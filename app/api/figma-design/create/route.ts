"use server";

import { type NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "../../../../utils/supabase/server";
import FigmaDesign from "../../../../model/figma-design.model";
import { connectToDatabase } from "../../../../lib/connectToDB";
import {
    FigmaDesignRequest,
    FigmaDesignResponse,
} from "../../../../types/figma-design.types";
import { logger } from "../../../../lib/utils/logger";
import { buildRateKey, checkRateLimit } from "../../../../lib/utils/rate-limit";

/**
 * POST /api/figma-design/create
 * 
 * Create and store a Figma design
 * CTO ADVISOR ONLY - Strict role validation enforced
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authentication check
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
            logger.warn("🔒 [FIGMA-CREATE] Unauthorized access attempt");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = data.user.id;

        // 2. Parse request body
        const body: FigmaDesignRequest = await request.json();
        const { designId, designData, activeRole } = body;

        // 3. CRITICAL: CTO-only role validation
        const normalizedRole = activeRole?.toLowerCase();
        if (normalizedRole !== "cto") {
            logger.warn(`🚫 [FIGMA-CREATE] Non-CTO role attempted design creation: ${activeRole}`);
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized: Only CTO advisor can generate Figma designs",
                },
                { status: 403 }
            );
        }

        // 4. Validate required fields
        if (!designId || !designData) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: designId, designData" },
                { status: 400 }
            );
        }

        // 5. Rate limiting
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            request.headers.get("x-real-ip") ||
            "unknown-ip";
        const rateKey = buildRateKey(["figma-create", userId, ip]);
        const rate = checkRateLimit(rateKey, { capacity: 20, refillRatePerSec: 0.1 });

        if (!rate.allowed) {
            logger.warn(`⏱️ [FIGMA-CREATE] Rate limit exceeded for user ${userId}`);
            return NextResponse.json(
                { success: false, error: "Rate limit exceeded. Please try again later." },
                { status: 429 }
            );
        }

        // 6. Ensure database connection
        await connectToDatabase();

        // 7. Store design in MongoDB
        const figmaDesign = await FigmaDesign.create({
            designId,
            designData,
            userId,
            activeRole: "cto",
        });

        logger.info(`✅ [FIGMA-CREATE] Design created successfully`, {
            designId,
            userId,
            nodeCount: designData.nodes?.length || 0,
        });

        return NextResponse.json(
            {
                success: true,
                designId: figmaDesign.designId,
                message: "Design stored successfully",
            } satisfies FigmaDesignResponse,
            { status: 201 }
        );
    } catch (err: any) {
        logger.error("❌ [FIGMA-CREATE] Error creating design:", err);

        // Handle duplicate designId
        if (err.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Design ID already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

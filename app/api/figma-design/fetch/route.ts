"use server";

import { type NextRequest, NextResponse } from "next/server";
import FigmaDesign from "../../../../model/figma-design.model";
import { connectToDatabase } from "../../../../lib/connectToDB";
import { FigmaDesignFetchResponse } from "../../../../types/figma-design.types";
import { logger } from "../../../../lib/utils/logger";

/**
 * GET /api/figma-design/fetch?designId=xxx
 * 
 * Fetch a stored Figma design by designId
 * Public endpoint (no auth) to work with Figma plugin security model
 * CORS enabled for Figma plugin access
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Extract designId from query params
        const { searchParams } = new URL(request.url);
        const designId = searchParams.get("designId");

        if (!designId) {
            return NextResponse.json(
                { success: false, error: "Missing designId parameter" },
                { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
            );
        }

        // 2. Ensure database connection
        await connectToDatabase();

        // 3. Fetch design from MongoDB
        const design = await FigmaDesign.findOne({ designId }).lean();

        if (!design) {
            logger.warn(`🔍 [FIGMA-FETCH] Design not found: ${designId}`);
            return NextResponse.json(
                { success: false, error: "Design not found" },
                { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
            );
        }

        logger.info(`✅ [FIGMA-FETCH] Design retrieved successfully`, {
            designId,
            nodeCount: design.designData?.nodes?.length || 0,
        });

        return NextResponse.json(
            {
                success: true,
                designData: design.designData,
            } satisfies FigmaDesignFetchResponse,
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            }
        );
    } catch (err) {
        logger.error("❌ [FIGMA-FETCH] Error fetching design:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            {
                status: 500,
                headers: { "Access-Control-Allow-Origin": "*" },
            }
        );
    }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        }
    );
}

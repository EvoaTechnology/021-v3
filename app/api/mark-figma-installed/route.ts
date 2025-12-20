import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "../../../lib/auth/authenticate-request";
import User from "../../../model/User";
import connectToDatabase from "../../../lib/database/mongodb";

/**
 * POST /api/mark-figma-installed
 * Marks that the user has installed the Figma plugin (one-time flag)
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const auth = await authenticateRequest(request);
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }
        const userId = auth.user.id;

        // 2. Connect to database
        await connectToDatabase();

        // 3. Update user's plugin installation status
        const user = await User.findByIdAndUpdate(
            userId,
            { hasInstalledFigmaPlugin: true },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            hasInstalledFigmaPlugin: user.hasInstalledFigmaPlugin,
        });
    } catch (error) {
        console.error("❌ [MARK-FIGMA-INSTALLED] Error:", error);
        return NextResponse.json(
            { error: "Failed to update plugin status" },
            { status: 500 }
        );
    }
}

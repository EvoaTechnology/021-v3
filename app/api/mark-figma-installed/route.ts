import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "../../../utils/supabase/server";
import { DatabaseService } from "../../../lib/services/database-service";

/**
 * POST /api/mark-figma-installed
 * Marks that the user has installed the Figma plugin (one-time flag)
 */

async function requireAuth() {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
            return { ok: false as const, status: 401, error: "Unauthorized" };
        }
        return { ok: true as const, user: data.user };
    } catch (err) {
        console.error("❌ [AUTH] Supabase auth error:", err);
        return { ok: false as const, status: 500, error: "Auth check failed" };
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const auth = await requireAuth();
        if (!auth.ok) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        // 2. Update user's plugin installation status using email
        // Note: userId is a UUID from Supabase, we use email to find MongoDB user
        if (!auth.user.email) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 }
            );
        }

        const result = await DatabaseService.updateUserPluginStatus(auth.user.email);

        if (!result) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            hasInstalledFigmaPlugin: true,
        });
    } catch (error) {
        console.error("❌ [MARK-FIGMA-INSTALLED] Error:", error);
        return NextResponse.json(
            { error: "Failed to update plugin status" },
            { status: 500 }
        );
    }
}

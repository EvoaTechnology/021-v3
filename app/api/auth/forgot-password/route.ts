import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const redirectTo = `${siteUrl.replace(/\/$/, "")}/forgot-password/reset`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    // To avoid user enumeration, respond with 200 even if the email doesn't exist.
    if (error) {
      console.warn("resetPasswordForEmail error:", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error)?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

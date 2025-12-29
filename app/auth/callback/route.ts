import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Exchanges Supabase auth code for a session, then redirects to `next`.
 * This route must be in Additional Redirect URLs in Supabase settings.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/chat";

    if (!code) return NextResponse.redirect(new URL("/login", url));

    const cookieStore = await cookies();
    const response = NextResponse.redirect(new URL(next, url));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookies: any[]) {
            cookies.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth error releasing code:", error);
      return NextResponse.redirect(new URL("/login?error=auth", url));
    }

    return response;
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }
}

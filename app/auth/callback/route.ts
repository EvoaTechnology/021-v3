import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Exchanges Supabase auth code for a session, then redirects to `next`.
 * This route must be in Additional Redirect URLs in Supabase settings.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    if (!code) return NextResponse.redirect(new URL("/login", url));

    const response = NextResponse.redirect(new URL(next, url));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
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
      return NextResponse.redirect(new URL("/login?error=auth", url));
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=callback", request.url));
  }
}

// import { NextResponse } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// /**
//  * Exchanges Supabase auth code for a session, then redirects to `next`.
//  * This route must be in Additional Redirect URLs in Supabase settings.
//  */
// export async function GET(request: Request) {
//   try {
//     const url = new URL(request.url);
//     const code = url.searchParams.get("code");
//     const next = url.searchParams.get("next") || "/";

//     if (!code) return NextResponse.redirect(new URL("/login", url));

//     const response = NextResponse.redirect(new URL(next, url));

//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//       {
//         cookies: {
//           getAll() {
//             return [];
//           },
//           setAll(cookies: any[]) {
//             cookies.forEach(({ name, value, options }) => {
//               response.cookies.set(name, value, options);
//             });
//           },
//         },
//       }
//     );

//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (error) {
//       return NextResponse.redirect(new URL("/login?error=auth", url));
//     }

//     return response;
//   } catch {
//     return NextResponse.redirect(new URL("/login?error=callback", request.url));
//   }
// }


import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // Use the request URL to preserve the origin (localhost, preview, or production)
    const requestUrl = new URL(request.url);
    
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/";

    if (!code) {
      // Redirect to login using the current request origin
      return NextResponse.redirect(new URL("/login", requestUrl));
    }

    // ✅ MUST be awaited
    const cookieStore = await cookies();

    // Construct redirect URL using the current request origin
    const redirectUrl = new URL(next, requestUrl);
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth exchange error:", error.message);
      // Redirect to login with error using the current request origin
      return NextResponse.redirect(new URL("/login?error=auth", requestUrl));
    }

    return response;
  } catch (err) {
    console.error("Auth callback error:", err);
    // Use request.url to preserve origin even in catch block
    const errorRequestUrl = new URL(request.url);
    return NextResponse.redirect(new URL("/login?error=callback", errorRequestUrl));
  }
}

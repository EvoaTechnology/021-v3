// middleware.ts
import { updateSession } from "./utils/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Enforce canonical host in production
  const host = request.headers.get("host") || "";
  const canonical = process.env.NEXT_PUBLIC_SITE_URL || "021.evoa.co.in";
  const canonicalHost = canonical.replace(/^https?:\/\//, "");
  const isLocalhost = /localhost|127.0.0.1/.test(host);
  if (process.env.NODE_ENV === "production" && !isLocalhost && host !== canonicalHost) {
    const url = new URL(request.url);
    url.host = canonicalHost;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const response = await updateSession(request);
  // Add basic security headers
  const res = NextResponse.next({ request: { headers: request.headers } });
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // Return session response if it modified cookies, else our header-enhanced response
  return response || res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login
     * - register
     * - auth (auth confirmation, etc.)
     * - favicon.ico
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder files
     */
    "/((?!login|register|auth|favicon.ico|api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/**
 * Resolve the absolute site URL to use in redirects.
 * Priority:
 * 1) NEXT_PUBLIC_SITE_URL (normalized to include scheme)
 * 2) Request "Origin" header
 * 3) Request URL origin
 * 4) In dev: http://localhost:3000
 * 5) Production fallback: https://021.evoa.co.in
 */
export function resolveSiteUrl(request: Request): string {
  const normalize = (u?: string) =>
    u && (u.startsWith("http://") || u.startsWith("https://"))
      ? u
      : u
      ? `https://${u}`
      : undefined;

  const envBase = normalize(process.env.NEXT_PUBLIC_SITE_URL);
  const headerOrigin = new Headers(request.headers).get("origin") || undefined;
  let requestOrigin: string | undefined;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {}
  const devFallback =
    process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined;
  return (
    envBase ||
    headerOrigin ||
    requestOrigin ||
    devFallback ||
    "https://021.evoa.co.in"
  );
}

// Minimal helper for places where only env+dev fallback are needed (client-safe)
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

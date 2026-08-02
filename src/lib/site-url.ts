/**
 * Canonical public origin for auth redirects and share links.
 * Production always uses NEXT_PUBLIC_SITE_URL so Vercel alias domains
 * (e.g. daily-lifeline-oberyon.vercel.app) never leak into magic links.
 */
export function getSiteUrl(requestOrigin?: string | null) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  const origin = requestOrigin?.replace(/\/$/, "") ?? null

  if (origin?.includes("localhost") || origin?.includes("127.0.0.1")) {
    return origin
  }

  if (configured) {
    return configured
  }

  return origin ?? "http://localhost:3000"
}

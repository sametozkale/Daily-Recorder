/** Build a favicon URL for an activity link (Google s2, sized for UI). */
export function faviconUrlForLink(
  href: string | null | undefined,
  size = 64,
): string | null {
  if (!href) return null
  try {
    const url = new URL(href.trim())
    if (!url.hostname) return null
    const endpoint = new URL("https://www.google.com/s2/favicons")
    endpoint.searchParams.set("domain", url.hostname)
    endpoint.searchParams.set("sz", String(size))
    return endpoint.toString()
  } catch {
    return null
  }
}

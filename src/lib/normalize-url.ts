/**
 * Prepend https:// when the value looks like a host/path without a scheme.
 * Leaves absolute URLs (http:, https:, mailto:, …) unchanged.
 */
export function normalizeHttpUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  // Already has a scheme (https:, http:, mailto:, …)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed
  // Protocol-relative
  if (trimmed.startsWith("//")) return `https:${trimmed}`
  return `https://${trimmed}`
}

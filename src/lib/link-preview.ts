import { fetchFigmaThumbnail } from "@/lib/figma-preview"
import { parseFigmaUrl } from "@/lib/figma-url"

function absoluteUrl(candidate: string, base: string) {
  try {
    return new URL(candidate, base).toString()
  } catch {
    return null
  }
}

function firstMetaMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

/** Public GitHub repo social card (works for many public repositories). */
export function githubRepoOpenGraphUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.endsWith("github.com")) return null
    const parts = parsed.pathname.split("/").filter(Boolean)
    if (parts.length < 2) return null
    const [owner, repo] = parts
    if (!owner || !repo || owner === "settings" || owner === "orgs") return null
    const cleanRepo = repo.replace(/\.git$/, "")
    return `https://opengraph.githubassets.com/1/${owner}/${cleanRepo}`
  } catch {
    return null
  }
}

/** Pull og/twitter image from a public page. */
export async function fetchOpenGraphImage(
  pageUrl: string,
): Promise<string | null> {
  try {
    const response = await fetch(pageUrl, {
      next: { revalidate: 60 * 60 * 6 },
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "DailyLifelinePreview/1.0 (+https://daily-lifeline.vercel.app)",
      },
      signal: AbortSignal.timeout(6_000),
    })
    if (!response.ok) return null

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html") && !contentType.includes("xml")) {
      // Direct image/media link can itself be the preview.
      if (contentType.startsWith("image/")) return pageUrl
      return null
    }

    const html = await response.text()
    const image =
      firstMetaMatch(html, [
        /property=["']og:image:secure_url["'][^>]*content=["']([^"']+)["']/i,
        /content=["']([^"']+)["'][^>]*property=["']og:image:secure_url["']/i,
        /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
        /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
        /name=["']twitter:image:src["'][^>]*content=["']([^"']+)["']/i,
        /content=["']([^"']+)["'][^>]*name=["']twitter:image:src["']/i,
        /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
        /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
      ]) ?? null

    if (!image) return null
    return absoluteUrl(image, pageUrl)
  } catch {
    return null
  }
}

/**
 * Resolve the best preview asset for an activity link.
 * Order: explicit media → provider-specific → Open Graph / page image.
 */
export async function resolveLinkPreview(input: {
  url: string | null
  mediaUrl: string | null
  provider?: "github" | "figma" | null
}): Promise<string | null> {
  if (input.mediaUrl) return input.mediaUrl
  if (!input.url) return null

  const provider = input.provider
  const isFigma = provider === "figma" || Boolean(parseFigmaUrl(input.url))
  if (isFigma) {
    const figmaThumb = await fetchFigmaThumbnail(input.url)
    if (figmaThumb) return figmaThumb
  }

  if (provider === "github" || input.url.includes("github.com")) {
    const githubCard = githubRepoOpenGraphUrl(input.url)
    if (githubCard) return githubCard
  }

  // Direct image URLs
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(input.url)) {
    return input.url
  }

  return fetchOpenGraphImage(input.url)
}

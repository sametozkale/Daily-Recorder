import { parseFigmaUrl, type ParsedFigmaUrl } from "@/lib/figma-url"

export type { ParsedFigmaUrl }
export { parseFigmaUrl, figmaEmbedUrl } from "@/lib/figma-url"

async function fetchViaOEmbed(figmaUrl: string): Promise<string | null> {
  try {
    const endpoint = new URL("https://www.figma.com/api/oEmbed")
    endpoint.searchParams.set("url", figmaUrl)

    const response = await fetch(endpoint, {
      next: { revalidate: 60 * 60 * 6 },
      headers: { Accept: "application/json" },
    })

    if (!response.ok) return null

    const data = (await response.json()) as { thumbnail_url?: string }
    return data.thumbnail_url ?? null
  } catch {
    return null
  }
}

async function fetchViaFigmaApi(parsed: ParsedFigmaUrl): Promise<string | null> {
  const token = process.env.FIGMA_ACCESS_TOKEN ?? process.env.FIGMA_TOKEN
  if (!token) return null

  try {
    if (parsed.nodeId) {
      const endpoint = new URL(
        `https://api.figma.com/v1/images/${parsed.fileKey}`,
      )
      endpoint.searchParams.set("ids", parsed.nodeId)
      endpoint.searchParams.set("format", "png")
      endpoint.searchParams.set("scale", "2")

      const response = await fetch(endpoint, {
        headers: { "X-Figma-Token": token },
        next: { revalidate: 60 * 60 * 6 },
      })
      if (!response.ok) return null

      const data = (await response.json()) as {
        images?: Record<string, string | null>
      }
      return data.images?.[parsed.nodeId] ?? null
    }

    const response = await fetch(
      `https://api.figma.com/v1/files/${parsed.fileKey}?depth=1`,
      {
        headers: { "X-Figma-Token": token },
        next: { revalidate: 60 * 60 * 6 },
      },
    )
    if (!response.ok) return null

    const data = (await response.json()) as { thumbnailUrl?: string }
    return data.thumbnailUrl ?? null
  } catch {
    return null
  }
}

/** Fetch a Figma frame/file thumbnail (oEmbed, then authenticated API). */
export async function fetchFigmaThumbnail(
  figmaUrl: string,
): Promise<string | null> {
  const parsed = parseFigmaUrl(figmaUrl)
  const candidates = parsed
    ? [parsed.canonicalUrl, figmaUrl]
    : [figmaUrl]

  for (const candidate of candidates) {
    const thumbnail = await fetchViaOEmbed(candidate)
    if (thumbnail) return thumbnail
  }

  if (parsed) {
    const fromApi = await fetchViaFigmaApi(parsed)
    if (fromApi) return fromApi
  }

  return null
}


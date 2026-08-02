/** Fetch a public Figma file/frame thumbnail via oEmbed. */
export async function fetchFigmaThumbnail(
  figmaUrl: string,
): Promise<string | null> {
  try {
    const endpoint = new URL("https://www.figma.com/api/oEmbed")
    endpoint.searchParams.set("url", figmaUrl)

    const response = await fetch(endpoint, {
      next: { revalidate: 60 * 60 * 24 },
      headers: { Accept: "application/json" },
    })

    if (!response.ok) return null

    const data = (await response.json()) as { thumbnail_url?: string }
    return data.thumbnail_url ?? null
  } catch {
    return null
  }
}

export async function resolveActivityMediaUrl(input: {
  url: string | null
  mediaUrl: string | null
  provider: "github" | "figma" | null
}): Promise<string | null> {
  if (input.mediaUrl) return input.mediaUrl
  if (input.provider === "figma" && input.url) {
    return fetchFigmaThumbnail(input.url)
  }
  return null
}

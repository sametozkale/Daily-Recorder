export type ParsedFigmaUrl = {
  fileKey: string
  nodeId?: string
  /** Canonical www URL suitable for oEmbed / embed. */
  canonicalUrl: string
}

/** Extract file key + node id from modern and legacy Figma URLs. */
export function parseFigmaUrl(raw: string): ParsedFigmaUrl | null {
  try {
    const url = new URL(raw.trim())
    if (!url.hostname.endsWith("figma.com")) return null

    const match = url.pathname.match(
      /^\/(design|file|proto|board|slides|deck|make)\/([a-zA-Z0-9]+)/,
    )
    if (!match) return null

    const [, kind, fileKey] = match
    const nodeParam = url.searchParams.get("node-id") ?? undefined
    const nodeId = nodeParam ? nodeParam.replace(/-/g, ":") : undefined
    const nodeQuery = nodeParam
      ? `?node-id=${encodeURIComponent(nodeParam)}`
      : ""

    return {
      fileKey,
      nodeId,
      canonicalUrl: `https://www.figma.com/${kind}/${fileKey}${nodeQuery}`,
    }
  } catch {
    return null
  }
}

export function figmaEmbedUrl(figmaUrl: string): string | null {
  const parsed = parseFigmaUrl(figmaUrl)
  if (!parsed) return null
  const endpoint = new URL("https://www.figma.com/embed")
  endpoint.searchParams.set("embed_host", "daily-lifeline")
  endpoint.searchParams.set("url", parsed.canonicalUrl)
  return endpoint.toString()
}

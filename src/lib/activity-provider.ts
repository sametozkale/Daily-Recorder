import type { Activity } from "@/lib/database.types"

export type ActivityProvider = "github" | "figma"

export function detectActivityProvider(
  activity: Pick<Activity, "url" | "type" | "source">,
): ActivityProvider | null {
  if (activity.source === "github") return "github"
  if (activity.source === "figma") return "figma"

  const url = activity.url?.toLowerCase() ?? ""
  if (
    url.includes("github.com") ||
    url.includes("githubusercontent.com")
  ) {
    return "github"
  }
  if (url.includes("figma.com")) {
    return "figma"
  }

  return null
}

export function providerBrandSrc(provider: ActivityProvider) {
  return `/brands/${provider}.svg`
}

export function providerLabel(provider: ActivityProvider) {
  return provider === "github" ? "GitHub" : "Figma"
}

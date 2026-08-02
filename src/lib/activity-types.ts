import type { ActivityType } from "@/lib/database.types"

export const ACTIVITY_TYPES: ActivityType[] = [
  "design",
  "code",
  "pr",
  "review",
  "spec",
  "meeting",
  "research",
  "ship",
  "other",
]

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  design: "Design",
  code: "Code",
  pr: "PR",
  review: "Review",
  spec: "Spec",
  meeting: "Meeting",
  research: "Research",
  ship: "Ship",
  other: "Other",
}

/** Small swatch colors for activity types in selects and labels. */
export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  design: "#E879A9",
  code: "#3B82F6",
  pr: "#22C55E",
  review: "#F59E0B",
  spec: "#6366F1",
  meeting: "#F97316",
  research: "#14B8A6",
  ship: "#EC4899",
  other: "#A1A1AA",
}

export function todayISODate(timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

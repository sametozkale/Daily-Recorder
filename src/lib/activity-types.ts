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

export function todayISODate(timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

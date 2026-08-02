import type { LifelineMarker } from "@/components/lifeline/types"
import type { ActivityType } from "@/lib/database.types"
import { defineLifeline, type LifelineMilestones } from "@/lib/lifeline-data"

const MS_PER_DAY = 86_400_000
const DAY_COUNT = 12

const preview = {
  figma: "/landing-previews/figma.svg",
  figmaSettings: "/landing-previews/figma-settings.svg",
  notion: "/landing-previews/notion.svg",
  notionShip: "/landing-previews/notion-ship.svg",
  linear: "/landing-previews/linear.svg",
  meet: "/landing-previews/meet.svg",
  slack: "/landing-previews/slack.svg",
} as const

type ActivityOpts = {
  provider?: "github" | "figma"
  href?: string
  /** Preview image in the card media well — required for landing demos. */
  src: string
}

function activity(title: string, type: ActivityType, opts: ActivityOpts) {
  return {
    src: opts.src,
    alt: title,
    activityType: type,
    provider: opts.provider,
    href: opts.href,
    width: 258 as const,
  }
}

const githubOg = (owner: string, repo: string) =>
  `https://opengraph.githubassets.com/1/${owner}/${repo}`

/**
 * Activity payloads keyed by day index within the demo window (1..N).
 * Most days stack several cards; day 8 is a single-card example.
 * Day N is local today, where the rail parks.
 * Every card carries a content preview (`src`).
 */
const DEMO_BY_DAY: Record<number, ReturnType<typeof activity>[]> = {
  2: [
    activity("Homepage explorations", "design", {
      href: "https://www.figma.com/design/example/homepage",
      src: preview.figma,
    }),
    activity("Stand-up notes", "meeting", {
      href: "https://www.notion.so",
      src: preview.notion,
    }),
  ],
  3: [
    activity("Fix timezone on day park", "code", {
      provider: "github",
      href: "https://github.com/vercel/next.js",
      src: githubOg("vercel", "next.js"),
    }),
    activity("TRI-482 · Share link bugs", "other", {
      href: "https://linear.app",
      src: preview.linear,
    }),
  ],
  5: [
    activity("Q3 planning doc", "spec", {
      href: "https://www.notion.so",
      src: preview.notion,
    }),
    activity("Critique: settings sheet", "review", {
      href: "https://www.figma.com/design/example/settings",
      src: preview.figmaSettings,
    }),
    activity("Design sync", "meeting", {
      href: "https://meet.google.com/abc-defg-hij",
      src: preview.meet,
    }),
    activity("Customer call recap", "meeting", {
      href: "https://slack.com",
      src: preview.slack,
    }),
  ],
  7: [
    activity("PR #142 — hover day labels", "pr", {
      provider: "github",
      href: "https://github.com/supabase/supabase/pull/1",
      src: githubOg("supabase", "supabase"),
    }),
    activity("Invite flow frames", "design", {
      href: "https://www.figma.com/design/example/invite",
      src: preview.figma,
    }),
  ],
  // Single-card day — shows a quiet / focused day on the rail.
  8: [
    activity("Auth callback edge case", "code", {
      provider: "github",
      href: "https://github.com/remix-run/remix",
      src: githubOg("remix-run", "remix"),
    }),
  ],
  10: [
    activity("Competitor rail research", "research", {
      href: "https://www.notion.so",
      src: preview.notion,
    }),
    activity("Frame thumbnail pipeline", "design", {
      href: "https://www.figma.com/design/example/thumbs",
      src: preview.figmaSettings,
    }),
    activity("Invite-only gate fix", "code", {
      provider: "github",
      href: "https://github.com/tailwindlabs/tailwindcss",
      src: githubOg("tailwindlabs", "tailwindcss"),
    }),
    activity("TRI-501 · Onboarding copy", "other", {
      href: "https://linear.app",
      src: preview.linear,
    }),
  ],
  11: [
    activity("Design review notes", "review", {
      href: "https://www.notion.so",
      src: preview.notion,
    }),
    activity("PR #158 — card stacks", "pr", {
      provider: "github",
      href: "https://github.com/shadcn-ui/ui",
      src: githubOg("shadcn-ui", "ui"),
    }),
    activity("Shipped share-with-team", "ship", {
      provider: "github",
      href: "https://github.com/withastro/astro",
      src: githubOg("withastro", "astro"),
    }),
  ],
  // Today — where the intro parks.
  12: [
    activity("Team share link live", "ship", {
      href: "https://www.notion.so",
      src: preview.notionShip,
    }),
    activity("Slack #launch announcement", "meeting", {
      href: "https://slack.com",
      src: preview.slack,
    }),
    activity("Docs: how we use the rail", "spec", {
      href: "https://www.notion.so",
      src: preview.notion,
    }),
  ],
}

function startOfLocalDayUTC(date = new Date()) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayLabel(utcMs: number, full: boolean) {
  const date = new Date(utcMs)
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  const day = date.getUTCDate()
  if (full || day === 1) return `${month} ${day}`
  return `${day}`
}

function toISODate(utcMs: number) {
  return new Date(utcMs).toISOString().slice(0, 10)
}

/**
 * Landing demo rail: ends on local today so the timeline parks on a real
 * “today” marker instead of scrolling to the far end of a future-only week.
 */
export function getLandingLifeline() {
  const endUTC = startOfLocalDayUTC()
  const startUTC = endUTC - (DAY_COUNT - 1) * MS_PER_DAY

  const milestones: LifelineMilestones = {}
  for (let day = 1; day <= DAY_COUNT; day++) {
    const photos = DEMO_BY_DAY[day]
    if (!photos?.length) continue
    const utcMs = startUTC + (day - 1) * MS_PER_DAY
    milestones[day] = {
      id: toISODate(utcMs),
      age: "",
      events: [],
      photos,
    }
  }

  const record = defineLifeline({
    slug: "landing-example",
    name: "A week on the rail",
    birthYear: 1,
    endYear: DAY_COUNT,
    description: "Sample week for the landing page.",
    milestones,
  })

  return {
    ...record,
    markers: record.markers.map((marker): LifelineMarker => {
      const utcMs = startUTC + (marker.year - 1) * MS_PER_DAY
      const hasActivity = (marker.photos?.length ?? 0) > 0
      return {
        ...marker,
        id: toISODate(utcMs),
        label: dayLabel(utcMs, hasActivity),
        labelFull: dayLabel(utcMs, true),
        age: "",
      }
    }),
  }
}

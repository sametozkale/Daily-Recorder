import type { LifelineMarker } from "@/components/lifeline/types"
import { detectActivityProvider } from "@/lib/activity-provider"
import type { Activity, Profile } from "@/lib/database.types"
import { resolveLinkPreview } from "@/lib/link-preview"
import { defineLifeline } from "@/lib/lifeline-data"

const MS_PER_DAY = 86_400_000

function parseUTCDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  return Date.UTC(year, month - 1, day)
}

function formatDayLabel(utcMs: number, full: boolean) {
  const date = new Date(utcMs)
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  const day = date.getUTCDate()
  if (full || day === 1) return `${month} ${day}`
  return `${day}`
}

function toISODate(utcMs: number) {
  return new Date(utcMs).toISOString().slice(0, 10)
}

async function enrichActivity(activity: Activity) {
  const provider = detectActivityProvider(activity)
  const previewUrl = await resolveLinkPreview({
    url: activity.url,
    mediaUrl: activity.media_url,
    provider,
  })

  return { activity, provider, previewUrl }
}

/**
 * Maps day-based activities onto the Lifeline journey axis (day 1..N).
 * Quiet days stay on the rail so scrubbing feels continuous.
 * Every activity becomes a card (same shell as GitHub / Figma).
 */
export async function mapActivitiesToLifeline(
  profile: Profile,
  activities: Activity[],
) {
  const sorted = [...activities].sort((a, b) =>
    a.occurred_on.localeCompare(b.occurred_on),
  )

  const enriched = await Promise.all(sorted.map(enrichActivity))

  // Calendar days match the user's local “today”, same as the scroll park.
  const now = new Date()
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())

  const accountCreated = new Date(profile.created_at)
  const accountDayUTC = Date.UTC(
    accountCreated.getFullYear(),
    accountCreated.getMonth(),
    accountCreated.getDate(),
  )
  // Keep the week before signup open so early work can still be logged.
  const weekBeforeAccountUTC = accountDayUTC - 7 * MS_PER_DAY

  const firstActivityUTC = sorted[0]
    ? parseUTCDate(sorted[0].occurred_on)
    : null
  const startUTC = Math.min(
    weekBeforeAccountUTC,
    firstActivityUTC ?? weekBeforeAccountUTC,
  )

  const lastActivityUTC = sorted[sorted.length - 1]
    ? parseUTCDate(sorted[sorted.length - 1].occurred_on)
    : todayUTC
  // Always keep ~1 calendar month ahead of today open on the rail.
  const openThroughUTC = Date.UTC(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  )
  const endUTC = Math.max(lastActivityUTC, openThroughUTC)

  const firstDay = 1
  const lastDay = Math.floor((endUTC - startUTC) / MS_PER_DAY) + 1

  const byDay = new Map<number, typeof enriched>()
  for (const item of enriched) {
    const day =
      Math.floor(
        (parseUTCDate(item.activity.occurred_on) - startUTC) / MS_PER_DAY,
      ) + 1
    const list = byDay.get(day) ?? []
    list.push(item)
    byDay.set(day, list)
  }

  const milestones: Record<
    number,
    {
      id: string
      age: string
      events: LifelineMarker["events"]
      photos?: LifelineMarker["photos"]
    }
  > = {}

  for (const [day, dayActivities] of byDay) {
    // Newest first so the stack reads with the latest card on top.
    const ordered = [...dayActivities].sort((a, b) =>
      b.activity.created_at.localeCompare(a.activity.created_at),
    )

    const photos: NonNullable<LifelineMarker["photos"]> = ordered.map(
      ({ activity, provider, previewUrl }) => ({
        // White media well only gets real link previews (never brand SVGs).
        src: previewUrl ?? "",
        alt: activity.title,
        provider: provider ?? undefined,
        activityType: activity.type,
        activityId: activity.id,
        href: activity.url ?? undefined,
        width: 258,
      }),
    )

    const iso = toISODate(startUTC + (day - 1) * MS_PER_DAY)
    milestones[day] = {
      id: iso,
      age: "",
      events: [],
      ...(photos.length > 0 ? { photos } : {}),
    }
  }

  const record = defineLifeline({
    slug: profile.slug,
    name: profile.display_name,
    birthYear: firstDay,
    endYear: Math.max(lastDay, firstDay + 6),
    description: `${profile.title ?? "Design Engineer"} — daily work lifeline.`,
    milestones,
  })

  return {
    ...record,
    markers: record.markers.map((marker) => {
      const utcMs = startUTC + (marker.year - 1) * MS_PER_DAY
      const iso = toISODate(utcMs)
      const hasActivity = (marker.photos?.length ?? 0) > 0
      return {
        ...marker,
        id: iso,
        label: formatDayLabel(utcMs, hasActivity),
        labelFull: formatDayLabel(utcMs, true),
        age: marker.age ?? "",
      }
    }),
  }
}

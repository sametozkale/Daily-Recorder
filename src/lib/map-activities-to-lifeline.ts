import type { LifelineEvent, LifelineMarker } from "@/components/lifeline/types"
import {
  detectActivityProvider,
  providerBrandSrc,
  providerLabel,
  type ActivityProvider,
} from "@/lib/activity-provider"
import { ACTIVITY_TYPE_LABELS } from "@/lib/activity-types"
import type { Activity, Profile } from "@/lib/database.types"
import { resolveActivityMediaUrl } from "@/lib/figma-preview"
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

function activityToEvent(
  activity: Activity,
  provider: ActivityProvider | null,
  previewUrl: string | null,
): LifelineEvent {
  const typeLabel = ACTIVITY_TYPE_LABELS[activity.type]
  const project = activity.project ? ` · ${activity.project}` : ""
  const summary = activity.summary ? ` — ${activity.summary}` : ""
  const prefix = provider
    ? `${providerLabel(provider)} · `
    : `[${typeLabel}] `

  const text: string | LifelineEvent = activity.url
    ? [
        { type: "text", value: prefix },
        { type: "link", value: activity.title, href: activity.url },
        { type: "text", value: `${project}${summary}` },
      ]
    : `${prefix}${activity.title}${project}${summary}`

  if (previewUrl) {
    return {
      text,
      image: {
        src: previewUrl,
        alt: activity.title,
      },
    }
  }

  return text
}

async function enrichActivity(activity: Activity) {
  const provider = detectActivityProvider(activity)
  const previewUrl = await resolveActivityMediaUrl({
    url: activity.url,
    mediaUrl: activity.media_url,
    provider,
  })

  return { activity, provider, previewUrl }
}

/**
 * Maps day-based activities onto the Lifeline journey axis (day 1..N).
 * Quiet days stay on the rail so scrubbing feels continuous.
 */
export async function mapActivitiesToLifeline(
  profile: Profile,
  activities: Activity[],
) {
  const sorted = [...activities].sort((a, b) =>
    a.occurred_on.localeCompare(b.occurred_on),
  )

  const enriched = await Promise.all(sorted.map(enrichActivity))

  const today = new Date()
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  )

  const firstActivityUTC = sorted[0]
    ? parseUTCDate(sorted[0].occurred_on)
    : todayUTC
  const startUTC = firstActivityUTC - 2 * MS_PER_DAY
  const lastActivityUTC = sorted[sorted.length - 1]
    ? parseUTCDate(sorted[sorted.length - 1].occurred_on)
    : todayUTC
  const endUTC = Math.max(lastActivityUTC, todayUTC)

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
      events: LifelineEvent[]
      photos?: LifelineMarker["photos"]
      badges?: LifelineMarker["badges"]
    }
  > = {}

  for (const [day, dayActivities] of byDay) {
    const photos: NonNullable<LifelineMarker["photos"]> = []

    // Newest first so the stack reads with the latest card on top.
    const providerCards = [...dayActivities]
      .filter(
        (
          item,
        ): item is typeof item & { provider: ActivityProvider } =>
          item.provider !== null,
      )
      .sort((a, b) =>
        b.activity.created_at.localeCompare(a.activity.created_at),
      )

    for (const { activity, provider } of providerCards) {
      photos.push({
        src: providerBrandSrc(provider),
        alt: activity.title,
        provider,
        href: activity.url ?? undefined,
        width: 112,
      })
    }

    for (const { activity, provider, previewUrl } of dayActivities) {
      if (provider || !previewUrl) continue
      photos.push({
        src: previewUrl,
        alt: activity.title,
        href: activity.url ?? undefined,
      })
    }

    const iso = toISODate(startUTC + (day - 1) * MS_PER_DAY)
    milestones[day] = {
      id: iso,
      age: "",
      events: dayActivities.map(({ activity, provider, previewUrl }) =>
        activityToEvent(activity, provider, previewUrl),
      ),
      ...(photos.length > 0 ? { photos: photos.slice(0, 6) } : {}),
    }
  }

  const record = defineLifeline({
    slug: profile.slug,
    name: profile.display_name,
    birthYear: firstDay,
    endYear: Math.max(lastDay, firstDay + 6),
    description:
      profile.bio ??
      `${profile.title ?? "Design Engineer"} — daily work lifeline.`,
    milestones,
  })

  return {
    ...record,
    markers: record.markers.map((marker) => {
      const utcMs = startUTC + (marker.year - 1) * MS_PER_DAY
      const iso = toISODate(utcMs)
      const hasEvents = marker.events.length > 0
      return {
        ...marker,
        id: iso,
        label: formatDayLabel(utcMs, hasEvents),
        age: marker.age ?? "",
      }
    }),
  }
}

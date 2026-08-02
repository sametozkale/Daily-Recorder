import {
  PROVIDER_CARD_COMPACT_HEIGHT,
  PROVIDER_DAY_MIN_WIDTH,
  PROVIDER_STACK_COMPACT_FOOTER,
  PROVIDER_STACK_COMPACT_MAX_PX,
} from "./provider-card-layout"
import type { LifelineMarker } from "./types"

/** Quiet days stay compact so activity columns (and their +) read clearly. */
const QUIET_DAY_WIDTH = 72

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function hasMarkerPhotos(marker: LifelineMarker) {
  return (marker.photos?.length ?? 0) > 0
}

export function hasActivityCards(marker: LifelineMarker) {
  return (marker.photos ?? []).some(
    (photo) => Boolean(photo.activityType) || Boolean(photo.provider),
  )
}

/** @deprecated Use hasActivityCards */
export function hasProviderCards(marker: LifelineMarker) {
  return hasActivityCards(marker)
}

export function hasMarkerContent(marker: LifelineMarker) {
  return (
    marker.events.length > 0 ||
    hasMarkerPhotos(marker) ||
    (marker.companies?.length ?? 0) > 0 ||
    (marker.mentors?.length ?? 0) > 0 ||
    (marker.met?.length ?? 0) > 0
  )
}

export function hasMarkerPeople(marker: LifelineMarker) {
  return (marker.mentors?.length ?? 0) > 0 || (marker.met?.length ?? 0) > 0
}

export function getMarkerHeight(marker: LifelineMarker, nextYear?: number) {
  const hasContent = hasMarkerContent(marker)
  const hasPeople = hasMarkerPeople(marker)

  if (!hasContent) return 48

  const peopleOnly =
    hasPeople &&
    marker.events.length === 0 &&
    (marker.companies?.length ?? 0) === 0 &&
    !hasMarkerPhotos(marker)

  let height = 96

  if (marker.companies?.length) height += 28
  height += marker.events.length * 44

  if (hasActivityCards(marker)) {
    const cardCount = (marker.photos ?? []).filter(
      (photo) => Boolean(photo.activityType) || Boolean(photo.provider),
    ).length
    const expandedH =
      cardCount * PROVIDER_CARD_COMPACT_HEIGHT +
      Math.max(0, cardCount - 1) * 6 +
      PROVIDER_STACK_COMPACT_FOOTER
    height += Math.min(expandedH, PROVIDER_STACK_COMPACT_MAX_PX) + 16
  }

  if (peopleOnly) height += 88
  else if (hasPeople) height += 108

  if (!nextYear) return Math.min(720, Math.max(peopleOnly ? 148 : 188, height))

  const gap = Math.max(1, nextYear - marker.year)
  height += Math.min(32, gap * 3)

  return Math.min(720, Math.max(peopleOnly ? 148 : 188, height))
}

export function getMarkerWidth(marker: LifelineMarker, nextYear?: number) {
  const hasContent = hasMarkerContent(marker)

  if (!hasContent) return QUIET_DAY_WIDTH

  // Any activity-card day reserves the full card column.
  if (hasActivityCards(marker)) {
    return PROVIDER_DAY_MIN_WIDTH
  }

  const hasPeople = hasMarkerPeople(marker)
  const peopleOnly =
    hasPeople &&
    marker.events.length === 0 &&
    (marker.companies?.length ?? 0) === 0

  if (peopleOnly) return 220
  if (!nextYear) return 360

  const gap = Math.max(1, nextYear - marker.year)
  return Math.min(420, Math.max(290, gap * 36))
}

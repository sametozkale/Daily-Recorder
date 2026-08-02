"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { todayISODate } from "@/lib/activity-types"
import { clamp } from "./lifeline-utils"

const AWAY_FROM_TODAY_MIN_PX = 160
const AWAY_FROM_TODAY_VIEW_RATIO = 0.28
const SCROLL_TO_TODAY_MS = 480

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null

  while (node) {
    const { overflowY } = window.getComputedStyle(node)
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    ) {
      return node
    }
    node = node.parentElement
  }

  // Nothing on the way up scrolls, so the document does — which is the
  // ordinary case for a page-mode timeline in a page that just scrolls.
  return (document.scrollingElement as HTMLElement | null) ?? null
}

interface LifelineVerticalScrollOptions {
  /**
   * Embedded, the timeline opens at its start rather than where a skipped
   * intro would have settled it — the reader is arriving at a module in a
   * page, not returning to a timeline that already played.
   */
  isEmbed?: boolean
  introLocked?: boolean
  introAnimating?: boolean
  introSkipped?: boolean
  introRailMs?: number
  introGetTrackProgress?: (elapsedMs: number) => number
  onIntroSettleComplete?: () => void
  onIntroScrollStart?: () => void
}

export function useLifelineVerticalScroll(
  markerCount: number,
  options: LifelineVerticalScrollOptions = {},
) {
  const sectionRef = useRef<HTMLElement>(null)
  const entryRefs = useRef<(HTMLLIElement | null)[]>([])
  const maxScrollRef = useRef(0)
  const presentScrollRef = useRef(0)
  const scrollParentRef = useRef<HTMLElement | null>(null)
  const initialized = useRef(false)
  const userHasNavigatedRef = useRef(false)
  const todayScrollId = useRef(0)
  const todayNavRef = useRef<"past" | "future" | null>(null)
  const introLockedRef = useRef(options.introLocked ?? false)
  const introAnimatingRef = useRef(options.introAnimating ?? false)
  const introSkippedRef = useRef(options.introSkipped ?? false)
  const isEmbedRef = useRef(options.isEmbed ?? false)
  const onIntroSettleCompleteRef = useRef(options.onIntroSettleComplete)
  const onIntroScrollStartRef = useRef(options.onIntroScrollStart)
  const introGetTrackProgressRef = useRef(options.introGetTrackProgress)
  const introStartedRef = useRef(false)
  const introScrollId = useRef(0)
  const introScrollStart = useRef(0)
  const introWasAnimatingRef = useRef(false)
  const scheduleMeasureRef = useRef<() => void>(() => {})
  const applyScrollRef = useRef<(value: number) => void>(() => {})
  const [isLayoutReady, setIsLayoutReady] = useState(false)
  const [todayNav, setTodayNav] = useState<"past" | "future" | null>(null)

  introLockedRef.current = options.introLocked ?? false
  introAnimatingRef.current = options.introAnimating ?? false
  introSkippedRef.current = options.introSkipped ?? false
  isEmbedRef.current = options.isEmbed ?? false
  onIntroSettleCompleteRef.current = options.onIntroSettleComplete
  onIntroScrollStartRef.current = options.onIntroScrollStart
  introGetTrackProgressRef.current = options.introGetTrackProgress

  const markUserNavigated = useCallback(() => {
    userHasNavigatedRef.current = true
  }, [])

  const setEntryRef = useCallback(
    (index: number, node: HTMLLIElement | null) => {
      entryRefs.current[index] = node

      if (index === markerCount - 1 && node) {
        scheduleMeasureRef.current()
      }
    },
    [markerCount],
  )

  const syncAwayFromToday = useCallback(() => {
    const scrollParent = scrollParentRef.current
    if (!scrollParent || (introAnimatingRef.current && !introSkippedRef.current)) {
      if (todayNavRef.current !== null) {
        todayNavRef.current = null
        setTodayNav(null)
      }
      return
    }

    const threshold = Math.max(
      AWAY_FROM_TODAY_MIN_PX,
      scrollParent.clientHeight * AWAY_FROM_TODAY_VIEW_RATIO,
    )
    const delta = scrollParent.scrollTop - presentScrollRef.current
    const next: "past" | "future" | null =
      Math.abs(delta) <= threshold ? null : delta < 0 ? "past" : "future"

    if (next !== todayNavRef.current) {
      todayNavRef.current = next
      setTodayNav(next)
    }
  }, [])

  const applyScroll = useCallback(
    (value: number) => {
      const scrollParent = scrollParentRef.current
      if (!scrollParent) return

      scrollParent.scrollTop = clamp(value, 0, maxScrollRef.current)
      syncAwayFromToday()
    },
    [syncAwayFromToday],
  )

  applyScrollRef.current = applyScroll

  /** Scroll offset that vertically centers today's entry in the scroller. */
  const measurePresentScroll = useCallback(() => {
    const scrollParent = scrollParentRef.current
    if (!scrollParent || maxScrollRef.current <= 0) return 0

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const today = todayISODate(timeZone)
    const entries = entryRefs.current.filter(
      (entry): entry is HTMLLIElement => Boolean(entry),
    )

    let present =
      entries.find((entry) => entry.dataset.lifelineDay === today) ?? null

    if (!present) {
      for (let i = entries.length - 1; i >= 0; i -= 1) {
        const day = entries[i]?.dataset.lifelineDay
        if (day && day <= today) {
          present = entries[i] ?? null
          break
        }
      }
    }

    if (!present) return maxScrollRef.current

    const parentRect = scrollParent.getBoundingClientRect()
    const entryRect = present.getBoundingClientRect()
    const entryOffset =
      entryRect.top - parentRect.top + scrollParent.scrollTop
    const target =
      entryOffset - parentRect.height / 2 + entryRect.height / 2

    return clamp(target, 0, maxScrollRef.current)
  }, [])

  const measureLayout = useCallback(() => {
    const section = sectionRef.current
    if (!section) return 0

    const scrollParent = getScrollParent(section)
    scrollParentRef.current = scrollParent

    if (!scrollParent) return 0

    const heights = entryRefs.current.map((entry) => entry?.offsetHeight ?? 0)
    if (heights.length < markerCount || heights.some((height) => height <= 0)) {
      return 0
    }

    const max = Math.max(
      0,
      scrollParent.scrollHeight - scrollParent.clientHeight,
    )
    maxScrollRef.current = max
    presentScrollRef.current = measurePresentScroll()

    return max
  }, [markerCount, measurePresentScroll])

  const scrollToToday = useCallback(() => {
    markUserNavigated()
    cancelAnimationFrame(todayScrollId.current)
    todayScrollId.current = 0

    const scrollParent = scrollParentRef.current
    if (!scrollParent) return

    // Refresh present after layout may have changed.
    presentScrollRef.current = measurePresentScroll()
    const from = scrollParent.scrollTop
    const to = presentScrollRef.current
    if (Math.abs(from - to) < 0.5) {
      applyScroll(to)
      return
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyScroll(to)
      return
    }

    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / SCROLL_TO_TODAY_MS)
      const eased = 1 - (1 - t) ** 3
      applyScroll(from + (to - from) * eased)
      if (t < 1) {
        todayScrollId.current = requestAnimationFrame(step)
      } else {
        todayScrollId.current = 0
      }
    }
    todayScrollId.current = requestAnimationFrame(step)
  }, [applyScroll, markUserNavigated, measurePresentScroll])

  useLayoutEffect(() => {
    entryRefs.current.length = markerCount
  }, [markerCount])

  useLayoutEffect(() => {
    const max = measureLayout()

    const scrollParent = scrollParentRef.current
    if (!scrollParent) return

    if (!initialized.current) {
      const present = presentScrollRef.current
      scrollParent.scrollTop =
        introSkippedRef.current && !isEmbedRef.current ? present : 0
      initialized.current = true
      syncAwayFromToday()
    }

    setIsLayoutReady(
      max >= 0 &&
        entryRefs.current.length === markerCount &&
        entryRefs.current.every((entry) => Boolean(entry)),
    )
    // Sync initial position once before first paint; resize uses measure().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLayoutReady) return
    if (options.introSkipped || !options.introAnimating) {
      cancelAnimationFrame(introScrollId.current)
      introScrollId.current = 0
      introStartedRef.current = false
      return
    }

    introWasAnimatingRef.current = true
    const railMs = options.introRailMs ?? 3200

    const step = (now: number) => {
      const markersReady =
        markerCount === 0 ||
        entryRefs.current.filter(Boolean).length >= markerCount

      if (!markersReady) {
        introScrollId.current = requestAnimationFrame(step)
        return
      }

      // Keep present current while images / stacks settle during the sweep.
      measureLayout()
      const present = presentScrollRef.current

      if (!introStartedRef.current) {
        introStartedRef.current = true
        introScrollStart.current = now
        onIntroScrollStartRef.current?.()
        sectionRef.current?.style.setProperty("--lifeline-intro-progress", "0")
        applyScrollRef.current(0)
      }

      const elapsed = now - introScrollStart.current
      const progress = introGetTrackProgressRef.current
        ? clamp(introGetTrackProgressRef.current(elapsed), 0, 1)
        : clamp(elapsed / railMs, 0, 1)

      sectionRef.current?.style.setProperty(
        "--lifeline-intro-progress",
        String(progress),
      )

      applyScrollRef.current(progress * present)

      if (progress < 1) {
        introScrollId.current = requestAnimationFrame(step)
        return
      }

      sectionRef.current?.style.setProperty("--lifeline-intro-progress", "1")
      applyScrollRef.current(presentScrollRef.current)
      introScrollId.current = 0
    }

    introScrollId.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(introScrollId.current)
      introScrollId.current = 0
      introStartedRef.current = false
    }
  }, [
    isLayoutReady,
    markerCount,
    measureLayout,
    options.introAnimating,
    options.introRailMs,
    options.introSkipped,
  ])

  useEffect(() => {
    if (options.introSkipped) return
    if (options.introAnimating) return
    if (!introWasAnimatingRef.current) return

    introWasAnimatingRef.current = false
    measureLayout()
    applyScrollRef.current(presentScrollRef.current)
    sectionRef.current?.style.removeProperty("--lifeline-intro-progress")
    onIntroSettleCompleteRef.current?.()
  }, [measureLayout, options.introAnimating, options.introSkipped])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frameId = 0
    let resizeObserver: ResizeObserver | null = null

    const measure = () => {
      measureLayout()

      const scrollParent = scrollParentRef.current
      if (!scrollParent) return

      const introOwnsScroll =
        introAnimatingRef.current && introStartedRef.current
      const introSettled =
        introSkippedRef.current || !introAnimatingRef.current
      const markersReady =
        markerCount === 0 ||
        entryRefs.current.filter(Boolean).length >= markerCount
      const present = presentScrollRef.current

      if (
        !userHasNavigatedRef.current &&
        !introOwnsScroll &&
        introSettled &&
        !isEmbedRef.current &&
        markersReady &&
        Math.abs(scrollParent.scrollTop - present) > 1
      ) {
        // Recover from a first paint that parked before today was measurable,
        // or from the old “scroll to end” behavior.
        applyScroll(present)
      } else if (!introOwnsScroll) {
        scrollParent.scrollTop = clamp(
          scrollParent.scrollTop,
          0,
          maxScrollRef.current,
        )
        syncAwayFromToday()
      }

      setIsLayoutReady(
        entryRefs.current.length === markerCount &&
          entryRefs.current.every((entry) => Boolean(entry)),
      )
    }

    const scheduleMeasure = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(measure)
    }

    scheduleMeasureRef.current = scheduleMeasure

    scheduleMeasure()
    frameId = requestAnimationFrame(() => {
      measure()
      requestAnimationFrame(measure)
    })

    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(section)

    window.addEventListener("resize", scheduleMeasure)

    const isScrollLocked = () =>
      introLockedRef.current && introStartedRef.current

    const preventScroll = (event: Event) => {
      if (!isScrollLocked()) return
      event.preventDefault()
    }

    const onScroll = () => {
      if (introAnimatingRef.current && introStartedRef.current) return
      // Native touch/wheel scrolling counts as navigation after intro.
      if (!introAnimatingRef.current) {
        // Only mark after the user moves away from the parked present.
        const scrollParent = scrollParentRef.current
        if (
          scrollParent &&
          Math.abs(scrollParent.scrollTop - presentScrollRef.current) > 8
        ) {
          markUserNavigated()
        }
      }
      syncAwayFromToday()
    }

    const scrollParent = getScrollParent(section)
    scrollParentRef.current = scrollParent

    scrollParent?.addEventListener("wheel", preventScroll, { passive: false })
    scrollParent?.addEventListener("touchmove", preventScroll, {
      passive: false,
    })
    scrollParent?.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frameId)
      cancelAnimationFrame(todayScrollId.current)
      todayScrollId.current = 0
      resizeObserver?.disconnect()
      window.removeEventListener("resize", scheduleMeasure)
      scrollParent?.removeEventListener("wheel", preventScroll)
      scrollParent?.removeEventListener("touchmove", preventScroll)
      scrollParent?.removeEventListener("scroll", onScroll)
      initialized.current = false
      userHasNavigatedRef.current = false
    }
  }, [
    applyScroll,
    markUserNavigated,
    markerCount,
    measureLayout,
    syncAwayFromToday,
  ])

  return {
    sectionRef,
    setEntryRef,
    isLayoutReady,
    todayNav,
    scrollToToday,
  }
}

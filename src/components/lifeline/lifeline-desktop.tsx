"use client"

import { useMemo, type CSSProperties } from "react"
import { AppIcons, Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import {
  LifelineStickyLabels,
  LIFELINE_STICKY_SHIELD_WIDTH,
} from "./lifeline-labels"
import { LifelineMarkerColumn } from "./lifeline-marker"
import type { LifelineEventImage, LifelineProps } from "./types"
import { getLifelineEventImage } from "./lifeline-event"
import { LifelineHoverImageProvider } from "./lifeline-hover-image"
import { LifelineFloatingPhotos } from "./lifeline-photos"
import { useLifelineIntro } from "./use-lifeline-intro"
import { useLifelineScroll } from "./use-lifeline-scroll"
import { getMarkerWidth } from "./lifeline-utils"

export function LifelineDesktop({
  markers,
  birthYear,
  className,
  title = "Lifeline",
  mode = "auto",
}: LifelineProps) {
  const widths = useMemo(
    () =>
      markers.map((marker, index) =>
        getMarkerWidth(marker, markers[index + 1]?.year),
      ),
    [markers],
  )

  // Left edge of each marker's slot within the track — anchors for the
  // floating photo cards.
  const offsets = useMemo(() => {
    const result: number[] = []
    let sum = 0
    for (const width of widths) {
      result.push(sum)
      sum += width
    }
    return result
  }, [widths])

  const hoverImages = useMemo(() => {
    const images: LifelineEventImage[] = []
    for (const marker of markers) {
      for (const event of marker.events) {
        const image = getLifelineEventImage(event)
        if (image) images.push(image)
      }
    }
    return images
  }, [markers])

  const intro = useLifelineIntro(widths)
  const isIntroAnimating = intro.shouldPlay && intro.isPlaying

  const {
    sectionRef,
    trackRef,
    labelsRef,
    setMarkerRef,
    isLayoutReady,
    isEmbed,
    introArmed,
    todayNav,
    scrollToToday,
  } = useLifelineScroll(markers.length, {
    mode,
    introLocked: isIntroAnimating,
    introAnimating: isIntroAnimating,
    introSkipped: !intro.shouldPlay,
    introRailMs: intro.railDuration,
    introGetTrackProgress: intro.getTrackProgressAtTime,
    onIntroScrollStart: intro.startIntroTimer,
    onIntroSettleComplete: intro.completeIntro,
  })

  // Embedded, the open waits for the module to come into view: the marker
  // fades are CSS animations that start the moment their class lands, so
  // applying it early would spend them below the fold.
  const introWaitingInView = isEmbed && intro.shouldPlay && !introArmed
  const showIntro = isIntroAnimating && isLayoutReady && !introWaitingInView

  const trackWidth =
    LIFELINE_STICKY_SHIELD_WIDTH + widths.reduce((sum, width) => sum + width, 0)

  const introStyle = {
    "--lifeline-labels-ms": `${intro.labelsDuration}ms`,
    "--lifeline-rail-ms": `${intro.railDuration}ms`,
  } as CSSProperties

  return (
    <section
      ref={sectionRef}
      data-lifeline-mode={isEmbed ? "embed" : "page"}
      // Embedded, the module needs a tab stop to be operable at all — a
      // page-mode lifeline is reached just by scrolling to it.
      tabIndex={isEmbed ? 0 : undefined}
      className={cn(
        "relative h-full min-h-0 select-none overflow-hidden [&_a]:cursor-pointer",
        // `pan-y` lets the browser start a vertical page scroll on the
        // first frame instead of waiting on the JS axis lock; horizontal
        // panning stays ours.
        isEmbed &&
          "touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        // Hold it blank rather than showing a settled timeline that then
        // resets itself to play the intro. Below the fold there is nothing
        // to see anyway, and the arming margin means it fills in before it
        // reaches the reader.
        (!isLayoutReady || introWaitingInView) && "invisible",
        className,
      )}
      aria-label={title}
      style={showIntro ? introStyle : undefined}
    >
      <LifelineHoverImageProvider preload={hoverImages}>
      {/*
        Vertically centered. Activity stacks expand out of flow on hover, so
        the track height (and this centering) stay put. `safe center` falls
        back to start if a column would overflow the stage top.
      */}
      <div
        className="flex h-full items-center overflow-hidden"
        style={{ alignItems: "safe center" }}
      >
        <div
          ref={trackRef}
          className="relative flex w-max items-start will-change-transform [--lifeline-people-top:calc(14.5rem+40px)] [--lifeline-rail:5rem]"
          style={{ width: trackWidth }}
        >
          {/*
            LIFELINE_STICKY_SHIELD_WIDTH reserves this column at the head of
            the track, and the column has to actually paint it: once the
            track scrolls, marker text passes underneath and would otherwise
            read straight through "Age" and "Years".

            `bg-white dark:bg-black` to match the framing the shell puts
            around this — reframe the page on a different surface and this
            wants overriding with it. The transition is not decoration
            either: without it the shield snaps between the two while the
            page behind it is still crossfading, which flashes a hard box
            for the length of a theme switch. 300ms on the default curve is
            what `LifelineShell` fades on, so the two move as one.
          */}
          <div
            ref={labelsRef}
            className="lifeline-labels shrink-0 bg-white transition-colors duration-300 will-change-transform dark:bg-black"
            style={{ width: LIFELINE_STICKY_SHIELD_WIDTH }}
          >
            <div className={cn(showIntro && "lifeline-labels-intro")}>
              <LifelineStickyLabels />
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-[var(--lifeline-rail)] h-px -translate-y-1/2 overflow-hidden"
            >
              <div
                className={cn(
                  "lifeline-rail-line h-px w-full transition-opacity duration-300",
                  showIntro && "lifeline-rail-intro",
                )}
              />
            </div>

            <div className="relative flex items-start">
              {markers.map((marker, index) => (
                <LifelineMarkerColumn
                  key={marker.id}
                  ref={(node) => setMarkerRef(index, node)}
                  marker={marker}
                  birthYear={birthYear}
                  minWidth={widths[index]}
                  animateIntro={showIntro}
                  introDelay={intro.getMarkerDelay(index)}
                  introDuration={intro.getMarkerFadeDuration(index)}
                />
              ))}
            </div>

            <LifelineFloatingPhotos
              markers={markers}
              offsets={offsets}
              widths={widths}
              animateIntro={showIntro}
              getIntroDelay={intro.getMarkerDelay}
              getIntroDuration={intro.getMarkerFadeDuration}
            />
          </div>
        </div>
      </div>

      {todayNav && !showIntro ? (
        <button
          type="button"
          onClick={scrollToToday}
          data-lifeline-interactive=""
          className={cn(
            "pointer-events-auto absolute bottom-6 z-40 inline-flex items-center gap-1.5",
            "rounded-2xl bg-white px-3 py-2 font-runde text-xs font-medium tracking-[-2%] text-zinc-700",
            "shadow-[0_8px_24px_-12px_rgb(0_0_0/0.22)] ring-1 ring-[#f4f4f4]",
            "transition-[color,background-color,opacity,transform] duration-200",
            "hover:bg-zinc-50 hover:text-black",
            "dark:bg-zinc-900 dark:text-zinc-200 dark:ring-white/10 dark:hover:bg-zinc-800 dark:hover:text-white",
            // Past → return rightward; future → return leftward.
            todayNav === "past"
              ? "left-5 md:left-8"
              : "right-5 md:right-8",
          )}
        >
          {todayNav === "future" ? (
            <Icon
              icon={AppIcons.chevronLeft}
              size={14}
              className="text-zinc-400"
            />
          ) : null}
          Today
          {todayNav === "past" ? (
            <Icon
              icon={AppIcons.chevronRight}
              size={14}
              className="text-zinc-400"
            />
          ) : null}
        </button>
      ) : null}

      </LifelineHoverImageProvider>
    </section>
  )
}
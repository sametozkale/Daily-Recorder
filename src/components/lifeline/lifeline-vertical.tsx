"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { AppIcons, Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { CompanyIcon } from "./company-icon"
import {
  isIsoDateId,
  useLifelineInteraction,
} from "./lifeline-interaction"
import {
  getLifelineEventEffect,
  getLifelineEventImage,
  getLifelineEventKey,
  LifelineEventText,
} from "./lifeline-event"
import { useLifelineFireworks } from "./lifeline-fireworks"
import {
  LifelineLightbox,
  type LifelineLightboxStart,
} from "./lifeline-lightbox"
import { aggregateLifelinePeople, LifelinePeople } from "./lifeline-people"
import { LifelinePhotoCard } from "./lifeline-photos"
import {
  getMediaPhotos,
  getProviderPhotos,
  ProviderCardStack,
} from "./provider-card-stack"
import type { LifelineEvent, LifelineMarker, LifelineProps } from "./types"
import { getMarkerHeight, hasMarkerContent } from "./lifeline-utils"
import { useLifelineIntro } from "./use-lifeline-intro"
import { useLifelineVerticalScroll } from "./use-lifeline-vertical-scroll"

const GRID_CLASS = "grid grid-cols-[2.5rem_1rem_1fr] gap-x-3"
const RAIL_LEFT = "calc(2.5rem + 0.75rem + 0.5rem)"

/**
 * Above this many entries the delay-armed intro fades would promote
 * every entry to a compositor layer at once and crash mobile Safari's
 * compositor. Long timelines fade entries in as they enter the
 * viewport during the auto-scroll instead — same look, but only a
 * handful of live animations at any moment.
 */
const MAX_ARMED_ENTRIES = 80

function RailTick() {
  return (
    <span
      aria-hidden="true"
      className="block h-px w-[10px] bg-zinc-400 transition-colors duration-300 dark:bg-zinc-700"
    />
  )
}

/**
 * One event line. Touch layouts have no hover reveal, so an event with
 * attached media becomes tappable: the media expands into the lightbox
 * from the event's text, framed by the poster image's real aspect.
 */
function LifelineVerticalEvent({ event }: { event: LifelineEvent }) {
  const fireworks = useLifelineFireworks()
  const image = getLifelineEventImage(event)
  const effect = getLifelineEventEffect(event)
  const textRef = useRef<HTMLParagraphElement>(null)
  const aspectRef = useRef(3 / 4)
  const [lightboxStart, setLightboxStart] =
    useState<LifelineLightboxStart | null>(null)

  // The event text has no card geometry — synthesize a small seed
  // centered on the text, carrying the media's aspect so the lightbox
  // expands into the right frame.
  const measureText = useCallback((): LifelineLightboxStart | null => {
    const el = textRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const w = 96
    return {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      w,
      h: w * aspectRef.current,
    }
  }, [])

  const openMedia = () => {
    if (!image || lightboxStart) return
    // The poster sets the frame; for videos it shares the clip's aspect.
    const probe = new window.Image()
    probe.src = image.src
    const open = () => {
      if (probe.naturalWidth > 0) {
        aspectRef.current = probe.naturalHeight / probe.naturalWidth
      }
      setLightboxStart(measureText())
    }
    if (probe.complete) {
      open()
    } else {
      probe.onload = open
      probe.onerror = open
    }
  }

  return (
    <>
      <p
        ref={textRef}
        className={cn(
          "max-w-[18rem] text-left text-[14px] leading-[1.55] tracking-[-0.01em]",
          (image || effect) && "cursor-pointer",
        )}
        onClick={
          image
            ? openMedia
            : effect && fireworks
              ? () => fireworks.launch(effect)
              : undefined
        }
      >
        <LifelineEventText event={event} />
        {image && (
          // Glued to the last word with a no-break space so the icon
          // can never wrap onto a line of its own.
          <span className="whitespace-nowrap">
            {" "}
            <span className="ml-0.5 inline-block -translate-y-px text-zinc-400 transition-colors duration-300 dark:text-zinc-600">
              <Icon
                icon={image.video ? AppIcons.film : AppIcons.image}
                size={12}
              />
            </span>
          </span>
        )}
      </p>
      {lightboxStart && image && (
        <LifelineLightbox
          photo={image}
          rotate={0}
          start={lightboxStart}
          getHome={measureText}
          onClosed={() => setLightboxStart(null)}
        />
      )}
    </>
  )
}

const LifelineVerticalEntry = forwardRef<
  HTMLLIElement,
  {
    marker: LifelineMarker
    birthYear: number
    animateIntro?: boolean
    introDelay?: number
    introDuration?: number
    revealPending?: boolean
  }
>(function LifelineVerticalEntry(
  {
    marker,
    birthYear,
    animateIntro = false,
    introDelay = 0,
    introDuration = 420,
    revealPending = false,
  },
  ref,
) {
  const age = marker.age ?? marker.year - birthYear
  const people = aggregateLifelinePeople(marker)
  const providerPhotos = getProviderPhotos(marker.photos)
  const mediaPhotos = getMediaPhotos(marker.photos)
  const hasContent =
    hasMarkerContent(marker) ||
    providerPhotos.length > 0 ||
    mediaPhotos.length > 0
  const hasActivities = marker.events.length > 0
  const interaction = useLifelineInteraction()
  const canSelectDay =
    Boolean(interaction?.onDaySelect) && isIsoDateId(marker.id)
  // Fresh tilts per visit; stacked neighbors lean apart.
  const [photoTilts] = useState(() =>
    mediaPhotos.map((_, index) => {
      const sign =
        mediaPhotos.length > 1
          ? index % 2 === 0
            ? -1
            : 1
          : Math.random() > 0.5
            ? 1
            : -1
      return sign * (2 + Math.random() * 4)
    }),
  )

  const addDayButton = canSelectDay ? (
    <button
      type="button"
      onClick={() => interaction?.onDaySelect?.(marker.id)}
      aria-label={`Add activity on ${marker.label ?? marker.year}`}
      className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-black dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <Icon icon={AppIcons.plus} size={14} />
    </button>
  ) : null

  return (
    <li
      ref={ref}
      className={hasContent ? "pb-10" : "pb-3"}
      aria-label={marker.label ?? `${marker.year}`}
    >
      <div
        className={cn(
          animateIntro && "lifeline-marker-intro",
          revealPending && "opacity-0",
        )}
        style={{
          animationDelay: animateIntro ? `${introDelay}ms` : undefined,
          ...(animateIntro
            ? ({
                "--lifeline-marker-fade-ms": `${introDuration}ms`,
              } as CSSProperties)
            : {}),
        }}
      >
        <div className={`${GRID_CLASS} items-center`}>
          <p className="text-right text-[11px] font-medium leading-4 tabular-nums text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
            {age !== "" && age !== undefined ? age : null}
          </p>

          <div className="flex items-center justify-center">
            <RailTick />
          </div>

          {canSelectDay ? (
            <button
              type="button"
              onClick={() => interaction?.onDaySelect?.(marker.id)}
              className="whitespace-nowrap text-left text-[15px] font-medium leading-5 tabular-nums text-zinc-500 transition-colors duration-300 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              {marker.label ?? marker.year}
            </button>
          ) : (
            <p className="whitespace-nowrap text-[15px] font-medium leading-5 tabular-nums text-zinc-500 transition-colors duration-300 dark:text-zinc-400">
              {marker.label ?? marker.year}
            </p>
          )}
        </div>

        {canSelectDay && !hasActivities ? (
          <div className={`${GRID_CLASS} mt-3`}>
            <div aria-hidden="true" />
            <div className="flex justify-center">{addDayButton}</div>
            <div aria-hidden="true" />
          </div>
        ) : null}

        {hasContent && (
          <div className={`${GRID_CLASS} mt-6`}>
            <div aria-hidden="true" />
            <div aria-hidden="true" />
            <div className="min-w-0 text-zinc-500 transition-colors duration-300 dark:text-zinc-400">
              {providerPhotos.length > 0 ? (
                <ProviderCardStack photos={providerPhotos} forceExpanded />
              ) : null}

              {marker.companies && marker.companies.length > 0 && (
                <div className="mb-2 flex items-center justify-start gap-1.5">
                  {marker.companies.map((company) => (
                    <CompanyIcon
                      key={company.id}
                      id={company.id}
                      label={company.name}
                      className="opacity-70"
                    />
                  ))}
                </div>
              )}

              {hasActivities && (
                <div className="space-y-4">
                  {marker.events.map((event, index) => (
                    <LifelineVerticalEvent
                      key={getLifelineEventKey(event, index)}
                      event={event}
                    />
                  ))}
                </div>
              )}

              {canSelectDay && hasActivities ? (
                <div className="mt-4">{addDayButton}</div>
              ) : null}

              {mediaPhotos.length > 0 && (
                <div className="mt-6 flex flex-wrap items-start">
                  {mediaPhotos.map((photo, index) => (
                    <LifelinePhotoCard
                      key={`${photo.src}-${index}`}
                      photo={photo}
                      rotate={photo.rotate ?? photoTilts[index] ?? 0}
                      width={160}
                      className={cn(
                        "relative",
                        index > 0 && "-ml-8 mt-6",
                      )}
                    />
                  ))}
                </div>
              )}

              {people.length > 0 && (
                <div className="mt-6 border-t border-zinc-200/70 pt-5 transition-colors duration-300 dark:border-zinc-800/70">
                  <LifelinePeople people={people} allowWrap />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  )
})

export function LifelineVertical({
  markers,
  birthYear,
  title = "Lifeline",
  mode = "auto",
}: LifelineProps) {
  // Only an explicit `mode` embeds the vertical layout. `"auto"` measures
  // scrollability on desktop, but the mobile layout *is* a vertical
  // scroller inside a scrolling stage, so that test would read every
  // full-page timeline as embedded and drop its intro.
  const isEmbed = mode === "embed"
  const heights = useMemo(
    () =>
      markers.map((marker, index) =>
        getMarkerHeight(marker, markers[index + 1]?.year),
      ),
    [markers],
  )

  const intro = useLifelineIntro(heights)
  const isIntroAnimating = intro.shouldPlay && intro.isPlaying

  // Warm the event media posters during idle — the tap-to-open
  // lightbox measures its frame from these, and a cold fetch at tap
  // time reads as lag.
  useEffect(() => {
    const sources: string[] = []
    for (const marker of markers) {
      for (const event of marker.events) {
        const image = getLifelineEventImage(event)
        if (image) sources.push(image.src)
      }
    }
    if (sources.length === 0) return

    const warm = () => {
      sources.forEach((src) => {
        const image = new window.Image()
        image.src = src
      })
    }

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(warm)
      return () => window.cancelIdleCallback(handle)
    }
    const timeout = window.setTimeout(warm, 2000)
    return () => window.clearTimeout(timeout)
  }, [markers])

  const { sectionRef, setEntryRef, isLayoutReady } = useLifelineVerticalScroll(
    markers.length,
    {
      isEmbed,
      introLocked: isIntroAnimating,
      introAnimating: isIntroAnimating,
      // Embedded, the sweep would play out unseen below the fold — and
      // lock the module's own scroller while doing it.
      introSkipped: !intro.shouldPlay || isEmbed,
      introRailMs: intro.railDuration,
      introGetTrackProgress: intro.getTrackProgressAtTime,
      onIntroScrollStart: intro.startIntroTimer,
      onIntroSettleComplete: intro.completeIntro,
    },
  )

  const showIntro = isIntroAnimating && isLayoutReady && !isEmbed
  const revealOnScroll = markers.length > MAX_ARMED_ENTRIES
  const animateEntries = showIntro && !revealOnScroll

  // Rail-synced fades for long timelines: entries render hidden and
  // each one fades in the moment the rail tip (--lifeline-intro-progress,
  // written every frame by the intro scroll) crosses its position —
  // desktop's choreography, but each entry drops its animation (and
  // compositor layer) as soon as its fade finishes.
  useEffect(() => {
    if (!showIntro || !revealOnScroll) return
    const section = sectionRef.current
    const ol = section?.querySelector("ol")
    if (!section || !ol) return

    const entries = Array.from(ol.children) as HTMLElement[]
    const targets = entries.map(
      (li) => li.firstElementChild as HTMLElement | null,
    )

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName !== "lifeline-marker-in") return
      ;(event.target as HTMLElement).classList.remove("lifeline-marker-intro")
    }
    section.addEventListener("animationend", onAnimationEnd)

    let next = 0
    let frame = 0
    const tick = () => {
      const progress = parseFloat(
        section.style.getPropertyValue("--lifeline-intro-progress") || "0",
      )
      const tip = progress * ol.offsetHeight

      while (next < entries.length && entries[next].offsetTop <= tip) {
        const el = targets[next]
        if (el) {
          el.classList.remove("opacity-0")
          el.classList.add("lifeline-marker-intro")
        }
        next++
      }

      if (next < entries.length) {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      section.removeEventListener("animationend", onAnimationEnd)
      targets.forEach((el) => {
        el?.classList.remove("opacity-0", "lifeline-marker-intro")
      })
    }
  }, [showIntro, revealOnScroll, sectionRef])

  const introStyle = {
    "--lifeline-labels-ms": `${intro.labelsDuration}ms`,
    "--lifeline-rail-ms": `${intro.railDuration}ms`,
  } as CSSProperties

  return (
    <article
      ref={sectionRef}
      aria-label={title}
      className={cn(
        "relative select-none px-6 pb-10 pt-4 [&_a]:cursor-pointer",
        !isLayoutReady && "invisible",
      )}
      style={showIntro ? introStyle : undefined}
    >
      <div className={cn(`${GRID_CLASS} mb-6 items-end`, showIntro && "lifeline-labels-intro")}>
        <p className="text-right text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
          {new Date().getFullYear()}
        </p>
        <div aria-hidden="true" />
        <p className="text-[11px] font-medium uppercase leading-5 tracking-[0.08em] text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
          Days
        </p>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 top-0 overflow-hidden -translate-x-1/2"
          style={{ left: RAIL_LEFT, width: 1 }}
        >
          <div
            className={cn(
              "h-full w-px border-l border-dashed border-zinc-300 transition-colors duration-300 dark:border-zinc-800",
              showIntro && "lifeline-rail-intro-vertical",
            )}
          />
        </div>

        <ol className="relative">
          {markers.map((marker, index) => (
            <LifelineVerticalEntry
              key={marker.id}
              ref={(node) => setEntryRef(index, node)}
              marker={marker}
              birthYear={birthYear}
              animateIntro={animateEntries}
              revealPending={showIntro && revealOnScroll}
              introDelay={intro.getMarkerDelay(index)}
              introDuration={intro.getMarkerFadeDuration(index)}
            />
          ))}
        </ol>
      </div>
    </article>
  )
}
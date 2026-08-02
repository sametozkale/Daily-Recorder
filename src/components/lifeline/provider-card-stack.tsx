"use client"

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { AppIcons, Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { figmaEmbedUrl } from "@/lib/figma-url"
import { ActivityCardMenu } from "./activity-card-menu"
import { ActivityTypeIcon } from "./activity-type-icon"
import {
  PROVIDER_CARD_FAN_PAD_X,
  PROVIDER_CARD_HEIGHT,
  PROVIDER_CARD_WIDTH,
  PROVIDER_STACK_END_PAD,
  PROVIDER_STACK_MAX,
  PROVIDER_STACK_VIEWPORT_PAD,
} from "./provider-card-layout"
import type { LifelinePhoto } from "./types"

export {
  PROVIDER_CARD_FAN_PAD_X,
  PROVIDER_CARD_HEIGHT,
  PROVIDER_CARD_WIDTH,
  PROVIDER_DAY_MIN_WIDTH,
} from "./provider-card-layout"

const CARD_WIDTH = PROVIDER_CARD_WIDTH
const CARD_HEIGHT = PROVIDER_CARD_HEIGHT
const MEDIA_HEIGHT = 141
const STACK_GAP = 8
const FAN_PAD_X = PROVIDER_CARD_FAN_PAD_X
const FAN_PAD_Y = 42
const ADD_BUTTON_SIZE = 28
const ADD_BUTTON_GAP = 12
const ADD_BUTTON_PAD = 16

function isActivityCard(photo: LifelinePhoto) {
  return Boolean(photo.activityType || photo.provider)
}

export function getActivityCards(photos: LifelinePhoto[] | undefined) {
  return (photos ?? []).filter(isActivityCard)
}

/** @deprecated Use getActivityCards */
export function getProviderPhotos(photos: LifelinePhoto[] | undefined) {
  return getActivityCards(photos)
}

export function getMediaPhotos(photos: LifelinePhoto[] | undefined) {
  return (photos ?? []).filter((photo) => !isActivityCard(photo))
}

function hasPreviewImage(photo: LifelinePhoto) {
  return Boolean(photo.src && !photo.src.includes("/brands/"))
}

/** White well: image preview when available, else Figma embed fallback. */
function ActivityCardMedia({
  photo,
  href,
}: {
  photo: LifelinePhoto
  href?: string
}) {
  const showImage = hasPreviewImage(photo)
  const embedSrc =
    !showImage && photo.provider === "figma" && href
      ? figmaEmbedUrl(href)
      : null

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-white dark:bg-zinc-950"
      style={{ height: MEDIA_HEIGHT }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt=""
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      ) : embedSrc ? (
        <iframe
          src={embedSrc}
          title={photo.alt}
          loading="lazy"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[280%] w-[280%] -translate-x-1/2 -translate-y-1/2 border-0"
          allowFullScreen
        />
      ) : null}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-lifeline-interactive=""
          aria-label={`Open ${photo.alt}`}
          className="absolute inset-0 z-10"
        />
      ) : null}
    </div>
  )
}

type StackPose = {
  rotate: number
  x: number
  y: number
}

/**
 * Resting fan poses — front card nearly straight, deeper cards more
 * skewed, alternating lean like the Wol stack (≈ −10° / +8° / −2°).
 */
function createStackPoses(count: number): StackPose[] {
  if (count <= 1) return [{ rotate: 0, x: 0, y: 0 }]

  return Array.from({ length: count }, (_, index) => {
    const sign = index % 2 === 0 ? -1 : 1
    const rotate =
      index === 0
        ? sign * (1.5 + Math.random() * 2.5)
        : sign * (5 + index * 2.5 + Math.random() * 3)
    const x = sign * (2 + index * 3 + Math.random() * 4)
    const y = index * (3 + Math.random() * 3)
    return {
      rotate: Math.max(-12, Math.min(12, rotate)),
      x,
      y,
    }
  })
}

/**
 * Activity cards (all types): fanned/random stack at rest, then on day
 * hover they ease into a vertical list (newest → oldest).
 */
export function ProviderCardStack({
  photos,
  className,
  forceExpanded = false,
  onAdd,
  addLabel = "Add activity",
}: {
  photos: LifelinePhoto[]
  className?: string
  /** Vertical / touch layouts can keep the list open. */
  forceExpanded?: boolean
  /** Renders under the cards inside the scroll layer (survives out-of-flow expand). */
  onAdd?: () => void
  addLabel?: string
}) {
  const cards = photos.filter(isActivityCard)
  const [poses] = useState(() => createStackPoses(cards.length))
  const rootRef = useRef<HTMLDivElement>(null)

  const count = cards.length
  const fanned = count > 1
  const collapsedH = fanned ? CARD_HEIGHT + FAN_PAD_Y : CARD_HEIGHT
  const collapsedW = fanned ? CARD_WIDTH + FAN_PAD_X : CARD_WIDTH
  const expandedH = count * CARD_HEIGHT + (count - 1) * STACK_GAP
  const footerH = onAdd
    ? ADD_BUTTON_GAP + ADD_BUTTON_SIZE + ADD_BUTTON_PAD
    : PROVIDER_STACK_END_PAD
  const scrollContentH = expandedH + footerH

  // Cap the scroll viewport to what's actually visible below the stack —
  // the stage clips overflow, so a taller panel would hide lower cards.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || count === 0) return

    const updateMax = () => {
      const top = el.getBoundingClientRect().top
      const available = Math.max(
        collapsedH,
        window.innerHeight - top - PROVIDER_STACK_VIEWPORT_PAD,
      )
      el.style.setProperty("--stack-max", `${available}px`)
    }

    updateMax()
    const frame = requestAnimationFrame(updateMax)
    window.addEventListener("resize", updateMax)

    const observer = new ResizeObserver(updateMax)
    observer.observe(el)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", updateMax)
      observer.disconnect()
    }
  }, [collapsedH, count])

  if (cards.length === 0) return null

  // Vertical / touch: fill the content column so 258px cards don't overflow
  // narrow phones. Desktop hover stack keeps the fixed Figma width.
  const fluid = forceExpanded

  return (
    <div
      ref={rootRef}
      className={cn(
        "provider-card-stack relative mb-3",
        forceExpanded && "provider-card-stack--expanded",
        fluid && "w-full max-w-[258px]",
        className,
      )}
      style={
        {
          width: fluid ? undefined : collapsedW,
          "--stack-collapsed": `${collapsedH}px`,
          "--stack-expanded": `${expandedH}px`,
          "--stack-scroll-h": `${scrollContentH}px`,
          "--stack-collapsed-w": fluid ? "100%" : `${collapsedW}px`,
          "--stack-expanded-w": fluid ? "100%" : `${CARD_WIDTH}px`,
          "--stack-max": PROVIDER_STACK_MAX,
          "--card-h": `${CARD_HEIGHT}px`,
          "--stack-gap": `${STACK_GAP}px`,
        } as CSSProperties
      }
    >
      <div className="provider-card-stack__scroll" data-lifeline-vscroll="">
        <div className="provider-card-stack__inner">
          {cards.map((photo, index) => {
            const href = photo.href
            const pose = poses[index] ?? { rotate: 0, x: 0, y: 0 }

            return (
              <div
                key={`${photo.activityId ?? photo.alt}-${index}`}
                className="provider-card-stack__card group/card absolute left-0 top-0 rounded-2xl bg-[#fafafa] shadow-[0_8px_24px_-12px_rgb(0_0_0/0.18)] ring-1 ring-black/5 transition-[transform,box-shadow,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-zinc-900 dark:ring-white/10"
                style={
                  {
                    width: fluid ? "100%" : CARD_WIDTH,
                    height: CARD_HEIGHT,
                    zIndex: count - index,
                    "--i": index,
                    "--rot": `${pose.rotate}deg`,
                    "--tx": `${pose.x}px`,
                    "--ty": `${pose.y}px`,
                  } as CSSProperties
                }
              >
                <div className="relative flex h-full w-full flex-col gap-2 px-1 pb-1 pt-2">
                  <div className="relative z-20 flex min-w-0 items-center gap-1.5 pl-1.5 pr-1">
                    <ActivityTypeIcon href={href} size={14} />
                    <p className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-[-0.13px] text-[#323232] dark:text-zinc-200">
                      {photo.alt}
                    </p>
                    {photo.activityId ? (
                      <ActivityCardMenu activityId={photo.activityId} />
                    ) : null}
                  </div>

                  <ActivityCardMedia photo={photo} href={href} />
                </div>
              </div>
            )
          })}

          {onAdd ? (
            <button
              type="button"
              onClick={onAdd}
              aria-label={addLabel}
              data-lifeline-interactive=""
              className={cn(
                "absolute left-0 z-40 inline-flex h-7 items-center gap-1 rounded-full px-2.5",
                "bg-zinc-100 font-runde text-xs font-medium tracking-[-2%] text-zinc-500",
                "transition-[opacity,color,background-color] duration-300",
                "hover:bg-zinc-200 hover:text-black",
                "dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                forceExpanded
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
              style={{ top: expandedH + ADD_BUTTON_GAP }}
            >
              <Icon icon={AppIcons.plus} size={14} strokeWidth={2.25} />
              Add activity
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

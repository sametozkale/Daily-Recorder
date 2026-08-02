"use client"

import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import type { LifelinePhoto } from "./types"

const CARD_SIZE = 112
const STACK_GAP = 10
const STACK_PEEK = 6
const STACK_PEEK_X = 4

function isProviderPhoto(
  photo: LifelinePhoto,
): photo is LifelinePhoto & { provider: "github" | "figma" } {
  return photo.provider === "github" || photo.provider === "figma"
}

export function getProviderPhotos(photos: LifelinePhoto[] | undefined) {
  return (photos ?? []).filter(isProviderPhoto)
}

export function getMediaPhotos(photos: LifelinePhoto[] | undefined) {
  return (photos ?? []).filter((photo) => !isProviderPhoto(photo))
}

/**
 * GitHub / Figma logo cards: collapsed into a soft stack, then on day
 * hover they ease into a vertical list (newest on top).
 */
export function ProviderCardStack({
  photos,
  className,
  forceExpanded = false,
}: {
  photos: LifelinePhoto[]
  className?: string
  /** Vertical / touch layouts can keep the list open. */
  forceExpanded?: boolean
}) {
  const cards = photos.filter(isProviderPhoto)
  if (cards.length === 0) return null

  const count = cards.length
  const collapsedH = CARD_SIZE + (count - 1) * STACK_PEEK
  const expandedH = count * CARD_SIZE + (count - 1) * STACK_GAP

  return (
    <div
      className={cn(
        "provider-card-stack relative mb-3",
        forceExpanded && "provider-card-stack--expanded",
        className,
      )}
      style={
        {
          width: CARD_SIZE,
          "--stack-collapsed": `${collapsedH}px`,
          "--stack-expanded": `${expandedH}px`,
          "--card-size": `${CARD_SIZE}px`,
          "--stack-gap": `${STACK_GAP}px`,
          "--stack-peek": `${STACK_PEEK}px`,
          "--stack-peek-x": `${STACK_PEEK_X}px`,
        } as CSSProperties
      }
    >
      {cards.map((photo, index) => {
        const href = photo.href
        const Comp = href ? "a" : "div"

        return (
          <Comp
            key={`${photo.provider}-${photo.alt}-${index}`}
            href={href || undefined}
            target={href ? "_blank" : undefined}
            rel={href ? "noopener noreferrer" : undefined}
            data-lifeline-interactive={href ? "" : undefined}
            className="provider-card-stack__card absolute left-0 top-0 block overflow-hidden rounded-2xl bg-zinc-100 shadow-md ring-1 ring-black/8 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-zinc-900 dark:ring-white/12"
            style={
              {
                width: CARD_SIZE,
                height: CARD_SIZE,
                zIndex: count - index,
                "--i": index,
              } as CSSProperties
            }
          >
            <div className="flex size-full flex-col items-center justify-center gap-2.5 px-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/brands/${photo.provider}.svg`}
                alt=""
                className={cn(
                  "size-9 opacity-90",
                  photo.provider === "github" && "dark:invert",
                )}
              />
              <p className="line-clamp-2 text-center text-[11px] font-medium leading-snug text-zinc-600 dark:text-zinc-300">
                {photo.alt}
              </p>
            </div>
          </Comp>
        )
      })}
    </div>
  )
}

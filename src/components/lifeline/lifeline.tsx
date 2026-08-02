"use client"

import { useLayoutEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { LifelineDesktop } from "./lifeline-desktop"
import { LifelineFireworksProvider } from "./lifeline-fireworks"
import { LifelineVertical } from "./lifeline-vertical"
import {
  LIFELINE_MOBILE_BREAKPOINT,
  LIFELINE_SHORT_VIEWPORT_MAX,
  shouldUseVerticalLifeline,
} from "./lifeline-layout"
import type { LifelineProps } from "./types"

/**
 * `lifeline-typeset` carries the timeline's own font stack (Geist, falling
 * back to the system sans) rather than inheriting the host's `font-sans`.
 * A shadcn init writes a self-referential `--font-sans` into the theme
 * block, which resolves to the browser serif, and the timeline is dense
 * enough that the wrong face is the first thing you notice. Override
 * `--lifeline-font` to typeset it in something else.
 */
export function Lifeline(props: LifelineProps) {
  const [isVertical, setIsVertical] = useState<boolean | null>(null)

  useLayoutEffect(() => {
    const widthQuery = window.matchMedia(
      `(min-width: ${LIFELINE_MOBILE_BREAKPOINT}px)`,
    )
    const coarseQuery = window.matchMedia("(pointer: coarse)")
    const hoverQuery = window.matchMedia("(hover: none)")
    const shortQuery = window.matchMedia(
      `(max-height: ${LIFELINE_SHORT_VIEWPORT_MAX}px)`,
    )

    const update = () => setIsVertical(shouldUseVerticalLifeline())

    update()
    widthQuery.addEventListener("change", update)
    coarseQuery.addEventListener("change", update)
    hoverQuery.addEventListener("change", update)
    shortQuery.addEventListener("change", update)
    return () => {
      widthQuery.removeEventListener("change", update)
      coarseQuery.removeEventListener("change", update)
      hoverQuery.removeEventListener("change", update)
      shortQuery.removeEventListener("change", update)
    }
  }, [])

  if (isVertical === null) {
    return <div className="invisible h-full" aria-hidden="true" />
  }

  if (isVertical) {
    return (
      <LifelineFireworksProvider>
        {/*
          Embedded, the vertical timeline gets its own bounded scroller:
          the consumer's height lands here, and this element becomes the
          scroll parent the vertical hook looks for. Native overscroll
          chaining then releases to the page at either end, which is
          exactly the embed contract. Page mode is left alone — the host's
          own scroller owns it there, and `h-full` would only fight it.
        */}
        <div
          className={
            props.mode === "embed"
              ? cn(
                  "lifeline-typeset h-full min-h-0 overflow-y-auto overscroll-y-contain",
                  props.className,
                )
              : // Page mode: grow with content so LifelineStage owns scrolling.
                // Don't take `h-full` or the list clips inside the stage.
                "lifeline-typeset"
          }
        >
          <LifelineVertical {...props} />
        </div>
      </LifelineFireworksProvider>
    )
  }

  return (
    <LifelineFireworksProvider>
      <LifelineDesktop
        {...props}
        className={cn("lifeline-typeset pt-5", props.className)}
      />
    </LifelineFireworksProvider>
  )
}

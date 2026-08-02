export const LIFELINE_MOBILE_BREAKPOINT = 768

/**
 * Phone landscape (and similarly short coarse viewports) stay on the vertical
 * rail even when width clears the md breakpoint.
 */
export const LIFELINE_SHORT_VIEWPORT_MAX = 540

/** Prefer vertical when the device can’t hover and the viewport is short. */
export function shouldUseVerticalLifeline() {
  if (typeof window === "undefined") return false

  const wide = window.matchMedia(
    `(min-width: ${LIFELINE_MOBILE_BREAKPOINT}px)`,
  ).matches
  if (!wide) return true

  const coarse = window.matchMedia("(pointer: coarse)").matches
  const noHover = window.matchMedia("(hover: none)").matches
  const short = window.matchMedia(
    `(max-height: ${LIFELINE_SHORT_VIEWPORT_MAX}px)`,
  ).matches

  return coarse && noHover && short
}
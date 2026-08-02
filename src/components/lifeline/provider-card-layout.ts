/** Matches Figma node 2689:10393 — outer shell + title row + media well. */
export const PROVIDER_CARD_WIDTH = 258
export const PROVIDER_CARD_HEIGHT = 179
/** Extra room so rotated cards don’t clip (≈ Figma fan hull). */
export const PROVIDER_CARD_FAN_PAD_X = 28
/** Marker column width for a day with provider cards (card + fan + pr-8). */
export const PROVIDER_DAY_MIN_WIDTH =
  PROVIDER_CARD_WIDTH + PROVIDER_CARD_FAN_PAD_X + 32
/**
 * Fallback cap before the stack measures remaining viewport space.
 * Runtime `--stack-max` is set from the stack's top to the viewport bottom.
 */
export const PROVIDER_STACK_MAX =
  "calc(100dvh - var(--lifeline-rail, 5rem) - 9rem)"
/** SSR / layout-measurement fallback for PROVIDER_STACK_MAX (~3 cards). */
export const PROVIDER_STACK_MAX_PX = PROVIDER_CARD_HEIGHT * 3 + 8 * 2
/** Breathing room under the last card so menus / links stay reachable. */
export const PROVIDER_STACK_END_PAD = 72
/** Bottom inset when measuring how tall the stack may grow on screen. */
export const PROVIDER_STACK_VIEWPORT_PAD = 24

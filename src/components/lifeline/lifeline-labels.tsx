export const LIFELINE_LABEL_COLUMN_WIDTH = 56
export const LIFELINE_LABEL_GAP = 16
export const LIFELINE_STICKY_SHIELD_WIDTH =
  LIFELINE_LABEL_COLUMN_WIDTH + LIFELINE_LABEL_GAP
/** Fallback pin X — matches `left-5` on the display-name corner. */
export const LIFELINE_STICKY_LEFT = 20

export function LifelineStickyLabels() {
  return (
    <div
      className="relative"
      style={{ width: LIFELINE_LABEL_COLUMN_WIDTH }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-start text-left">
        <p className="mb-5 h-4 font-runde text-[11px] font-medium uppercase leading-4 tracking-[-2%] text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
          {new Date().getFullYear()}
        </p>
        <p className="mb-6 h-5 font-runde text-[11px] font-medium uppercase leading-5 tracking-[-2%] text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
          Days
        </p>
      </div>
    </div>
  )
}
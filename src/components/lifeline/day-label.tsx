import { cn } from "@/lib/utils"

/**
 * Quiet days show just the day number (“23”); on hover the month eases in
 * ahead of it (“Aug 23”) without stacking over the digits.
 */
export function DayLabel({
  label,
  labelFull,
  fallback,
  groupHover = true,
}: {
  label?: string
  labelFull?: string
  fallback: string | number
  /** Use the parent `.group` hover (desktop columns). */
  groupHover?: boolean
}) {
  const short = label ?? String(fallback)
  const full = labelFull ?? short

  if (full === short) {
    return <>{short}</>
  }

  // Trailing normal spaces collapse in overflow clips — use NBSP.
  const month = (
    full.endsWith(short) ? full.slice(0, -short.length) : full
  ).trimEnd()

  return (
    <span className="inline-flex items-baseline whitespace-nowrap">
      <span
        className={cn(
          "inline-block overflow-hidden whitespace-nowrap will-change-[max-width,opacity]",
          "max-w-0 opacity-0",
          "transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "motion-reduce:transition-none",
          groupHover
            ? "group-hover:max-w-[4.5rem] group-hover:opacity-100"
            : "group-hover/day:max-w-[4.5rem] group-hover/day:opacity-100",
        )}
      >
        {month}
        {"\u00A0"}
      </span>
      <span className="shrink-0">{short}</span>
    </span>
  )
}

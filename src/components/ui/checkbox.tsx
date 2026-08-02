"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { AppIcons, Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox relative flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-[#e8e8e8] bg-white text-transparent shadow-[0_1px_2px_rgb(0_0_0/0.04)] outline-none transition-[background-color,border-color,box-shadow,color,transform] duration-150 ease-out [corner-shape:squircle]",
        "hover:border-zinc-300 hover:bg-zinc-50",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-zinc-900 data-checked:bg-zinc-900 data-checked:text-white data-checked:shadow-[0_1px_2px_rgb(0_0_0/0.12)] data-checked:hover:border-zinc-800 data-checked:hover:bg-zinc-800",
        "dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-500 dark:hover:bg-zinc-900",
        "dark:data-checked:border-white dark:data-checked:bg-white dark:data-checked:text-zinc-900 dark:data-checked:hover:border-zinc-100 dark:data-checked:hover:bg-zinc-100",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-transform duration-150 ease-out data-unchecked:scale-50 data-unchecked:opacity-0 data-checked:scale-100 data-checked:opacity-100"
      >
        <Icon icon={AppIcons.check} size={12} strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

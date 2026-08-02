"use client"

import { AppIcons, Icon } from "@/components/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLifelineInteraction } from "./lifeline-interaction"

export function ActivityCardMenu({ activityId }: { activityId: string }) {
  const interaction = useLifelineInteraction()
  if (!interaction?.onEditActivity && !interaction?.onDeleteActivity) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-lifeline-interactive=""
        aria-label="Activity options"
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-xl text-zinc-400 opacity-0 outline-none transition-[opacity,color,background-color] hover:bg-black/5 hover:text-zinc-700 group-hover/card:opacity-100 data-popup-open:bg-black/5 data-popup-open:text-zinc-700 data-popup-open:opacity-100 [@media(hover:none)]:opacity-100 dark:hover:bg-white/10 dark:hover:text-zinc-200 dark:data-popup-open:bg-white/10 dark:data-popup-open:text-zinc-200"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Icon icon={AppIcons.more} size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-[100] min-w-32"
        data-lifeline-interactive=""
      >
        {interaction.onEditActivity ? (
          <DropdownMenuItem
            onClick={() => interaction.onEditActivity?.(activityId)}
          >
            <Icon icon={AppIcons.edit} size={16} />
            Edit
          </DropdownMenuItem>
        ) : null}
        {interaction.onDeleteActivity ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => interaction.onDeleteActivity?.(activityId)}
          >
            <Icon icon={AppIcons.trash} size={16} />
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import Link from "next/link"
import { toast } from "sonner"

import { AppIcons, Icon } from "@/components/icon"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/actions/auth"

/** Invisible anchors so the rail matches the corner name / actions insets. */
export function LifelineRailAnchors() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-0"
      aria-hidden="true"
    >
      <div
        data-site-nav-inner
        className="flex h-px w-full items-center justify-between px-5 md:px-8"
      >
        <span data-site-nav-logo className="block size-px" />
      </div>
    </div>
  )
}

export function LifelineCornerName({
  name,
  href,
  subtitle,
}: {
  name: string
  href?: string
  subtitle?: string | null
}) {
  const content = (
    <div className="max-w-[12rem]">
      <p className="truncate text-sm font-medium tracking-tight text-black dark:text-white">
        {name}
      </p>
      {subtitle ? (
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  )

  return (
    <div
      data-lifeline-corner-name
      className="pointer-events-auto fixed left-5 top-5 z-50 md:left-8 md:top-6"
    >
      {href ? (
        <Link
          href={href}
          className="block transition-opacity hover:opacity-70"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  )
}

export function LifelinePublicCornerActions() {
  return (
    <div className="pointer-events-auto fixed right-5 top-5 z-50 md:right-8 md:top-6">
      <ThemeSwitcher />
    </div>
  )
}

export function LifelineOwnerCornerActions({
  publicHref,
  onOpenSettings,
  onAddActivity,
}: {
  publicHref: string | null
  onOpenSettings: () => void
  onAddActivity: () => void
}) {
  return (
    <div className="pointer-events-auto fixed right-5 top-5 z-50 flex items-center gap-1.5 md:right-8 md:top-6">
      <button
        type="button"
        onClick={onAddActivity}
        aria-label="Add activity"
        className="inline-flex size-8 items-center justify-center rounded-xl text-zinc-500 outline-none transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Icon icon={AppIcons.plus} size={16} />
      </button>
      <ThemeSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-8 items-center justify-center rounded-xl text-zinc-500 outline-none transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="More"
        >
          <Icon icon={AppIcons.more} size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-44">
          <DropdownMenuItem onClick={onOpenSettings}>
            <Icon icon={AppIcons.settings} size={16} />
            Settings
          </DropdownMenuItem>
          {publicHref ? (
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(publicHref)
                  toast.success("Public link copied")
                } catch {
                  toast.error("Could not copy link")
                }
              }}
            >
              <Icon icon={AppIcons.link} size={16} />
              Copy public link
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-muted-foreground focus:text-muted-foreground focus:**:text-muted-foreground"
            onClick={() => {
              void signOut()
            }}
          >
            <Icon icon={AppIcons.logout} size={16} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

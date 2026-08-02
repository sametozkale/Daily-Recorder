"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { AppIcons, Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="inline-block size-8" aria-hidden="true" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-xl text-zinc-500 outline-none transition-colors hover:bg-black/5 hover:text-black dark:hover:bg-white/10 dark:hover:text-white",
      )}
    >
      <Icon icon={isDark ? AppIcons.sun : AppIcons.moon} size={16} />
    </button>
  )
}

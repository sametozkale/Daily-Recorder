"use client"

import { useState } from "react"
import { faviconUrlForLink } from "@/lib/favicon"
import { cn } from "@/lib/utils"

/**
 * Activity header logo from the linked site’s favicon.
 * Renders nothing when there is no link or the favicon fails to load.
 */
export function ActivityTypeIcon({
  href,
  className,
  size = 14,
}: {
  href?: string
  className?: string
  size?: number
}) {
  const favicon = faviconUrlForLink(href, 64)
  const [failed, setFailed] = useState(false)

  if (!favicon || failed) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={favicon}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-[3px] object-contain", className)}
      style={{ width: size, height: size }}
    />
  )
}

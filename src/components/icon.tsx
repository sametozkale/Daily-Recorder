"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
  Film01Icon,
  Image01Icon,
  InformationCircleIcon,
  Link01Icon,
  Loading03Icon,
  Logout01Icon,
  Moon02Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Settings01Icon,
  Sun03Icon,
  Tick02Icon,
  UnavailableIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type IconProps = {
  icon: IconSvgElement
  className?: string
  size?: number
  strokeWidth?: number
}

/** Shared Hugeicons renderer — prefer filled/solid Pro pack when licensed. */
export function Icon({
  icon,
  className,
  size = 16,
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
    />
  )
}

export const AppIcons = {
  moon: Moon02Icon,
  sun: Sun03Icon,
  more: MoreHorizontalIcon,
  settings: Settings01Icon,
  link: Link01Icon,
  logout: Logout01Icon,
  plus: PlusSignIcon,
  calendar: Calendar03Icon,
  image: Image01Icon,
  film: Film01Icon,
  eye: ViewIcon,
  eyeOff: ViewOffIcon,
  trash: Delete02Icon,
  edit: Edit02Icon,
  close: Cancel01Icon,
  check: Tick02Icon,
  checkCircle: CheckmarkCircle02Icon,
  chevronDown: ArrowDown01Icon,
  chevronUp: ArrowUp01Icon,
  chevronLeft: ArrowLeft01Icon,
  chevronRight: ArrowRight01Icon,
  info: InformationCircleIcon,
  alert: Alert02Icon,
  error: UnavailableIcon,
  loading: Loading03Icon,
} as const

"use client"

import { toast } from "sonner"

import { AppIcons, Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"

export function CopyPublicLink({ href }: { href: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(href)
          toast.success("Public link copied")
        } catch {
          toast.error("Could not copy link")
        }
      }}
    >
      <Icon icon={AppIcons.link} size={16} />
      Copy public link
    </Button>
  )
}

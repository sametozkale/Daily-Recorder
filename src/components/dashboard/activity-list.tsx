"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { AppIcons, Icon } from "@/components/icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  deleteActivity,
  toggleActivityPublic,
} from "@/lib/actions/activities"
import { ACTIVITY_TYPE_LABELS } from "@/lib/activity-types"
import type { Activity } from "@/lib/database.types"

export function ActivityList({ activities }: { activities: Activity[] }) {
  const [pending, startTransition] = useTransition()

  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No activities yet. Log your first design or code moment above.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {ACTIVITY_TYPE_LABELS[activity.type]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {activity.occurred_on}
              </span>
              {!activity.is_public ? (
                <Badge variant="outline">Private</Badge>
              ) : null}
            </div>
            <p className="font-medium">{activity.title}</p>
            {activity.summary ? (
              <p className="text-sm text-muted-foreground">{activity.summary}</p>
            ) : null}
            {activity.project ? (
              <p className="text-xs text-muted-foreground">{activity.project}</p>
            ) : null}
            {activity.url ? (
              <a
                href={activity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline underline-offset-2"
              >
                Open link
              </a>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              aria-label={
                activity.is_public ? "Make private" : "Make public"
              }
              onClick={() => {
                const formData = new FormData()
                formData.set("id", activity.id)
                formData.set("is_public", String(activity.is_public))
                startTransition(async () => {
                  const result = await toggleActivityPublic(formData)
                  if (result?.error) toast.error(result.error)
                })
              }}
            >
              <Icon
                icon={activity.is_public ? AppIcons.eye : AppIcons.eyeOff}
                size={16}
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              aria-label="Delete activity"
              onClick={() => {
                if (!confirm("Delete this activity?")) return
                const formData = new FormData()
                formData.set("id", activity.id)
                startTransition(async () => {
                  const result = await deleteActivity(formData)
                  if (result?.error) toast.error(result.error)
                  else toast.success("Deleted")
                })
              }}
            >
              <Icon icon={AppIcons.trash} size={16} />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

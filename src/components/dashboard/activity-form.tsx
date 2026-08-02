"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createActivity } from "@/lib/actions/activities"
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES,
  todayISODate,
} from "@/lib/activity-types"

export function ActivityForm({
  defaultDate,
  onSuccess,
  showDateField = true,
}: {
  defaultDate?: string
  onSuccess?: () => void
  showDateField?: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [isPublic, setIsPublic] = useState(true)
  const dateValue = defaultDate ?? todayISODate()

  return (
    <form
      className="grid gap-4"
      key={dateValue}
      action={(formData) => {
        if (!showDateField) formData.set("occurred_on", dateValue)
        if (isPublic) formData.set("is_public", "on")
        else formData.delete("is_public")

        startTransition(async () => {
          const result = await createActivity(formData)
          if (result?.error) {
            toast.error(result.error)
            return
          }
          toast.success("Activity logged")
          setIsPublic(true)
          onSuccess?.()
        })
      }}
    >
      {showDateField ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="occurred_on">Date</Label>
            <Input
              id="occurred_on"
              name="occurred_on"
              type="date"
              required
              defaultValue={dateValue}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <TypeSelect />
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="occurred_on" value={dateValue} />
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <TypeSelect />
          </div>
          <p className="text-xs text-muted-foreground">Date: {dateValue}</p>
        </>
      )}

      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Checkout redesign, PR #142, design critique…"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          rows={3}
          placeholder="What mattered about this work?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="project">Project</Label>
          <Input id="project" name="project" placeholder="Product / feature" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="url">Link</Label>
          <Input
            id="url"
            name="url"
            type="url"
            placeholder="https://figma.com/… or https://github.com/…"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="media_url">Media URL</Label>
        <Input
          id="media_url"
          name="media_url"
          type="url"
          placeholder="Optional screenshot URL"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="size-4 rounded border border-input"
        />
        Show on public lifeline
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Log activity"}
      </Button>
    </form>
  )
}

function TypeSelect() {
  return (
    <select
      id="type"
      name="type"
      defaultValue="design"
      className="h-8 w-full rounded-lg border border-[#f4f4f4] bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {ACTIVITY_TYPES.map((type) => (
        <option key={type} value={type}>
          {ACTIVITY_TYPE_LABELS[type]}
        </option>
      ))}
    </select>
  )
}

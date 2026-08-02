"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AppIcons, Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { normalizeHttpUrl } from "@/lib/normalize-url"
import { cn } from "@/lib/utils"
import { createActivity, updateActivity } from "@/lib/actions/activities"
import {
  ACTIVITY_TYPE_COLORS,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES,
  todayISODate,
} from "@/lib/activity-types"
import type { Activity, ActivityType } from "@/lib/database.types"

function hasAdvancedValues(activity?: Activity) {
  if (!activity) return false
  return Boolean(
    activity.summary ||
      activity.project ||
      activity.media_url ||
      activity.is_public === false,
  )
}

export function ActivityForm({
  defaultDate,
  activity,
  onSuccess,
  showDateField = true,
}: {
  defaultDate?: string
  /** When set, form updates this activity instead of creating. */
  activity?: Activity
  onSuccess?: () => void
  showDateField?: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [isPublic, setIsPublic] = useState(activity?.is_public ?? true)
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    hasAdvancedValues(activity),
  )
  const dateValue = activity?.occurred_on ?? defaultDate ?? todayISODate()
  const isEditing = Boolean(activity)

  return (
    <form
      className="grid gap-5"
      key={activity?.id ?? dateValue}
      action={(formData) => {
        if (!showDateField) formData.set("occurred_on", dateValue)
        if (isPublic) formData.set("is_public", "on")
        else formData.delete("is_public")
        if (activity) formData.set("id", activity.id)

        const url = String(formData.get("url") ?? "")
        if (url.trim()) formData.set("url", normalizeHttpUrl(url))
        const mediaUrl = String(formData.get("media_url") ?? "")
        if (mediaUrl.trim()) {
          formData.set("media_url", normalizeHttpUrl(mediaUrl))
        }

        startTransition(async () => {
          const result = isEditing
            ? await updateActivity(formData)
            : await createActivity(formData)
          if (result?.error) {
            toast.error(result.error)
            return
          }
          toast.success(isEditing ? "Activity updated" : "Activity logged")
          if (!isEditing) setIsPublic(true)
          onSuccess?.()
        })
      }}
    >
      {showDateField ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="occurred_on">Date</Label>
            <DateInput defaultValue={dateValue} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <TypeSelect defaultValue={activity?.type ?? "design"} />
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="occurred_on" value={dateValue} />
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <TypeSelect defaultValue={activity?.type ?? "design"} />
          </div>
        </>
      )}

      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          autoFocus={!isEditing}
          defaultValue={activity?.title}
          placeholder="Checkout redesign, PR #142…"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="url">Link</Label>
        <Input
          id="url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          required
          defaultValue={activity?.url ?? undefined}
          placeholder="Figma, GitHub, Notion…"
          onBlur={(event) => {
            const next = normalizeHttpUrl(event.currentTarget.value)
            if (next !== event.currentTarget.value) {
              event.currentTarget.value = next
            }
          }}
        />
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          className="inline-flex items-center gap-1 rounded-lg py-1.5 pl-0 pr-1 font-runde text-xs font-medium tracking-[-2%] text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
          aria-expanded={advancedOpen}
        >
          Advanced
          <Icon
            icon={AppIcons.chevronDown}
            size={14}
            className={cn(
              "transition-[color,transform] duration-200",
              advancedOpen && "rotate-180",
            )}
          />
        </button>

        {/* Keep fields mounted so closed Advanced still submits existing values. */}
        <div
          className={cn(
            "grid gap-4 rounded-xl bg-zinc-50/80 p-3 ring-1 ring-[#f4f4f4] dark:bg-zinc-950/50 dark:ring-white/10",
            !advancedOpen && "hidden",
          )}
        >
          <div className="grid gap-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              rows={2}
              defaultValue={activity?.summary ?? undefined}
              placeholder="What mattered about this work?"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">Project</Label>
            <Input
              id="project"
              name="project"
              defaultValue={activity?.project ?? undefined}
              placeholder="Product / feature"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="media_url">Media URL</Label>
            <Input
              id="media_url"
              name="media_url"
              type="text"
              inputMode="url"
              autoComplete="url"
              defaultValue={activity?.media_url ?? undefined}
              placeholder="Optional screenshot override"
              onBlur={(event) => {
                const next = normalizeHttpUrl(event.currentTarget.value)
                if (next !== event.currentTarget.value) {
                  event.currentTarget.value = next
                }
              }}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 font-runde text-sm text-zinc-700 select-none dark:text-zinc-300">
            <Checkbox
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
            />
            Show on public lifeline
          </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="rounded-2xl font-runde tracking-[-2%]"
      >
        {pending ? "Saving…" : isEditing ? "Save changes" : "Add activity"}
      </Button>
    </form>
  )
}

function parseISODate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDisplayDate(iso: string) {
  return parseISODate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function DateInput({ defaultValue }: { defaultValue: string }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const selected = parseISODate(value)

  return (
    <>
      <input type="hidden" name="occurred_on" value={value} required />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id="occurred_on"
          className={cn(
            "flex h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-[calc(var(--radius)+2px)] border border-input bg-transparent px-2.5 py-1 text-left text-base transition-colors outline-none [corner-shape:round] md:text-sm",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "dark:bg-input/30",
          )}
        >
          <span className="truncate">{formatDisplayDate(value)}</span>
          <Icon
            icon={AppIcons.calendar}
            size={14}
            className="shrink-0 text-zinc-400"
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="z-[100] w-auto p-0 ring-1 ring-[#f4f4f4] dark:ring-white/10"
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) return
              setValue(toISODate(date))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </>
  )
}

function ActivityTypeSwatch({
  type,
  className,
}: {
  type: ActivityType
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn("size-2.5 shrink-0 rounded-[3px]", className)}
      style={{ backgroundColor: ACTIVITY_TYPE_COLORS[type] }}
    />
  )
}

function TypeSelect({ defaultValue }: { defaultValue: ActivityType }) {
  return (
    <Select defaultValue={defaultValue} name="type" required>
      <SelectTrigger id="type" className="w-full min-w-0">
        <SelectValue>
          {(value: ActivityType | null) =>
            value ? (
              <span className="flex min-w-0 items-center gap-2">
                <ActivityTypeSwatch type={value} />
                <span className="truncate">{ACTIVITY_TYPE_LABELS[value]}</span>
              </span>
            ) : (
              "Select type"
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        sideOffset={6}
        alignItemWithTrigger={false}
        className="z-[100]"
      >
        {ACTIVITY_TYPES.map((type) => (
          <SelectItem key={type} value={type} className="gap-2">
            <ActivityTypeSwatch type={type} />
            {ACTIVITY_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

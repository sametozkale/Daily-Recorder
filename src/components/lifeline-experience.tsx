"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { ActivityForm } from "@/components/dashboard/activity-form"
import { Lifeline } from "@/components/lifeline"
import { LifelineInteractionProvider } from "@/components/lifeline/lifeline-interaction"
import type { LifelineMarker } from "@/components/lifeline/types"
import {
  LifelineCornerName,
  LifelineOwnerCornerActions,
  LifelinePublicCornerActions,
  LifelineRailAnchors,
} from "@/components/lifeline-chrome"
import { LifelineShell, LifelineStage } from "@/components/lifeline-shell"
import { ProfileForm } from "@/components/settings/profile-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteActivity } from "@/lib/actions/activities"
import { todayISODate } from "@/lib/activity-types"
import type { Activity, Profile } from "@/lib/database.types"

type AddActivityDialog =
  | { mode: "day"; date: string }
  | { mode: "custom" }

function formatActivityDialogDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function LifelineExperience({
  profile,
  markers,
  birthYear,
  activities = [],
  mode = "public",
  publicHref = null,
}: {
  profile: Profile
  markers: LifelineMarker[]
  birthYear: number
  activities?: Activity[]
  mode?: "public" | "owner"
  publicHref?: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [addDialog, setAddDialog] = useState<AddActivityDialog | null>(null)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const activitiesById = useMemo(() => {
    const map = new Map<string, Activity>()
    for (const activity of activities) map.set(activity.id, activity)
    return map
  }, [activities])

  const shell = (
    <LifelineShell>
      <LifelineRailAnchors />
      <LifelineCornerName
        name={profile.display_name}
        subtitle={profile.title ?? "Design Engineer"}
        href={mode === "public" ? `/u/${profile.slug}` : undefined}
      />
      {mode === "owner" ? (
        <LifelineOwnerCornerActions
          publicHref={publicHref}
          onOpenSettings={() => setSettingsOpen(true)}
          onAddActivity={() => setAddDialog({ mode: "custom" })}
        />
      ) : (
        <LifelinePublicCornerActions />
      )}

      <LifelineStage className="pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] md:pt-0">
        <Lifeline
          markers={markers}
          birthYear={birthYear}
          title={`${profile.display_name} daily lifeline`}
          className="h-full"
          mode="page"
        />
      </LifelineStage>

      {mode === "owner" ? (
        <>
          <Dialog
            open={Boolean(addDialog)}
            onOpenChange={(open) => {
              if (!open) setAddDialog(null)
            }}
          >
            <DialogContent className="sm:max-w-md" showCloseButton>
              <DialogHeader>
                <DialogTitle>Add activity</DialogTitle>
                <DialogDescription>
                  {addDialog?.mode === "day"
                    ? `For ${formatActivityDialogDate(addDialog.date)}.`
                    : addDialog?.mode === "custom"
                      ? "Choose a date for this entry."
                      : null}
                </DialogDescription>
              </DialogHeader>
              {addDialog ? (
                <ActivityForm
                  defaultDate={
                    addDialog.mode === "day" ? addDialog.date : todayISODate()
                  }
                  showDateField={addDialog.mode === "custom"}
                  onSuccess={() => {
                    setAddDialog(null)
                    router.refresh()
                  }}
                />
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog
            open={Boolean(editingActivity)}
            onOpenChange={(open) => {
              if (!open) setEditingActivity(null)
            }}
          >
            <DialogContent className="sm:max-w-md" showCloseButton>
              <DialogHeader>
                <DialogTitle>Edit activity</DialogTitle>
                <DialogDescription>
                  Update this entry on your lifeline.
                </DialogDescription>
              </DialogHeader>
              {editingActivity ? (
                <ActivityForm
                  activity={editingActivity}
                  showDateField
                  onSuccess={() => {
                    setEditingActivity(null)
                    router.refresh()
                  }}
                />
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogContent className="sm:max-w-md" showCloseButton>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Public slug and how you appear on the lifeline.
                </DialogDescription>
              </DialogHeader>
              <ProfileForm
                profile={profile}
                onSuccess={() => {
                  setSettingsOpen(false)
                  router.refresh()
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </LifelineShell>
  )

  if (mode !== "owner") return shell

  return (
    <LifelineInteractionProvider
      onDaySelect={(date) => setAddDialog({ mode: "day", date })}
      onEditActivity={(activityId) => {
        const activity = activitiesById.get(activityId)
        if (activity) setEditingActivity(activity)
      }}
      onDeleteActivity={(activityId) => {
        if (pending) return
        if (!confirm("Delete this activity?")) return
        const formData = new FormData()
        formData.set("id", activityId)
        startTransition(async () => {
          const result = await deleteActivity(formData)
          if (result?.error) toast.error(result.error)
          else {
            toast.success("Deleted")
            router.refresh()
          }
        })
      }}
    >
      {shell}
    </LifelineInteractionProvider>
  )
}

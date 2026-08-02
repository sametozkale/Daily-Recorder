"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

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
import type { Profile } from "@/lib/database.types"

export function LifelineExperience({
  profile,
  markers,
  birthYear,
  mode = "public",
  publicHref = null,
}: {
  profile: Profile
  markers: LifelineMarker[]
  birthYear: number
  mode?: "public" | "owner"
  publicHref?: string | null
}) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

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
        />
      ) : (
        <LifelinePublicCornerActions />
      )}

      <LifelineStage className="pt-0">
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
            open={Boolean(selectedDate)}
            onOpenChange={(open) => {
              if (!open) setSelectedDate(null)
            }}
          >
            <DialogContent className="sm:max-w-md" showCloseButton>
              <DialogHeader>
                <DialogTitle>Log activity</DialogTitle>
                <DialogDescription>
                  Add work for {selectedDate}.
                </DialogDescription>
              </DialogHeader>
              {selectedDate ? (
                <ActivityForm
                  defaultDate={selectedDate}
                  showDateField={false}
                  onSuccess={() => {
                    setSelectedDate(null)
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
    <LifelineInteractionProvider onDaySelect={setSelectedDate}>
      {shell}
    </LifelineInteractionProvider>
  )
}

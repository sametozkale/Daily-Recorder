"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/lib/actions/profile"
import type { Profile } from "@/lib/database.types"

export function ProfileForm({
  profile,
  onSuccess,
}: {
  profile: Profile
  onSuccess?: () => void
}) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="grid gap-4"
      action={(formData) => {
        startTransition(async () => {
          const result = await updateProfile(formData)
          if (result?.error) {
            toast.error(result.error)
            return
          }
          toast.success("Profile updated")
          onSuccess?.()
        })
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          name="display_name"
          required
          defaultValue={profile.display_name}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">Public slug</Label>
        <Input
          id="slug"
          name="slug"
          required
          defaultValue={profile.slug}
          pattern="^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$"
        />
        <p className="text-xs text-muted-foreground">
          Public URL: /u/{profile.slug}
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={profile.title ?? ""}
          placeholder="Design Engineer"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ""}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}

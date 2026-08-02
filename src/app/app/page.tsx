import { redirect } from "next/navigation"

import { LifelineExperience } from "@/components/lifeline-experience"
import { mapActivitiesToLifeline } from "@/lib/map-activities-to-lifeline"
import { getSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const [{ data: profile }, { data: activities }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .order("occurred_on", { ascending: true }),
  ])

  if (!profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">
          Profile missing. Sign out and sign in again with an invited email.
        </p>
      </main>
    )
  }

  const lifeline = await mapActivitiesToLifeline(profile, activities ?? [])
  const publicHref = `${getSiteUrl()}/u/${profile.slug}`

  return (
    <LifelineExperience
      profile={profile}
      markers={lifeline.markers}
      birthYear={lifeline.birthYear}
      activities={activities ?? []}
      mode="owner"
      publicHref={publicHref}
    />
  )
}

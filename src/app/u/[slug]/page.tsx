import { notFound } from "next/navigation"

import { LifelineExperience } from "@/components/lifeline-experience"
import { mapActivitiesToLifeline } from "@/lib/map-activities-to-lifeline"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, title")
    .eq("slug", slug)
    .maybeSingle()

  if (!profile) return { title: "Lifeline" }

  return {
    title: `${profile.display_name} · Daily Lifeline`,
    description:
      profile.title ??
      `${profile.display_name}'s design engineer daily lifeline`,
  }
}

export default async function PublicLifelinePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (!profile) notFound()

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("occurred_on", { ascending: true })

  const lifeline = await mapActivitiesToLifeline(profile, activities ?? [])

  return (
    <LifelineExperience
      profile={profile}
      markers={lifeline.markers}
      birthYear={lifeline.birthYear}
      mode="public"
    />
  )
}

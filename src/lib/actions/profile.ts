"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  const displayName = String(formData.get("display_name") ?? "").trim()
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
  const title = String(formData.get("title") ?? "").trim() || null

  if (!displayName) return { error: "Display name is required." }
  if (!/^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/.test(slug)) {
    return {
      error:
        "Slug must be lowercase letters, numbers, and hyphens (2–64 chars).",
    }
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle()

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      slug,
      title,
    })
    .eq("id", user.id)

  if (error) {
    if (error.code === "23505") {
      return { error: "That slug is already taken." }
    }
    return { error: error.message }
  }

  revalidatePath("/app")
  revalidatePath("/app/settings")
  if (existing?.slug) revalidatePath(`/u/${existing.slug}`)
  revalidatePath(`/u/${slug}`)

  return { success: true }
}

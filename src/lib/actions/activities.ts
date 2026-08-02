"use server"

import { revalidatePath } from "next/cache"

import { detectActivityProvider } from "@/lib/activity-provider"
import type { ActivityType } from "@/lib/database.types"
import { ACTIVITY_TYPES } from "@/lib/activity-types"
import { resolveLinkPreview } from "@/lib/link-preview"
import { createClient } from "@/lib/supabase/server"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized")
  }

  return { supabase, user }
}

function parseActivityFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim()
  const type = String(formData.get("type") ?? "other") as ActivityType
  const occurredOn = String(formData.get("occurred_on") ?? "").trim()
  const summary = String(formData.get("summary") ?? "").trim() || null
  const url = String(formData.get("url") ?? "").trim()
  const project = String(formData.get("project") ?? "").trim() || null
  const mediaUrl = String(formData.get("media_url") ?? "").trim() || null
  const isPublic = formData.get("is_public") === "on"

  if (!title) return { error: "Title is required." as const }
  if (!occurredOn) return { error: "Date is required." as const }
  if (!url) return { error: "Link is required." as const }
  if (!ACTIVITY_TYPES.includes(type)) {
    return { error: "Invalid activity type." as const }
  }

  return {
    data: {
      title,
      type,
      occurred_on: occurredOn,
      summary,
      url,
      project,
      media_url: mediaUrl,
      is_public: isPublic,
      source: "manual" as const,
    },
  }
}

export async function createActivity(formData: FormData) {
  const parsed = parseActivityFields(formData)
  if ("error" in parsed && parsed.error) {
    return { error: parsed.error }
  }

  const data = parsed.data!
  const provider = detectActivityProvider(data)
  const mediaUrl =
    data.media_url ??
    (await resolveLinkPreview({
      url: data.url,
      mediaUrl: data.media_url,
      provider,
    }))

  const { supabase, user } = await requireUser()
  const { error } = await supabase.from("activities").insert({
    ...data,
    media_url: mediaUrl,
    source:
      provider === "github"
        ? "github"
        : provider === "figma"
          ? "figma"
          : "manual",
    user_id: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath("/app")
  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle()
  if (profile?.slug) revalidatePath(`/u/${profile.slug}`)

  return { success: true }
}

export async function updateActivity(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing activity id." }

  const parsed = parseActivityFields(formData)
  if ("error" in parsed && parsed.error) {
    return { error: parsed.error }
  }

  const data = parsed.data!
  const provider = detectActivityProvider(data)
  const mediaUrl =
    data.media_url ??
    (await resolveLinkPreview({
      url: data.url,
      mediaUrl: data.media_url,
      provider,
    }))

  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from("activities")
    .update({
      ...data,
      media_url: mediaUrl,
      source:
        provider === "github"
          ? "github"
          : provider === "figma"
            ? "figma"
            : "manual",
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/app")
  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle()
  if (profile?.slug) revalidatePath(`/u/${profile.slug}`)

  return { success: true }
}

export async function deleteActivity(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return { error: "Missing activity id." }

  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/app")
  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle()
  if (profile?.slug) revalidatePath(`/u/${profile.slug}`)

  return { success: true }
}

export async function toggleActivityPublic(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const isPublic = formData.get("is_public") === "true"

  if (!id) return { error: "Missing activity id." }

  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from("activities")
    .update({ is_public: !isPublic })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/app")
  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .maybeSingle()
  if (profile?.slug) revalidatePath(`/u/${profile.slug}`)

  return { success: true }
}

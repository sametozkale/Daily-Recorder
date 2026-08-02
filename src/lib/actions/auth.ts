"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { getSiteUrl } from "@/lib/site-url"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

async function assertEmailAllowed(email: string) {
  const supabase = await createClient()
  const { data: allowed, error } = await supabase.rpc("is_email_allowed", {
    check_email: email,
  })

  if (error) return { error: error.message }
  if (!allowed) {
    return { error: "This email is not invited. Contact the owner." }
  }
  return { supabase }
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const next = String(formData.get("next") ?? "/app")

  if (!email) {
    return { error: "Email is required." }
  }

  const allowed = await assertEmailAllowed(email)
  if ("error" in allowed && allowed.error) {
    return { error: allowed.error }
  }

  const headerStore = await headers()
  const siteUrl = getSiteUrl(headerStore.get("origin"))

  const { error } = await allowed.supabase!.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Check your email for the magic link." }
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")
  const next = String(formData.get("next") ?? "/app")

  if (!email) return { error: "Email is required." }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  const allowed = await assertEmailAllowed(email)
  if ("error" in allowed && allowed.error) {
    return { error: allowed.error }
  }

  const supabase = allowed.supabase!

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (!signInError) {
    redirect(next.startsWith("/") ? next : "/app")
  }

  // First-time / no password yet: create a confirmed user without sending email.
  const invalid =
    signInError.message.toLowerCase().includes("invalid login") ||
    signInError.message.toLowerCase().includes("invalid credentials")

  if (!invalid) {
    return { error: signInError.message }
  }

  try {
    const admin = createAdminClient()
    const { data: listed } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    })
    const existing = listed.users.find(
      (user) => user.email?.toLowerCase() === email,
    )

    if (existing) {
      const { error: updateError } = await admin.auth.admin.updateUserById(
        existing.id,
        { password, email_confirm: true },
      )
      if (updateError) return { error: updateError.message }
    } else {
      const { error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: email.split("@")[0] },
      })
      if (createError) return { error: createError.message }
    }

    const { error: retryError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (retryError) return { error: retryError.message }

    redirect(next.startsWith("/") ? next : "/app")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sign in with password."
    if (message.includes("NEXT_REDIRECT")) throw error
    return { error: message }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

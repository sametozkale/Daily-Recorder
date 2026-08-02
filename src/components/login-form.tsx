"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  signInWithMagicLink,
  signInWithPassword,
} from "@/lib/actions/auth"
import { cn } from "@/lib/utils"

type Mode = "password" | "magic"

export function LoginForm({ next = "/app" }: { next?: string }) {
  const [mode, setMode] = useState<Mode>("password")
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-1">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            mode === "password"
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => {
            setMode("password")
            setSent(false)
          }}
        >
          Password
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            mode === "magic"
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("magic")}
        >
          Magic link
        </button>
      </div>

      {mode === "password" ? (
        <form
          className="grid gap-4"
          action={(formData) => {
            startTransition(async () => {
              const result = await signInWithPassword(formData)
              if (result?.error) toast.error(result.error)
            })
          }}
        >
          <input type="hidden" name="next" value={next} />
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              disabled={pending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="At least 8 characters"
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              First time? Pick a password — we create your account if you&apos;re
              invited.
            </p>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form
          className="grid gap-4"
          action={(formData) => {
            startTransition(async () => {
              const result = await signInWithMagicLink(formData)
              if (result?.error) {
                toast.error(result.error)
                return
              }
              setSent(true)
              toast.success(result?.success ?? "Check your email")
            })
          }}
        >
          <input type="hidden" name="next" value={next} />
          <div className="grid gap-2">
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              disabled={pending || sent}
            />
          </div>
          <Button type="submit" disabled={pending || sent}>
            {sent ? "Link sent" : pending ? "Sending…" : "Send magic link"}
          </Button>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              Open the email on this device to finish signing in.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Subject to Supabase email rate limits — use password if blocked.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { AppIcons, Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  signInWithMagicLink,
  signInWithPassword,
} from "@/lib/actions/auth"
import { cn } from "@/lib/utils"

type Mode = "password" | "magic"

function SubmitArrow() {
  return (
    <span
      aria-hidden
      className="inline-flex max-w-0 -translate-x-1 overflow-hidden opacity-0 transition-[max-width,transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/button:max-w-4 group-hover/button:translate-x-0 group-hover/button:opacity-100"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 8h9M8.5 4l4 4-4 4" />
      </svg>
    </span>
  )
}

export function LoginForm({ next = "/app" }: { next?: string }) {
  const [mode, setMode] = useState<Mode>("password")
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="grid gap-6">
      <div
        role="tablist"
        aria-label="Sign-in method"
        className="relative grid h-8 w-fit grid-cols-2 rounded-[10px] bg-zinc-100/80 p-0.5 font-runde tracking-[-2%] dark:bg-zinc-800/80"
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0.5 w-[calc(50%-0.125rem)] rounded-[8px] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[left] dark:bg-zinc-950",
            mode === "magic" ? "left-1/2" : "left-0.5",
          )}
        />
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={cn(
            "relative z-10 rounded-[8px] px-3 text-[13px] transition-colors duration-300 outline-none focus-visible:outline-none",
            mode === "password"
              ? "font-medium text-foreground"
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
          role="tab"
          aria-selected={mode === "magic"}
          className={cn(
            "relative z-10 rounded-[8px] px-3 text-[13px] transition-colors duration-300 outline-none focus-visible:outline-none",
            mode === "magic"
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("magic")}
        >
          Magic link
        </button>
      </div>

      {/* Stack both modes so height stays the taller form — no layout jump. */}
      <div className="relative grid">
        <form
          className={cn(
            "col-start-1 row-start-1 grid gap-4 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:filter-none",
            mode === "password"
              ? "z-10 translate-y-0 opacity-100 blur-0"
              : "pointer-events-none z-0 -translate-y-1.5 opacity-0 blur-[2px]",
          )}
          aria-hidden={mode !== "password"}
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
              required={mode === "password"}
              autoComplete="email"
              placeholder="you@company.com"
              disabled={pending || mode !== "password"}
              tabIndex={mode === "password" ? 0 : -1}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="group/password relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required={mode === "password"}
                minLength={8}
                autoComplete="current-password"
                placeholder="At least 8 characters"
                disabled={pending || mode !== "password"}
                tabIndex={mode === "password" ? 0 : -1}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((open) => !open)}
                disabled={pending || mode !== "password"}
                tabIndex={mode === "password" ? 0 : -1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-400 opacity-0 outline-none transition-[opacity,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-zinc-700 focus-visible:opacity-100 group-hover/password:opacity-100 group-focus-within/password:opacity-100 disabled:pointer-events-none disabled:opacity-0 dark:hover:text-zinc-200"
              >
                <Icon
                  icon={showPassword ? AppIcons.eyeOff : AppIcons.eye}
                  size={16}
                />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              First time? Pick a password — we create your account if you&apos;re
              invited.
            </p>
          </div>
          <Button
            type="submit"
            disabled={pending || mode !== "password"}
            tabIndex={mode === "password" ? 0 : -1}
            className="h-9 rounded-2xl font-runde tracking-[-2%]"
          >
            {pending && mode === "password" ? "Signing in…" : "Sign in"}
            {!(pending && mode === "password") ? <SubmitArrow /> : null}
          </Button>
        </form>

        <form
          className={cn(
            "col-start-1 row-start-1 grid gap-4 self-start transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:filter-none",
            mode === "magic"
              ? "z-10 translate-y-0 opacity-100 blur-0"
              : "pointer-events-none z-0 translate-y-1.5 opacity-0 blur-[2px]",
          )}
          aria-hidden={mode !== "magic"}
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
              required={mode === "magic"}
              autoComplete="email"
              placeholder="you@company.com"
              disabled={pending || sent || mode !== "magic"}
              tabIndex={mode === "magic" ? 0 : -1}
            />
          </div>
          <Button
            type="submit"
            disabled={pending || sent || mode !== "magic"}
            tabIndex={mode === "magic" ? 0 : -1}
            className="h-9 rounded-2xl font-runde tracking-[-2%]"
          >
            {sent
              ? "Link sent"
              : pending && mode === "magic"
                ? "Sending…"
                : "Send magic link"}
            {!pending && !sent ? <SubmitArrow /> : null}
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
      </div>
    </div>
  )
}

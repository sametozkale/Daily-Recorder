import Link from "next/link"
import { redirect } from "next/navigation"

import { LandingLifelinePreview } from "@/components/landing-lifeline-preview"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

const VALUE_PROPS = [
  ["Log work as it happens,", "not in a rushed recap."],
  ["Share a public rail", "the team can follow."],
  ["Keep today organized,", "not scattered across tools."],
] as const

function CheckIcon() {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <svg
        viewBox="0 0 16 16"
        className="size-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    </span>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/app")
  }

  return (
    <main className="flex min-h-dvh w-full flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <div className="flex w-full flex-col gap-4">
          <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6">
            <div className="space-y-3">
              <p className="font-runde text-2xl font-medium tracking-[-0.04em] text-foreground sm:text-3xl">
                Daily Lifeline
              </p>
              <h1 className="text-xl font-medium tracking-tight text-zinc-700 dark:text-zinc-300 sm:text-2xl">
                When they ask how your day went, show them the rail.
              </h1>
              <p className="max-w-[30.5rem] text-muted-foreground">
                Log what you did as the day unfolds — then share a public
                lifeline so teammates can see how it went, without the long
                stand-up.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                nativeButton={false}
                render={<Link href="/login" />}
                className="rounded-2xl"
              >
                Sign in
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
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="#pricing" />}
                className="rounded-2xl bg-white dark:bg-background"
              >
                Buy
                <span
                  aria-hidden
                  className="size-1 rounded-full bg-current opacity-40"
                />
                <span className="opacity-40">$29</span>
              </Button>
              <span className="text-sm text-muted-foreground">
                one-time payment
              </span>
            </div>
          </section>

          <section
            aria-label="Example lifeline of a work week"
            className="w-full"
          >
            <LandingLifelinePreview />
          </section>
        </div>
      </div>

      <section
        aria-label="Why Daily Lifeline"
        className="mx-auto w-full max-w-2xl px-6 pb-8 pt-2"
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {VALUE_PROPS.map(([line1, line2]) => (
            <li
              key={line1}
              className="flex items-start gap-2.5 text-sm text-muted-foreground"
            >
              <CheckIcon />
              <span className="min-w-0 leading-snug">
                <span className="block whitespace-nowrap">{line1}</span>
                <span className="block whitespace-nowrap">{line2}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

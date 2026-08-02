import Link from "next/link"

import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const next = params.next?.startsWith("/") ? params.next : "/app"

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6">
      <div className="space-y-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Daily Lifeline
        </Link>
        <h1 className="text-2xl font-medium tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Invite-only. Password or magic link.
        </p>
      </div>
      <LoginForm next={next} />
    </main>
  )
}

import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/app")
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Daily Lifeline</p>
        <h1 className="text-3xl font-medium tracking-tight">
          Your design engineer work day, on a rail.
        </h1>
        <p className="text-muted-foreground">
          Log design, code, PRs, and reviews. Share a public lifeline with your
          team.
        </p>
      </div>
      <div className="flex gap-3">
        <Button nativeButton={false} render={<Link href="/login" />}>
          Sign in
        </Button>
      </div>
    </main>
  )
}

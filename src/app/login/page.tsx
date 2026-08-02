import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const next = params.next?.startsWith("/") ? params.next : "/app"

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-6">
      <div className="space-y-2">
        <h1 className="font-runde text-2xl font-medium tracking-[-0.04em]">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Use the email you were invited with.
        </p>
      </div>
      <LoginForm next={next} />
    </main>
  )
}

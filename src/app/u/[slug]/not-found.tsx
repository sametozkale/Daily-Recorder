import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-medium">Lifeline not found</h1>
      <p className="text-sm text-muted-foreground">
        This public slug doesn&apos;t exist or was renamed.
      </p>
      <Link href="/" className="text-sm underline underline-offset-2">
        Go home
      </Link>
    </main>
  )
}

import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import { Providers } from "@/components/providers"
import { openRunde } from "@/app/fonts"

import "./globals.css"

export const metadata: Metadata = {
  title: "Daily Lifeline",
  description:
    "When they ask how your day went, show them the rail — log your day and share a public lifeline with your team.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${openRunde.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

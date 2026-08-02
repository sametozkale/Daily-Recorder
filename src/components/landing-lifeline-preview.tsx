"use client"

import { useMemo } from "react"

import { Lifeline } from "@/components/lifeline"
import { getLandingLifeline } from "@/lib/landing-lifeline"

export function LandingLifelinePreview() {
  const landingLifeline = useMemo(() => getLandingLifeline(), [])

  return (
    <div className="landing-lifeline relative h-[min(42dvh,24rem)] w-full min-h-[18rem] overflow-x-clip overflow-y-visible">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
      />
      <Lifeline
        markers={landingLifeline.markers}
        birthYear={landingLifeline.birthYear}
        title="Example week"
        mode="embed"
        className="h-full overflow-visible"
      />
    </div>
  )
}

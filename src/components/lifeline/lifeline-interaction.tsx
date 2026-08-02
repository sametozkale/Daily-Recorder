"use client"

import { createContext, useContext, type ReactNode } from "react"

export type LifelineDayHandler = (isoDate: string) => void

const LifelineInteractionContext = createContext<{
  onDaySelect?: LifelineDayHandler
} | null>(null)

export function LifelineInteractionProvider({
  onDaySelect,
  children,
}: {
  onDaySelect?: LifelineDayHandler
  children: ReactNode
}) {
  return (
    <LifelineInteractionContext.Provider value={{ onDaySelect }}>
      {children}
    </LifelineInteractionContext.Provider>
  )
}

export function useLifelineInteraction() {
  return useContext(LifelineInteractionContext)
}

export function isIsoDateId(id: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(id)
}

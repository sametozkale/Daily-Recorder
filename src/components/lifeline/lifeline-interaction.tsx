"use client"

import { createContext, useContext, type ReactNode } from "react"

export type LifelineDayHandler = (isoDate: string) => void
export type LifelineActivityHandler = (activityId: string) => void

const LifelineInteractionContext = createContext<{
  onDaySelect?: LifelineDayHandler
  onEditActivity?: LifelineActivityHandler
  onDeleteActivity?: LifelineActivityHandler
} | null>(null)

export function LifelineInteractionProvider({
  onDaySelect,
  onEditActivity,
  onDeleteActivity,
  children,
}: {
  onDaySelect?: LifelineDayHandler
  onEditActivity?: LifelineActivityHandler
  onDeleteActivity?: LifelineActivityHandler
  children: ReactNode
}) {
  return (
    <LifelineInteractionContext.Provider
      value={{ onDaySelect, onEditActivity, onDeleteActivity }}
    >
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

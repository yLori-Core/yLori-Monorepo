"use client"

import { useEffect } from "react"
import { trackEventViewAction } from "@/app/events/[slug]/actions"

interface EventViewTrackerProps {
  eventId: string
  isOrganizer?: boolean
}

export function EventViewTracker({ eventId, isOrganizer = false }: EventViewTrackerProps) {
  useEffect(() => {
    // Don't track views for organizers viewing their own events
    if (!isOrganizer) {
      trackEventViewAction(eventId)
    }
  }, [eventId, isOrganizer])

  // This component doesn't render anything
  return null
} 
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Attendee {
  id: string
  status: 'pending' | 'approved' | 'waitlisted' | 'declined' | 'cancelled' | 'checked_in' | 'no_show'
  registeredAt: Date
  checkedIn: boolean | null
  checkedInAt: Date | null
  waitlistPosition: number | null
  isVip: boolean | null
  guestName: string | null
  guestEmail: string | null
  applicationAnswers: any
  user: {
    id: string | null
    name: string | null
    email: string | null
    image: string | null
    username: string | null
    company: string | null
    jobTitle: string | null
  } | null
}

interface AttendeeContextType {
  attendees: Attendee[]
  setAttendees: (attendees: Attendee[]) => void
  updateAttendee: (attendeeId: string, updates: Partial<Attendee>) => void
  loading: boolean
}

const AttendeeContext = createContext<AttendeeContextType | null>(null)

export function useAttendees() {
  const context = useContext(AttendeeContext)
  if (!context) {
    throw new Error('useAttendees must be used within an AttendeeProvider')
  }
  return context
}

interface AttendeeProviderProps {
  children: ReactNode
  eventId: string
  initialData?: Attendee[]
}

export function AttendeeProvider({ children, eventId, initialData }: AttendeeProviderProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialData || [])
  const [loading, setLoading] = useState(!initialData)

  useEffect(() => {
    async function fetchAttendees() {
      if (initialData) return // Skip fetching if we have initial data
      
      try {
        const response = await fetch(`/api/events/${eventId}/attendees`)
        if (response.ok) {
          const data = await response.json()
          setAttendees(data)
        }
      } catch (error) {
        console.error('Error fetching attendees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendees()
  }, [eventId, initialData])

  const updateAttendee = (attendeeId: string, updates: Partial<Attendee>) => {
    setAttendees(prev => prev.map(attendee => 
      attendee.id === attendeeId ? { ...attendee, ...updates } : attendee
    ))
  }

  return (
    <AttendeeContext.Provider value={{ attendees, setAttendees, updateAttendee, loading }}>
      {children}
    </AttendeeContext.Provider>
  )
} 
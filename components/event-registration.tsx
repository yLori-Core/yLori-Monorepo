"use client"

import { Button } from "@/components/ui/button"
import { TicketQR } from "@/components/ticket-qr"
import { handleRegisterAction } from "@/app/events/[slug]/actions"
import Link from "next/link"
import { UserCheck, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { Session } from "next-auth"
import { type Event, type EventAttendee } from "@/lib/db/schema"

interface EventRegistrationProps {
  session: Session | null
  isOrganizer: boolean
  userRegistration: EventAttendee | null
  eventId: string
  slug: string
  isDraft: boolean
  ticketType: Event['ticketType']
}

export function EventRegistration({ 
  session, 
  isOrganizer, 
  userRegistration, 
  eventId,
  slug,
  isDraft,
  ticketType
}: EventRegistrationProps) {
  if (isDraft) {
    return (
      <Button className="w-full" disabled>
        Event Not Published
      </Button>
    )
  }

  if (!session?.user) {
    return (
      <Button className="w-full" asChild>
        <Link href="/auth/signin">Sign In to Register</Link>
      </Button>
    )
  }

  if (isOrganizer) {
    return (
      <Button className="w-full" disabled>
        <UserCheck className="w-4 h-4 mr-2" />
        You're an Organizer
      </Button>
    )
  }

  if (userRegistration) {
    const statusIcons = {
      'pending': <AlertCircle className="w-4 h-4 mr-2" />,
      'approved': <CheckCircle className="w-4 h-4 mr-2" />,
      'waitlisted': <Clock className="w-4 h-4 mr-2" />,
      'checked_in': <CheckCircle className="w-4 h-4 mr-2" />,
      'cancelled': <AlertCircle className="w-4 h-4 mr-2" />,
      'declined': <AlertCircle className="w-4 h-4 mr-2" />,
      'no_show': <AlertCircle className="w-4 h-4 mr-2" />
    }
    
    const statusColors = {
      'pending': 'bg-yellow-600 hover:bg-yellow-700',
      'approved': 'bg-green-600 hover:bg-green-700',
      'waitlisted': 'bg-orange-600 hover:bg-orange-700',
      'checked_in': 'bg-blue-600 hover:bg-blue-700',
      'cancelled': 'bg-red-600 hover:bg-red-700',
      'declined': 'bg-gray-600 hover:bg-gray-700',
      'no_show': 'bg-purple-600 hover:bg-purple-700'
    }

    return (
      <div className="space-y-2">
        <Button 
          className={`w-full ${statusColors[userRegistration.status] || 'bg-green-600 hover:bg-green-700'}`} 
          disabled
        >
          {statusIcons[userRegistration.status]}
          {userRegistration.status.charAt(0).toUpperCase() + userRegistration.status.slice(1).replace('_', ' ')}
        </Button>
        
        {/* Show QR Code button for approved attendees */}
        {userRegistration.status === 'approved' && session?.user?.email && (
          <TicketQR 
            email={session.user.email}
            eventId={eventId}
          />
        )}
      </div>
    )
  }

  return (
    <form action={() => handleRegisterAction(eventId, slug)}>
      <Button type="submit" className="w-full">
        Register for Event
      </Button>
    </form>
  )
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { eventAttendees, events, users } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { checkInAttendee } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, qrData } = await request.json()

    if (!eventId || !qrData) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the QR data contains the expected format
    // The QR data should be encrypted ticket data that contains email and eventId
    let ticketData
    try {
      // For now, we'll parse the QR data as JSON (this should be encrypted in production)
      // The TicketQR component generates encrypted data, so we need to decrypt it
      // This is a simplified version - in production you'd decrypt the data properly
      ticketData = JSON.parse(qrData)
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid QR code format' }, { status: 400 })
    }

    if (!ticketData.email || !ticketData.eventId) {
      return NextResponse.json({ success: false, error: 'Invalid ticket data' }, { status: 400 })
    }

    // Verify the event ID matches
    if (ticketData.eventId !== eventId) {
      return NextResponse.json({ success: false, error: 'QR code is for a different event' }, { status: 400 })
    }

    // Find the user by email
    const userResult = await db.select().from(users).where(eq(users.email, ticketData.email)).limit(1)
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const user = userResult[0]

    // Find the attendee record
    const attendeeResult = await db
      .select()
      .from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, user.id)))
      .limit(1)

    if (attendeeResult.length === 0) {
      return NextResponse.json({ success: false, error: 'Attendee registration not found' }, { status: 404 })
    }

    const attendee = attendeeResult[0]

    // Check if attendee is approved
    if (attendee.status !== 'approved') {
      return NextResponse.json({ success: false, error: 'Attendee is not approved for this event' }, { status: 400 })
    }

    // Check if already checked in
    if (attendee.checkedIn) {
      return NextResponse.json({ success: false, error: 'Attendee is already checked in' }, { status: 400 })
    }

    // Verify the organizer has permission to check in attendees for this event
    const eventResult = await db.select().from(events).where(eq(events.id, eventId)).limit(1)
    if (eventResult.length === 0 || eventResult[0].createdById !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Not authorized to check in attendees for this event' }, { status: 403 })
    }

    // Check in the attendee
    await checkInAttendee(eventId, attendee.id)

    return NextResponse.json({ 
      success: true, 
      attendeeName: user.name || user.email,
      message: 'Attendee checked in successfully' 
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 
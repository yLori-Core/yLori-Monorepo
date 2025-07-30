import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { eventAttendees, events, users } from '@/lib/db/schema'
import { eq, and, or, sql } from 'drizzle-orm'
import { checkInAttendee } from '@/lib/db/queries'
import { decryptFromQR } from '@/lib/utils'

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
      // Decrypt the QR code data first
      const decryptedData = decryptFromQR(qrData)
      ticketData = JSON.parse(decryptedData)
    } catch (error) {
      console.error('Failed to decrypt QR code:', error)
      return NextResponse.json({ success: false, error: 'Invalid QR code format' }, { status: 400 })
    }

    if (!ticketData.email || !ticketData.eventId) {
      return NextResponse.json({ success: false, error: 'Invalid ticket data' }, { status: 400 })
    }

    // Verify the event ID matches
    if (ticketData.eventId !== eventId) {
      return NextResponse.json({ success: false, error: 'QR code is for a different event' }, { status: 400 })
    }

    // Find the attendee by either guest email or user email
    const attendee = await db.query.eventAttendees.findFirst({
      where: and(
        eq(eventAttendees.eventId, eventId),
        or(
          eq(eventAttendees.guestEmail, ticketData.email),
          sql`${eventAttendees.userId} IN (SELECT id FROM ${users} WHERE email = ${ticketData.email})`
        )
      ),
      with: {
        user: true
      }
    })

    if (!attendee) {
      return NextResponse.json({ success: false, error: 'Attendee registration not found' }, { status: 404 })
    }

    // Check if attendee is approved
    if (attendee.status !== 'approved' && attendee.status !== 'checked_in') {
      return NextResponse.json({ success: false, error: 'Attendee is not approved for this event' }, { status: 400 })
    }

    // Check if already checked in
    if (attendee.checkedIn) {
      const attendeeName = attendee.user?.name || attendee.guestName || attendee.guestEmail || ticketData.email
      return NextResponse.json({ 
        success: true, 
        attendeeName,
        message: `${attendeeName} has already checked in`,
        type: 'info'
      })
    }

    // Verify the organizer has permission to check in attendees for this event
    const eventResult = await db.select().from(events).where(eq(events.id, eventId)).limit(1)
    if (eventResult.length === 0 || eventResult[0].createdById !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Not authorized to check in attendees for this event' }, { status: 403 })
    }

    // Check in the attendee
    await checkInAttendee(eventId, attendee.id)

    const attendeeName = attendee.user?.name || attendee.guestName || attendee.guestEmail || ticketData.email
    return NextResponse.json({ 
      success: true, 
      attendeeName,
      message: `${attendeeName} successfully checked in`,
      type: 'success'
    })

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 
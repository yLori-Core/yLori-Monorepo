"use server"

import { approveAttendee, moveToWaitlist, checkInAttendee as checkInAttendeeQuery } from "@/lib/db/queries"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { isEventOrganizer } from "@/lib/db/queries"
import { eventAttendees } from "@/lib/db/schema"
import { eq, and, or, sql } from "drizzle-orm"
import { decryptFromQR } from "@/lib/utils"
import { users } from "@/lib/db/schema"

export async function approveAttendeeAction(eventId: string, attendeeId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in' }
    }
    
    // Check if user is organizer
    const isOrganizer = await isEventOrganizer(eventId, session.user.id)
    if (!isOrganizer) {
      return { success: false, error: 'Only organizers can approve attendees' }
    }
    
    await approveAttendee(eventId, attendeeId)
    
    revalidatePath(`/events/[slug]/manage`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error approving attendee:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve attendee' }
  }
}

export async function declineAttendeeAction(eventId: string, attendeeId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in' }
    }
    
    // Check if user is organizer
    const isOrganizer = await isEventOrganizer(eventId, session.user.id)
    if (!isOrganizer) {
      return { success: false, error: 'Only organizers can decline attendees' }
    }
    
    // Update attendee status to declined
    await db.update(eventAttendees)
      .set({ 
        status: 'declined',
        rejectionReason: reason || null,
        updatedAt: new Date()
      })
      .where(and(
        eq(eventAttendees.id, attendeeId),
        eq(eventAttendees.eventId, eventId)
      ))
    
    revalidatePath(`/events/[slug]/manage`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error declining attendee:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to decline attendee' }
  }
}

export async function moveToWaitlistAction(eventId: string, attendeeId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in' }
    }
    
    // Check if user is organizer
    const isOrganizer = await isEventOrganizer(eventId, session.user.id)
    if (!isOrganizer) {
      return { success: false, error: 'Only organizers can manage waitlist' }
    }
    
    await moveToWaitlist(eventId, attendeeId)
    
    revalidatePath(`/events/[slug]/manage`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error moving to waitlist:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to move to waitlist' }
  }
}

export async function checkInAttendeeAction(eventId: string, attendeeId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in' }
    }
    
    // Check if user is organizer
    const isOrganizer = await isEventOrganizer(eventId, session.user.id)
    if (!isOrganizer) {
      return { success: false, error: 'Only organizers can check in attendees' }
    }
    
    await checkInAttendeeQuery(eventId, attendeeId)
    
    revalidatePath(`/events/[slug]/manage`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error checking in attendee:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to check in attendee' }
  }
} 

export async function checkInAttendee(eventId: string, encryptedData: string) {
  try {
    console.log('Attempting to check in with encrypted data:', encryptedData)
    
    // Decrypt and parse the QR code data
    const decryptedData = decryptFromQR(encryptedData)
    console.log('Successfully decrypted QR data:', decryptedData)
    
    let data: { email: string; eventId: string }
    try {
      data = JSON.parse(decryptedData)
      console.log('Parsed QR data:', data)
    } catch (error) {
      console.error('Failed to parse decrypted data:', decryptedData)
      throw new Error('Invalid QR code format')
    }
    
    // Verify this QR code is for this event
    if (data.eventId !== eventId) {
      console.error('QR code event mismatch:', { qrEventId: data.eventId, expectedEventId: eventId })
      throw new Error('This QR code is for a different event')
    }
    
    // Find the attendee by either guest email or user email
    const attendee = await db.query.eventAttendees.findFirst({
      where: and(
        eq(eventAttendees.eventId, eventId),
        or(
          eq(eventAttendees.guestEmail, data.email),
          sql`${eventAttendees.userId} IN (SELECT id FROM ${users} WHERE email = ${data.email})`
        )
      ),
      with: {
        user: true
      }
    })

    if (!attendee) {
      console.error('Attendee not found for email:', data.email)
      return {
        success: false,
        error: "Attendee not found",
        type: 'error' as const
      }
    }

    console.log('Found attendee:', {
      id: attendee.id,
      email: attendee.guestEmail || attendee.user?.email,
      name: attendee.user?.name || attendee.guestName,
      status: attendee.status,
      checkedIn: attendee.checkedIn,
      isGuest: !attendee.userId
    })

    // Check if attendee is eligible for check-in
    if (attendee.status !== 'approved' && attendee.status !== 'checked_in') {
      return {
        success: false,
        error: "Attendee not approved",
        type: 'error' as const
      }
    }

    // If already checked in, return info response
    if (attendee.checkedIn) {
      return {
        success: true,
        message: `${attendee.user?.name || attendee.guestName || attendee.guestEmail} has already checked in`,
        type: 'info' as const,
        attendee: {
          name: attendee.user?.name || attendee.guestName || attendee.guestEmail,
          email: attendee.guestEmail || attendee.user?.email || data.email
        }
      }
    }

    // Update check-in status for first-time check-in
    await db.update(eventAttendees)
      .set({ 
        checkedIn: true, 
        checkedInAt: new Date(),
        status: 'checked_in'
      })
      .where(eq(eventAttendees.id, attendee.id))

    console.log('Successfully checked in attendee:', {
      email: data.email,
      eventId: eventId,
      timestamp: new Date().toISOString()
    })

    return { 
      success: true,
      message: `${attendee.user?.name || attendee.guestName || attendee.guestEmail} successfully checked in`,
      type: 'success' as const,
      attendee: {
        name: attendee.user?.name || attendee.guestName || attendee.guestEmail,
        email: attendee.guestEmail || attendee.user?.email || data.email
      }
    }
  } catch (error) {
    console.error("Check-in error:", error)
    throw error
  }
} 

export async function moveToPendingAction(eventId: string, attendeeId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in' }
    }
    
    // Check if user is organizer
    const isOrganizer = await isEventOrganizer(eventId, session.user.id)
    if (!isOrganizer) {
      return { success: false, error: 'Only organizers can manage attendees' }
    }
    
    // Update attendee status to pending
    await db.update(eventAttendees)
      .set({ 
        status: 'pending',
        updatedAt: new Date()
      })
      .where(and(
        eq(eventAttendees.id, attendeeId),
        eq(eventAttendees.eventId, eventId)
      ))
    
    revalidatePath(`/events/[slug]/manage`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error moving to pending:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to move to pending' }
  }
} 
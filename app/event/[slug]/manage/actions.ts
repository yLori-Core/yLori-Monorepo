"use server"

import { approveAttendee, moveToWaitlist, checkInAttendee } from "@/lib/db/queries"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { isEventOrganizer } from "@/lib/db/queries"
import { eventAttendees } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

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
    
    revalidatePath(`/event/[slug]/manage`, 'page')
    
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
    
    revalidatePath(`/event/[slug]/manage`, 'page')
    
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
    
    revalidatePath(`/event/[slug]/manage`, 'page')
    
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
    
    await checkInAttendee(eventId, attendeeId)
    
    revalidatePath(`/event/[slug]/manage`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error checking in attendee:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to check in attendee' }
  }
} 
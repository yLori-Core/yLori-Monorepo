"use server"

import { updateEvent, createEvent, registerForEvent, getUserEventStatus, updateEventQuestions } from "@/lib/db/queries"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Schema for event validation
const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string(),
  eventType: z.enum(['in_person', 'virtual', 'hybrid']),
  location: z.string().optional(),
  virtualUrl: z.string().url().optional().or(z.literal("")),
  capacity: z.number().positive().optional(),
  requiresApproval: z.boolean(),
  visibility: z.enum(['public', 'private', 'unlisted']),
  ticketType: z.enum(['qr_code', 'nft']),
  ticketPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  coverImage: z.string().optional(),
  bannerImage: z.string().optional(),
  logoImage: z.string().optional(),
})

// Update schema for partial updates
const updateEventSchema = eventSchema.partial()

export async function createEventAction(formData: any) {
  try {
    const validatedData = eventSchema.parse(formData)
    
    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50)
    
    const event = await createEvent({
      ...validatedData,
      slug,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      ticketPrice: validatedData.ticketPrice ? validatedData.ticketPrice.toString() : undefined,
    })
    
    revalidatePath('/user/[username]', 'page')
    return { success: true, event }
  } catch (error) {
    console.error('Error creating event:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create event' }
  }
}

export async function updateEventAction(eventId: string, formData: FormData) {
  try {
    // Extract form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') ? (formData.get('description') as string) : undefined,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      timezone: formData.get('timezone') as string,
      eventType: formData.get('eventType') as 'in_person' | 'virtual' | 'hybrid',
      location: formData.get('location') ? (formData.get('location') as string) : undefined,
      virtualUrl: formData.get('virtualUrl') ? (formData.get('virtualUrl') as string) : "",
      capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined,
      requiresApproval: formData.get('requiresApproval') === 'true',
      visibility: formData.get('visibility') as 'public' | 'private' | 'unlisted',
      ticketType: formData.get('ticketType') as 'qr_code' | 'nft',
      ticketPrice: formData.get('ticketPrice') ? parseFloat(formData.get('ticketPrice') as string) : undefined,
      currency: formData.get('currency') as string || 'USD',
      coverImage: formData.get('coverImage') ? (formData.get('coverImage') as string) : undefined,
      bannerImage: formData.get('bannerImage') ? (formData.get('bannerImage') as string) : undefined,
      logoImage: formData.get('logoImage') ? (formData.get('logoImage') as string) : undefined,
    }

    // Extract custom questions
    const customQuestionsData = formData.get('customQuestions') as string
    let customQuestions: any[] = []
    if (customQuestionsData) {
      try {
        customQuestions = JSON.parse(customQuestionsData)
      } catch (error) {
        console.error('Failed to parse custom questions:', error)
      }
    }

    const validatedData = updateEventSchema.parse(rawData)
    
    // Convert date strings to Date objects if provided
    const updateData: any = {
      ...validatedData,
    }
    
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }
    
    if (validatedData.ticketPrice !== undefined) {
      updateData.ticketPrice = validatedData.ticketPrice.toString()
    }
    
    const event = await updateEvent(eventId, updateData)

    // Update custom questions if any
    if (customQuestions.length >= 0) { // Allow empty array to clear questions
      const validQuestions = customQuestions
        .filter(q => q.question && q.question.trim())
        .map((q, index) => ({
          question: q.question.trim(),
          questionType: q.questionType || 'text',
          options: q.options || undefined,
          isRequired: Boolean(q.isRequired),
          order: index,
        }))

      await updateEventQuestions(eventId, validQuestions)
    }
    
    revalidatePath(`/events/${event.slug}`)
    revalidatePath('/user/[username]', 'page')
    
    return { success: true, event }
  } catch (error) {
    console.error('Error updating event:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update event' }
  }
} 

export async function publishEventAction(eventId: string) {
  try {
    const event = await updateEvent(eventId, {
      status: 'published',
      publishedAt: new Date()
    })
    
    revalidatePath(`/events/${event.slug}`)
    revalidatePath('/user/[username]', 'page')
    
    return { success: true, event }
  } catch (error) {
    console.error('Error publishing event:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to publish event' }
  }
} 

export async function registerForEventAction(eventId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to register for events' }
    }
    
    // Check if user is already registered
    const existingRegistration = await getUserEventStatus(eventId, session.user.id)
    if (existingRegistration) {
      return { success: false, error: 'You are already registered for this event' }
    }
    
    const registration = await registerForEvent(eventId)
    
    revalidatePath(`/events/[slug]`, 'page')
    
    return { success: true, registration }
  } catch (error) {
    console.error('Error registering for event:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to register for event' }
  }
} 
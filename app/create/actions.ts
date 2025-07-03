"use server"

import { createEvent } from "@/lib/db/queries"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

// Form validation schema
const createEventSchema = z.object({
  title: z.string().min(1, "Event name is required").max(200, "Event name is too long"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  timezone: z.string().min(1, "Timezone is required"),
  eventType: z.enum(['in_person', 'virtual', 'hybrid']).default('in_person'),
  location: z.string().optional(),
  virtualUrl: z.string().url().optional().or(z.literal("")),
  capacity: z.number().positive().optional(),
  requiresApproval: z.boolean().default(false),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  ticketType: z.enum(['free', 'paid', 'donation', 'rsvp']).default('free'),
  ticketPrice: z.number().positive().optional(),
  currency: z.string().default('USD'),
})

export type CreateEventFormData = z.infer<typeof createEventSchema>

export async function createEventAction(formData: FormData) {
  try {
    // Extract and validate form data
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
      ticketType: formData.get('ticketType') as 'free' | 'paid' | 'donation' | 'rsvp',
      ticketPrice: formData.get('ticketPrice') ? parseFloat(formData.get('ticketPrice') as string) : undefined,
      currency: formData.get('currency') as string || 'USD',
    }

    // Validate the data
    const validatedData = createEventSchema.parse(rawData)

    // Convert dates
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    // Validate date logic
    if (endDate <= startDate) {
      throw new Error("End date must be after start date")
    }

    // Generate a URL-friendly slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100) + '-' + Date.now()

    // Prepare event data for database
    const eventData = {
      title: validatedData.title,
      description: validatedData.description || null,
      summary: validatedData.description ? validatedData.description.substring(0, 200) : null,
      startDate,
      endDate,
      timezone: validatedData.timezone,
      allDay: false,
      eventType: validatedData.eventType,
      location: validatedData.location || null,
      virtualUrl: validatedData.virtualUrl || null,
      capacity: validatedData.capacity || null,
      requiresApproval: validatedData.requiresApproval,
      visibility: validatedData.visibility,
      ticketType: validatedData.ticketType,
      ticketPrice: validatedData.ticketPrice ? validatedData.ticketPrice.toString() : null,
      currency: validatedData.currency,
      slug,
      status: 'draft' as const,
      theme: 'minimal',
      waitlistEnabled: false,
      allowGuestRegistration: true,
      maxGuestsPerRegistration: 1,
      collectGuestInfo: false,
      totalViews: 0,
      totalShares: 0,
      totalRegistrations: 0,
      totalCheckins: 0,
      isPrivate: validatedData.visibility === 'private',
      unlisted: validatedData.visibility === 'unlisted',
    }

    // Create event in database
    const newEvent = await createEvent(eventData)

    // Revalidate relevant pages
    revalidatePath('/')
    revalidatePath('/events')
    revalidatePath(`/user/${newEvent.createdById}`)

    // Return success with the slug for client-side navigation
    return { success: true, slug: newEvent.slug }
    
  } catch (error) {
    console.error('Error creating event:', error)
    
    if (error instanceof z.ZodError) {
      // Return validation errors
      return { success: false, error: `Validation error: ${error.errors.map(e => e.message).join(', ')}` }
    }
    
    if (error instanceof Error) {
      return { success: false, error: `Failed to create event: ${error.message}` }
    }
    
    return { success: false, error: 'Failed to create event. Please try again.' }
  }
} 
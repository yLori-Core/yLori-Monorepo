"use server"

import { publishEventAction, registerForEventAction } from "@/app/events/actions"
import { registerForEvent, incrementEventViews, incrementEventShares } from "@/lib/db/queries"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { encryptForQR } from '@/lib/utils'

export async function handlePublishAction(eventId: string, slug: string): Promise<void> {
  const result = await publishEventAction(eventId)
  if (result.success) {
    redirect(`/events/${slug}`)
  }
}

export async function handleRegisterAction(eventId: string, slug: string): Promise<void> {
  const result = await registerForEventAction(eventId)
  if (result.success) {
    revalidatePath(`/events/${slug}`)
  }
}

export async function handleRegisterWithAnswersAction(
  eventId: string, 
  slug: string, 
  answers: { questionId: string; answer: string | string[] }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert answers to the format expected by the database
    const applicationAnswers = answers.reduce((acc, { questionId, answer }) => {
      acc[questionId] = answer
      return acc
    }, {} as Record<string, string | string[]>)

    const result = await registerForEvent(eventId, { applicationAnswers })
    
    if (result) {
      revalidatePath(`/events/${slug}`)
      return { success: true }
    } else {
      return { success: false, error: 'Failed to register for event' }
    }
  } catch (error) {
    console.error('Error registering with answers:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to register for event' 
    }
  }
}

export async function trackEventViewAction(eventId: string): Promise<void> {
  try {
    await incrementEventViews(eventId)
  } catch (error) {
    console.error('Error tracking event view:', error)
    // Don't throw error - view tracking shouldn't break the page
  }
}

export async function trackEventShareAction(eventId: string): Promise<void> {
  try {
    await incrementEventShares(eventId)
  } catch (error) {
    console.error('Error tracking event share:', error)
    // Don't throw error - share tracking shouldn't break functionality
  }
}



export async function generateTicketData(email: string, eventId: string) {
  try {
    const data = JSON.stringify({ email, eventId })
    const encryptedData = encryptForQR(data)
    return { success: true, data: encryptedData }
  } catch (error) {
    console.error('Error generating ticket:', error)
    return { success: false, error: 'Failed to generate ticket' }
  }
} 
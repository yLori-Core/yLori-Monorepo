"use server"

import { publishEventAction, registerForEventAction } from "@/app/events/actions"
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
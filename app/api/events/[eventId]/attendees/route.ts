import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getEventAttendeesByStatus, isEventOrganizer } from "@/lib/db/queries"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user is organizer
    const isOrganizer = await isEventOrganizer(eventId, session.user.id)
    if (!isOrganizer) {
      return NextResponse.json({ error: "Only organizers can view attendees" }, { status: 403 })
    }
    
    // Get all attendees for this event
    const attendees = await getEventAttendeesByStatus(eventId)
    
    return NextResponse.json(attendees)
  } catch (error) {
    console.error("Error fetching attendees:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    )
  }
} 
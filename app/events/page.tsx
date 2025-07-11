import { Navbar } from "@/components/navbar"
import { getPublicEvents, getUpcomingEvents } from "@/lib/db/queries"
import { EventsClient } from "./events-client"

export default async function EventsPage() {
  // Get all events from the database
  const [allEvents, upcomingEvents] = await Promise.all([
    getPublicEvents(200), // Get more events for better filtering
    getUpcomingEvents(50)
  ])
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <EventsClient allEvents={allEvents} upcomingEvents={upcomingEvents} />
    </div>
  )
} 
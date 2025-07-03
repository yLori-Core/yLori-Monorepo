import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { getEventBySlug } from "@/lib/db/queries"
import { notFound } from "next/navigation"

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Fetch event from database
  const event = await getEventBySlug(slug)
  
  if (!event) {
    notFound()
  }

  // Format dates
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Event Status */}
        <div className="mb-6">
          <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="mb-4">
            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Draft'}
          </Badge>
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{event.title}</h1>
          {event.summary && (
            <p className="text-lg text-muted-foreground">{event.summary}</p>
          )}
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Date & Time</h3>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-foreground">{formatDate(startDate)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(startDate)} - {formatTime(endDate)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {event.timezone}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Location</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-foreground">
                  {event.eventType === 'virtual' ? 'Virtual Event' : event.location || 'Location TBA'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {event.eventType === 'virtual' ? 'Online' : event.eventType || 'In Person'}
                </div>
              </div>
            </div>
          </div>

          {/* Capacity */}
          {event.capacity && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Capacity</h3>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">{event.capacity} people</div>
                  <div className="text-sm text-muted-foreground">
                    {event.totalRegistrations} registered
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Tickets</h3>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-foreground">
                  {event.ticketType === 'free' ? 'Free' : 
                   event.ticketType === 'paid' ? `$${event.ticketPrice || '0'}` : 
                   event.ticketType ? event.ticketType.toUpperCase() : 'RSVP'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {event.requiresApproval === true ? 'Approval required' : 'Open registration'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">About this event</h3>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {(event.status === 'draft' || !event.status) ? (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Publish Event
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Register for Event
            </Button>
          )}
          <Button variant="outline">
            Share Event
          </Button>
        </div>

        {/* Event Stats */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{event.totalViews || 0}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{event.totalRegistrations || 0}</div>
              <div className="text-sm text-muted-foreground">Registered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{event.totalShares || 0}</div>
              <div className="text-sm text-muted-foreground">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{event.totalCheckins || 0}</div>
              <div className="text-sm text-muted-foreground">Check-ins</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
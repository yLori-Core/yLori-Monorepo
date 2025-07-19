import { getEventBySlug, getEventQuestions, isEventOrganizer, getUserEventStatus, getEventAttendeesCount } from "@/lib/db/queries"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventForm } from "@/components/event-form"
import { EventRegistration } from "@/components/event-registration"
import { EditEventLayout } from "@/components/edit-event-layout"
import { EventViewTracker } from "@/components/event-view-tracker"
import { EventShareButton } from "@/components/event-share-button"
import { handlePublishAction } from "./actions"
import { type Event } from "@/lib/db/schema"
import { 
  Edit, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Globe, 
  Monitor, 
  Eye,
  Share,
  ExternalLink,
  DollarSign,
  UserCheck,
  Settings,
  Send
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function EventPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { edit } = await searchParams
  const session = await getServerSession(authOptions)
  const isEditMode = edit === 'true'
  
  const event = await getEventBySlug(slug)
  if (!event) {
    notFound()
  }
  
  // Check if user is organizer
  const isOrganizer = session?.user?.id ? await isEventOrganizer(event.id, session.user.id) : false
  
  // Check if user is already registered
  const userRegistration = session?.user?.id ? await getUserEventStatus(event.id, session.user.id) : null
  
  // Get real-time registration count
  const realTimeRegistrationCount = await getEventAttendeesCount(event.id)
  
  // Get custom questions for registration
  const customQuestions = await getEventQuestions(event.id)
  
  // If event is draft and user is not organizer, show not found
  if (event.status === 'draft' && !isOrganizer) {
    notFound()
  }
  
  // If in edit mode but not organizer, redirect to view mode
  if (isEditMode && !isOrganizer) {
    redirect(`/events/${slug}`)
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
      <EventViewTracker eventId={event.id} isOrganizer={isOrganizer} />
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isEditMode ? (
          <EditEventLayout event={event as any} />
        ) : (
          <>
            {/* Event Header */}
            <div className="mb-8">
              {/* Cover Image */}
              {event.coverImage && (
                <div className="w-full h-64 bg-muted rounded-lg mb-8 overflow-hidden">
                  <Image 
                    src={event.coverImage} 
                    alt={event.title}
                    width={1200}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title and Description */}
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{event.title}</h1>
                  {event.description && (
                    <p className="text-lg text-muted-foreground leading-relaxed">{event.description}</p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  {/* Approved Participants Count */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span className="font-medium">{realTimeRegistrationCount}</span>
                    <span className="text-sm text-muted-foreground">going</span>
                  </div>
                  
                  {isOrganizer && (
                    <>
                      {event.status === 'draft' ? (
                        <form action={handlePublishAction.bind(null, event.id, slug)}>
                          <Button type="submit" variant="outline">
                            <Send className="w-4 h-4 mr-2" />
                            Publish
                          </Button>
                        </form>
                      ) : (
                        <Button asChild variant="outline">
                          <Link href={`/events/${slug}/manage`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="outline">
                        <Link href={`/events/${slug}?edit=true`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </>
                  )}
                  
                  {/* Share Button - always visible */}
                  <EventShareButton 
                    eventId={event.id}
                    eventTitle={event.title}
                    eventSlug={slug}
                  />
                </div>
              </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Event Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Date & Time Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Date & Time
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">{formatDate(startDate)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(startDate)} - {formatTime(endDate)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.timezone}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {event.eventType === 'virtual' ? <Monitor className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                      Location
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">
                        {event.eventType === 'virtual' ? 'Virtual Event' : event.location || 'Location TBA'}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {event.eventType.replace('_', ' ')}
                      </div>
                      {event.virtualUrl && userRegistration?.status === 'approved' && (
                        <Button asChild variant="outline" size="sm" className="mt-3">
                          <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Join Virtual Event
                          </a>
                        </Button>
                      )}
                      {event.virtualUrl && !userRegistration && (
                        <div className="text-xs text-muted-foreground mt-3">
                          Virtual link will be available after registration approval
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* About Section */}
                {event.description && (
                  <Card>
                    <CardHeader className="pb-4">
                      <h3 className="text-lg font-semibold">About this event</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{event.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Registration Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Registration
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-medium text-foreground">
                        {event.ticketType === 'qr_code' ? 'QR Code Ticket' : 
                         event.ticketType === 'nft' ? 'NFT Ticket' : 
                         'Digital Ticket'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Organizer approval required
                      </div>
                    </div>
                    
                    <EventRegistration 
                      session={session}
                      isOrganizer={isOrganizer}
                      userRegistration={userRegistration}
                      eventId={event.id}
                      slug={slug}
                      isDraft={event.status === 'draft'}
                      ticketType={event.ticketType}
                      customQuestions={customQuestions as any}
                      eventTitle={event.title}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
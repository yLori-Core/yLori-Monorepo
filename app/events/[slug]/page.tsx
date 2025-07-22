import { getEventBySlug, getEventQuestions, isEventOrganizer, getUserEventStatus, getEventAttendeesCount, getEventDashboardData } from "@/lib/db/queries"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventRegistration } from "@/components/event-registration"
import { EventViewTracker } from "@/components/event-view-tracker"
import { EventShareButton } from "@/components/event-share-button"
import { TicketQR } from "@/components/ticket-qr"
import { handlePublishAction } from "./actions"
import { 
  Edit, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Monitor, 
  Eye,
  Share,
  ExternalLink,
  UserCheck,
  UserPlus,
  Settings,
  Send,
  QrCode,
  TrendingUp,
  Award,
  Coins,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
  Globe,
  ChevronRight
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
  
  // Get real-time registration count and dashboard data
  const [realTimeRegistrationCount, dashboardData] = await Promise.all([
    getEventAttendeesCount(event.id),
    isOrganizer ? getEventDashboardData(event.id) : null
  ])
  
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
  const now = new Date()
  const isEventLive = now >= startDate && now <= endDate
  const isEventUpcoming = now < startDate
  const isEventPast = now > endDate
  
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

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-background">
      <EventViewTracker eventId={event.id} isOrganizer={isOrganizer} />
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-4">
        {isEditMode ? (
          <div>Edit mode placeholder - redirect to edit component</div>
        ) : (
          <div className="space-y-4">
            {/* Header Section */}
            <div className="relative">
              {/* Cover Image */}
              <div className="relative w-full h-48 sm:h-56 bg-muted rounded-lg overflow-hidden">
                {event.coverImage ? (
                  <Image 
                    src={event.coverImage} 
                    alt={event.title}
                    width={1200}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status and Actions */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div>
                    {isEventLive && (
                      <Badge variant="default" className="bg-green-600">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                        Live
                      </Badge>
                    )}
                    {isEventUpcoming && (
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Upcoming
                      </Badge>
                    )}
                    {isEventPast && (
                      <Badge variant="outline">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {event.status === 'draft' && (
                      <Badge variant="destructive">
                        <Edit className="w-3 h-3 mr-1" />
                        Draft
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <EventShareButton 
                      eventId={event.id}
                      eventTitle={event.title}
                      eventSlug={slug}
                    />
                    
                    {isOrganizer && (
                      <>
                        {event.status === 'draft' ? (
                          <form action={handlePublishAction.bind(null, event.id, slug)}>
                            <Button type="submit" size="sm" variant="secondary">
                              <Send className="w-4 h-4 mr-1" />
                              Publish
                            </Button>
                          </form>
                        ) : (
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/events/${slug}/manage`}>
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <h1 className="text-2xl font-bold text-foreground mb-3">
                        {event.title}
                      </h1>
                      
                      {/* Quick Event Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{formatShortDate(startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.eventType === 'virtual' ? <Monitor className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          <span className="capitalize">{event.eventType?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{realTimeRegistrationCount} attending</span>
                        </div>
                      </div>

                      {/* Event Description */}
                      {event.description && (
                        <div className="mt-4 mb-3">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {event.description}
                          </p>
                        </div>
                      )}


                    </div>

                                        {/* Registration Section */}
                    <div>
                      {isOrganizer ? (
                        /* Event Organizer */
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Settings className="w-4 h-4 text-primary" />
                              Event Organizer
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-center bg-primary/5 rounded-lg p-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Settings className="w-6 h-6 text-primary" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-4">
                                You're the organizer of this event. Use the management panel to handle registrations and check-ins.
                              </p>
                              <div className="flex gap-2">
                                <Button asChild size="sm" className="flex-1">
                                  <Link href={`/events/${slug}/manage`}>
                                    <QrCode className="w-4 h-4 mr-2" />
                                    Manage Event
                                  </Link>
                                </Button>
                                {event.status === 'draft' && (
                                  <form action={handlePublishAction.bind(null, event.id, slug)} className="flex-1">
                                    <Button type="submit" variant="outline" size="sm" className="w-full">
                                      <Send className="w-4 h-4 mr-2" />
                                      Publish
                                    </Button>
                                  </form>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : userRegistration?.status === 'approved' ? (
                        /* Your QR Code - Ready to Check In */
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Your Check-in QR Code
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">You're approved! Present this code at the event</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-dashed border-green-200 dark:border-green-800">
                              <div className="text-center space-y-3">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                                  <QrCode className="w-6 h-6 text-green-600" />
                                </div>
                                
                                <TicketQR 
                                  eventId={event.id}
                                  email={session?.user?.email || ''}
                                  eventName={event.title}
                                  eventDate={formatShortDate(startDate)}
                                />
                                
                                <div className="space-y-2">
                                  <div className="text-xs text-muted-foreground">
                                    This QR code is unique to you
                                  </div>
                                  <div className="bg-green-50 dark:bg-green-950 rounded p-2 text-xs">
                                    <div className="flex items-center gap-1 justify-center text-green-700 dark:text-green-300">
                                      <Coins className="w-3 h-3" />
                                      <span>+30 points when you check in</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {event.virtualUrl && (
                              <Button asChild className="w-full mt-3">
                                <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Join Virtual Event
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ) : userRegistration ? (
                        /* Pending Status */
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              Registration Status
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-center bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-6 h-6 text-blue-600" />
                              </div>
                              <Badge variant="secondary" className="mb-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {userRegistration.status === 'pending' ? 'Under Review' : userRegistration.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                {userRegistration.status === 'pending' 
                                  ? "Your registration is being reviewed. You'll receive your QR code once approved."
                                  : "Please contact the organizer for more information."
                                }
                              </p>
                              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                                ⏱️ Typically takes 1-2 hours
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        /* Registration Form */
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <UserPlus className="w-4 h-4" />
                              Register for Event
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                        {/* Event Details - Compact Layout */}
            <div className="space-y-4">
              {/* Essential Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date & Time */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{formatShortDate(startDate)}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(startDate)} - {formatTime(endDate)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        {event.eventType === 'virtual' ? 
                          <Monitor className="w-5 h-5 text-purple-600" /> : 
                          <MapPin className="w-5 h-5 text-purple-600" />
                        }
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {event.eventType === 'virtual' ? 'Virtual Event' : event.location || 'Location TBA'}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{event.eventType?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attendees */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{realTimeRegistrationCount} attending</div>
                        <div className="text-xs text-muted-foreground">
                          {event.capacity ? `${event.capacity - realTimeRegistrationCount} spots left` : 'No limit'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Points Available */}
                {!isOrganizer && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                          <Coins className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Earn Points</div>
                          <div className="text-xs text-muted-foreground">+30 check-in, +20 completion</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Capacity Progress (if has capacity) */}
              {event.capacity && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Event Capacity</span>
                      <span className="text-sm text-muted-foreground">{realTimeRegistrationCount} / {event.capacity}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min((realTimeRegistrationCount / event.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
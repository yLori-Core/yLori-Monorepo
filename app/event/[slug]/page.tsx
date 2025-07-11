import { getEventBySlug, isEventOrganizer, getUserEventStatus, getEventAttendeesCount } from "@/lib/db/queries"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EventForm } from "@/components/event-form"
import { publishEventAction, registerForEventAction } from "@/app/event/actions"
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
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { revalidatePath } from "next/cache"

export default async function EventPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>
  searchParams: Promise<{ edit?: string }>
}) {
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
  
  // If event is draft and user is not organizer, show not found
  if (event.status === 'draft' && !isOrganizer) {
    notFound()
  }
  
  // If in edit mode but not organizer, redirect to view mode
  if (isEditMode && !isOrganizer) {
    redirect(`/event/${slug}`)
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

  const handlePublish = async () => {
    'use server'
    const result = await publishEventAction(event.id)
    if (result.success) {
      redirect(`/event/${slug}`)
    }
  }

  const handleRegister = async () => {
    'use server'
    const result = await registerForEventAction(event.id)
    if (result.success) {
      revalidatePath(`/event/${slug}`)
    } else {
      // Handle error - in a real app, you'd want to show this to the user
      console.error('Registration failed:', result.error)
    }
  }

  const getRegistrationButton = () => {
    if (!session?.user) {
      return (
        <Button className="w-full" asChild>
          <Link href="/auth/signin">Sign In to Register</Link>
        </Button>
      )
    }

    if (isOrganizer) {
      return (
        <Button className="w-full" disabled>
          <UserCheck className="w-4 h-4 mr-2" />
          You're an Organizer
        </Button>
      )
    }

    if (userRegistration) {
      const statusIcons = {
        'pending': <AlertCircle className="w-4 h-4 mr-2" />,
        'approved': <CheckCircle className="w-4 h-4 mr-2" />,
        'waitlisted': <Clock className="w-4 h-4 mr-2" />,
        'checked_in': <CheckCircle className="w-4 h-4 mr-2" />,
        'cancelled': <AlertCircle className="w-4 h-4 mr-2" />,
        'declined': <AlertCircle className="w-4 h-4 mr-2" />,
        'no_show': <AlertCircle className="w-4 h-4 mr-2" />
      }
      
      const statusColors = {
        'pending': 'bg-yellow-600 hover:bg-yellow-700',
        'approved': 'bg-green-600 hover:bg-green-700',
        'waitlisted': 'bg-orange-600 hover:bg-orange-700',
        'checked_in': 'bg-blue-600 hover:bg-blue-700',
        'cancelled': 'bg-red-600 hover:bg-red-700',
        'declined': 'bg-gray-600 hover:bg-gray-700',
        'no_show': 'bg-purple-600 hover:bg-purple-700'
      }

      return (
        <Button 
          className={`w-full ${statusColors[userRegistration.status] || 'bg-green-600 hover:bg-green-700'}`} 
          disabled
        >
          {statusIcons[userRegistration.status]}
          {userRegistration.status.charAt(0).toUpperCase() + userRegistration.status.slice(1).replace('_', ' ')}
        </Button>
      )
    }

    return (
      <form action={handleRegister}>
        <Button type="submit" className="w-full">
          Register for Event
        </Button>
      </form>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isEditMode ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Edit className="w-6 h-6" />
                  Edit Event
                </h1>
                <p className="text-muted-foreground mt-1">Make changes to your event details</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/event/${slug}`}>Cancel</Link>
              </Button>
            </div>
            <EventForm initialData={event} />
          </>
        ) : (
          <>
            {/* Event Header */}
            <div className="mb-8">
              {/* Status Badge */}
              <div className="mb-6">
                <Badge 
                  variant={event.status === 'published' ? 'default' : 'secondary'} 
                  className="mb-4"
                >
                  {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Draft'}
                </Badge>
                

              </div>

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
                <div className="flex items-center gap-3">
                  {isOrganizer && (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/event/${slug}/manage`} className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Manage Event
                        </Link>
                      </Button>
                      
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/event/${slug}?edit=true`} className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </Button>
                      
                      {event.status === 'draft' && (
                        <form action={handlePublish} className="inline">
                          <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                            <Send className="w-4 h-4 mr-2" />
                            Publish
                          </Button>
                        </form>
                      )}
                    </>
                  )}
                  
                  {event.status === 'published' && (
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  )}
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
                        {event.eventType?.replace('_', ' ')}
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
                        {event.ticketType === 'free' ? 'Free' : 
                         event.ticketType === 'paid' ? `${event.currency || '$'}${event.ticketPrice || '0'}` : 
                         event.ticketType ? event.ticketType.toUpperCase() : 'RSVP'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.requiresApproval ? 'Approval required' : 'Open registration'}
                      </div>
                    </div>
                    
                    {event.status === 'draft' ? (
                      <Button className="w-full" disabled>
                        Event Not Published
                      </Button>
                    ) : (
                      getRegistrationButton()
                    )}
                  </CardContent>
                </Card>

                {/* Event Info Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Event Details
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.capacity && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4" />
                          <span>Capacity</span>
                        </div>
                        <span className="font-medium">{event.capacity}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>Visibility</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {event.visibility}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="w-4 h-4" />
                        <span>Registered</span>
                      </div>
                      <span className="font-medium">{realTimeRegistrationCount}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Stats Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <h3 className="text-lg font-semibold">Event Statistics</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{event.totalViews || 0}</div>
                        <div className="text-xs text-muted-foreground">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{event.totalShares || 0}</div>
                        <div className="text-xs text-muted-foreground">Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{realTimeRegistrationCount}</div>
                        <div className="text-xs text-muted-foreground">Registered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{event.totalCheckins || 0}</div>
                        <div className="text-xs text-muted-foreground">Check-ins</div>
                      </div>
                    </div>
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

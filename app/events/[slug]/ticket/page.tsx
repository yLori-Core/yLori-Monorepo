import { getEventBySlug, getUserEventStatus } from "@/lib/db/queries"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TicketQR } from "@/components/ticket-qr"
import { 
  QrCode, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Download,
  Share,
  CheckCircle,
  Monitor,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function TicketPage({ params }: PageProps) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }
  
  const event = await getEventBySlug(slug)
  if (!event) {
    notFound()
  }
  
  // Check user's registration status
  const userRegistration = await getUserEventStatus(event.id, session.user.id)
  
  // Only approved attendees can view tickets
  if (!userRegistration || userRegistration.status !== 'approved') {
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
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${slug}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Your Ticket</h1>
            <p className="text-sm text-muted-foreground">Present QR code for check-in</p>
          </div>
        </div>

        {/* Ticket */}
        <div className="space-y-4">
          {/* Event Header */}
          <Card>
            <div className="relative">
              {/* Cover Image */}
              <div className="relative h-40 bg-muted rounded-t-lg overflow-hidden">
                {event.coverImage && (
                  <Image 
                    src={event.coverImage} 
                    alt={event.title}
                    width={800}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                </div>
              </div>
              
              {/* Event Info */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h1 className="text-xl font-bold text-foreground">{event.title}</h1>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatDate(startDate)}</div>
                          <div className="text-xs text-muted-foreground">{formatTime(startDate)} - {formatTime(endDate)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        {event.eventType === 'virtual' ? <Monitor className="w-4 h-4 text-muted-foreground" /> : <MapPin className="w-4 h-4 text-muted-foreground" />}
                        <div>
                          <div className="font-medium">
                            {event.eventType === 'virtual' ? 'Virtual Event' : event.location || 'Location TBA'}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">{event.eventType?.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium">Event Type</div>
                        <div className="text-xs text-muted-foreground capitalize">{event.ticketType} • {event.eventType?.replace('_', ' ')}</div>
                      </div>
                      
                      {event.timezone && (
                        <div className="text-sm">
                          <div className="font-medium">Timezone</div>
                          <div className="text-xs text-muted-foreground">{event.timezone}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* QR Code Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Your Check-in QR Code
              </CardTitle>
              <p className="text-sm text-muted-foreground">Present this QR code to organizers at the event entrance</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/30 rounded-lg p-6 text-center border-2 border-dashed">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <QrCode className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <TicketQR 
                      eventId={event.id}
                      email={session.user.email!}
                      eventName={event.title}
                      eventDate={formatDate(startDate)}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground max-w-xs mx-auto">
                    This QR code is unique to you. Do not share it with others.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendee & Points Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Registration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Registration</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{session.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{session.user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Approved
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Registered</span>
                  <span className="font-medium text-xs">
                    {userRegistration?.createdAt ? new Date(userRegistration.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Points & Rewards */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Points & Rewards</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Check-in to event</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">+30 pts</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Complete event</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">+20 pts</Badge>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span>Total potential</span>
                    <span className="text-primary">+50 points</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {event.virtualUrl && (
                <Button asChild className="w-full">
                  <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Virtual Event
                  </a>
                </Button>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Save Ticket
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share Event
                </Button>
              </div>
              
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/events/${slug}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Event Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Important Notes */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground space-y-1">
            <p>• Arrive 15 minutes early</p>
            <p>• Keep QR code ready</p>
            <p>• Contact organizers for issues</p>
            <p>• Points awarded on check-in</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
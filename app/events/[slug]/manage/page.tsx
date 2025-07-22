import { getEventBySlug, isEventOrganizer, getEventDashboardData, getEventAttendeesByStatus } from "@/lib/db/queries"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  UserX,
  ArrowLeft,
  Calendar,
  MapPin,
  Eye,
  Share,
  Settings,
  QrCode
} from "lucide-react"
import Link from "next/link"
import { AttendeeManagement } from "@/components/attendee-management"
import { AttendeeProvider } from "@/components/providers/attendee-provider"
import { QRScannerButton } from "@/components/qr-scanner-button"

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }
  
  const event = await getEventBySlug(slug)
  if (!event) {
    notFound()
  }
  
  // Check if user is organizer
  const isOrganizer = await isEventOrganizer(event.id, session.user.id)
  if (!isOrganizer) {
    redirect(`/events/${slug}`)
  }
  
  // Get dashboard data and attendees
  const [dashboardData, attendees] = await Promise.all([
    getEventDashboardData(event.id),
    getEventAttendeesByStatus(event.id)
  ])
  
  // Format dates
  const startDate = new Date(event.startDate)
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <AttendeeProvider eventId={event.id} initialData={attendees}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${slug}`} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Event
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <QRScannerButton eventId={event.id} />
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${slug}?edit=true`} className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Event
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${slug}`} className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Public Page
                </Link>
              </Button>
            </div>
          </div>

          {/* Event Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                      {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Draft'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {event.visibility}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {event.eventType === 'virtual' ? 'Virtual Event' : event.location || 'TBA'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {event.eventType?.replace('_', ' ')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {event.capacity ? `${dashboardData.stats.totalRegistrations}/${event.capacity}` : `${dashboardData.stats.totalRegistrations} registered`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.capacity ? 'Spots remaining: ' + (event.capacity - dashboardData.stats.totalRegistrations) : 'Unlimited capacity'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{event.totalViews || 0} views</p>
                <p className="text-xs text-muted-foreground">{event.totalShares || 0} shares</p>
              </CardContent>
            </Card>
          </div>

          {/* Attendee Management */}
          <Card>
            <CardHeader>
              <CardTitle>Attendee Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage registrations, approve attendees, and check people in
              </p>
            </CardHeader>
            <CardContent>
              <AttendeeManagement eventId={event.id} requiresApproval={event.requiresApproval || false} />
            </CardContent>
          </Card>
        </div>
      </AttendeeProvider>
    </div>
  )
} 
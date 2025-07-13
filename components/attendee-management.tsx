"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  UserCheck, 
  AlertCircle,
  MoreVertical,
  MessageSquare,
  Users,
  Calendar
} from "lucide-react"
import { 
  approveAttendeeAction, 
  declineAttendeeAction, 
  moveToWaitlistAction, 
  checkInAttendeeAction 
} from "@/app/events/[slug]/manage/actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Attendee {
  id: string
  status: 'pending' | 'approved' | 'waitlisted' | 'declined' | 'cancelled' | 'checked_in' | 'no_show'
  registeredAt: Date
  checkedIn: boolean
  checkedInAt: Date | null
  waitlistPosition: number | null
  isVip: boolean
  guestName: string | null
  guestEmail: string | null
  applicationAnswers: any
  user: {
    id: string | null
    name: string | null
    email: string | null
    image: string | null
    username: string | null
    company: string | null
    jobTitle: string | null
  } | null
}

interface AttendeeManagementProps {
  eventId: string
  requiresApproval: boolean
}

export function AttendeeManagement({ eventId, requiresApproval }: AttendeeManagementProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()
  const [declineReason, setDeclineReason] = useState("")
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null)

  // Fetch attendees
  useEffect(() => {
    async function fetchAttendees() {
      try {
        const response = await fetch(`/api/events/${eventId}/attendees`)
        if (response.ok) {
          const data = await response.json()
          setAttendees(data)
        }
      } catch (error) {
        console.error('Error fetching attendees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendees()
  }, [eventId])

  // Filter attendees
  const filteredAttendees = attendees.filter(attendee => {
    const name = attendee.user?.name || attendee.guestName || ""
    const email = attendee.user?.email || attendee.guestEmail || ""
    const company = attendee.user?.company || ""
    
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || attendee.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Group attendees by status
  const attendeesByStatus = {
    pending: filteredAttendees.filter(a => a.status === 'pending'),
    approved: filteredAttendees.filter(a => a.status === 'approved'),
    waitlisted: filteredAttendees.filter(a => a.status === 'waitlisted'),
    checked_in: filteredAttendees.filter(a => a.status === 'checked_in'),
    declined: filteredAttendees.filter(a => a.status === 'declined'),
  }

  const handleApprove = async (attendeeId: string) => {
    startTransition(async () => {
      const result = await approveAttendeeAction(eventId, attendeeId)
      if (result.success) {
        // Update local state
        setAttendees(prev => prev.map(a => 
          a.id === attendeeId ? { ...a, status: 'approved' as const } : a
        ))
      } else {
        alert(result.error)
      }
    })
  }

  const handleDecline = async (attendeeId: string) => {
    startTransition(async () => {
      const result = await declineAttendeeAction(eventId, attendeeId, declineReason)
      if (result.success) {
        setAttendees(prev => prev.map(a => 
          a.id === attendeeId ? { ...a, status: 'declined' as const } : a
        ))
        setDeclineReason("")
        setSelectedAttendee(null)
      } else {
        alert(result.error)
      }
    })
  }

  const handleMoveToWaitlist = async (attendeeId: string) => {
    startTransition(async () => {
      const result = await moveToWaitlistAction(eventId, attendeeId)
      if (result.success) {
        setAttendees(prev => prev.map(a => 
          a.id === attendeeId ? { ...a, status: 'waitlisted' as const } : a
        ))
      } else {
        alert(result.error)
      }
    })
  }

  const handleCheckIn = async (attendeeId: string) => {
    startTransition(async () => {
      const result = await checkInAttendeeAction(eventId, attendeeId)
      if (result.success) {
        setAttendees(prev => prev.map(a => 
          a.id === attendeeId ? { ...a, status: 'checked_in' as const, checkedIn: true, checkedInAt: new Date() } : a
        ))
      } else {
        alert(result.error)
      }
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, color: "text-yellow-600", label: "Pending" },
      approved: { variant: "default" as const, color: "text-green-600", label: "Approved" },
      waitlisted: { variant: "outline" as const, color: "text-orange-600", label: "Waitlisted" },
      checked_in: { variant: "default" as const, color: "text-blue-600", label: "Checked In" },
      declined: { variant: "destructive" as const, color: "text-red-600", label: "Declined" },
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    )
  }

    const AttendeeCard = ({ attendee }: { attendee: Attendee }) => {
    const displayName = attendee.user?.name || attendee.guestName || "Unknown"
    const displayEmail = attendee.user?.email || attendee.guestEmail || ""
    const displayCompany = attendee.user?.company || ""
    const displayJob = attendee.user?.jobTitle || ""

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                  <AvatarImage src={attendee.user?.image || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {attendee.isVip && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">★</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-foreground text-lg truncate">{displayName}</h4>
                  {attendee.isVip && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 text-xs font-medium">
                      VIP
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
                  {displayCompany && (
                    <p className="text-sm text-muted-foreground/80 truncate">
                      {displayJob ? `${displayJob} at ${displayCompany}` : displayCompany}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Registered {new Date(attendee.registeredAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {attendee.status === 'pending' ? (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(attendee.id)}
                    disabled={isPending}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedAttendee(attendee.id)}
                    disabled={isPending}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Decline
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleMoveToWaitlist(attendee.id)}
                    disabled={isPending}
                    className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Waitlist
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={isPending} 
                      className="hover:bg-muted/50 transition-colors duration-200 rounded-full w-8 h-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {attendee.status === 'approved' && (
                      <>
                        <DropdownMenuItem onClick={() => handleCheckIn(attendee.id)} className="cursor-pointer">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Check In
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMoveToWaitlist(attendee.id)} className="cursor-pointer">
                          <Clock className="h-4 w-4 mr-2" />
                          Move to Waitlist
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {attendee.status === 'waitlisted' && (
                      <DropdownMenuItem onClick={() => handleApprove(attendee.id)} className="cursor-pointer">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading attendees...</div>
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search attendees by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 h-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="waitlisted">Waitlisted</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendee Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/30 backdrop-blur-sm p-1 h-12 rounded-lg">
          <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <Clock className="h-4 w-4" />
            Pending ({attendeesByStatus.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <CheckCircle className="h-4 w-4" />
            Approved ({attendeesByStatus.approved.length})
          </TabsTrigger>
          <TabsTrigger value="waitlisted" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <AlertCircle className="h-4 w-4" />
            Waitlisted ({attendeesByStatus.waitlisted.length})
          </TabsTrigger>
          <TabsTrigger value="checked_in" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <UserCheck className="h-4 w-4" />
            Checked In ({attendeesByStatus.checked_in.length})
          </TabsTrigger>
          <TabsTrigger value="declined" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <XCircle className="h-4 w-4" />
            Declined ({attendeesByStatus.declined.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(attendeesByStatus).map(([status, statusAttendees]) => (
          <TabsContent key={status} value={status} className="mt-8">
            <div className="space-y-3">
              {statusAttendees.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium">No {status.replace('_', ' ')} attendees</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {status === 'pending' ? 'New registrations will appear here' : 
                     status === 'approved' ? 'Approved attendees will appear here' :
                     `${status.replace('_', ' ')} attendees will appear here`}
                  </p>
                </div>
              ) : (
                statusAttendees.map((attendee) => (
                  <AttendeeCard key={attendee.id} attendee={attendee} />
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Decline Dialog */}
      <Dialog open={selectedAttendee !== null} onOpenChange={() => setSelectedAttendee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this registration? You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Reason for declining (optional)"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAttendee(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedAttendee && handleDecline(selectedAttendee)}
              disabled={isPending}
            >
              Decline Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
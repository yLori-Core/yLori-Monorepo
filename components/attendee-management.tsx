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
  MessageSquare
} from "lucide-react"
import { 
  approveAttendeeAction, 
  declineAttendeeAction, 
  moveToWaitlistAction, 
  checkInAttendeeAction 
} from "@/app/event/[slug]/manage/actions"
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
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={attendee.user?.image || ""} />
              <AvatarFallback>
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{displayName}</h4>
                {attendee.isVip && <Badge variant="outline" className="text-xs">VIP</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
              {displayCompany && (
                <p className="text-xs text-muted-foreground">
                  {displayJob ? `${displayJob} at ${displayCompany}` : displayCompany}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Registered: {new Date(attendee.registeredAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(attendee.status)}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isPending}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {attendee.status === 'pending' && (
                  <>
                    <DropdownMenuItem onClick={() => handleApprove(attendee.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedAttendee(attendee.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMoveToWaitlist(attendee.id)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Move to Waitlist
                    </DropdownMenuItem>
                  </>
                )}
                
                {attendee.status === 'approved' && (
                  <>
                    <DropdownMenuItem onClick={() => handleCheckIn(attendee.id)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Check In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMoveToWaitlist(attendee.id)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Move to Waitlist
                    </DropdownMenuItem>
                  </>
                )}
                
                {attendee.status === 'waitlisted' && (
                  <DropdownMenuItem onClick={() => handleApprove(attendee.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search attendees by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({attendeesByStatus.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({attendeesByStatus.approved.length})
          </TabsTrigger>
          <TabsTrigger value="waitlisted" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Waitlisted ({attendeesByStatus.waitlisted.length})
          </TabsTrigger>
          <TabsTrigger value="checked_in" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Checked In ({attendeesByStatus.checked_in.length})
          </TabsTrigger>
          <TabsTrigger value="declined" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Declined ({attendeesByStatus.declined.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(attendeesByStatus).map(([status, statusAttendees]) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-4">
              {statusAttendees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {status.replace('_', ' ')} attendees found
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
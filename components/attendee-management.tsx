"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Users, 
  Search, 
  MoreVertical, 
  Building2, 
  Briefcase,
  Loader2,
  Calendar,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from "lucide-react"
import { useAttendees } from "./providers/attendee-provider"
import { type EventAttendee, attendeeStatusEnum } from "@/lib/db/schema"
import { 
  approveAttendeeAction, 
  declineAttendeeAction, 
  moveToWaitlistAction,
  moveToPendingAction,
  checkInAttendeeAction 
} from "@/app/events/[slug]/manage/actions"
import { toast } from "sonner"

type AttendeeStatus = (typeof attendeeStatusEnum.enumValues)[number]

interface AttendeeUser {
  id: string | null
  name: string | null
  email: string | null
  image: string | null
  username: string | null
  company: string | null
  jobTitle: string | null
}

interface Attendee {
  id: string
  status: AttendeeStatus
  registeredAt: Date
  checkedIn: boolean | null
  checkedInAt: Date | null
  waitlistPosition: number | null
  isVip: boolean | null
  guestName: string | null
  guestEmail: string | null
  applicationAnswers: any
  user: AttendeeUser | null
}

interface AttendeeManagementProps {
  eventId: string
  requiresApproval: boolean
}

function isStatus(status: string): status is AttendeeStatus {
  return attendeeStatusEnum.enumValues.includes(status as AttendeeStatus)
}

function getStatusActions(status: AttendeeStatus) {
  const actions = []
  
  if (status !== "approved") {
    actions.push("approve")
  }
  
  if (status !== "pending") {
    actions.push("pending")
  }
  
  if (status !== "waitlisted") {
    actions.push("waitlist")
  }
  
  if (status === "approved") {
    actions.push("check_in")
  }
  
  if (status !== "declined") {
    actions.push("decline")
  }
  
  return actions
}

const ATTENDEE_STATUS = {
  PENDING: "pending" as AttendeeStatus,
  APPROVED: "approved" as AttendeeStatus,
  WAITLISTED: "waitlisted" as AttendeeStatus,
  DECLINED: "declined" as AttendeeStatus,
  CHECKED_IN: "checked_in" as AttendeeStatus,
  CANCELLED: "cancelled" as AttendeeStatus,
  NO_SHOW: "no_show" as AttendeeStatus
}

function getStatusLabel(status: AttendeeStatus) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function AttendeeManagement({ eventId, requiresApproval }: AttendeeManagementProps) {
  const [activeTab, setActiveTab] = useState<AttendeeStatus>(ATTENDEE_STATUS.PENDING)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [eventQuestions, setEventQuestions] = useState<Record<string, string>>({})
  const { attendees, loading, updateAttendee } = useAttendees()

  // Fetch event questions for displaying question text instead of IDs
  useEffect(() => {
    const fetchEventQuestions = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/questions`)
        const data = await response.json()
        if (data.success && Array.isArray(data.questions)) {
          const questionsMap = data.questions.reduce((acc: Record<string, string>, q: any) => {
            acc[q.id] = q.question
            return acc
          }, {})
          setEventQuestions(questionsMap)
        }
      } catch (error) {
        console.error('Failed to fetch event questions:', error)
      }
    }

    fetchEventQuestions()
  }, [eventId])

  // Filter and group attendees by status
  const filteredAttendees = attendees.filter(attendee => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const user = attendee.user
    
    return (
      user?.name?.toLowerCase().includes(searchLower) ||
      user?.email?.toLowerCase().includes(searchLower) ||
      user?.company?.toLowerCase().includes(searchLower) ||
      attendee.guestName?.toLowerCase().includes(searchLower) ||
      attendee.guestEmail?.toLowerCase().includes(searchLower)
    )
  })

  const attendeesByStatus = filteredAttendees.reduce((acc, attendee) => {
    const status = attendee.status as AttendeeStatus
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(attendee)
    return acc
  }, {} as Record<AttendeeStatus, Attendee[]>)

  // Ensure all status arrays exist
  Object.values(ATTENDEE_STATUS).forEach(status => {
    if (!attendeesByStatus[status]) {
      attendeesByStatus[status] = []
    }
  })

  // Initialize empty arrays for each status if not present
  const statuses: AttendeeStatus[] = attendeeStatusEnum.enumValues
  statuses.forEach(status => {
    if (!attendeesByStatus[status]) {
      attendeesByStatus[status] = []
    }
  })

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (isStatus(value)) {
      setActiveTab(value)
    }
  }



  // Set initial active tab to first non-empty section
  useEffect(() => {
    if (!loading) {
      const tabOrder = ["pending", "approved", "waitlisted", "checked_in", "declined"] as const;
      const firstNonEmptyTab = tabOrder.find(tab => attendeesByStatus[tab as AttendeeStatus].length > 0);
      if (firstNonEmptyTab && firstNonEmptyTab !== activeTab) {
        setActiveTab(firstNonEmptyTab as AttendeeStatus);
      }
    }
  }, [loading, attendeesByStatus, activeTab]);

  const handleApprove = async (attendeeId: string) => {
    try {
      setIsPending(true)
      const result = await approveAttendeeAction(eventId, attendeeId)
      
      if (result.success) {
        // Update local state
        updateAttendee(attendeeId, { status: ATTENDEE_STATUS.APPROVED })
        toast.success('Attendee moved to Approved')
      } else {
        toast.error(result.error || 'Failed to approve attendee')
      }
    } catch (error) {
      console.error('Error approving attendee:', error)
      toast.error('Failed to approve attendee')
    } finally {
      setIsPending(false)
    }
  }

  const handleDecline = async (attendeeId: string) => {
    try {
      setIsPending(true)
      const result = await declineAttendeeAction(eventId, attendeeId, declineReason)
      
      if (result.success) {
        console.log('Successfully declined attendee')
        updateAttendee(attendeeId, { status: ATTENDEE_STATUS.DECLINED })
        setDeclineReason("")
        setSelectedAttendee(null)
        toast.success('Attendee declined')
      } else {
        toast.error(result.error || 'Failed to decline attendee')
      }
    } catch (error) {
      console.error('Error declining attendee:', error)
      toast.error('Failed to decline attendee')
    } finally {
      setIsPending(false)
    }
  }

  const handleMoveToWaitlist = async (attendeeId: string) => {
    try {
      setIsPending(true)
      const result = await moveToWaitlistAction(eventId, attendeeId)
      
      if (result.success) {
        console.log('Successfully moved attendee to waitlist')
        updateAttendee(attendeeId, { status: ATTENDEE_STATUS.WAITLISTED })
        toast.success('Attendee moved to Waitlist')
      } else {
        toast.error(result.error || 'Failed to move attendee to waitlist')
      }
    } catch (error) {
      console.error('Error moving attendee to waitlist:', error)
      toast.error('Failed to move attendee to waitlist')
    } finally {
      setIsPending(false)
    }
  }

  const handleMoveToPending = async (attendeeId: string) => {
    try {
      setIsPending(true)
      const result = await moveToPendingAction(eventId, attendeeId)
      
      if (result.success) {
        console.log('Successfully moved attendee to pending')
        updateAttendee(attendeeId, { status: ATTENDEE_STATUS.PENDING })
        toast.success('Attendee moved to Pending')
      } else {
        toast.error(result.error || 'Failed to move attendee to pending')
      }
    } catch (error) {
      console.error('Error moving attendee to pending:', error)
      toast.error('Failed to move attendee to pending')
    } finally {
      setIsPending(false)
    }
  }

  const handleCheckIn = async (attendeeId: string) => {
    try {
      setIsPending(true)
      const result = await checkInAttendeeAction(eventId, attendeeId)
      
      if (result.success) {
        console.log('Successfully checked in attendee')
        updateAttendee(attendeeId, {
          status: ATTENDEE_STATUS.CHECKED_IN,
          checkedIn: true,
          checkedInAt: new Date()
        })
        toast.success('Attendee checked in')
      } else {
        toast.error(result.error || 'Failed to check in attendee')
      }
    } catch (error) {
      console.error('Error checking in attendee:', error)
      toast.error('Failed to check in attendee')
    } finally {
      setIsPending(false)
    }
  }

  const AttendeeCard = ({ attendee }: { attendee: Attendee }) => {
    const [showAnswers, setShowAnswers] = useState(false)
    const displayName = attendee.user?.name || attendee.guestName || "Unknown"
    const displayEmail = attendee.user?.email || attendee.guestEmail || ""
    const displayCompany = attendee.user?.company || ""
    const displayJob = attendee.user?.jobTitle || ""

    const availableActions = getStatusActions(attendee.status)
    
    // Parse application answers if they exist
    const hasAnswers = attendee.applicationAnswers && Object.keys(attendee.applicationAnswers).length > 0
    const answers = hasAnswers ? attendee.applicationAnswers : null
    
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
              {attendee.status === ATTENDEE_STATUS.PENDING ? (
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
                      disabled={isPending || attendee.status === ATTENDEE_STATUS.CHECKED_IN} 
                      className="hover:bg-muted/50 transition-colors duration-200 rounded-full w-8 h-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* Only show status change options if not checked in */}
                    {attendee.status !== ATTENDEE_STATUS.CHECKED_IN && (
                      <>
                        {availableActions.includes("approve") && (
                          <DropdownMenuItem onClick={() => handleApprove(attendee.id)} className="cursor-pointer">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Move to Approved
                          </DropdownMenuItem>
                        )}
                        
                        {availableActions.includes("pending") && (
                          <DropdownMenuItem onClick={() => handleMoveToPending(attendee.id)} className="cursor-pointer">
                            <Clock className="h-4 w-4 mr-2" />
                            Move to Pending
                          </DropdownMenuItem>
                        )}

                        {availableActions.includes("waitlist") && (
                          <DropdownMenuItem onClick={() => handleMoveToWaitlist(attendee.id)} className="cursor-pointer">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Move to Waitlist
                          </DropdownMenuItem>
                        )}

                        {availableActions.includes("check_in") && (
                          <DropdownMenuItem onClick={() => handleCheckIn(attendee.id)} className="cursor-pointer">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Check In
                          </DropdownMenuItem>
                        )}

                        {availableActions.includes("decline") && (
                          <DropdownMenuItem onClick={() => setSelectedAttendee(attendee.id)} className="cursor-pointer text-destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Move to Declined
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Application Answers Section */}
          {hasAnswers && (
            <div className="mt-4 border-t border-border/50 pt-4">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors p-2 rounded-md"
              >
                <HelpCircle className="h-4 w-4" />
                Registration Answers
                {showAnswers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {showAnswers && (
                                 <div className="mt-3 space-y-3 bg-muted/30 rounded-lg p-3">
                   {Object.entries(answers).map(([questionId, answer]) => (
                     <div key={questionId} className="space-y-1">
                       <p className="text-sm font-medium text-foreground">
                         {eventQuestions[questionId] || `Question ${questionId}`}
                       </p>
                       <div className="text-sm text-muted-foreground bg-background/50 rounded-md p-2">
                         {Array.isArray(answer) ? (
                           <ul className="list-disc list-inside space-y-1">
                             {answer.map((item, index) => (
                               <li key={index}>{String(item)}</li>
                             ))}
                           </ul>
                         ) : (
                           <p>{String(answer) || 'No answer provided'}</p>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-7 w-7 stroke-[1.2] text-primary animate-spin-fast mb-2" />
        <span className="text-sm text-muted-foreground">Loading attendees...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search attendees by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200"
        />
      </div>

      {/* Attendee Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/30 backdrop-blur-sm p-1 h-12 rounded-lg">
          <TabsTrigger value={ATTENDEE_STATUS.PENDING} className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <Clock className="h-4 w-4" />
            Pending ({attendeesByStatus[ATTENDEE_STATUS.PENDING].length})
          </TabsTrigger>
          <TabsTrigger value={ATTENDEE_STATUS.APPROVED} className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <CheckCircle className="h-4 w-4" />
            Approved ({attendeesByStatus[ATTENDEE_STATUS.APPROVED].length})
          </TabsTrigger>
          <TabsTrigger value={ATTENDEE_STATUS.WAITLISTED} className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <AlertCircle className="h-4 w-4" />
            Waitlisted ({attendeesByStatus[ATTENDEE_STATUS.WAITLISTED].length})
          </TabsTrigger>
          <TabsTrigger value={ATTENDEE_STATUS.CHECKED_IN} className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <UserCheck className="h-4 w-4" />
            Checked In ({attendeesByStatus[ATTENDEE_STATUS.CHECKED_IN].length})
          </TabsTrigger>
          <TabsTrigger value={ATTENDEE_STATUS.DECLINED} className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 font-medium">
            <XCircle className="h-4 w-4" />
            Declined ({attendeesByStatus[ATTENDEE_STATUS.DECLINED].length})
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
                  <p className="text-lg font-medium">No {getStatusLabel(status as AttendeeStatus)} Attendees</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {status === ATTENDEE_STATUS.PENDING ? 'New registrations will appear here' : 
                     status === ATTENDEE_STATUS.APPROVED ? 'Approved attendees will appear here' :
                     `${getStatusLabel(status as AttendeeStatus)} attendees will appear here`}
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
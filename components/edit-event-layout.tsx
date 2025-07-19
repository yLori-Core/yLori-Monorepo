"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DateTimePicker } from "@/components/date-time-picker"
import { ImageUpload } from "@/components/image-upload"
import { EventQuestionsManager, type EventQuestion } from "@/components/event-questions-manager"
import { updateEventAction } from "@/app/events/actions"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  Globe, 
  Settings, 
  HelpCircle,
  Image as ImageIcon,
  Save,
  Eye,
  Share,
  BarChart3,
  Clock,
  DollarSign,
  Shield,
  Palette,
  Plus
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface EventData {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  timezone?: string;
  eventType?: 'in_person' | 'virtual' | 'hybrid';
  location?: string | null;
  virtualUrl?: string | null;
  capacity?: number | null;
  requiresApproval?: boolean | null;
  visibility?: 'public' | 'private' | 'unlisted' | null;
  ticketType?: 'qr_code' | 'nft' | null;
  ticketPrice?: number | string | null;
  currency?: string | null;
  coverImage?: string | null;
  bannerImage?: string | null;
  logoImage?: string | null;
  slug: string;
  status: string;
  [key: string]: any;
}

interface EditEventLayoutProps {
  event: EventData;
}

export function EditEventLayout({ event }: EditEventLayoutProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("basic")
  const [hasChanges, setHasChanges] = useState(false)

  // Basic Info State
  const [title, setTitle] = useState(event.title || "")
  const [description, setDescription] = useState(event.description || "")
  const [startDate, setStartDate] = useState<Date | undefined>(event.startDate ? new Date(event.startDate) : undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(event.endDate ? new Date(event.endDate) : undefined)
  const [startTime, setStartTime] = useState<string | undefined>(
    event.startDate ? new Date(event.startDate).toTimeString().slice(0, 5) : undefined
  )
  const [endTime, setEndTime] = useState<string | undefined>(
    event.endDate ? new Date(event.endDate).toTimeString().slice(0, 5) : undefined
  )

  // Location & Format State
  const [eventType, setEventType] = useState(event.eventType || 'in_person')
  const [location, setLocation] = useState(event.location || "")
  const [virtualUrl, setVirtualUrl] = useState(event.virtualUrl || "")

  // Settings State
  const [capacity, setCapacity] = useState<number | undefined>(event.capacity || undefined)
  const [requiresApproval, setRequiresApproval] = useState<boolean>(event.requiresApproval !== null && event.requiresApproval !== undefined ? event.requiresApproval : true)
  const [visibility, setVisibility] = useState(event.visibility || 'public')
  const [ticketType, setTicketType] = useState(event.ticketType || 'qr_code')
  const [ticketPrice, setTicketPrice] = useState<number | undefined>(
    typeof event.ticketPrice === 'number' ? event.ticketPrice :
    typeof event.ticketPrice === 'string' ? parseFloat(event.ticketPrice) || undefined :
    undefined
  )

  // Media State
  const [coverImage, setCoverImage] = useState<string>(event.coverImage || "")
  const [bannerImage, setBannerImage] = useState<string>(event.bannerImage || "")
  const [logoImage, setLogoImage] = useState<string>(event.logoImage || "")

  // Custom Questions State
  const [customQuestions, setCustomQuestions] = useState<EventQuestion[]>([])
  const [questionsLoaded, setQuestionsLoaded] = useState(false)

  // Load existing questions
  useEffect(() => {
    if (!questionsLoaded) {
      fetch(`/api/events/${event.id}/questions`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.questions)) {
            const formattedQuestions = data.questions.map((q: any, index: number) => ({
              id: q.id,
              question: q.question,
              questionType: q.questionType,
              options: q.options ? JSON.parse(q.options) : undefined,
              isRequired: q.isRequired,
              order: q.order || index,
            }))
            setCustomQuestions(formattedQuestions)
          }
          setQuestionsLoaded(true)
        })
        .catch(error => {
          console.error('Failed to load questions:', error)
          setQuestionsLoaded(true)
        })
    }
  }, [event.id, questionsLoaded])

  // Track changes
  useEffect(() => {
    setHasChanges(true)
  }, [title, description, startDate, endDate, startTime, endTime, eventType, location, virtualUrl, capacity, requiresApproval, visibility, ticketType, ticketPrice, coverImage, bannerImage, logoImage, customQuestions])

  const handleSave = async () => {
    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error("Please fill in all required fields")
      return
    }

    const formData = new FormData()
    
    // Basic info
    formData.set('title', title)
    formData.set('description', description)
    
    // Combine date and time
    const startDateTime = new Date(startDate)
    const [startHour, startMinute] = startTime.split(':').map(Number)
    startDateTime.setHours(startHour, startMinute, 0, 0)
    
    const endDateTime = new Date(endDate)
    const [endHour, endMinute] = endTime.split(':').map(Number)
    endDateTime.setHours(endHour, endMinute, 0, 0)
    
    formData.set('startDate', startDateTime.toISOString())
    formData.set('endDate', endDateTime.toISOString())
    formData.set('timezone', 'Asia/Kolkata')
    
    // Location & format
    formData.set('eventType', eventType)
    formData.set('location', location)
    formData.set('virtualUrl', virtualUrl)
    
    // Settings
    if (capacity) formData.set('capacity', capacity.toString())
    formData.set('requiresApproval', requiresApproval.toString())
    formData.set('visibility', visibility)
    formData.set('ticketType', ticketType)
    if (ticketPrice) formData.set('ticketPrice', ticketPrice.toString())
    formData.set('currency', 'USD')
    
    // Media
    formData.set('coverImage', coverImage)
    formData.set('bannerImage', bannerImage)
    formData.set('logoImage', logoImage)
    
    // Questions
    formData.set('customQuestions', JSON.stringify(customQuestions))

    startTransition(async () => {
      try {
        const result = await updateEventAction(event.id, formData)
        if (result.success) {
          toast.success("Event updated successfully!")
          setHasChanges(false)
          // Redirect to view mode
          window.location.href = `/events/${event.slug}`
        } else {
          toast.error(result.error || "Failed to update event")
        }
      } catch (error) {
        toast.error("Failed to update event")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
            <p className="text-muted-foreground mt-1">Update your event details and settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${event.slug}`} className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Link>
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Status and Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <p className="font-medium capitalize">{visibility}</p>
                </div>
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{eventType?.replace('_', ' ')}</p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">{capacity || 'Unlimited'}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Questions
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Event Name *</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter event name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your event..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DateTimePicker
                    startDate={startDate}
                    endDate={endDate}
                    startTime={startTime}
                    endTime={endTime}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onStartTimeChange={setStartTime}
                    onEndTimeChange={setEndTime}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Event Format & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Event Type *</label>
                    <Select value={eventType} onValueChange={(value: any) => setEventType(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(eventType === 'in_person' || eventType === 'hybrid') && (
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter venue address"
                      className="mt-1"
                    />
                  </div>
                )}

                {(eventType === 'virtual' || eventType === 'hybrid') && (
                  <div>
                    <label className="text-sm font-medium">Virtual URL</label>
                    <Input
                      value={virtualUrl}
                      onChange={(e) => setVirtualUrl(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Capacity & Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Capacity</label>
                    <Input
                      type="number"
                      value={capacity || ''}
                      onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Leave blank for unlimited"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Registration Approval</label>
                    <Select value={requiresApproval ? "true" : "false"} onValueChange={(value) => setRequiresApproval(value === "true")}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">Automatic Approval</SelectItem>
                        <SelectItem value="true">Manual Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Visibility</label>
                    <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Ticketing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Ticket Type</label>
                    <Select value={ticketType} onValueChange={(value: any) => setTicketType(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qr_code">QR Code Ticket</SelectItem>
                        <SelectItem value="nft">NFT Ticket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Ticket Price</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={ticketPrice || ''}
                        onChange={(e) => setTicketPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Event Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <ImageUpload
                    value={coverImage}
                    onChange={setCoverImage}
                    onRemove={() => setCoverImage("")}
                    disabled={isPending}
                    label="Cover Image *"
                    description="Main event image (1200×800px recommended)"
                    maxSize={5}
                  />
                </div>

                <div>
                  <ImageUpload
                    value={bannerImage}
                    onChange={setBannerImage}
                    onRemove={() => setBannerImage("")}
                    disabled={isPending}
                    label="Banner Image (Optional)"
                    description="Wide banner for event page header"
                    maxSize={5}
                  />
                </div>

                <div>
                  <ImageUpload
                    value={logoImage}
                    onChange={setLogoImage}
                    onRemove={() => setLogoImage("")}
                    disabled={isPending}
                    label="Event Logo (Optional)"
                    description="Organization or event logo"
                    maxSize={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
                       <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-2">
                   <HelpCircle className="h-5 w-5" />
                   Registration Questions
                 </CardTitle>
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => {
                     const newQuestion: EventQuestion = {
                       question: "",
                       questionType: "text",
                       isRequired: false,
                       order: customQuestions.length,
                     }
                     setCustomQuestions([...customQuestions, newQuestion])
                   }}
                   className="flex items-center gap-2"
                 >
                   <Plus className="h-4 w-4" />
                   Add Question
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               {questionsLoaded ? (
                 <EventQuestionsManager
                   questions={customQuestions}
                   onChange={setCustomQuestions}
                   showHeader={false}
                   hideAddButton={true}
                 />
               ) : (
                 <div className="flex items-center justify-center py-8">
                   <div className="text-muted-foreground">Loading questions...</div>
                 </div>
               )}
             </CardContent>
           </Card>
          </TabsContent>
        </Tabs>

        {/* Floating Save Button */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              onClick={handleSave}
              disabled={isPending}
              size="lg"
              className="shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 
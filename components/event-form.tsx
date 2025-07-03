"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Edit3, Users, Ticket, UserCheck, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { createEventAction } from "@/app/create/actions"

interface EventFormProps {
  initialData?: {
    title?: string
    description?: string
    visibility?: 'public' | 'private' | 'unlisted'
  }
}

export function EventForm({ initialData }: EventFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startTime, setStartTime] = useState("14:00")
  const [endTime, setEndTime] = useState("15:00")
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [eventType, setEventType] = useState<'in_person' | 'virtual' | 'hybrid'>('in_person')
  const [location, setLocation] = useState("")
  const [virtualUrl, setVirtualUrl] = useState("")
  const [capacity, setCapacity] = useState<number | undefined>(undefined)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>(initialData?.visibility || 'public')
  const [ticketType, setTicketType] = useState<'free' | 'paid' | 'donation' | 'rsvp'>('free')
  const [ticketPrice, setTicketPrice] = useState<number | undefined>(undefined)

  const [showLocationInput, setShowLocationInput] = useState(false)
  const [showDescriptionInput, setShowDescriptionInput] = useState(false)
  const [showCapacityInput, setShowCapacityInput] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    
    // Combine date and time
    if (!startDate || !endDate) {
      setError("Please select start and end dates")
      return
    }

    try {
      const startDateTime = new Date(startDate)
      const [startHour, startMinute] = startTime.split(':').map(Number)
      startDateTime.setHours(startHour, startMinute, 0, 0)
  
      const endDateTime = new Date(endDate)
      const [endHour, endMinute] = endTime.split(':').map(Number)
      endDateTime.setHours(endHour, endMinute, 0, 0)
  
      // Check if end date is after start date
      if (endDateTime <= startDateTime) {
        setError("End time must be after start time")
        return
      }
  
      // Add combined datetime to form data (these can't be hidden inputs as they're computed)
      formData.set('startDate', startDateTime.toISOString())
      formData.set('endDate', endDateTime.toISOString())
    } catch (err) {
      setError("Invalid date or time format")
      return
    }

    startTransition(async () => {
      try {
        const result = await createEventAction(formData)
        
        if (result.success) {
          // Use client-side navigation to the new event page
          window.location.href = `/event/${result.slug}`
        } else {
          setError(result.error || 'Failed to create event')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create event')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Event Name */}
      <div>
        <Textarea 
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Name"
          className="font-bold bg-transparent border-0 px-0 py-8 placeholder:text-muted-foreground/60 focus-visible:ring-0 leading-none resize-none min-h-0"
          style={{ fontSize: '4.5rem' }}
          rows={2}
          required
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date & Time</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 sm:w-auto w-full">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="sm:w-32 w-full"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date & Time</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 sm:w-auto w-full">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="sm:w-32 w-full"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timezone & Event Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Timezone</label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Event Type</label>
          <Select value={eventType} onValueChange={(value: 'in_person' | 'virtual' | 'hybrid') => setEventType(value)}>
            <SelectTrigger>
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

      {/* Location */}
      <div className="space-y-3">
        {!showLocationInput ? (
          <div 
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setShowLocationInput(true)}
          >
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-foreground">Add Event Location</div>
              <div className="text-sm text-muted-foreground">
                {eventType === 'virtual' ? 'Virtual meeting link' : 'Offline location or virtual link'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {eventType === 'virtual' ? 'Meeting Link' : 'Location'}
            </label>
            {eventType === 'virtual' ? (
              <Input
                name="virtualUrl"
                type="url"
                value={virtualUrl}
                onChange={(e) => setVirtualUrl(e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
            ) : (
              <Input
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter venue address"
              />
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3">
        {!showDescriptionInput ? (
          <div 
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setShowDescriptionInput(true)}
          >
            <Edit3 className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Add Description</span>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what your event is about..."
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Event Options */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Event Options</h3>
        
        {/* Tickets */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <Ticket className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Tickets</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={ticketType} onValueChange={(value: 'free' | 'paid' | 'donation' | 'rsvp') => setTicketType(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
                <SelectItem value="rsvp">RSVP</SelectItem>
              </SelectContent>
            </Select>
            {ticketType === 'paid' && (
              <Input
                type="number"
                placeholder="Price"
                value={ticketPrice || ''}
                onChange={(e) => setTicketPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-20"
              />
            )}
          </div>
        </div>

        {/* Require Approval */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Require Approval</span>
          </div>
          <button
            type="button"
            onClick={() => setRequiresApproval(!requiresApproval)}
            className={cn(
              "w-11 h-6 rounded-full relative transition-colors",
              requiresApproval ? "bg-blue-600" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
              requiresApproval ? "right-0.5" : "left-0.5"
            )} />
          </button>
        </div>

        {/* Capacity */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Capacity</span>
          </div>
          <div className="flex items-center gap-2">
            {!showCapacityInput ? (
              <button
                type="button"
                onClick={() => setShowCapacityInput(true)}
                className="text-sm font-medium text-foreground"
              >
                Unlimited
              </button>
            ) : (
              <Input
                type="number"
                placeholder="100"
                value={capacity || ''}
                onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-20"
              />
            )}
          </div>
        </div>
      </div>

      {/* Hidden inputs for state-controlled fields */}
      <input type="hidden" name="visibility" value={visibility} />
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="eventType" value={eventType} />
      <input type="hidden" name="requiresApproval" value={requiresApproval.toString()} />
      <input type="hidden" name="ticketType" value={ticketType} />
      {description && <input type="hidden" name="description" value={description} />}
      {eventType === 'virtual' && virtualUrl && <input type="hidden" name="virtualUrl" value={virtualUrl} />}
      {eventType !== 'virtual' && location && <input type="hidden" name="location" value={location} />}
      {capacity && <input type="hidden" name="capacity" value={capacity.toString()} />}
      {ticketPrice && <input type="hidden" name="ticketPrice" value={ticketPrice.toString()} />}

      {/* Create Button */}
      <Button 
        type="submit"
        disabled={isPending || !title || !startDate || !endDate}
        className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium py-3 h-auto rounded-xl text-base"
      >
        {isPending ? "Creating Event..." : "Create Event"}
      </Button>
    </form>
  )
} 
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
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#e36c89]" />
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
              <Clock className="h-4 w-4 text-[#9b6fb5]" />
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
                  <CalendarIcon className="mr-2 h-4 w-4 text-[#e36c89]" />
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
              <Clock className="h-4 w-4 text-[#9b6fb5]" />
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
            <SelectTrigger className="border-border focus:ring-[#9b6fb5]/20">
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
            <SelectTrigger className="border-border focus:ring-[#9b6fb5]/20">
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
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-[#9b6fb5]/5 transition-colors cursor-pointer"
            onClick={() => setShowLocationInput(true)}
          >
            <MapPin className="w-5 h-5 text-[#e36c89]" />
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
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-[#9b6fb5]/5 transition-colors cursor-pointer"
            onClick={() => setShowDescriptionInput(true)}
          >
            <Edit3 className="w-5 h-5 text-[#f47e5c]" />
            <div>
              <div className="font-medium text-foreground">Add Event Description</div>
              <div className="text-sm text-muted-foreground">Tell attendees what your event is about</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Description</label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event..."
              className="min-h-[150px]"
            />
          </div>
        )}
      </div>

      {/* Capacity */}
      <div className="space-y-3">
        {!showCapacityInput ? (
          <div 
            className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-[#9b6fb5]/5 transition-colors cursor-pointer"
            onClick={() => setShowCapacityInput(true)}
          >
            <Users className="w-5 h-5 text-[#9b6fb5]" />
            <div>
              <div className="font-medium text-foreground">Set Capacity</div>
              <div className="text-sm text-muted-foreground">Limit the number of attendees</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Attendees</label>
            <Input
              type="number"
              name="capacity"
              value={capacity || ''}
              onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Leave blank for unlimited"
              className="max-w-xs"
            />
          </div>
        )}
      </div>

      {/* Visibility & Approval */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Visibility</label>
          <Select value={visibility} onValueChange={(value: 'public' | 'private' | 'unlisted') => setVisibility(value)}>
            <SelectTrigger className="border-border focus:ring-[#9b6fb5]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public (Anyone can see)</SelectItem>
              <SelectItem value="private">Private (Only invitees can see)</SelectItem>
              <SelectItem value="unlisted">Unlisted (Only accessible via link)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ticket Type</label>
          <Select value={ticketType} onValueChange={(value: 'free' | 'paid' | 'donation' | 'rsvp') => setTicketType(value)}>
            <SelectTrigger className="border-border focus:ring-[#9b6fb5]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="donation">Donation-based</SelectItem>
              <SelectItem value="rsvp">RSVP Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ticket Price (if paid) */}
      {ticketType === 'paid' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Ticket Price (USD)</label>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">$</span>
            <Input
              type="number"
              name="ticketPrice"
              value={ticketPrice || ''}
              onChange={(e) => setTicketPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
              className="max-w-xs"
              required
            />
          </div>
        </div>
      )}

      {/* Hidden fields */}
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="eventType" value={eventType} />
      <input type="hidden" name="visibility" value={visibility} />
      <input type="hidden" name="ticketType" value={ticketType} />
      <input type="hidden" name="requiresApproval" value={requiresApproval.toString()} />

      {/* Submit Button */}
      <div className="pt-6">
        <Button 
          type="submit" 
          disabled={isPending} 
          className="w-full sm:w-auto bg-[#e36c89] hover:bg-[#d15e7b] text-white"
          size="lg"
        >
          {isPending ? 'Creating Event...' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
} 
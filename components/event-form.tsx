"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, MapPin, Edit3, Users, Ticket, UserCheck, Clock, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { createEventAction } from "@/app/create/actions"
import { updateEventAction } from "@/app/event/actions"
import { DateTimePicker } from "@/components/date-time-picker"
import { ImageUpload } from "@/components/image-upload"

interface EventData {
  id?: string;
  title?: string;
  description?: string | null;
  startDate?: Date | string;
  endDate?: Date | string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  eventType?: 'in_person' | 'virtual' | 'hybrid';
  location?: string | null;
  virtualUrl?: string | null;
  capacity?: number | null;
  requiresApproval?: boolean | null;
  visibility?: 'public' | 'private' | 'unlisted' | null;
  ticketType?: 'free' | 'paid' | 'donation' | 'rsvp' | null;
  ticketPrice?: number | string | null;
  currency?: string | null;
  coverImage?: string | null;
  bannerImage?: string | null;
  logoImage?: string | null;
  // Additional fields that might come from the database
  summary?: string | null;
  allDay?: boolean | null;
  // ... other database fields
  [key: string]: any; // Allow additional properties from database
}

interface EventFormProps {
  initialData?: EventData;
}

export function EventForm({ initialData = {} }: EventFormProps) {
  const eventId = initialData.id;
  const isEditing = !!eventId;
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  
  // Field-specific error states
  const [errors, setErrors] = useState<{
    title?: string;
    dateTime?: string;
    location?: string;
    ticketPrice?: string;
  }>({})
  
  // Form state
  const [title, setTitle] = useState(initialData.title || "")
  const [description, setDescription] = useState(initialData.description || "")
  const [startDate, setStartDate] = useState<Date | undefined>(initialData.startDate ? new Date(initialData.startDate) : undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(initialData.endDate ? new Date(initialData.endDate) : undefined)
  const [startTime, setStartTime] = useState<string | undefined>(initialData.startTime || undefined)
  const [endTime, setEndTime] = useState<string | undefined>(initialData.endTime || undefined)
  const [timezone, setTimezone] = useState(initialData.timezone || "Asia/Kolkata")
  const [eventType, setEventType] = useState(initialData.eventType || 'in_person')
  const [location, setLocation] = useState(initialData.location || "")
  const [virtualUrl, setVirtualUrl] = useState(initialData.virtualUrl || "")
  const [capacity, setCapacity] = useState<number | undefined>(initialData.capacity || undefined)
  const [requiresApproval, setRequiresApproval] = useState(initialData.requiresApproval || false)
  const [visibility, setVisibility] = useState(initialData.visibility || 'public')
  const [ticketType, setTicketType] = useState(initialData.ticketType || 'free')
  const [ticketPrice, setTicketPrice] = useState<number | undefined>(
    typeof initialData.ticketPrice === 'number' ? initialData.ticketPrice :
    typeof initialData.ticketPrice === 'string' ? parseFloat(initialData.ticketPrice) || undefined :
    undefined
  )

  // Image states
  const [coverImage, setCoverImage] = useState<string>(initialData.coverImage || "")
  const [bannerImage, setBannerImage] = useState<string>(initialData.bannerImage || "")
  const [logoImage, setLogoImage] = useState<string>(initialData.logoImage || "")

  const [showLocationInput, setShowLocationInput] = useState(false)
  const [showDescriptionInput, setShowDescriptionInput] = useState(false)
  const [showCapacityInput, setShowCapacityInput] = useState(false)

  const validateForm = () => {
    const newErrors: {
      title?: string;
      dateTime?: string;
      location?: string;
      ticketPrice?: string;
    } = {};
    
    // Validate title
    if (!title.trim()) {
      newErrors.title = "Event name is required";
    }
    
    // Validate date and time
    if (!startDate || !endDate || !startTime || !endTime) {
      newErrors.dateTime = "Please select both start and end dates and times";
    } else {
      try {
        const startDateTime = new Date(startDate);
        const [startHour, startMinute] = startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute, 0, 0);
    
        const endDateTime = new Date(endDate);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute, 0, 0);
    
        // Check if end date is after start date
        if (endDateTime <= startDateTime) {
          newErrors.dateTime = "End time must be after start time";
        }
      } catch (err) {
        newErrors.dateTime = "Invalid date or time format";
      }
    }
    
    // Validate ticket price if paid
    if (ticketType === 'paid' && (ticketPrice === undefined || ticketPrice <= 0)) {
      newErrors.ticketPrice = "Please enter a valid price greater than 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (formData: FormData) => {
    setFormError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const startDateTime = new Date(startDate!);
      const [startHour, startMinute] = startTime!.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);
  
      const endDateTime = new Date(endDate!);
      const [endHour, endMinute] = endTime!.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);
  
      // Add combined datetime to form data (these can't be hidden inputs as they're computed)
      formData.set('startDate', startDateTime.toISOString());
      formData.set('endDate', endDateTime.toISOString());
    } catch (err) {
      setErrors(prev => ({...prev, dateTime: "Invalid date or time format"}));
      return;
    }

    startTransition(async () => {
      try {
        let result;
        if (isEditing) {
          result = await updateEventAction(eventId, formData);
        } else {
          result = await createEventAction(formData);
        }
        
        if (result.success) {
          // Use client-side navigation to the new event page
          let slug: string | null = null;
          
          if ('event' in result && result.event) {
            slug = result.event.slug || null;
          } else if ('slug' in result) {
            slug = result.slug || null;
          }
          
          if (slug) {
            window.location.href = `/event/${slug}`;
          }
        } else {
          setFormError(result.error || 'Failed to create event');
        }
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to create event');
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {formError}
        </div>
      )}

      {/* Event Name */}
      <div className="space-y-1">
        <Textarea 
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) {
              setErrors(prev => ({...prev, title: undefined}));
            }
          }}
          placeholder="Event Name"
          className="font-bold bg-transparent border-0 px-0 py-4 placeholder:text-muted-foreground/60 focus-visible:ring-0 leading-none resize-none min-h-0"
          style={{ fontSize: '4.5rem' }}
          rows={2}
          required
        />
        {errors.title && (
          <div className="text-red-500 text-sm mt-1">{errors.title}</div>
        )}
      </div>

      {/* Date & Time */}
      <div className="space-y-2 mt-0">
        <label className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 opacity-70" />
          Date & Time
        </label>
        <DateTimePicker
          startDate={startDate}
          endDate={endDate}
          startTime={startTime}
          endTime={endTime}
          timezone={timezone}
          onStartDateChange={(date) => {
            setStartDate(date);
            if (startDate && endDate && startTime && endTime) {
              setErrors(prev => ({...prev, dateTime: undefined}));
            }
          }}
          onEndDateChange={(date) => {
            setEndDate(date);
            if (startDate && endDate && startTime && endTime) {
              setErrors(prev => ({...prev, dateTime: undefined}));
            }
          }}
          onStartTimeChange={(time) => {
            setStartTime(time);
            if (startDate && endDate && startTime && endTime) {
              setErrors(prev => ({...prev, dateTime: undefined}));
            }
          }}
          onEndTimeChange={(time) => {
            setEndTime(time);
            if (startDate && endDate && startTime && endTime) {
              setErrors(prev => ({...prev, dateTime: undefined}));
            }
          }}
          onTimezoneChange={setTimezone}
        />
        {errors.dateTime && (
          <div className="text-red-500 text-sm mt-1">{errors.dateTime}</div>
        )}
      </div>

      {/* Event Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4 opacity-70" />
          Event Type
        </label>
        <Select value={eventType} onValueChange={(value: 'in_person' | 'virtual' | 'hybrid') => setEventType(value)}>
          <SelectTrigger className="px-3 py-5 text-left font-normal bg-background/50 border-border/50 hover:bg-accent/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_person">In Person</SelectItem>
            <SelectItem value="virtual">Virtual</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
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
            {errors.location && (
              <div className="text-red-500 text-sm mt-1">{errors.location}</div>
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

      {/* Event Images */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Event Images</h3>
        
        {/* Cover Image */}
        <div className="space-y-3">
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            onRemove={() => setCoverImage("")}
            disabled={isPending}
            label="Cover Image"
            description="Main event image that will be displayed on event cards and headers"
            maxSize={5}
          />
          <input type="hidden" name="coverImage" value={coverImage} />
        </div>

        {/* Banner Image */}
        <div className="space-y-3">
          <ImageUpload
            value={bannerImage}
            onChange={setBannerImage}
            onRemove={() => setBannerImage("")}
            disabled={isPending}
            label="Banner Image (Optional)"
            description="Wide banner image for event page header"
            maxSize={5}
          />
          <input type="hidden" name="bannerImage" value={bannerImage} />
        </div>

        {/* Logo Image */}
        <div className="space-y-3">
          <ImageUpload
            value={logoImage}
            onChange={setLogoImage}
            onRemove={() => setLogoImage("")}
            disabled={isPending}
            label="Event Logo (Optional)"
            description="Logo or icon representing your event or organization"
            maxSize={2}
          />
          <input type="hidden" name="logoImage" value={logoImage} />
        </div>
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
          <Select value={visibility || 'public'} onValueChange={(value: 'public' | 'private' | 'unlisted') => setVisibility(value)}>
            <SelectTrigger className="border-border focus:ring-[#9b6fb5]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Ticket Type</label>
          <Select value={ticketType || 'free'} onValueChange={(value: 'free' | 'paid' | 'donation' | 'rsvp') => {
            setTicketType(value);
            if (value !== 'paid') {
              setTicketPrice(undefined);
              setErrors(prev => ({...prev, ticketPrice: undefined}));
            }
          }}>
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
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                setTicketPrice(value);
                if (value && value > 0) {
                  setErrors(prev => ({...prev, ticketPrice: undefined}));
                }
              }}
              placeholder="0.00"
              className="max-w-xs"
              required
            />
          </div>
          {errors.ticketPrice && (
            <div className="text-red-500 text-sm mt-1">{errors.ticketPrice}</div>
          )}
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
          {isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
        </Button>
      </div>
    </form>
  )
} 
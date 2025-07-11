"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, MapPin, Users, Ticket, Globe, Plus } from "lucide-react"
import { createEventAction } from "@/app/create/actions"
import { DateTimePicker } from "@/components/date-time-picker"
import { ImageUpload } from "@/components/image-upload"

export function CreateEventForm() {
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
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState<string | undefined>(undefined)
  const [endTime, setEndTime] = useState<string | undefined>(undefined)
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [eventType, setEventType] = useState<'in_person' | 'virtual' | 'hybrid'>('in_person')
  const [location, setLocation] = useState("")
  const [virtualUrl, setVirtualUrl] = useState("")
  const [capacity, setCapacity] = useState<number | undefined>(undefined)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public')
  const [ticketType, setTicketType] = useState<'free' | 'paid' | 'donation' | 'rsvp'>('free')
  const [ticketPrice, setTicketPrice] = useState<number | undefined>(undefined)

  // Image states
  const [coverImage, setCoverImage] = useState<string>("")
  const [bannerImage, setBannerImage] = useState<string>("")
  const [logoImage, setLogoImage] = useState<string>("")

  // UI state
  const [showOptionalFields, setShowOptionalFields] = useState(false)

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
  
      // Add combined datetime to form data
      formData.set('startDate', startDateTime.toISOString());
      formData.set('endDate', endDateTime.toISOString());
    } catch (err) {
      setErrors(prev => ({...prev, dateTime: "Invalid date or time format"}));
      return;
    }

    startTransition(async () => {
      try {
        const result = await createEventAction(formData);
        
        if (result.success) {
          // Use client-side navigation to the new event page
          const slug = result.slug;
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
    <form action={handleSubmit} className="space-y-8">
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Image Uploads */}
        <div className="lg:col-span-5 space-y-6">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Event Images</h2>
            
            {/* Cover Image - Main */}
            <div className="space-y-3">
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                onRemove={() => setCoverImage("")}
                disabled={isPending}
                label="Cover Image"
                description="Main event image displayed on cards and headers"
                maxSize={5}
              />
              <input type="hidden" name="coverImage" value={coverImage} />
            </div>

            {/* Optional Images */}
            {showOptionalFields && (
              <>
                <div className="space-y-3">
                  <ImageUpload
                    value={bannerImage}
                    onChange={setBannerImage}
                    onRemove={() => setBannerImage("")}
                    disabled={isPending}
                    label="Banner Image (Optional)"
                    description="Wide banner for event page header"
                    maxSize={5}
                  />
                  <input type="hidden" name="bannerImage" value={bannerImage} />
                </div>

                <div className="space-y-3">
                  <ImageUpload
                    value={logoImage}
                    onChange={setLogoImage}
                    onRemove={() => setLogoImage("")}
                    disabled={isPending}
                    label="Event Logo (Optional)"
                    description="Organization or event logo"
                    maxSize={2}
                  />
                  <input type="hidden" name="logoImage" value={logoImage} />
                </div>
              </>
            )}

            {!showOptionalFields && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptionalFields(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More Images
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-foreground">Tips for great event images:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use high-quality images (at least 1200x800px)</li>
              <li>• Include event details or branding</li>
              <li>• Avoid cluttered backgrounds</li>
              <li>• Consider your brand colors</li>
            </ul>
          </div>
          </div>
        </div>

        {/* Right Column - Event Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Event Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Event Name *</label>
            <Input
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) {
                  setErrors(prev => ({...prev, title: undefined}));
                }
              }}
              placeholder="Enter your event name"
              className="text-lg font-semibold"
              required
            />
            {errors.title && (
              <div className="text-red-500 text-sm">{errors.title}</div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what your event is about..."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 opacity-70" />
              Date & Time *
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
              <div className="text-red-500 text-sm">{errors.dateTime}</div>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 opacity-70" />
              Event Type *
            </label>
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

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-70" />
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

          {/* Capacity */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 opacity-70" />
              Capacity
            </label>
            <Input
              type="number"
              name="capacity"
              value={capacity || ''}
              onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Leave blank for unlimited"
              className="max-w-xs [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Visibility</label>
              <Select value={visibility} onValueChange={(value: 'public' | 'private' | 'unlisted') => setVisibility(value)}>
                <SelectTrigger>
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
              <label className="text-sm font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4 opacity-70" />
                Ticket Type
              </label>
              <Select value={ticketType} onValueChange={(value: 'free' | 'paid' | 'donation' | 'rsvp') => setTicketType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="rsvp">RSVP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ticket Price */}
          {ticketType === 'paid' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Ticket Price *</label>
              <div className="flex gap-2 max-w-xs">
                <Select defaultValue="USD">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  name="ticketPrice"
                  value={ticketPrice || ''}
                  onChange={(e) => {
                    setTicketPrice(e.target.value ? parseFloat(e.target.value) : undefined);
                    if (e.target.value && parseFloat(e.target.value) > 0) {
                      setErrors(prev => ({...prev, ticketPrice: undefined}));
                    }
                  }}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.ticketPrice && (
                <div className="text-red-500 text-sm">{errors.ticketPrice}</div>
              )}
            </div>
          )}

          {/* Hidden Fields */}
          <input type="hidden" name="timezone" value={timezone} />
          <input type="hidden" name="eventType" value={eventType} />
          <input type="hidden" name="requiresApproval" value={requiresApproval.toString()} />
          <input type="hidden" name="visibility" value={visibility} />
          <input type="hidden" name="ticketType" value={ticketType} />
          <input type="hidden" name="currency" value="USD" />

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#e36c89] hover:bg-[#d15e7b] text-white font-medium py-3 text-base"
            >
              {isPending ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

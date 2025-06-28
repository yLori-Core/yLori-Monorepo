"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, Globe } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { TimePicker } from "@/components/time-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateTimePickerProps {
  startDate?: Date
  endDate?: Date
  startTime?: string
  endTime?: string
  timezone?: string
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
  onStartTimeChange?: (time: string) => void
  onEndTimeChange?: (time: string) => void
  onTimezoneChange?: (timezone: string) => void
}

// Common timezones
const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
]

export function DateTimePicker({
  startDate = new Date(),
  endDate = new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
  startTime = "14:00",
  endTime = "15:00",
  timezone = "Asia/Kolkata",
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onTimezoneChange,
}: DateTimePickerProps) {
  const [startCalendarOpen, setStartCalendarOpen] = React.useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = React.useState(false)

  return (
    <div className="space-y-4">
      {/* Start Date & Time */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Start</span>
        </div>
        
        <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="justify-start text-sm font-medium text-foreground hover:bg-accent/60"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "EEE, dd MMM") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                onStartDateChange?.(date)
                setStartCalendarOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <TimePicker
          value={startTime}
          onChange={onStartTimeChange}
        />
      </div>
      
      {/* End Date & Time */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>End</span>
        </div>
        
        <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="justify-start text-sm font-medium text-foreground hover:bg-accent/60"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "EEE, dd MMM") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                onEndDateChange?.(date)
                setEndCalendarOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <TimePicker
          value={endTime}
          onChange={onEndTimeChange}
        />
      </div>

      {/* Timezone Selector */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-3 py-2 rounded-md">
        <Globe className="w-4 h-4" />
        <Select value={timezone} onValueChange={onTimezoneChange}>
          <SelectTrigger className="border-0 bg-transparent p-0 h-auto text-xs text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value} className="text-xs">
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 
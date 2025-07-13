"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, Globe, ChevronDown } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  startDate?: Date | undefined
  endDate?: Date | undefined
  startTime?: string | undefined
  endTime?: string | undefined
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
  startDate = undefined,
  endDate = undefined,
  startTime = undefined,
  endTime = undefined,
  timezone = "Asia/Kolkata",
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onTimezoneChange,
}: DateTimePickerProps) {
  const [startCalendarOpen, setStartCalendarOpen] = React.useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = React.useState(false)
  const [timezoneOpen, setTimezoneOpen] = React.useState(false)

  return (
    <div className="space-y-8 p-4 rounded-lg bg-muted/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          <span className="font-medium text-sm">Start Date & Time</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "col-span-3 h-14 justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
                  !startDate && "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  setStartCalendarOpen(true);
                }}
              >
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
                  <span>{startDate ? format(startDate, "EEE, dd MMM") : "Pick a date"}</span>
                </div>
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
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>

          <TimePicker
            value={startTime}
            onChange={onStartTimeChange}
            className="col-span-2 h-14 hover:bg-accent hover:text-accent-foreground"
            placeholder="Pick a time"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <span className="font-medium text-sm">End Date & Time</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "col-span-3 h-14 justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
                  !endDate && "text-muted-foreground"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  setEndCalendarOpen(true);
                }}
              >
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
                  <span>{endDate ? format(endDate, "EEE, dd MMM") : "Pick a date"}</span>
                </div>
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
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>

          <TimePicker
            value={endTime}
            onChange={onEndTimeChange}
            className="col-span-2 h-14 hover:bg-accent hover:text-accent-foreground"
            placeholder="Pick a time"
          />
        </div>
      </div>

      {/* Timezone Selector */}
      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full h-14 justify-between text-left font-normal hover:bg-accent hover:text-accent-foreground"
          onClick={() => setTimezoneOpen(!timezoneOpen)}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 opacity-70" />
            <span className="text-sm">Timezone:</span>
            <span className="text-sm font-medium">
              {timezones.find(tz => tz.value === timezone)?.label || timezone}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        
        {timezoneOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover border shadow-lg">
            {timezones.map((tz) => (
              <div
                key={tz.value}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                  timezone === tz.value && "bg-accent text-accent-foreground font-medium"
                )}
                onClick={() => {
                  onTimezoneChange?.(tz.value)
                  setTimezoneOpen(false)
                }}
              >
                {tz.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
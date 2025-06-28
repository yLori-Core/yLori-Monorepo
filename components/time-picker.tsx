"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  className?: string
}

// Generate time options (12-hour format with AM/PM)
const generateTimeOptions = () => {
  const times: { value: string; label: string }[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
      const hour24 = hour
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      const minuteStr = minute.toString().padStart(2, '0')
      const hour24Str = hour.toString().padStart(2, '0')
      
      const value = `${hour24Str}:${minuteStr}` // 24-hour format for value
      const label = `${hour12}:${minuteStr} ${ampm}` // 12-hour format for display
      
      times.push({ value, label })
    }
  }
  
  return times
}

const timeOptions = generateTimeOptions()

// Convert 24-hour format to 12-hour format for display
const formatTimeForDisplay = (time24: string) => {
  const [hour, minute] = time24.split(':').map(Number)
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const ampm = hour < 12 ? 'AM' : 'PM'
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
}

export function TimePicker({ value = "14:00", onChange, className }: TimePickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`justify-start text-sm font-medium ${className}`}>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <SelectValue>
            {value ? formatTimeForDisplay(value) : "Select time"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {timeOptions.map((time) => (
          <SelectItem key={time.value} value={time.value} className="text-sm">
            {time.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 
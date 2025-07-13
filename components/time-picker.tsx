"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string | undefined
  onChange?: (time: string) => void
  className?: string
  placeholder?: string
}

// Generate time options (12-hour format with AM/PM)
const generateTimeOptions = () => {
  const times: { value: string; label: string }[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals for cleaner UI
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

export function TimePicker({ 
  value = undefined, 
  onChange, 
  className,
  placeholder = "Select time"
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <Select 
      value={value} 
      onValueChange={(val) => {
        onChange?.(val);
        setOpen(false);
      }} 
      open={open} 
      onOpenChange={setOpen}
    >
      <SelectTrigger 
        className={cn(
          "h-full text-left font-normal",
          !value && "text-muted-foreground",
          className
        )}
      >
        <div className="flex items-center flex-1">
          <Clock className="mr-2 h-5 w-5 opacity-70" />
          <span>{value ? formatTimeForDisplay(value) : placeholder}</span>
        </div>
      </SelectTrigger>
      <SelectContent 
        className="max-h-[300px] w-[160px]"
        position="popper"
        sideOffset={4}
      >
        {timeOptions.map((time) => (
          <SelectItem 
            key={time.value} 
            value={time.value} 
            className="text-sm cursor-pointer"
          >
            {time.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 
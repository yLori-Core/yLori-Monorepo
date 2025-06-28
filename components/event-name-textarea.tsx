"use client"

import { Textarea } from "@/components/ui/textarea"

interface EventNameTextareaProps {
  placeholder?: string
  className?: string
}

export function EventNameTextarea({ placeholder = "Event Name", className }: EventNameTextareaProps) {
  return (
    <Textarea 
      placeholder={placeholder}
      className={`font-bold bg-transparent border-0 px-0 py-8 placeholder:text-muted-foreground/60 focus-visible:ring-0 leading-none resize-none min-h-0 ${className}`}
      style={{ fontSize: '4.5rem' }}
      rows={2}
      onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
        // Scroll to the beginning when unfocused
        e.target.scrollTop = 0
        e.target.scrollLeft = 0
      }}
    />
  )
}
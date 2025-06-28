"use client"

import { useState } from "react"
import { DateTimePicker } from "@/components/date-time-picker"

export function ClientDateTimePicker() {
  // Event form state
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 60 * 60 * 1000))
  const [startTime, setStartTime] = useState("14:00")
  const [endTime, setEndTime] = useState("15:00")
  const [timezone, setTimezone] = useState("Asia/Kolkata")

  return (
    <DateTimePicker
      startDate={startDate}
      endDate={endDate}
      startTime={startTime}
      endTime={endTime}
      timezone={timezone}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onStartTimeChange={setStartTime}
      onEndTimeChange={setEndTime}
      onTimezoneChange={setTimezone}
    />
  )
} 
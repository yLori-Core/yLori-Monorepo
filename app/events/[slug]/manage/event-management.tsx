"use client"

import { useState } from "react"
import { QRScanner } from "@/components/qr-scanner"
import { Button } from "@/components/ui/button"
import { checkInAttendee } from "./actions"
import { toast } from "sonner"
import { QrCode } from "lucide-react"
import { useAttendees } from "@/components/providers/attendee-provider"
import { type EventAttendee } from "@/lib/db/schema"

interface EventManagementProps {
  event: {
    id: string
    title: string
  }
}

interface CheckInResponse {
  success: boolean
  message?: string
  error?: string
  type?: 'success' | 'info' | 'error'
  attendee?: {
    name: string
    email: string
  }
}

export function EventManagement({ event }: EventManagementProps) {
  const [isScanning, setIsScanning] = useState(false)
  const { updateAttendee } = useAttendees()

  const handleScan = async (encryptedData: string) => {
    try {
      console.log('Raw QR data:', encryptedData)
      const result = await checkInAttendee(event.id, encryptedData) as CheckInResponse
      console.log('Check-in result:', result)
      
      // Handle different response types
      if (result.success) {
        if (result.type === 'info') {
          // Already checked in case
          toast.info(result.message || 'Attendee already checked in')
        } else {
          // Successful first-time check-in
          toast.success(result.message || 'Check-in successful!')
          
          // Update attendee in the list only for new check-ins
          if (result.attendee) {
            // For successful check-ins, we need to find and update the attendee
            // Since the response doesn't include ID, we'll trigger a refresh
            // The attendee provider should handle this automatically
          }
        }
      } else {
        // Error cases
        toast.error(result.error || 'Failed to check in attendee')
        
        // Close scanner for critical errors
        if (result.error?.includes('Failed to decrypt') || result.error?.includes('Invalid QR code')) {
          setIsScanning(false)
        }
      }
      
      // Don't close the scanner - let the user close it manually
    } catch (error: any) {
      console.error('Unexpected QR scan error:', error)
      toast.error('An unexpected error occurred')
      
      // Close scanner for unexpected errors
      setIsScanning(false)
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsScanning(true)}
        className="flex items-center gap-2"
      >
        <QrCode className="w-4 h-4" />
        Check-in
      </Button>

      <QRScanner 
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={handleScan}
      />
    </>
  )
} 
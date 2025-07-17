"use client"

import { useState, useEffect } from "react"
import { QRScanner } from "@/components/qr-scanner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { checkInAttendee } from "./actions"
import { toast } from "sonner"
import { Users, QrCode } from "lucide-react"
import { AttendeeManagement } from "@/components/attendee-management"

interface ManagementClientProps {
  eventId: string
}

export function ManagementClient({ eventId }: ManagementClientProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState("attendees")

  // Effect to open scanner when check-in tab is selected
  useEffect(() => {
    if (activeTab === "check-in") {
      setIsScanning(true)
    }
  }, [activeTab])

  // Effect to switch back to attendees tab when scanner is closed
  useEffect(() => {
    if (!isScanning && activeTab === "check-in") {
      setActiveTab("attendees")
    }
  }, [isScanning, activeTab])

  const handleScan = async (encryptedData: string) => {
    try {
      if (!encryptedData) {
        toast.error('No QR code data received')
        return
      }
      
      console.log('Raw QR data:', encryptedData)
      const result = await checkInAttendee(eventId, encryptedData)
      console.log('Check-in result:', result)
      
      // Handle different response types
      if (result.success) {
        if (result.type === 'info') {
          // Already checked in case
          toast.info(result.message || 'Attendee already checked in')
        } else {
          // Successful first-time check-in
          toast.success(result.message || 'Check-in successful!')
        }
      } else {
        // Error cases
        toast.error(result.error || 'Failed to check in attendee')
        
        // Close scanner for critical errors
        if (result.error?.includes('Failed to decrypt') || result.error?.includes('Invalid QR code')) {
          setIsScanning(false)
        }
      }
    } catch (error: any) {
      console.error('Unexpected QR scan error:', error)
      toast.error('An unexpected error occurred')
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendees" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Attendees
          </TabsTrigger>
          <TabsTrigger value="check-in" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            Check-in
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "attendees" && (
        <AttendeeManagement eventId={eventId} requiresApproval={true} />
      )}

      <QRScanner 
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={handleScan}
      />
    </div>
  )
} 
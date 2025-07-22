"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"
import { QRScanner } from "./qr-scanner"
import { toast } from "sonner"

interface QRScannerButtonProps {
  eventId: string
}

export function QRScannerButton({ eventId }: QRScannerButtonProps) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleQRScan = async (qrData: string) => {
    try {
      setIsPending(true)
      
      // Parse the QR code data (it should contain encrypted ticket data)
      // The QR code contains encrypted data that we need to verify
      const response = await fetch('/api/events/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          qrData
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Successfully checked in ${result.attendeeName}`)
        // Refresh the page to update attendee counts
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to check in attendee')
      }
    } catch (error) {
      console.error('QR scan error:', error)
      toast.error('Failed to process QR code')
    } finally {
      setIsPending(false)
      setScannerOpen(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setScannerOpen(true)}
        disabled={isPending}
        className="flex items-center gap-2"
      >
        <QrCode className="w-4 h-4" />
        QR Check-in
      </Button>

      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQRScan}
      />
    </>
  )
} 
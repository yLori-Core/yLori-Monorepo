"use client"

import { Button } from "@/components/ui/button"
import { Share } from "lucide-react"
import { trackEventShareAction } from "@/app/events/[slug]/actions"
import { toast } from "sonner"

interface EventShareButtonProps {
  eventId: string
  eventTitle: string
  eventSlug: string
  className?: string
}

export function EventShareButton({ eventId, eventTitle, eventSlug, className }: EventShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/events/${eventSlug}`
    
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: eventTitle,
          text: `Check out this event: ${eventTitle}`,
          url: shareUrl,
        })
        // Track the share
        await trackEventShareAction(eventId)
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Event link copied to clipboard!")
        // Track the share
        await trackEventShareAction(eventId)
      }
    } catch (error) {
      // Only show error if it's not because user cancelled share dialog
      if (error instanceof Error && !error.message.includes('cancelled')) {
        toast.error("Failed to share event")
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
    >
      <Share className="w-4 h-4 mr-2" />
      Share
    </Button>
  )
} 
"use client"

import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { QrCode, Download, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { generateTicketData } from '@/app/events/[slug]/actions';

interface TicketQRProps {
  email: string;
  eventId: string;
  eventName?: string;
  eventDate?: string;
}

export function TicketQR({ email, eventId, eventName, eventDate }: TicketQRProps) {
  const [showQR, setShowQR] = useState(false);
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  
  // Check if Web Share API is available
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);
  
  // Generate encrypted data on mount
  useEffect(() => {
    async function generateTicket() {
      const result = await generateTicketData(email, eventId);
      if (result.success && result.data) {
        setEncryptedData(result.data);
      } else {
        setError(result.error || 'Failed to generate ticket');
        console.error('Failed to generate ticket:', result.error);
      }
    }
    generateTicket();
  }, [email, eventId]);

  // Function to download QR code as PNG
  const downloadQR = () => {
    const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `ticket-${eventId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Function to share ticket (if Web Share API is available)
  const shareTicket = async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: `Ticket for ${eventName || 'Event'}`,
        text: `My ticket for ${eventName || 'the event'}${eventDate ? ` on ${eventDate}` : ''}`,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };
  
  if (error) {
    return (
      <Button 
        variant="outline" 
        className="w-full" 
        disabled
      >
        <QrCode className="w-4 h-4 mr-2" />
        Unable to generate ticket
      </Button>
    );
  }
  
  return (
    <>
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => setShowQR(true)}
        disabled={!encryptedData}
      >
        <QrCode className="w-4 h-4 mr-2" />
        {encryptedData ? 'Show QR Code' : 'Generating ticket...'}
      </Button>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Your Event Ticket</DialogTitle>
            {eventName && (
              <DialogDescription className="text-center text-base">
                {eventName}
                {eventDate && <span className="block text-sm">{eventDate}</span>}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-6 py-4">
            <Card className={cn(
              "p-8 flex flex-col items-center space-y-6",
              "bg-gradient-to-b from-card/50 to-card",
              "backdrop-blur-sm border-2"
            )}>
              <div className="text-sm font-medium text-center text-muted-foreground">
                Present this QR code at the event entrance
              </div>
              
              {encryptedData && (
                <div id="qr-code" className="bg-white p-6 rounded-xl shadow-inner">
                  <QRCodeSVG
                    value={encryptedData}
                    size={250}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/logo_initial.png",
                      x: undefined,
                      y: undefined,
                      height: 50,
                      width: 50,
                      excavate: true,
                    }}
                  />
                </div>
              )}

              <div className="text-sm text-center text-muted-foreground">
                Registered to: {email}
              </div>
            </Card>

            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={downloadQR}
                disabled={!encryptedData}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {canShare && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={shareTicket}
                  disabled={!encryptedData}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
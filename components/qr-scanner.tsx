"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => Promise<void>;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const initializingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (await scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        // Silently handle stop errors
        console.debug('Error stopping scanner:', error);
      }
    }
    initializingRef.current = false;
  }, []);

  const startScanner = useCallback(async () => {
    if (initializingRef.current || !isOpen) return;
    
    try {
      initializingRef.current = true;
      setError(null);

      // Clean up any existing scanner
      await stopScanner();

      // Create new scanner with minimal configuration
      const newScanner = new Html5Qrcode('qr-reader-container');
      scannerRef.current = newScanner;

      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error('No cameras found');
      }

      await newScanner.start(
        { facingMode: 'environment' },
        {
          fps: 5,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (!processing) {
            setProcessing(true);
            try {
              await onScan(decodedText);
              await stopScanner();
              onClose();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Failed to process QR code';
              toast.error(message);
            } finally {
              setProcessing(false);
            }
          }
        },
        () => {
          // Silently ignore QR detection errors
          return;
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize camera';
      setError(message);
      if (!message.includes('No cameras found')) {
        toast.error('Please ensure camera permissions are granted');
      }
      initializingRef.current = false;
    }
  }, [isOpen, onScan, onClose, processing, stopScanner]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !initializingRef.current) {
      timer = setTimeout(startScanner, 100);
    }
    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          stopScanner().then(() => onClose());
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Attendee QR Code</DialogTitle>
          {error && (
            <div className="text-sm text-red-500 mt-2">
              Error: {error}
            </div>
          )}
        </DialogHeader>
        <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
          <div 
            id="qr-reader-container"
            className="w-full h-full" 
          />
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex items-center space-x-2 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              stopScanner().then(() => onClose());
            }}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
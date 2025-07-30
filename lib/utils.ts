import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto'

// Use a 32-byte (256-bit) key for encryption (server-side only)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encryptForQR(text: string): string {
  // Ensure this only runs server-side
  if (typeof window !== 'undefined') {
    throw new Error('Encryption must only be performed server-side for security')
  }

  try {
    console.log('Encrypting QR data:', text)
    
    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is not set')
    }
    
    // Convert hex string to buffer
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    if (key.length !== 32) {
      throw new Error('Encryption key must be a 32-byte (64 character) hex string')
    }
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text to encrypt must be a non-empty string')
    }
    
    const cipher = crypto.createCipheriv('aes-256-ecb', key, Buffer.alloc(0))
    let encrypted = cipher.update(text, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    
    console.log('Successfully encrypted QR data')
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function decryptFromQR(encryptedText: string): string {
  // Ensure this only runs server-side
  if (typeof window !== 'undefined') {
    throw new Error('Decryption must only be performed server-side for security')
  }

  try {
    console.log('Attempting to decrypt QR data')
    
    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is not set')
    }
    
    if (!encryptedText || typeof encryptedText !== 'string') {
      throw new Error('Encrypted text must be a non-empty string')
    }
    
    // Convert hex string to buffer
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    if (key.length !== 32) {
      throw new Error('Encryption key must be a 32-byte (64 character) hex string')
    }
    
    const decipher = crypto.createDecipheriv('aes-256-ecb', key, Buffer.alloc(0))
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    
    console.log('Successfully decrypted QR data:', decrypted)
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error(`Failed to decrypt QR code: ${error instanceof Error ? error.message : 'Invalid QR code format'}`)
  }
}

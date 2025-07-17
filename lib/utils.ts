import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto'

// Use a 32-byte (256-bit) key for encryption
const ENCRYPTION_KEY = typeof window === 'undefined' 
  ? (process.env.ENCRYPTION_KEY || '') 
  : (process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encryptForQR(text: string): string {
  try {
    console.log('Encrypting QR data:', text)
    
    // Convert hex string to buffer
    const key = Buffer.from(ENCRYPTION_KEY, 'hex')
    if (key.length !== 32) {
      throw new Error('Encryption key must be a 32-byte (64 character) hex string')
    }
    
    const cipher = crypto.createCipheriv('aes-256-ecb', key, Buffer.alloc(0))
    let encrypted = cipher.update(text, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    
    console.log('Successfully encrypted QR data')
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export function decryptFromQR(encryptedText: string): string {
  try {
    console.log('Attempting to decrypt QR data')
    
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
    throw new Error('Failed to decrypt QR code')
  }
}

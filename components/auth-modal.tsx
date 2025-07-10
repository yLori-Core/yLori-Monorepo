"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Github, Mail, ArrowLeft, Clock } from "lucide-react"
import Image from "next/image"

interface AuthModalProps {
  children: React.ReactNode
}

export function AuthModal({ children }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authMethod, setAuthMethod] = useState<'main' | 'email'>('main')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/" })
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailDemo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate a delay for demo purposes
    setTimeout(() => {
      setShowComingSoon(true)
      setIsLoading(false)
    }, 1000)
  }

  const resetModal = () => {
    setAuthMethod('main')
    setEmail('')
    setShowComingSoon(false)
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) {
        resetModal()
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-background border-border/50 shadow-2xl">
        <div className="px-8 py-8">
          <DialogHeader className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 relative overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="yLori Logo" 
                  width={64} 
                  height={64} 
                  className="object-contain mix-blend-multiply dark:mix-blend-screen"
                />
              </div>
            </div>
            <DialogTitle className="text-2xl font-display text-foreground">
              {showComingSoon ? 'Coming Soon!' : 'Welcome to yLori'}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              {showComingSoon 
                ? 'Email authentication is coming soon. Use Google or GitHub for now.' 
                : 'Sign in to discover amazing Web3 events'
              }
            </DialogDescription>
          </DialogHeader>

          {showComingSoon ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#f47e5c]/10 dark:bg-[#f47e5c]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-[#f47e5c]" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Email magic links are under development. Please use Google or GitHub to sign in.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setAuthMethod('main')}
                className="w-full border-border hover:bg-[#9b6fb5]/10"
              >
                Try other sign-in methods
              </Button>
            </div>
          ) : authMethod === 'main' ? (
            <div className="space-y-4">
              {/* Social Login Buttons */}
              <Button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium shadow-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <Button
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              >
                <Github className="w-5 h-5 mr-3" />
                Continue with GitHub
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">or</span>
                </div>
              </div>

              <Button
                onClick={() => setAuthMethod('email')}
                variant="outline"
                className="w-full h-12 border-border hover:bg-[#9b6fb5]/10 font-medium relative"
              >
                <Mail className="w-5 h-5 mr-3" />
                Continue with Email
                <span className="absolute -top-1 -right-1 bg-[#f47e5c] text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  Soon
                </span>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setAuthMethod('main')}
                className="p-0 h-auto font-medium text-muted-foreground hover:text-[#9b6fb5]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <form onSubmit={handleEmailDemo} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background border-border"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-[#e36c89] hover:bg-[#d15e7b] text-white font-medium"
                >
                  {isLoading ? 'Checking...' : 'Send magic link (Coming Soon)'}
                </Button>
              </form>

              <div className="bg-[#f47e5c]/10 border border-[#f47e5c]/20 rounded-lg p-4">
                <p className="text-xs text-[#f47e5c] text-center">
                  ⚠️ Email authentication is coming soon! Please use Google or GitHub for now.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-[#9b6fb5]">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-[#e36c89]">Privacy Policy</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
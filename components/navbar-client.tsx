"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Search, Bell, Globe, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthModal } from "@/components/auth-modal";
import { SignOutButton } from "@/components/sign-out-button";
import { signOut } from "next-auth/react";

interface NavbarClientProps {
  session: any;
}

export function NavbarClient({ session }: NavbarClientProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Debug session data
    if (session?.user) {
      console.log("Session user data:", session.user);
      console.log("User image URL:", session.user.image);
      
      // Set user image with proper URL handling
      if (session.user.image) {
        setUserImage(session.user.image);
      }
    }
    
    // Set up current time with timezone
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
      });
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzAbbr = timezone.split('/').pop()?.replace('_', ' ') || timezone;
      setCurrentTime(`${timeString} ${tzAbbr}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  // Create a fallback for avatar
  const getAvatarFallback = (user: any) => {
    if (!user) return "U";
    if (user.name) return user.name.charAt(0);
    if (user.email) return user.email.charAt(0);
    return "U";
  };

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo_full.png" 
                alt="yLori Logo" 
                width={100} 
                height={32} 
                className="h-7 sm:h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-screen"
                priority
              />
            </Link>
            
            <div className="hidden md:flex items-center ml-8 space-x-1">
              <Link href="/events" className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-foreground bg-[#9b6fb5]/10">
                <Calendar className="w-4 h-4 text-[#9b6fb5]" />
                <span>Events</span>
              </Link>
              <Link href="#" className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-[#e36c89] hover:bg-[#e36c89]/10 transition-all">
                <Calendar className="w-4 h-4" />
                <span>Calendars</span>
              </Link>
              <button className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-[#f47e5c] hover:bg-[#f47e5c]/10 transition-all">
                <Globe className="w-4 h-4" />
                <span>Discover</span>
              </button>
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden lg:block font-medium">
              {currentTime}
            </span>
            

            
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-[#9b6fb5]/10 text-muted-foreground hover:text-[#9b6fb5]">
                <Search className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 hover:bg-[#e36c89]/10 text-muted-foreground hover:text-[#e36c89]">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f47e5c] rounded-full"></span>
              </Button>
              
              <ThemeToggle />
            </div>
            
            {/* Desktop Auth */}
            <div className="hidden sm:block">
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative w-8 h-8 rounded-full">
                      <Avatar className="w-8 h-8 ring-2 ring-[#9b6fb5]/20">
                        {userImage ? (
                          <AvatarImage 
                            src={userImage} 
                            alt={session.user.name || "User"} 
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                        <AvatarFallback className="text-xs bg-[#9b6fb5]/20 text-[#9b6fb5]">
                          {getAvatarFallback(session.user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href={`/user/${(session.user as any).username || 'profile'}`}
                        className="flex items-center w-full hover:bg-[#9b6fb5]/10 focus:bg-[#9b6fb5]/10 text-foreground hover:text-[#9b6fb5]"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <AuthModal>
                  <Button className="bg-[#9b6fb5] hover:bg-[#8a5ea4] text-white font-medium px-4 py-2 h-9 text-sm shadow-sm">
                    Sign in
                  </Button>
                </AuthModal>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center space-x-3 sm:hidden">
              <span className="text-xs text-muted-foreground font-medium">
                {currentTime}
              </span>
              
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative w-8 h-8 rounded-full p-0">
                      <Avatar className="w-8 h-8 ring-2 ring-[#9b6fb5]/20">
                        {userImage ? (
                          <AvatarImage 
                            src={userImage} 
                            alt={session.user.name || "User"} 
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                        <AvatarFallback className="text-xs bg-[#9b6fb5]/20 text-[#9b6fb5]">
                          {getAvatarFallback(session.user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/events" 
                        className="flex items-center w-full hover:bg-[#9b6fb5]/10 focus:bg-[#9b6fb5]/10 text-foreground hover:text-[#9b6fb5]"
                      >
                        <Calendar className="mr-2 h-4 w-4 text-[#9b6fb5]" />
                        Events
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        href="#" 
                        className="flex items-center w-full hover:bg-[#e36c89]/10 focus:bg-[#e36c89]/10 text-foreground hover:text-[#e36c89]"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendars
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button 
                        className="flex items-center w-full hover:bg-[#f47e5c]/10 focus:bg-[#f47e5c]/10 text-foreground hover:text-[#f47e5c]"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Discover
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href={`/user/${(session.user as any).username || 'profile'}`}
                        className="flex items-center w-full hover:bg-[#9b6fb5]/10 focus:bg-[#9b6fb5]/10 text-foreground hover:text-[#9b6fb5]"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <AuthModal>
                  <Button className="bg-[#9b6fb5] hover:bg-[#8a5ea4] text-white font-medium px-3 py-1 h-8 text-xs shadow-sm">
                    Sign in
                  </Button>
                </AuthModal>
              )}
            </div>
          </div>
        </div>
      </div>


    </nav>
  );
} 
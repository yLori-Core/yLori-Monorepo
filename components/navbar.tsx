import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Search, Bell, Globe, LogOut, User, Plus } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/auth-modal"
import { SignOutButton } from "@/components/sign-out-button"

export async function Navbar() {
  const session = await getServerSession(authOptions)
  
  console.log("=== NAVBAR SERVER SESSION ===")
  console.log("Session:", JSON.stringify(session, null, 2))
  console.log("User image:", session?.user?.image)

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">yL</span>
              </div>
              <span className="text-lg font-semibold text-foreground">yLori</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link href="#" className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-foreground bg-accent/60">
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </Link>
              <Link href="#" className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all">
                <Calendar className="w-4 h-4" />
                <span>Calendars</span>
              </Link>
              <Link href="#" className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all">
                <Globe className="w-4 h-4" />
                <span>Discover</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden lg:block font-medium">
              1:26 am IST
            </span>
            
            <Button 
              className="bg-foreground hover:bg-foreground/90 text-background font-medium px-4 py-2 h-9 text-sm shadow-sm"
              asChild
            >
              <Link href="/create">
                Create Event
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-accent/60 text-muted-foreground hover:text-foreground">
              <Search className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative w-9 h-9 p-0 hover:bg-accent/60 text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <ThemeToggle />
            
            {/* Auth Section */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative w-8 h-8 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback className="text-xs">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
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
                      className="flex items-center w-full hover:bg-accent focus:bg-accent text-foreground hover:text-foreground"
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
                <Button className="bg-foreground hover:bg-foreground/90 text-background font-medium px-4 py-2 h-9 text-sm shadow-sm">
                  Sign in
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 
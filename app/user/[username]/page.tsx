import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Instagram, Twitter, Youtube, Linkedin, Globe, Users, MapPin } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Image from "next/image"

// Mock user data - in a real app, this would come from a database
const getUserData = (username: string) => {
  return {
    name: "Aditya Pundir",
    username: "adipundir",
    bio: "CEHv9 Certified | Dev | AI Agents",
    joinedDate: "May 2024",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face",
    hostedEvents: 0,
    attendedEvents: 103,
    socialLinks: {
      instagram: "#",
      twitter: "#", 
      youtube: "#",
      linkedin: "#",
      website: "#"
    },
    events: []
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const user = getUserData(username)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32 ring-4 ring-background shadow-2xl">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl bg-accent text-muted-foreground font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{user.name}</h1>
              <p className="text-lg text-muted-foreground">@{user.username}</p>
            </div>

            <p className="text-base text-foreground">{user.bio}</p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {user.joinedDate}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{user.hostedEvents}</div>
                <div className="text-sm text-muted-foreground">Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{user.attendedEvents}</div>
                <div className="text-sm text-muted-foreground">Attended</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground">
                <Youtube className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground">
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="space-y-8">
          {/* Empty State */}
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 opacity-20">
              <svg viewBox="0 0 120 120" className="w-full h-full text-muted-foreground">
                <rect x="20" y="20" width="80" height="80" rx="12" fill="currentColor" opacity="0.3"/>
                <rect x="30" y="35" width="25" height="4" rx="2" fill="currentColor"/>
                <rect x="30" y="45" width="35" height="4" rx="2" fill="currentColor"/>
                <rect x="30" y="55" width="20" height="4" rx="2" fill="currentColor"/>
                <rect x="30" y="75" width="15" height="4" rx="2" fill="currentColor"/>
                <rect x="50" y="75" width="15" height="4" rx="2" fill="currentColor"/>
                <rect x="70" y="55" width="15" height="15" rx="3" fill="currentColor"/>
                <circle cx="90" cy="30" r="8" fill="currentColor" opacity="0.6"/>
                <rect x="85" y="26" width="10" height="2" rx="1" fill="background"/>
                <rect x="87" y="28" width="6" height="2" rx="1" fill="background"/>
                <rect x="85" y="32" width="10" height="2" rx="1" fill="background"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground mb-3">Nothing Here, Yet</h2>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              {user.name} has no public events at this time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
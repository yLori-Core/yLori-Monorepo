import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Instagram, Twitter, Youtube, Linkedin, Globe, Users, MapPin } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Image from "next/image"
import { getUserProfileData } from "@/lib/db/queries"
import { notFound } from "next/navigation"

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  
  // Fetch user data from database
  const profileData = await getUserProfileData(username)
  
  if (!profileData) {
    notFound()
  }
  
  const { user, stats, events } = profileData

  // Format join date
  const joinedDate = new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date(user.createdAt))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32 ring-4 ring-background shadow-2xl">
              {user.image ? (
                <AvatarImage 
                  src={user.image} 
                  alt={user.name || user.username || ""}
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <AvatarFallback className="text-2xl bg-accent text-muted-foreground font-bold">
                {user.name?.split(' ').map(n => n[0]).join('') || user.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{user.name || user.username}</h1>
              <p className="text-lg text-muted-foreground">@{user.username}</p>
            </div>

            {user.bio && (
              <p className="text-base text-foreground">{user.bio}</p>
            )}

            {user.tagline && (
              <p className="text-sm text-muted-foreground italic">{user.tagline}</p>
            )}

            {user.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {joinedDate}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.hostedEvents}</div>
                <div className="text-sm text-muted-foreground">Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{stats.attendedEvents}</div>
                <div className="text-sm text-muted-foreground">Attended</div>
              </div>
              {stats.organizedEvents > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.organizedEvents}</div>
                  <div className="text-sm text-muted-foreground">Organized</div>
                </div>
              )}
              {stats.followersCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.followersCount}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {user.instagramHandle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={`https://instagram.com/${user.instagramHandle}`} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {user.twitterHandle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={`https://twitter.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {user.youtubeHandle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={`https://youtube.com/@${user.youtubeHandle}`} target="_blank" rel="noopener noreferrer">
                    <Youtube className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {user.linkedinHandle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={`https://linkedin.com/in/${user.linkedinHandle}`} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {user.website && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="space-y-8">
          {events.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Events</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div key={event.id} className="border border-border rounded-lg p-6 hover:border-border/80 transition-colors">
                    {event.coverImage && (
                      <div className="w-full h-32 bg-muted rounded-lg mb-4 overflow-hidden">
                        <Image 
                          src={event.coverImage} 
                          alt={event.title}
                          width={300}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                    {event.summary && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.summary}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Intl.DateTimeFormat('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        }).format(new Date(event.startDate))}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
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
                {user.name || user.username} has no public events at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
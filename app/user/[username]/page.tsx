import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Calendar, Instagram, Twitter, Youtube, Linkedin, Globe, Users, MapPin, Edit, Clock, Eye } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Image from "next/image"
import { getUserProfileData } from "@/lib/db/queries"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const session = await getServerSession(authOptions)
  const viewerId = session?.user?.id
  
  // Fetch user data from database
  const profileData = await getUserProfileData(username, viewerId)
  
  if (!profileData) {
    notFound()
  }
  
  const { user, stats, events, registeredEvents } = profileData
  const isOwner = viewerId === user.id

  // Group events if owner
  let drafts: typeof events = []
  let upcoming: typeof events = []
  let past: typeof events = []
  if (isOwner) {
    const now = new Date()
    drafts = events.filter(e => e.status === 'draft')
    upcoming = events.filter(e => e.status === 'published' && new Date(e.startDate) > now)
    past = events.filter(e => e.status === 'published' && new Date(e.startDate) <= now)
  }

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
            <Avatar className="w-32 h-32 ring-4 ring-border shadow-xl">
              {user.image ? (
                <AvatarImage 
                  src={user.image} 
                  alt={user.name || user.username || ""}
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-accent text-foreground font-bold">
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

            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinedDate}</span>
              </div>
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
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  asChild
                >
                  <a href={`https://x.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {user.youtubeHandle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
                  className="w-9 h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
          {isOwner ? (
            <>
              {/* Registered Events - Only visible to profile owner */}
              {registeredEvents && registeredEvents.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    Registered Events
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {registeredEvents.map(({ event, attendee }) => {
                      const isUpcoming = new Date(event.startDate) > new Date()
                      const statusColors = {
                        'pending': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
                        'approved': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
                        'waitlisted': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                        'checked_in': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                        'declined': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                        'cancelled': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
                        'no_show': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      }
                      
                      return (
                        <Card key={event.id} className={`group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border overflow-hidden ${!isUpcoming ? 'opacity-75' : ''}`}>
                          <Link href={`/events/${event.slug}`}>
                            {event.coverImage && (
                              <div className="w-full h-32 bg-muted overflow-hidden">
                                <Image 
                                  src={event.coverImage} 
                                  alt={event.title}
                                  width={300}
                                  height={128}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors flex-1">{event.title}</h3>
                                <Badge className={statusColors[attendee.status] || statusColors.pending}>
                                  {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1).replace('_', ' ')}
                                </Badge>
                              </div>
                              {event.summary && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{event.summary}</p>
                              )}
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2">
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
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Registered {new Intl.DateTimeFormat('en-US', { 
                                    month: 'short', 
                                    day: 'numeric'
                                  }).format(new Date(attendee.registeredAt))}
                                </span>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {drafts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Edit className="w-6 h-6" />
                    Drafts
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {drafts.map((event) => (
                      <Card key={event.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">{event.title}</h3>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                              Draft
                            </Badge>
                            <Button asChild size="sm" variant="outline" className="ml-auto">
                              <Link href={`/events/${event.slug}?edit=true`} className="flex items-center gap-2">
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </CardHeader>
                        {event.description && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {upcoming.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Clock className="w-6 h-6" />
                    Upcoming Events
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {upcoming.map((event) => (
                      <Card key={event.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border overflow-hidden">
                        <Link href={`/events/${event.slug}`}>
                          {event.coverImage && (
                            <div className="w-full h-32 bg-muted overflow-hidden">
                              <Image 
                                src={event.coverImage} 
                                alt={event.title}
                                width={300}
                                height={128}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                            {event.summary && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{event.summary}</p>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0 space-y-2">
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
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {past.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Calendar className="w-6 h-6" />
                    Past Events
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {past.map((event) => (
                      <Card key={event.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border overflow-hidden opacity-75 hover:opacity-100">
                        <Link href={`/events/${event.slug}`}>
                          {event.coverImage && (
                            <div className="w-full h-32 bg-muted overflow-hidden">
                              <Image 
                                src={event.coverImage} 
                                alt={event.title}
                                width={300}
                                height={128}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                            {event.summary && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{event.summary}</p>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0 space-y-2">
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
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {events.length === 0 && (
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
                  
                  <h2 className="text-2xl font-semibold text-foreground mb-3">Ready to Create?</h2>
                  <p className="text-base text-muted-foreground max-w-md mx-auto mb-6">
                    You haven't created any events yet. Start building your community!
                  </p>
                  <Button asChild>
                    <Link href="/create">Create Your First Event</Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            events.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Eye className="w-6 h-6" />
                  Public Events
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <Card key={event.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border overflow-hidden">
                      <Link href={`/events/${event.slug}`}>
                        {event.coverImage && (
                          <div className="w-full h-32 bg-muted overflow-hidden">
                            <Image 
                              src={event.coverImage} 
                              alt={event.title}
                              width={300}
                              height={128}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">{event.title}</h3>
                          {event.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{event.summary}</p>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 space-y-2">
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
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
            )
          )}
        </div>
      </div>
    </div>
  )
} 
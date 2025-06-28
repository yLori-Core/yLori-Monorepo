import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin } from "lucide-react"
import Image from "next/image"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  const events = [
    {
      id: 1,
      date: "23 Jun",
      day: "Monday",
      time: "5:30 am • 12:00 am UTC",
      title: "Founder Sprint: The 100-Hour Vibathon",
      host: "StarkWare & Starknet Foundation",
      hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      location: "Online",
      isOnline: true,
      status: "going",
      attendees: [
        "https://images.unsplash.com/photo-1494790108755-2616b612b641?w=24&h=24&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=24&h=24&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=24&h=24&fit=crop&crop=face",
      ],
      attendeeCount: "+138",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=160&h=100&fit=crop",
      isLive: true,
    },
    {
      id: 2,
      date: "27 Jun",
      day: "Friday",
      time: "1:30 pm • 10:00 am GMT+2",
      title: "AI / AI AGENT DAY MONACO",
      host: "WAIBSummit x NFTFEST",
      hostAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face",
      location: "One Monte-Carlo",
      isOnline: false,
      status: "invited",
      attendees: [
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=24&h=24&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=24&h=24&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=24&h=24&fit=crop&crop=face",
      ],
      attendeeCount: "",
      image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=160&h=100&fit=crop",
      isLive: false,
    },
    {
      id: 3,
      date: "28 Jun",
      day: "Saturday",
      time: "2:30 pm • 11:00 am GMT+2",
      title: "⭐VCC Demo Day Ethcc Cannes (Yacht)🛥️",
      host: "Pcventure",
      hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop&crop=face",
      location: "Location Shown Upon Approval",
      isOnline: false,
      status: null,
      attendees: [],
      attendeeCount: "",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&h=100&fit=crop",
      isLive: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-display text-foreground text-balance">Events</h1>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" className="bg-accent/80 border-border text-foreground font-semibold px-4 shadow-sm">
                Upcoming
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-semibold px-4">
                Past
              </Button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={event.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute left-24 top-8 w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
              
              {/* Timeline line */}
              {index < events.length - 1 && (
                <div className="absolute left-24.5 top-10 w-px h-20 bg-border/60"></div>
              )}

              <div className="flex gap-10 hover:bg-accent/30 -mx-6 px-6 py-6 rounded-2xl transition-all duration-300 cursor-pointer">
                {/* Date Column */}
                <div className="w-24 flex-shrink-0 pt-2">
                  <div className="text-base font-bold text-foreground">{event.date}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">{event.day}</div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  {/* Time and Status */}
                  <div className="flex items-center gap-4 mb-4">
                    {event.isLive && (
                      <Badge className="bg-red-500 text-white border-0 text-sm font-bold px-3 py-1 shadow-lg">
                        LIVE
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground font-semibold">{event.time}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {event.title}
                  </h3>

                  {/* Host */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-6 h-6 ring-2 ring-background shadow-md">
                      <AvatarImage src={event.hostAvatar} alt={event.host} />
                      <AvatarFallback className="text-xs bg-accent text-muted-foreground font-bold">
                        {event.host.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground font-medium">By {event.host}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3 mb-5">
                    <MapPin className="w-4 h-4 text-muted-foreground/80" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {event.isOnline ? "Online" : event.location}
                    </span>
                  </div>

                  {/* Status and Attendees */}
                  <div className="flex items-center gap-5">
                    {event.status && (
                      <Badge 
                        variant="secondary"
                        className={`text-sm font-bold px-4 py-2 shadow-sm ${
                          event.status === 'going' 
                            ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30' 
                            : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {event.status === 'going' ? 'Going' : 'Invited'}
                      </Badge>
                    )}
                    {event.attendees.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {event.attendees.map((avatar, idx) => (
                            <Avatar key={idx} className="w-7 h-7 border-2 border-background ring-1 ring-border/50 shadow-sm">
                              <AvatarImage src={avatar} alt="Attendee" />
                              <AvatarFallback className="text-xs bg-accent font-bold">U</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {event.attendeeCount && (
                          <span className="text-sm text-muted-foreground font-bold">
                            {event.attendeeCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Image */}
                <div className="w-40 h-24 flex-shrink-0">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={160}
                    height={96}
                    className="w-full h-full object-cover rounded-xl border border-border/60 shadow-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-16">
          <Button variant="outline" className="text-muted-foreground border-border hover:bg-accent font-semibold px-8 py-3 shadow-sm">
            Load more events
          </Button>
        </div>
      </div>
    </div>
  )
}

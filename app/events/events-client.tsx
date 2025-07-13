"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Clock, Search, Plus } from "lucide-react"
import { AvatarCircles } from "@/components/ui/avatar-circles"

interface Event {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date
  location: string | null
  eventType: 'in_person' | 'virtual' | 'hybrid'
  ticketType: 'qr_code' | 'nft' | null
  totalRegistrations: number | null
  coverImage: string | null
  slug: string | null
}

interface EventsClientProps {
  allEvents: Event[]
  upcomingEvents: Event[]
}

export function EventsClient({ allEvents, upcomingEvents }: EventsClientProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    let filtered = allEvents

    // Search filter
    if (search) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase()) ||
        event.location?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === typeFilter)
    }

    // Time filter
    if (timeFilter === 'upcoming') {
      const now = new Date()
      filtered = filtered.filter(event => new Date(event.startDate) > now)
    } else if (timeFilter === 'past') {
      const now = new Date()
      filtered = filtered.filter(event => new Date(event.startDate) <= now)
    }

    // Sort events by start date (newest first)
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }, [allEvents, search, typeFilter, timeFilter])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  const getStatusBadge = (startDate: Date) => {
    const now = new Date()
    const eventDate = new Date(startDate)
    
    if (eventDate > now) {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Upcoming</Badge>
    } else {
      return <Badge variant="secondary">Past</Badge>
    }
  }

  // Generate dummy avatar URLs for demonstration
  const generateAvatarUrls = (count: number) => {
    const baseUrls = [
      "https://avatars.githubusercontent.com/u/16860528",
      "https://avatars.githubusercontent.com/u/20110627",
      "https://avatars.githubusercontent.com/u/106103625",
      "https://avatars.githubusercontent.com/u/59228569",
      "https://avatars.githubusercontent.com/u/1",
      "https://avatars.githubusercontent.com/u/2",
      "https://avatars.githubusercontent.com/u/3",
      "https://avatars.githubusercontent.com/u/4",
    ]
    
    const displayCount = Math.min(count, 4) // Show max 4 avatars
    return baseUrls.slice(0, displayCount)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">All Events</h1>
          <p className="text-lg text-muted-foreground">
            Discover and join Web3 events from around the world
          </p>
        </div>
        <Button asChild className="mt-4 lg:mt-0 bg-gradient-to-r from-[#9b6fb5] to-[#e36c89] hover:from-[#8a5fa0] hover:to-[#d15e7b]">
          <Link href="/create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Event Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="When" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>{filteredEvents.length} events found</span>
          <span>•</span>
          <span>{upcomingEvents.length} upcoming events</span>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const startDate = new Date(event.startDate)
            
            return (
              <Card key={event.id} className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm overflow-hidden hover:-translate-y-1 p-0 gap-0">
                {/* Event Image */}
                {event.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.coverImage}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-black/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
                        {startDate > new Date() ? 'Upcoming' : 'Past'}
                      </div>
                    </div>
                    
                    {/* NFT Badge - Only for NFT tickets */}
                    {event.ticketType === 'nft' && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          NFT Tickets
                        </div>
                      </div>
                    )}
                    
                    {/* QR Code Badge - Subtle for QR tickets */}
                    {event.ticketType === 'qr_code' && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-black/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
                          QR
                        </div>
                      </div>
                    )}
                    
                    {/* Title overlay on image */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                )}
                
                {/* Content - No header needed since title is on image */}
                <div className="p-6 space-y-4">
                  {/* If no image, show title here */}
                  {!event.coverImage && (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        {/* Ticket type badge for no-image cards */}
                        {event.ticketType === 'nft' && (
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shrink-0">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            NFT Tickets
                          </div>
                        )}
                        {event.ticketType === 'qr_code' && (
                          <div className="bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-medium shrink-0">
                            QR
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(startDate)}
                      </div>
                    </div>
                  )}
                  
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">{formatDate(startDate)} • {formatTime(startDate)}</span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {event.eventType === 'virtual' ? (
                      <>
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">Virtual Event</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="line-clamp-1 font-medium">
                          {event.location || 'Location TBA'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  
                  {/* Bottom section with attendees and button */}
                  <div className="flex items-center justify-between pt-2">
                    {/* Attendees Count with Avatar Circles */}
                    {event.totalRegistrations && event.totalRegistrations > 0 ? (
                      <div className="flex items-center gap-3">
                        <AvatarCircles 
                          className="scale-75" 
                          numPeople={event.totalRegistrations > 4 ? event.totalRegistrations - 4 : undefined}
                          avatarUrls={generateAvatarUrls(event.totalRegistrations)}
                        />
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{event.totalRegistrations} approved</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-xs">
                          {event.eventType?.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                    
                    {/* View Event Button */}
                    <Button asChild size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-200">
                      <Link href={`/events/${event.slug || event.id}`}>
                        View Event
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              No events match your current filters. Try adjusting your search criteria.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch("")
                  setTypeFilter("all")
                  setTimeFilter("all")
                }}
              >
                Clear Filters
              </Button>
              <Button asChild>
                <Link href="/create">Create Event</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
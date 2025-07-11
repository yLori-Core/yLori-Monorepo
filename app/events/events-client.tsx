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

interface Event {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date
  location: string | null
  eventType: 'in_person' | 'virtual' | 'hybrid'
  ticketType: 'free' | 'paid' | 'donation' | 'rsvp' | null
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const startDate = new Date(event.startDate)
            
            return (
              <Card key={event.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border overflow-hidden">
                {/* Event Image */}
                {event.coverImage && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.coverImage}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(startDate)}
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-[#e36c89] transition-colors">
                        {event.title}
                      </h3>
                      {!event.coverImage && (
                        <div className="mt-2">
                          {getStatusBadge(startDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-3">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(startDate)} • {formatTime(startDate)}</span>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {event.eventType === 'virtual' ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Virtual Event</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">
                          {event.location || 'Location TBA'}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Event Type Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {event.eventType?.replace('_', ' ')}
                    </Badge>
                    {event.ticketType && (
                      <Badge variant="outline" className="capitalize">
                        {event.ticketType}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  {/* Attendees Count */}
                  {event.totalRegistrations && event.totalRegistrations > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.totalRegistrations} registered</span>
                    </div>
                  )}
                  
                  {/* View Event Button */}
                  <Button asChild className="w-full mt-4">
                    <Link href={`/event/${event.slug || event.id}`}>
                      View Event
                    </Link>
                  </Button>
                </CardContent>
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
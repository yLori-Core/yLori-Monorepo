"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp,
  Crown,
  Star,
  Users
} from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  userId: string
  user: {
    name: string
    username?: string
    image?: string
  }
  points: number
  level: number
}

interface LeaderboardData {
  timeframe: 'week' | 'month' | 'all'
  leaderboard: LeaderboardEntry[]
  metadata: {
    totalEntries: number
    generatedAt: string
  }
}

interface PointsLeaderboardProps {
  defaultTimeframe?: 'week' | 'month' | 'all'
  limit?: number
  showUserRank?: boolean
  compact?: boolean
}

export function PointsLeaderboard({ 
  defaultTimeframe = 'all', 
  limit = 50,
  showUserRank = true,
  compact = false 
}: PointsLeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTimeframe, setActiveTimeframe] = useState<'week' | 'month' | 'all'>(defaultTimeframe)

  useEffect(() => {
    fetchLeaderboard(activeTimeframe)
  }, [activeTimeframe, limit])

  const fetchLeaderboard = async (timeframe: 'week' | 'month' | 'all') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/points/leaderboard?timeframe=${timeframe}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      
      const leaderboardData = await response.json()
      setData(leaderboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 6) return "text-purple-600"
    if (level >= 4) return "text-blue-600"
    if (level >= 2) return "text-green-600"
    return "text-gray-600"
  }

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case 'all': return 'All Time'
      default: return timeframe
    }
  }

  if (loading) {
    return (
      <Card className={compact ? 'w-full' : 'w-full max-w-4xl'}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className={compact ? 'w-full' : 'w-full max-w-4xl'}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{error || 'No leaderboard data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const LeaderboardContent = () => (
    <div className="space-y-3">
      {data.leaderboard.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No users on the leaderboard yet</p>
          <p className="text-sm">Be the first to earn some points!</p>
        </div>
      ) : (
        data.leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
              entry.rank <= 3 
                ? 'bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20' 
                : 'bg-card/50 border border-border/50'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8">
              {getRankIcon(entry.rank)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.user.image || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                  {entry.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{entry.user.name}</p>
                  {entry.rank <= 3 && (
                    <Badge variant={getRankBadgeVariant(entry.rank)} className="text-xs">
                      #{entry.rank}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Level {entry.level}
                  </p>
                  {entry.user.username && (
                    <p className="text-xs text-muted-foreground">
                      @{entry.user.username}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <p className="font-bold text-lg text-primary">
                {entry.points.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        ))
      )}
    </div>
  )

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardContent />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Points Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTimeframe} onValueChange={(value) => setActiveTimeframe(value as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="week" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                This Week
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                This Month
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                All Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTimeframe} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {getTimeframeLabel(activeTimeframe)} Leaders
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.leaderboard.length} {data.leaderboard.length === 1 ? 'participant' : 'participants'}
                </p>
              </div>
              
              <LeaderboardContent />

              {data.metadata && (
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(data.metadata.generatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 
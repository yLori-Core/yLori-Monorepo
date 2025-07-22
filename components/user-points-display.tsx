"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar, 
  Users, 
  Award,
  Coins,
  Target,
  History,
  Medal
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserPointsData {
  points: {
    total: number
    lifetime: number
    level: number
    progress: number
    pointsToNextLevel: number
  }
  stats: {
    eventsCreated: number
    eventsAttended: number
    achievementsUnlocked: number
  }
  recentTransactions: Array<{
    id: string
    points: number
    type: string
    description: string
    date: string
    metadata?: any
  }>
  achievements: Array<{
    id: string
    type: string
    name: string
    description: string
    points: number
    unlockedAt: string
    metadata?: any
  }>
}

interface UserPointsDisplayProps {
  userId?: string
  compact?: boolean
  showAchievements?: boolean
  showTransactions?: boolean
}

export function UserPointsDisplay({ 
  userId, 
  compact = false, 
  showAchievements = true, 
  showTransactions = true 
}: UserPointsDisplayProps) {
  const [data, setData] = useState<UserPointsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPointsData()
  }, [userId])

  const fetchPointsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/points/profile')
      
      if (!response.ok) {
        throw new Error('Failed to fetch points data')
      }
      
      const pointsData = await response.json()
      setData(pointsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load points data')
    } finally {
      setLoading(false)
    }
  }

  const getLevelName = (level: number): string => {
    const levelNames = {
      1: 'Newcomer',
      2: 'Explorer', 
      3: 'Participant',
      4: 'Organizer',
      5: 'Expert',
      6: 'Master'
    }
    return levelNames[level as keyof typeof levelNames] || `Level ${level}`
  }

  const formatTransactionType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getTransactionIcon = (type: string) => {
    if (type.includes('event_create')) return <Calendar className="w-4 h-4" />
    if (type.includes('event_checkin')) return <Users className="w-4 h-4" />
    if (type.includes('achievement')) return <Award className="w-4 h-4" />
    return <Coins className="w-4 h-4" />
  }

  const getAchievementIcon = (type: string) => {
    if (type.includes('first')) return <Star className="w-5 h-5 text-yellow-500" />
    if (type.includes('level')) return <Trophy className="w-5 h-5 text-purple-500" />
    if (type.includes('host')) return <Users className="w-5 h-5 text-blue-500" />
    return <Medal className="w-5 h-5 text-green-500" />
  }

  if (loading) {
    return (
      <Card className={compact ? 'w-full' : 'w-full max-w-4xl'}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
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
            <Coins className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{error || 'No points data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{data.points.total.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Level {data.points.level}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{data.points.pointsToNextLevel} to next level</p>
              <Progress value={data.points.progress} className="w-20 h-2 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Main Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            Your Points & Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Points */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {data.points.total.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            
            {/* Current Level */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold">{data.points.level}</span>
              </div>
              <p className="text-sm text-muted-foreground">{getLevelName(data.points.level)}</p>
            </div>
            
            {/* Lifetime Points */}
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground mb-1">
                {data.points.lifetime.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Lifetime Points</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {data.points.level + 1}</span>
              <span>{data.points.pointsToNextLevel} points to go</span>
            </div>
            <Progress value={data.points.progress} className="w-full h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{data.stats.eventsCreated}</div>
            <p className="text-sm text-muted-foreground">Events Created</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{data.stats.eventsAttended}</div>
            <p className="text-sm text-muted-foreground">Events Attended</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{data.stats.achievementsUnlocked}</div>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      {(showAchievements || showTransactions) && (
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {showAchievements && (
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Achievements
              </TabsTrigger>
            )}
            {showTransactions && (
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Activity
              </TabsTrigger>
            )}
          </TabsList>

          {showAchievements && (
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Achievements Unlocked</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.achievements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No achievements unlocked yet</p>
                      <p className="text-sm">Keep participating to earn your first achievement!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card/50"
                        >
                          {getAchievementIcon(achievement.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{achievement.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                +{achievement.points} pts
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {showTransactions && (
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                        >
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTransactionType(transaction.type)} • {' '}
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-medium ${
                              transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.points > 0 ? '+' : ''}{transaction.points}
                            </span>
                            <p className="text-xs text-muted-foreground">pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
} 
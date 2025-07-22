import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getUserPointsSummary, 
  getUserPointsTransactions, 
  getUserAchievements,
  getUserEventCreationCount,
  getUserEventAttendanceCount 
} from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all user points data in parallel
    const [
      pointsSummary,
      recentTransactions,
      achievements,
      eventCreationCount,
      eventAttendanceCount
    ] = await Promise.all([
      getUserPointsSummary(userId),
      getUserPointsTransactions(userId, 10, 0), // Last 10 transactions
      getUserAchievements(userId),
      getUserEventCreationCount(userId),
      getUserEventAttendanceCount(userId)
    ])

    // Calculate level information
    const totalPoints = pointsSummary?.totalPoints || 0
    const currentLevel = pointsSummary?.currentLevel || 1
    const levelProgress = pointsSummary?.levelProgress || 0
    const nextLevelPoints = 100 - levelProgress
    const pointsToNextLevel = nextLevelPoints

    const response = {
      points: {
        total: totalPoints,
        lifetime: pointsSummary?.lifetimePoints || 0,
        level: currentLevel,
        progress: levelProgress,
        pointsToNextLevel
      },
      stats: {
        eventsCreated: eventCreationCount,
        eventsAttended: eventAttendanceCount,
        achievementsUnlocked: achievements.length
      },
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        points: tx.pointsEarned,
        type: tx.transactionType,
        description: tx.description,
        date: tx.createdAt,
        metadata: tx.metadata
      })),
      achievements: achievements.map(ach => ({
        id: ach.id,
        type: ach.achievementType,
        name: ach.achievementName,
        description: ach.description,
        points: ach.pointsEarned,
        unlockedAt: ach.achievedAt,
        metadata: ach.metadata
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching user points profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points profile' },
      { status: 500 }
    )
  }
} 
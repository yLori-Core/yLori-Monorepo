import { NextRequest, NextResponse } from 'next/server'
import { getTopPointEarners } from '@/lib/db/queries'
import { users } from '@/lib/db/schema'
import { db } from '@/lib/db'
import { eq, inArray } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') as 'week' | 'month' | 'all' || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get top point earners
    const topEarners = await getTopPointEarners(timeframe, limit)
    
    if (topEarners.length === 0) {
      return NextResponse.json({ leaderboard: [] })
    }

    // Get user details for the top earners
    const userIds = topEarners.map(earner => earner.userId).filter(Boolean)
    const userDetails = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image
    })
    .from(users)
    .where(inArray(users.id, userIds))

    // Create user lookup map
    const userMap = new Map(userDetails.map(user => [user.id, user]))

    // Combine data and format response
    const leaderboard = topEarners.map((earner, index) => {
      const user = userMap.get(earner.userId)
      return {
        rank: index + 1,
        userId: earner.userId,
        user: {
          name: user?.name || 'Anonymous',
          username: user?.username || null,
          image: user?.image || null
        },
        points: Number(earner.totalPoints),
        level: 'currentLevel' in earner ? earner.currentLevel : Math.max(1, Math.floor(Number(earner.totalPoints) / 100) + 1)
      }
    })

    const response = {
      timeframe,
      leaderboard,
      metadata: {
        totalEntries: leaderboard.length,
        generatedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
} 
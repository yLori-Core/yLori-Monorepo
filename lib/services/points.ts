/**
 * Points Service - Production-grade points and gamification system
 * 
 * This service handles:
 * - Point earning and deduction
 * - Risk assessment and fraud detection
 * - Achievement and badge management
 * - Level progression
 * - Transaction audit trail
 * - Background monitoring
 */

import { db } from '@/lib/db'
import { 
  userPoints, 
  pointsTransactions, 
  userSecurity, 
  pointsRules, 
  userAchievements,
  type NewPointsTransaction,
  type UserPoints,
  type PointsTransaction,
  type UserSecurity as UserSecurityType,
  type PointsRule,
  type UserAchievement
} from '@/lib/db/schema'
import { eq, desc, and, sum, count, gte, lte, sql, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'

// Types for service operations
export interface PointsEarnedEvent {
  userId: string
  eventId?: string
  transactionType: string
  points: number
  description: string
  metadata?: Record<string, any>
}

export interface RiskAssessment {
  score: number // 0-100
  flags: string[]
  recommendation: 'allow' | 'review' | 'block'
}

export interface UserLevel {
  level: number
  progress: number
  nextLevelPoints: number
  totalPointsForLevel: number
}

export interface Achievement {
  type: string
  name: string
  description: string
  points: number
  metadata?: Record<string, any>
}

// Transaction types enum for type safety
export const TRANSACTION_TYPES = {
  // Event hosting
  EVENT_CREATE: 'event_create',
  EVENT_PUBLISH: 'event_publish', 
  EVENT_COMPLETE: 'event_complete',
  ATTENDEE_MILESTONE_10: 'attendee_milestone_10',
  ATTENDEE_MILESTONE_25: 'attendee_milestone_25',
  ATTENDEE_MILESTONE_50: 'attendee_milestone_50',
  ATTENDEE_MILESTONE_100: 'attendee_milestone_100',
  ORGANIZER_CHECKIN_BONUS: 'organizer_checkin_bonus',
  
  // Event attendance
  EVENT_REGISTER: 'event_register',
  EVENT_CHECKIN: 'event_checkin',
  EVENT_COMPLETE_ATTEND: 'event_complete_attend',
  EARLY_BIRD: 'early_bird',
  
  // Platform engagement
  PROFILE_COMPLETE: 'profile_complete',
  FIRST_EVENT_CREATE: 'first_event_create',
  FIRST_EVENT_ATTEND: 'first_event_attend',
  EVENT_SHARE: 'event_share',
  EVENT_REVIEW: 'event_review',
  
  // Community
  INVITE_FRIEND: 'invite_friend',
  CUSTOM_QUESTIONS: 'custom_questions',
  WEEKLY_ACTIVE: 'weekly_active',
  
  // System
  MANUAL_ADJUSTMENT: 'manual_adjustment',
  ACHIEVEMENT_BONUS: 'achievement_bonus'
} as const

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES]

// Achievement types
export const ACHIEVEMENT_TYPES = {
  FIRST_STEPS: 'first_steps',
  PROFILE_COMPLETE: 'profile_complete', 
  FIRST_EVENT_CREATE: 'first_event_create',
  FIRST_EVENT_ATTEND: 'first_event_attend',
  HOST_HERO: 'host_hero',
  SOCIAL_BUTTERFLY: 'social_butterfly',
  EARLY_BIRD: 'early_bird',
  COMMUNITY_LEADER: 'community_leader',
  STREAK_MASTER: 'streak_master',
  EVENT_CREATOR: 'event_creator',
  SUPER_ATTENDEE: 'super_attendee',
  POINT_COLLECTOR: 'point_collector',
  LEVEL_ACHIEVER: 'level_achiever'
} as const

export type AchievementType = typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES]

class PointsService {
  
  /**
   * Award points to a user with full audit trail and risk assessment
   */
  async awardPoints(params: PointsEarnedEvent): Promise<{ success: boolean; transaction?: PointsTransaction; error?: string }> {
    try {
      // 1. Get points rule for this transaction type
      const rule = await this.getPointsRule(params.transactionType)
      if (!rule) {
        return { success: false, error: `No rule found for transaction type: ${params.transactionType}` }
      }

      // 2. Calculate final points (including multipliers)
      const finalPoints = await this.calculatePointsWithMultipliers(params.userId, rule, params.points || rule.basePoints)

      // 3. Perform risk assessment
      const riskAssessment = await this.assessTransactionRisk(params.userId, params.transactionType, finalPoints)
      
      // 4. Check daily/event limits
      const withinLimits = await this.checkLimits(params.userId, params.transactionType, finalPoints, params.eventId)
      if (!withinLimits.allowed) {
        return { success: false, error: withinLimits.reason }
      }

      // 5. Create transaction record
      const transaction = await this.createTransaction({
        userId: params.userId,
        eventId: params.eventId,
        pointsEarned: finalPoints,
        transactionType: params.transactionType as any,
        description: params.description,
        metadata: params.metadata || {},
        riskScore: riskAssessment.score,
        status: riskAssessment.recommendation === 'block' ? 'flagged' : 'completed'
      })

      // 6. Check for achievements
      if (transaction.status === 'completed') {
        await this.checkAndAwardAchievements(params.userId, params.transactionType, finalPoints)
      }

      return { success: true, transaction }

    } catch (error) {
      console.error('Error awarding points:', error)
      return { success: false, error: 'Failed to award points' }
    }
  }

  /**
   * Get user's current points and level information
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      const result = await db.select()
        .from(userPoints)
        .where(eq(userPoints.userId, userId))
        .limit(1)

      return result[0] || null
    } catch (error) {
      console.error('Error getting user points:', error)
      return null
    }
  }

  /**
   * Get user's transaction history with pagination
   */
  async getUserTransactions(userId: string, limit = 50, offset = 0): Promise<PointsTransaction[]> {
    try {
      return await db.select()
        .from(pointsTransactions)
        .where(eq(pointsTransactions.userId, userId))
        .orderBy(desc(pointsTransactions.createdAt))
        .limit(limit)
        .offset(offset)
    } catch (error) {
      console.error('Error getting user transactions:', error)
      return []
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(timeframe: 'week' | 'month' | 'all' = 'all', limit = 100): Promise<Array<{ user: any; points: number; level: number }>> {
    try {
      let dateFilter = sql`true`
      
      if (timeframe === 'week') {
        dateFilter = sql`${pointsTransactions.createdAt} >= NOW() - INTERVAL '7 days'`
      } else if (timeframe === 'month') {
        dateFilter = sql`${pointsTransactions.createdAt} >= NOW() - INTERVAL '30 days'`
      }

      const query = timeframe === 'all' 
        ? db.select({
            userId: userPoints.userId,
            totalPoints: userPoints.totalPoints,
            currentLevel: userPoints.currentLevel
          })
          .from(userPoints)
          .orderBy(desc(userPoints.totalPoints))
          .limit(limit)
        : db.select({
            userId: pointsTransactions.userId,
            totalPoints: sql<number>`sum(${pointsTransactions.pointsEarned})`,
            currentLevel: sql<number>`1` // For period-based, we'll calculate level from points
          })
          .from(pointsTransactions)
          .where(and(
            eq(pointsTransactions.status, 'completed'),
            dateFilter
          ))
          .groupBy(pointsTransactions.userId)
          .orderBy(desc(sql`sum(${pointsTransactions.pointsEarned})`))
          .limit(limit)

      return await query as any
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return []
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      return await db.select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.achievedAt))
    } catch (error) {
      console.error('Error getting user achievements:', error)
      return []
    }
  }

  /**
   * Calculate level information from points
   */
  calculateLevel(totalPoints: number): UserLevel {
    const level = Math.max(1, Math.floor(totalPoints / 100) + 1)
    const progress = totalPoints % 100
    const nextLevelPoints = 100 - progress
    const totalPointsForLevel = (level - 1) * 100

    return {
      level,
      progress,
      nextLevelPoints,
      totalPointsForLevel
    }
  }

  /**
   * Assess risk for a transaction
   */
  private async assessTransactionRisk(userId: string, transactionType: string, points: number): Promise<RiskAssessment> {
    try {
      const flags: string[] = []
      let score = 0

      // Get user security record
      const security = await this.getUserSecurity(userId)
      
      // Base risk from user's existing score
      score += security?.riskScore || 0

      // Check for suspicious velocity (too many points too quickly)
      const recentTransactions = await db.select()
        .from(pointsTransactions)
        .where(and(
          eq(pointsTransactions.userId, userId),
          gte(pointsTransactions.createdAt, sql`NOW() - INTERVAL '1 hour'`)
        ))

      if (recentTransactions.length > 10) {
        flags.push('high_velocity')
        score += 20
      }

      // Check for unusual point amounts
      if (points > 500) {
        flags.push('high_value_transaction')
        score += 10
      }

      // Check for repeated same-type transactions
      const sameTypeRecent = recentTransactions.filter(t => t.transactionType === transactionType)
      if (sameTypeRecent.length > 5) {
        flags.push('repeated_transaction_type')
        score += 15
      }

      // IP address consistency check would go here
      // Device fingerprinting would go here

      score = Math.min(100, score)

      const recommendation = score >= 80 ? 'block' : score >= 50 ? 'review' : 'allow'

      return { score, flags, recommendation }

    } catch (error) {
      console.error('Error assessing risk:', error)
      return { score: 0, flags: [], recommendation: 'allow' }
    }
  }

  /**
   * Check daily and per-event limits
   */
  private async checkLimits(userId: string, transactionType: string, points: number, eventId?: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const rule = await this.getPointsRule(transactionType)
      if (!rule) return { allowed: true }

      // Check daily limit
      if (rule.maxDailyEarnings) {
        const todayTotal = await db.select({ total: sum(pointsTransactions.pointsEarned) })
          .from(pointsTransactions)
          .where(and(
            eq(pointsTransactions.userId, userId),
            eq(pointsTransactions.status, 'completed'),
            gte(pointsTransactions.createdAt, sql`CURRENT_DATE`)
          ))

        const currentTotal = Number(todayTotal[0]?.total || 0)
        if (currentTotal + points > rule.maxDailyEarnings) {
          return { allowed: false, reason: 'Daily earning limit exceeded' }
        }
      }

      // Check per-event limit
      if (rule.maxPerEvent && eventId) {
        const eventTotal = await db.select({ total: sum(pointsTransactions.pointsEarned) })
          .from(pointsTransactions)
          .where(and(
            eq(pointsTransactions.userId, userId),
            eq(pointsTransactions.eventId, eventId),
            eq(pointsTransactions.status, 'completed')
          ))

        const currentEventTotal = Number(eventTotal[0]?.total || 0)
        if (currentEventTotal + points > rule.maxPerEvent) {
          return { allowed: false, reason: 'Per-event earning limit exceeded' }
        }
      }

      return { allowed: true }
    } catch (error) {
      console.error('Error checking limits:', error)
      return { allowed: true } // Allow on error to avoid blocking legitimate users
    }
  }

  /**
   * Calculate points with multipliers
   */
  private async calculatePointsWithMultipliers(userId: string, rule: PointsRule, basePoints: number): Promise<number> {
    try {
      let finalPoints = basePoints
      const security = await this.getUserSecurity(userId)
      
      // Apply verification level multipliers
      const verificationMultipliers = {
        'none': 0.5,
        'email': 1.0,
        'phone': 1.1,
        'social': 1.2,
        'id': 1.3,
        'kyc': 1.5
      }

      const multiplier = verificationMultipliers[security?.verificationLevel || 'none'] || 1.0
      finalPoints = Math.floor(finalPoints * multiplier)

      // Apply risk-based adjustments
      if (security?.riskScore && security.riskScore > 30) {
        const riskMultiplier = Math.max(0.1, 1 - (security.riskScore / 100))
        finalPoints = Math.floor(finalPoints * riskMultiplier)
      }

      return Math.max(1, finalPoints) // Minimum 1 point
    } catch (error) {
      console.error('Error calculating multipliers:', error)
      return basePoints
    }
  }

  /**
   * Check and award achievements
   */
  private async checkAndAwardAchievements(userId: string, transactionType: string, points: number): Promise<void> {
    try {
      const achievements: Achievement[] = []

      // Get current user data
      const userPointsData = await this.getUserPoints(userId)
      const userTransactions = await db.select({ count: count() })
        .from(pointsTransactions)
        .where(and(
          eq(pointsTransactions.userId, userId),
          eq(pointsTransactions.status, 'completed')
        ))

      const transactionCount = userTransactions[0]?.count || 0
      const totalPoints = userPointsData?.totalPoints || 0

      // First event created
      if (transactionType === TRANSACTION_TYPES.EVENT_CREATE) {
        const eventCreationCount = await db.select({ count: count() })
          .from(pointsTransactions)
          .where(and(
            eq(pointsTransactions.userId, userId),
            eq(pointsTransactions.transactionType, 'event_create'),
            eq(pointsTransactions.status, 'completed')
          ))

        if (eventCreationCount[0]?.count === 1) {
          achievements.push({
            type: ACHIEVEMENT_TYPES.FIRST_EVENT_CREATE,
            name: 'Event Creator',
            description: 'Created your first event',
            points: 25
          })
        }
      }

      // Point collector milestones
      if (totalPoints >= 1000 && totalPoints < 1000 + points) {
        achievements.push({
          type: ACHIEVEMENT_TYPES.POINT_COLLECTOR,
          name: 'Point Collector',
          description: 'Earned 1,000 points',
          points: 50
        })
      }

      // Level achievements
      const newLevel = this.calculateLevel(totalPoints).level
      const previousLevel = this.calculateLevel(totalPoints - points).level
      
      if (newLevel > previousLevel) {
        achievements.push({
          type: ACHIEVEMENT_TYPES.LEVEL_ACHIEVER,
          name: `Level ${newLevel} Achiever`,
          description: `Reached level ${newLevel}`,
          points: newLevel * 10,
          metadata: { level: newLevel }
        })
      }

      // Award achievements
      for (const achievement of achievements) {
        await this.awardAchievement(userId, achievement)
      }

    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  /**
   * Award an achievement to a user
   */
  private async awardAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      // Check if user already has this achievement
      const existing = await db.select()
        .from(userAchievements)
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementType, achievement.type as any)
        ))
        .limit(1)

      if (existing.length > 0) return

      // Award the achievement
      await db.insert(userAchievements).values({
        userId,
        achievementType: achievement.type as any,
        achievementName: achievement.name,
        description: achievement.description,
        pointsEarned: achievement.points,
        metadata: achievement.metadata || {}
      })

      // Award bonus points for the achievement
      if (achievement.points > 0) {
        await this.awardPoints({
          userId,
          transactionType: TRANSACTION_TYPES.ACHIEVEMENT_BONUS,
          points: achievement.points,
          description: `Achievement bonus: ${achievement.name}`,
          metadata: { achievementType: achievement.type }
        })
      }

    } catch (error) {
      console.error('Error awarding achievement:', error)
    }
  }

  /**
   * Get points rule by transaction type
   */
  private async getPointsRule(transactionType: string): Promise<PointsRule | null> {
    try {
      const result = await db.select()
        .from(pointsRules)
        .where(and(
          eq(pointsRules.ruleType, transactionType),
          eq(pointsRules.isActive, true)
        ))
        .limit(1)

      return result[0] || null
    } catch (error) {
      console.error('Error getting points rule:', error)
      return null
    }
  }

  /**
   * Get or create user security record
   */
  private async getUserSecurity(userId: string): Promise<UserSecurityType | null> {
    try {
      const result = await db.select()
        .from(userSecurity)
        .where(eq(userSecurity.userId, userId))
        .limit(1)

      return result[0] || null
    } catch (error) {
      console.error('Error getting user security:', error)
      return null
    }
  }

  /**
   * Create a points transaction
   */
  private async createTransaction(data: NewPointsTransaction): Promise<PointsTransaction> {
    const result = await db.insert(pointsTransactions)
      .values(data)
      .returning()

    return result[0]
  }

  /**
   * Update user risk score
   */
  async updateUserRiskScore(userId: string, newScore: number, flags: string[] = []): Promise<void> {
    try {
      await db.update(userSecurity)
        .set({
          riskScore: newScore,
          redFlags: flags,
          lastRiskAssessment: new Date()
        })
        .where(eq(userSecurity.userId, userId))
    } catch (error) {
      console.error('Error updating user risk score:', error)
    }
  }

  /**
   * Get platform-wide statistics
   */
  async getPlatformStats(): Promise<{
    totalPointsAwarded: number
    totalTransactions: number
    activeUsers: number
    averageUserLevel: number
  }> {
    try {
      const [totalPoints, transactionCount, userCount, avgLevel] = await Promise.all([
        db.select({ total: sum(pointsTransactions.pointsEarned) })
          .from(pointsTransactions)
          .where(eq(pointsTransactions.status, 'completed')),
        
        db.select({ count: count() })
          .from(pointsTransactions)
          .where(eq(pointsTransactions.status, 'completed')),
        
        db.select({ count: count() })
          .from(userPoints)
          .where(gte(userPoints.totalPoints, 1)),
        
        db.select({ avg: sql<number>`avg(${userPoints.currentLevel})` })
          .from(userPoints)
          .where(gte(userPoints.totalPoints, 1))
      ])

      return {
        totalPointsAwarded: Number(totalPoints[0]?.total || 0),
        totalTransactions: transactionCount[0]?.count || 0,
        activeUsers: userCount[0]?.count || 0,
        averageUserLevel: Number(avgLevel[0]?.avg || 1)
      }
    } catch (error) {
      console.error('Error getting platform stats:', error)
      return { totalPointsAwarded: 0, totalTransactions: 0, activeUsers: 0, averageUserLevel: 1 }
    }
  }
}

// Export singleton instance
export const pointsService = new PointsService()

// Convenience functions for common operations
export async function awardEventCreationPoints(userId: string, eventId: string): Promise<void> {
  await pointsService.awardPoints({
    userId,
    eventId,
    transactionType: TRANSACTION_TYPES.EVENT_CREATE,
    points: 50,
    description: 'Points for creating a new event'
  })
}

export async function awardOrganizerCheckInBonus(organizerId: string, eventId: string): Promise<void> {
  await pointsService.awardPoints({
    userId: organizerId,
    eventId,
    transactionType: TRANSACTION_TYPES.ORGANIZER_CHECKIN_BONUS,
    points: 25,
    description: 'Organizer bonus for attendee check-in'
  })
}

export async function awardEventCheckinPoints(userId: string, eventId: string): Promise<void> {
  await pointsService.awardPoints({
    userId,
    eventId,
    transactionType: TRANSACTION_TYPES.EVENT_CHECKIN,
    points: 25,
    description: 'Points for checking into an event'
  })
}

export async function awardAttendeeMillestonePoints(userId: string, eventId: string, attendeeCount: number): Promise<void> {
  let transactionType: TransactionType
  let points: number
  let description: string

  if (attendeeCount >= 100) {
    transactionType = TRANSACTION_TYPES.ATTENDEE_MILESTONE_100
    points = 500
    description = 'Milestone bonus: 100+ attendees'
  } else if (attendeeCount >= 50) {
    transactionType = TRANSACTION_TYPES.ATTENDEE_MILESTONE_50
    points = 200
    description = 'Milestone bonus: 50+ attendees'
  } else if (attendeeCount >= 25) {
    transactionType = TRANSACTION_TYPES.ATTENDEE_MILESTONE_25
    points = 100
    description = 'Milestone bonus: 25+ attendees'
  } else if (attendeeCount >= 10) {
    transactionType = TRANSACTION_TYPES.ATTENDEE_MILESTONE_10
    points = 50
    description = 'Milestone bonus: 10+ attendees'
  } else {
    return // No milestone reached
  }

  await pointsService.awardPoints({
    userId,
    eventId,
    transactionType,
    points,
    description,
    metadata: { attendeeCount }
  })
} 
import { Coins, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { UserPoints } from '@/lib/db/schema'

interface PointsIndicatorServerProps {
  userPoints: UserPoints | null
  showLevel?: boolean
  className?: string
}

export function PointsIndicatorServer({ 
  userPoints, 
  showLevel = true, 
  className = "" 
}: PointsIndicatorServerProps) {
  // Don't show anything if no points data
  if (!userPoints) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-sm">
        <Coins className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground">
          {userPoints.totalPoints.toLocaleString()}
        </span>
      </div>
      
      {showLevel && (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <Trophy className="w-3 h-3" />
          L{userPoints.currentLevel}
        </Badge>
      )}
    </div>
  )
} 
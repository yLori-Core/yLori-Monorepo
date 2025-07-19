import { NextRequest, NextResponse } from 'next/server'
import { getEventQuestions } from '@/lib/db/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const questions = await getEventQuestions(eventId)
    
    return NextResponse.json({
      success: true,
      questions
    })
  } catch (error) {
    console.error('Error fetching event questions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch questions'
      },
      { status: 500 }
    )
  }
} 
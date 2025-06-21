import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all interview sessions
    const sessions = await prisma.interviewSession.findMany({
      select: {
        id: true,
        candidate_name: true,
        candidate_email: true,
        position: true,
        vapi_call_id: true,
        status: true,
        created_at: true,
        started_at: true,
        completed_at: true,
        vapi_summary: true,
        analysis_score: true,
        final_transcript: true,
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 20
    })

    const sessionCount = await prisma.interviewSession.count()

    return NextResponse.json({
      success: true,
      totalSessions: sessionCount,
      recentSessions: sessions,
      message: `Found ${sessionCount} sessions in the database`
    })

  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error },
      { status: 500 }
    )
  }
}

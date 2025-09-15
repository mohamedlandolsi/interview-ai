import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

/**
 * Protected API route for recent interviews
 * GET /api/dashboard/recent-interviews
 */
export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 60, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  // Verify authentication
  const { user, response } = await verifyAuthentication(request)
  if (response) return response

  try {
    const userId = user.id

    // Get URL parameters for pagination
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50) // Max 50
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Fetch recent interviews for this user
    const interviews = await prisma.interviewSession.findMany({
      where: {
        interviewer_id: userId
      },
      select: {
        id: true,
        candidate_name: true,
        candidate_email: true,
        position: true,
        status: true,
        overall_score: true,
        analysis_score: true,
        duration: true,
        created_at: true,
        started_at: true,
        completed_at: true,
        template: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const totalCount = await prisma.interviewSession.count({
      where: {
        interviewer_id: userId
      }
    })

    // Transform data for frontend
    const transformedInterviews = interviews.map((interview, index) => {
      // Generate interview ID in the format INT-XXX
      const paddedIndex = String(totalCount - offset - index).padStart(3, '0')
      const interviewId = `INT-${paddedIndex}`

      // Determine the best score to display
      let displayScore: number | null = null
      if (interview.overall_score !== null) {
        displayScore = Math.round(interview.overall_score)
      } else if (interview.analysis_score !== null) {
        displayScore = Math.round(interview.analysis_score)
      }

      // Format duration
      let displayDuration = '—'
      if (interview.duration) {
        displayDuration = `${interview.duration} min`
      } else if (interview.started_at && interview.completed_at) {
        const durationMs = new Date(interview.completed_at).getTime() - new Date(interview.started_at).getTime()
        const durationMin = Math.round(durationMs / (1000 * 60))
        displayDuration = `${durationMin} min`
      }

      return {
        id: interviewId,
        sessionId: interview.id, // Keep original session ID for actions
        candidate: interview.candidate_name,
        candidateEmail: interview.candidate_email,
        position: interview.position,
        templateTitle: interview.template?.title || 'General Interview',
        date: interview.created_at.toISOString(),
        duration: displayDuration,
        status: interview.status,
        score: displayScore,
        startedAt: interview.started_at?.toISOString() || null,
        completedAt: interview.completed_at?.toISOString() || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        interviews: transformedInterviews,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    })
  } catch (error) {
    console.error('Recent interviews fetch error:', error)
    return NextResponse.json(
      {
        error: 'Fetch Error',
        message: 'Failed to fetch recent interviews',
        code: 'INTERVIEWS_FETCH_ERROR',
      },
      { status: 500 }
    )
  }
}

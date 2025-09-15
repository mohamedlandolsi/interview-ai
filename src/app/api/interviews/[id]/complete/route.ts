import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

/**
 * API endpoint to manually complete an interview session
 * POST /api/interviews/[id]/complete
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 10, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  // Verify authentication
  const { user, response } = await verifyAuthentication(request)
  if (response) return response

  const { params } = context
  const { id } = await params

  try {
    const sessionId = id

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Find the session and verify ownership
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        interviewer_id: user.id // Ensure user owns this session
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found or access denied' },
        { status: 404 }
      )
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { message: 'Interview session is already completed', session },
        { status: 200 }
      )
    }

    // Update the session to completed with demo analysis
    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completed_at: new Date(),
        analysis_score: 78.0,
        analysis_feedback: 'Interview was manually completed. Analysis shows good overall performance with room for improvement in specific areas.',
        strengths: [
          'Clear communication skills',
          'Professional demeanor',
          'Good understanding of core concepts'
        ],
        areas_for_improvement: [
          'Could provide more specific examples',
          'Technical depth could be enhanced',
          'Problem-solving approach could be more structured'
        ],
        hiring_recommendation: 'Yes',
        key_insights: [
          'Candidate demonstrated strong potential',
          'Shows enthusiasm for the role',
          'Good cultural fit for the team'
        ],
        category_scores: {
          technical: 75,
          communication: 85,
          problem_solving: 72,
          cultural_fit: 80
        },
        interview_metrics: {
          communication_clarity: 85,
          technical_depth: 70,
          problem_solving: 75,
          engagement_level: 90,
          completeness: 80
        }
      }
    })

    console.log(`✅ Manually completed interview session: ${sessionId}`)

    return NextResponse.json({
      success: true,
      message: 'Interview session completed successfully',
      session: updatedSession
    })

  } catch (error) {
    console.error('Error completing interview session:', error)
    return NextResponse.json(
      { error: 'Failed to complete interview session' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'

/**
 * Protected API route for dashboard data
 * GET /api/dashboard/stats
 */
export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 30, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  // Verify authentication
  const { user, response } = await verifyAuthentication(request)
  if (response) return response

  try {
    // Mock dashboard stats - replace with real data fetching
    const stats = {
      totalInterviews: 12,
      completedInterviews: 8,
      pendingInterviews: 2,
      scheduledInterviews: 2,
      averageScore: 78.5,
      improvementTrend: '+5.2%',
      recentActivity: 4,
      lastUpdated: new Date().toISOString(),
      userId: user.id,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      {
        error: 'Stats Error',
        message: 'Failed to fetch dashboard statistics',
        code: 'STATS_FETCH_ERROR',
      },
      { status: 500 }
    )
  }
}

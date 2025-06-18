import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'

/**
 * Protected API route for dashboard data
 * GET /api/dashboard
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
    // Mock dashboard data - replace with real data fetching
    const dashboardData = {
      stats: {
        totalInterviews: 12,
        completedInterviews: 8,
        pendingInterviews: 2,
        scheduledInterviews: 2,
        averageScore: 78.5,
        improvementTrend: '+5.2%',
        recentActivity: 4,
      },
      recentInterviews: [
        {
          id: '1',
          title: 'Software Engineering Interview',
          date: new Date().toISOString(),
          status: 'completed',
          score: 85,
        },
        {
          id: '2',
          title: 'Product Manager Interview',
          date: new Date().toISOString(),
          status: 'pending',
          score: null,
        },
      ],
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || 'User',
      },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      {
        error: 'Dashboard Error',
        message: 'Failed to fetch dashboard data',
        code: 'DASHBOARD_FETCH_ERROR',
      },
      { status: 500 }
    )
  }
}

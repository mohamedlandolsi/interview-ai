import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

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
    const userId = user.id

    // Get current date and calculate date ranges
    const now = new Date()
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all interviews for this user
    const [
      totalInterviews,
      currentMonthInterviews,
      lastMonthInterviews,
      completedInterviews,
      interviewsWithDuration
    ] = await Promise.all([
      // Total interviews count
      prisma.interviewSession.count({
        where: { interviewer_id: userId }
      }),

      // Current month interviews
      prisma.interviewSession.count({
        where: {
          interviewer_id: userId,
          created_at: { gte: startOfCurrentMonth }
        }
      }),

      // Last month interviews
      prisma.interviewSession.count({
        where: {
          interviewer_id: userId,
          created_at: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Completed interviews with scores
      prisma.interviewSession.findMany({
        where: {
          interviewer_id: userId,
          status: 'completed',
          completed_at: { not: null }
        },
        select: {
          overall_score: true,
          analysis_score: true
        }
      }),

      // Interviews with duration data
      prisma.interviewSession.findMany({
        where: {
          interviewer_id: userId,
          status: 'completed',
          duration: { not: null }
        },
        select: {
          duration: true
        }
      })
    ])

    // Calculate monthly growth
    const monthlyGrowthNum = lastMonthInterviews > 0 
      ? ((currentMonthInterviews - lastMonthInterviews) / lastMonthInterviews * 100)
      : currentMonthInterviews > 0 ? 100.0 : 0.0

    // Calculate success rate (interviews that have been completed successfully)
    const completedCount = completedInterviews.length
    const successRateNum = totalInterviews > 0 
      ? ((completedCount / totalInterviews) * 100)
      : 0.0

    // Calculate average duration
    const validDurations = interviewsWithDuration
      .map(i => i.duration)
      .filter((duration): duration is number => duration !== null)
    
    const avgDuration = validDurations.length > 0
      ? Math.round(validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length)
      : 0

    // Calculate success rate trend (comparing with historical data)
    // For simplicity, we'll calculate a mock trend based on recent performance
    const recentCompletions = await prisma.interviewSession.count({
      where: {
        interviewer_id: userId,
        status: 'completed',
        completed_at: { gte: startOfCurrentMonth }
      }
    })

    const currentMonthSuccessRate = currentMonthInterviews > 0 
      ? (recentCompletions / currentMonthInterviews) * 100 
      : 0

    const lastMonthCompletions = await prisma.interviewSession.count({
      where: {
        interviewer_id: userId,
        status: 'completed',
        completed_at: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    })

    const lastMonthSuccessRate = lastMonthInterviews > 0
      ? (lastMonthCompletions / lastMonthInterviews) * 100
      : 0

    const successRateTrendNum = lastMonthSuccessRate > 0
      ? ((currentMonthSuccessRate - lastMonthSuccessRate) / lastMonthSuccessRate * 100)
      : currentMonthSuccessRate > 0 ? 100.0 : 0.0

    // Calculate duration trend
    const currentMonthDurations = await prisma.interviewSession.findMany({
      where: {
        interviewer_id: userId,
        duration: { not: null },
        created_at: { gte: startOfCurrentMonth }
      },
      select: { duration: true }
    })

    const lastMonthDurations = await prisma.interviewSession.findMany({
      where: {
        interviewer_id: userId,
        duration: { not: null },
        created_at: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      },
      select: { duration: true }
    })

    const currentMonthAvgDuration = currentMonthDurations.length > 0
      ? currentMonthDurations.reduce((sum, i) => sum + (i.duration || 0), 0) / currentMonthDurations.length
      : 0

    const lastMonthAvgDuration = lastMonthDurations.length > 0
      ? lastMonthDurations.reduce((sum, i) => sum + (i.duration || 0), 0) / lastMonthDurations.length
      : 0

    const durationTrendNum = lastMonthAvgDuration > 0
      ? ((currentMonthAvgDuration - lastMonthAvgDuration) / lastMonthAvgDuration * 100)
      : currentMonthAvgDuration > 0 ? 100.0 : 0.0

    const stats = {
      totalInterviews,
      thisMonth: currentMonthInterviews,
      monthlyGrowth: `${monthlyGrowthNum >= 0 ? '+' : ''}${monthlyGrowthNum.toFixed(1)}%`,
      successRate: `${successRateNum.toFixed(1)}%`,
      successRateTrend: `${successRateTrendNum >= 0 ? '+' : ''}${successRateTrendNum.toFixed(1)}%`,
      avgDuration: `${avgDuration} min`,
      durationTrend: `${durationTrendNum >= 0 ? '+' : ''}${durationTrendNum.toFixed(1)}%`,
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

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

/**
 * Protected API route for dashboard chart data
 * GET /api/dashboard/charts
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

    // Get the last 6 months of data
    const now = new Date()
    const months = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      })
    }

    // Fetch interview trends data
    const interviewTrends = await Promise.all(
      months.map(async (month) => {
        const [total, completed] = await Promise.all([
          prisma.interviewSession.count({
            where: {
              interviewer_id: userId,
              created_at: {
                gte: month.start,
                lte: month.end
              }
            }
          }),
          prisma.interviewSession.count({
            where: {
              interviewer_id: userId,
              status: 'completed',
              created_at: {
                gte: month.start,
                lte: month.end
              }
            }
          })
        ])

        return {
          month: month.label,
          interviews: total,
          completed: completed,
          successRate: total > 0 ? Math.round((completed / total) * 100) : 0
        }
      })
    )

    // Fetch weekly trends for the last 4 weeks
    const weeks = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7 + 6))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: `Week ${4 - i}`
      })
    }

    const weeklyTrends = await Promise.all(
      weeks.map(async (week) => {
        const [total, completed] = await Promise.all([
          prisma.interviewSession.count({
            where: {
              interviewer_id: userId,
              created_at: {
                gte: week.start,
                lte: week.end
              }
            }
          }),
          prisma.interviewSession.count({
            where: {
              interviewer_id: userId,
              status: 'completed',
              created_at: {
                gte: week.start,
                lte: week.end
              }
            }
          })
        ])

        return {
          week: week.label,
          interviews: total,
          completed: completed,
          successRate: total > 0 ? Math.round((completed / total) * 100) : 0
        }
      })
    )

    // Get status distribution
    const statusCounts = await prisma.interviewSession.groupBy({
      by: ['status'],
      where: {
        interviewer_id: userId
      },
      _count: {
        id: true
      }
    })

    const statusDistribution = statusCounts.map(item => ({
      status: item.status,
      count: item._count.id
    }))

    // Get daily activity for the last 30 days
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)

      last30Days.push({
        date: date,
        nextDay: nextDay,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }

    const dailyActivity = await Promise.all(
      last30Days.map(async (day) => {
        const count = await prisma.interviewSession.count({
          where: {
            interviewer_id: userId,
            created_at: {
              gte: day.date,
              lt: day.nextDay
            }
          }
        })

        return {
          date: day.label,
          interviews: count
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        interviewTrends,
        weeklyTrends,
        statusDistribution,
        dailyActivity
      },
    })
  } catch (error) {
    console.error('Dashboard charts error:', error)
    return NextResponse.json(
      {
        error: 'Charts Error',
        message: 'Failed to fetch dashboard chart data',
        code: 'CHARTS_FETCH_ERROR',
      },
      { status: 500 }
    )
  }
}
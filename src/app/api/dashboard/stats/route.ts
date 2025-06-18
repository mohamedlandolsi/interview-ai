import { NextRequest, NextResponse } from 'next/server'
import { createProtectedHandler, handleCors, rateLimit } from '@/lib/api-auth'

/**
 * Protected API route for dashboard data
 * GET /api/dashboard/stats
 */
export const GET = createProtectedHandler({
  methods: ['GET'],
  handler: async (request: NextRequest, { user }) => {
    // Handle CORS
    const corsResponse = handleCors(request)
    if (corsResponse) return corsResponse

    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, { maxRequests: 50, windowMs: 60000 })
    if (rateLimitResponse) return rateLimitResponse

    try {
      // Mock dashboard stats - replace with real data fetching
      const stats = {
        totalInterviews: 42,
        averageScore: 85,
        highPerformers: 8,
        avgDuration: 45,
        userId: user.id,
        lastUpdated: new Date().toISOString(),
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
  },
})

/**
 * Update dashboard preferences
 * POST /api/dashboard/stats
 */
export const POST = createProtectedHandler({
  methods: ['POST'],
  handler: async (request: NextRequest, { user }) => {
    try {
      const body = await request.json()

      // Validate preferences
      const validPreferences = ['theme', 'notifications', 'layout']
      const preferences = Object.keys(body).filter(key => validPreferences.includes(key))

      if (preferences.length === 0) {
        return NextResponse.json(
          {
            error: 'Invalid Preferences',
            message: 'No valid preferences provided',
            code: 'INVALID_PREFERENCES',
            validPreferences,
          },
          { status: 400 }
        )
      }

      // Here you would save preferences to the database
      
      return NextResponse.json({
        success: true,
        message: 'Preferences updated successfully',
        data: { userId: user.id, updatedPreferences: preferences },
      })
    } catch (error) {
      console.error('Preferences update error:', error)
      return NextResponse.json(
        {
          error: 'Update Error',
          message: 'Failed to update preferences',
          code: 'PREFERENCES_UPDATE_ERROR',
        },
        { status: 500 }
      )
    }
  },
})

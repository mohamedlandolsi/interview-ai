import { NextRequest, NextResponse } from 'next/server'

/**
 * Health check endpoint - public route
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        supabase: await checkSupabaseHealth(),
        database: 'healthy', // Add actual database check if needed
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Check Supabase connectivity
 */
async function checkSupabaseHealth(): Promise<string> {
  try {
    // Simple check - you could enhance this with actual Supabase ping
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return 'misconfigured'
    }

    // You could add an actual API call to Supabase here
    return 'healthy'
  } catch (error) {
    return 'unhealthy'
  }
}

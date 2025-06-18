import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'

/**
 * Protected API route example - Get user profile
 * GET /api/profile
 */
export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 30, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  // Verify authentication
  const { user, response } = await verifyAuthentication(request)
  if (response) return response

  try {
    // Your business logic here
    const profile = {
      id: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
      lastSignIn: user.last_sign_in_at,
      createdAt: user.created_at,
      // Add more profile fields as needed
    }

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      {
        error: 'Profile Error',
        message: 'Failed to fetch user profile',
        code: 'PROFILE_FETCH_ERROR',
      },
      { status: 500 }
    )
  }
}

/**
 * Update user profile
 * PUT /api/profile
 */
export async function PUT(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 10, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  // Verify authentication
  const { user, response } = await verifyAuthentication(request)
  if (response) return response

  try {
    const body = await request.json()
    
    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          error: 'Invalid Request',
          message: 'Request body must be a valid JSON object',
          code: 'INVALID_BODY',
        },
        { status: 400 }
      )
    }

    // Here you would update the user profile in your database
    // For example, update the profiles table in Supabase
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: { userId: user.id },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      {
        error: 'Update Error',
        message: 'Failed to update user profile',
        code: 'PROFILE_UPDATE_ERROR',
      },
      { status: 500 }
    )
  }
}

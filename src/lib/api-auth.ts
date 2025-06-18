import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * API Authentication Error Types
 */
export interface ApiAuthError {
  error: string
  message: string
  code: string
  statusCode: number
}

/**
 * Authenticated API Request Context
 */
export interface AuthenticatedRequest {
  user: User
  userId: string
  userEmail: string
}

/**
 * API Response with authentication error
 */
export function createAuthErrorResponse(
  error: string,
  message: string,
  code: string = 'AUTH_ERROR',
  statusCode: number = 401
): NextResponse {
  const response = NextResponse.json(
    {
      error,
      message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

/**
 * Extract user authentication from API request
 */
export async function getAuthenticatedUser(_request: NextRequest): Promise<{
  user: User | null
  error: ApiAuthError | null
}> {
  try {
    // Create Supabase client for API routes
    const supabase = await createClient()

    // Get session from request
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return {
        user: null,
        error: {
          error: 'Session Error',
          message: 'Failed to retrieve session',
          code: 'SESSION_ERROR',
          statusCode: 401,
        },
      }
    }

    if (!session) {
      return {
        user: null,
        error: {
          error: 'No Session',
          message: 'No active session found',
          code: 'NO_SESSION',
          statusCode: 401,
        },
      }
    }

    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      return {
        user: null,
        error: {
          error: 'User Error',
          message: 'Failed to retrieve user information',
          code: 'USER_ERROR',
          statusCode: 401,
        },
      }
    }

    if (!user) {
      return {
        user: null,
        error: {
          error: 'No User',
          message: 'No user found in session',
          code: 'NO_USER',
          statusCode: 401,
        },
      }
    }

    return {
      user,
      error: null,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      user: null,
      error: {
        error: 'Internal Error',
        message: 'Internal authentication error',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    }
  }
}

/**
 * Verify user authentication and return user data or error response
 */
export async function verifyAuthentication(
  request: NextRequest
): Promise<{ user: User; response: null } | { user: null; response: NextResponse }> {
  const { user, error } = await getAuthenticatedUser(request)

  if (error || !user) {
    const authError = error || {
      error: 'Authentication Required',
      message: 'You must be logged in to access this resource',
      code: 'AUTH_REQUIRED',
      statusCode: 401,
    }

    return {
      user: null,
      response: createAuthErrorResponse(
        authError.error,
        authError.message,
        authError.code,
        authError.statusCode
      ),
    }
  }

  return {
    user,
    response: null,
  }
}

/**
 * Create authenticated API handler wrapper
 * This higher-order function automatically handles authentication for API routes
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, context: { user: User } & T) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    const { user, response } = await verifyAuthentication(request)

    if (response) {
      return response
    }

    try {
      return await handler(request, { user, ...context } as { user: User } & T)
    } catch (error) {
      console.error('API handler error:', error)
      return createAuthErrorResponse(
        'Internal Server Error',
        'An unexpected error occurred',
        'HANDLER_ERROR',
        500
      )
    }
  }
}

/**
 * Extract user information from request headers (set by middleware)
 */
export function getUserFromHeaders(request: NextRequest): {
  userId: string | null
  userEmail: string | null
} {
  const userId = request.headers.get('X-User-ID')
  const userEmail = request.headers.get('X-User-Email')

  return {
    userId,
    userEmail,
  }
}

/**
 * Validate API request method
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        error: 'Method Not Allowed',
        message: `Method ${request.method} is not allowed for this endpoint`,
        code: 'METHOD_NOT_ALLOWED',
        allowedMethods,
      },
      { status: 405 }
    )
  }
  return null
}

/**
 * Create a protected API route handler with method validation
 */
export function createProtectedHandler(options: {
  methods: string[]
  handler: (request: NextRequest, context: { user: User; params: any }) => Promise<NextResponse>
}) {
  return withAuth(async (request: NextRequest, context: { user: User; params: any }) => {
    // Validate HTTP method
    const methodError = validateMethod(request, options.methods)
    if (methodError) {
      return methodError
    }

    return await options.handler(request, { ...context, params: context.params || {} })
  })
}

/**
 * Rate limiting helper (basic implementation)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  request: NextRequest,
  options: { maxRequests: number; windowMs: number } = { maxRequests: 100, windowMs: 60000 }
): NextResponse | null {
  // Get client IP from headers (works in most deployment scenarios)
  const clientIP = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous'
  
  const key = clientIP
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (record) {
    if (now > record.resetTime) {
      // Reset window
      rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs })
    } else if (record.count >= options.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: 'Rate Limit Exceeded',
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        { status: 429 }
      )
    } else {
      // Increment count
      record.count++
    }
  } else {
    // First request
    rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs })
  }

  return null
}

/**
 * CORS helper for API routes
 */
export function setCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    return setCorsHeaders(response, request.headers.get('origin') || undefined)
  }
  return null
}

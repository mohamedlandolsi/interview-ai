import { NextRequest, NextResponse } from 'next/server'

/**
 * Development utilities for testing authentication flows
 * These should NOT be included in production builds
 */

interface AuthTestResult {
  success: boolean
  message: string
  details?: any
  timestamp: string
}

/**
 * Development route for testing authentication
 * GET /api/dev/auth-test
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Development endpoints disabled in production' },
      { status: 404 }
    )
  }

  /**
   * Test API authentication helper - internal function
   */
  async function testApiAuth(endpoint: string, options: {
    method?: string
    headers?: Record<string, string>
    body?: any
  } = {}): Promise<AuthTestResult> {
    try {
      const response = await fetch(endpoint, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      const data = await response.json()

      return {
        success: response.ok,
        message: `${options.method || 'GET'} ${endpoint} - ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: data,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error testing ${endpoint}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString(),
      }
    }
  }

  const results: AuthTestResult[] = []

  // Test public API endpoints
  const publicTests = [
    { endpoint: '/api/health', expected: 'Should work without auth' },
  ]

  // Test protected API endpoints
  const protectedTests = [
    { endpoint: '/api/profile', expected: 'Should require auth' },
  ]

  // Run tests
  for (const test of publicTests) {
    const result = await testApiAuth(`${request.nextUrl.origin}${test.endpoint}`)
    results.push({
      ...result,
      message: `${result.message} (${test.expected})`,
    })
  }

  for (const test of protectedTests) {
    const result = await testApiAuth(`${request.nextUrl.origin}${test.endpoint}`)
    results.push({
      ...result,
      message: `${result.message} (${test.expected})`,
    })
  }

  return NextResponse.json({
    testSuite: 'Authentication Flow Tests',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    },
  })
}

/**
 * Test session validation
 * POST /api/dev/auth-test
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Development endpoints disabled in production' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()
    const { sessionToken } = body

    if (!sessionToken) {
      return NextResponse.json({
        error: 'Missing session token',
        message: 'Provide a sessionToken in the request body',
      }, { status: 400 })
    }

    // Here you could add session validation logic
    // For now, just return the session info

    return NextResponse.json({
      message: 'Session test completed',
      sessionToken: sessionToken.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

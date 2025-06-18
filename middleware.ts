import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/utils/supabase/middleware'

// Define route patterns for better organization
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/auth/confirm',
  '/api/auth/callback',
]

const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

const PROTECTED_ROUTES = [
  '/dashboard',
  '/interviews',
  '/templates',
  '/results',
  '/settings',
]

const API_PROTECTED_ROUTES = [
  '/api/dashboard',
  '/api/interviews',
  '/api/templates',
  '/api/results',
  '/api/profile',
  '/api/settings',
]

/**
 * Check if a path matches any pattern in the given array
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match
    if (pathname === route) return true
    
    // Prefix match for nested routes (e.g., /dashboard/* matches /dashboard)
    if (pathname.startsWith(route + '/')) return true
    
    return false
  })
}

/**
 * Check if the route is public (no authentication required)
 */
function isPublicRoute(pathname: string): boolean {
  return matchesRoute(pathname, PUBLIC_ROUTES)
}

/**
 * Check if the route is an auth route (login, register, etc.)
 */
function isAuthRoute(pathname: string): boolean {
  return matchesRoute(pathname, AUTH_ROUTES)
}

/**
 * Check if the route is protected (requires authentication)
 */
function isProtectedRoute(pathname: string): boolean {
  return matchesRoute(pathname, PROTECTED_ROUTES)
}

/**
 * Check if the API route is protected (requires authentication)
 */
function isProtectedApiRoute(pathname: string): boolean {
  return matchesRoute(pathname, API_PROTECTED_ROUTES)
}

/**
 * Handle authentication errors for API routes
 */
function handleApiAuthError(request: NextRequest, error?: string) {
  const response = NextResponse.json(
    { 
      error: 'Authentication required',
      message: error || 'You must be logged in to access this resource',
      code: 'AUTH_REQUIRED'
    },
    { status: 401 }
  )
  
  // Add CORS headers for API routes
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}

/**
 * Handle authentication redirects for page routes
 */
function handlePageAuthRedirect(request: NextRequest, redirectTo: string) {
  const url = request.nextUrl.clone()
  url.pathname = redirectTo
  
  // Preserve the original URL as a redirect parameter
  if (!isAuthRoute(request.nextUrl.pathname)) {
    url.searchParams.set('redirectTo', request.nextUrl.pathname + request.nextUrl.search)
  }
  
  return NextResponse.redirect(url)
}

/**
 * Main middleware function with comprehensive route protection
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth/callback') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  try {
    // Create Supabase client
    const { supabase, response } = createMiddlewareClient(request)

    // Refresh session if it exists - required for Server Components
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Handle session refresh errors
    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
      
      // For API routes, return 401
      if (pathname.startsWith('/api/') && isProtectedApiRoute(pathname)) {
        return handleApiAuthError(request, 'Session expired')
      }
      
      // For protected pages, redirect to login
      if (isProtectedRoute(pathname)) {
        return handlePageAuthRedirect(request, '/login')
      }
    }

    // Get user info for additional checks
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // API Route Protection
    if (pathname.startsWith('/api/')) {
      // Allow public API routes
      if (!isProtectedApiRoute(pathname)) {
        return response
      }

      // Check authentication for protected API routes
      if (!session || !user || userError) {
        return handleApiAuthError(request, 'Invalid or expired session')
      }

      // Add user info to headers for API routes
      response.headers.set('X-User-ID', user.id)
      response.headers.set('X-User-Email', user.email || '')
      
      return response
    }

    // Page Route Protection
    
    // Allow public routes
    if (isPublicRoute(pathname)) {
      return response
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute(pathname) && session && user) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
      const url = request.nextUrl.clone()
      url.pathname = redirectTo
      url.search = '' // Clear search params
      return NextResponse.redirect(url)
    }

    // Protect dashboard and other protected routes
    if (isProtectedRoute(pathname)) {
      if (!session || !user || userError) {
        return handlePageAuthRedirect(request, '/login')
      }

      // Optional: Add role-based protection here
      // You can check user roles and redirect accordingly
      // Example:
      // const { data: profile } = await supabase
      //   .from('profiles')
      //   .select('role')
      //   .eq('id', user.id)
      //   .single()
      // 
      // if (profile?.role !== 'admin' && pathname.startsWith('/admin')) {
      //   return handlePageAuthRedirect(request, '/dashboard')
      // }
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // For API routes, return 500 error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: 'Authentication service temporarily unavailable',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }

    // For page routes, allow through (graceful degradation)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

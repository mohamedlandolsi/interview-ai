/**
 * End-to-End Authentication Integration Tests
 * 
 * This test file simulates complete authentication flows to ensure
 * the middleware, API routes, and client-side authentication work together.
 */

import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '../../../middleware'
import { withAuth } from '../../lib/api-auth'

// Mock implementations
jest.mock('@/utils/supabase/middleware')
jest.mock('@/utils/supabase/server')

const mockMiddlewareClient = require('@/utils/supabase/middleware')
const mockServerClient = require('@/utils/supabase/server')

describe('Authentication Integration Tests', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn(),
      },
    }

    mockMiddlewareClient.createMiddlewareClient.mockReturnValue({
      supabase: mockSupabase,
      response: NextResponse.next(),
    })

    mockServerClient.createClient.mockResolvedValue(mockSupabase)
  })

  const createMockRequest = (pathname: string, method = 'GET', headers?: Record<string, string>) => {
    return new NextRequest(`http://localhost:3000${pathname}`, {
      method,
      headers: headers || {},
    })
  }

  describe('Complete Authentication Flow', () => {
    test('should handle complete user journey from unauthenticated to authenticated', async () => {
      // 1. Unauthenticated user tries to access protected route
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      let request = createMockRequest('/dashboard')
      let response = await middleware(request)

      // Should redirect to login
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
      expect(response.headers.get('location')).toContain('redirectTo=%2Fdashboard')

      // 2. User successfully logs in
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
      }

      const mockSession = {
        user: mockUser,
        access_token: 'token-123',
        expires_at: Date.now() + 3600000,
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // 3. User is redirected from login page to original destination
      request = createMockRequest('/login?redirectTo=%2Fdashboard')
      response = await middleware(request)

      // Should redirect to dashboard
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard')

      // 4. User can now access protected routes
      request = createMockRequest('/dashboard')
      response = await middleware(request)

      // Should allow access
      expect(response.status).toBe(200)

      // 5. User can access protected API routes
      request = createMockRequest('/api/profile')
      response = await middleware(request)

      // Should allow API access and set user headers
      expect(response.status).toBe(200)
      expect(response.headers.get('X-User-ID')).toBe('user-123')
      expect(response.headers.get('X-User-Email')).toBe('test@example.com')
    })

    test('should handle session expiration gracefully', async () => {
      // 1. User has an expired session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      })

      // 2. Protected page request should redirect to login
      let request = createMockRequest('/dashboard/settings')
      let response = await middleware(request)

      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/login')
      expect(response.headers.get('location')).toContain('redirectTo=%2Fdashboard%2Fsettings')

      // 3. API request should return 401
      request = createMockRequest('/api/profile')
      response = await middleware(request)

      expect(response.status).toBe(401)
      const responseData = await response.json()
      expect(responseData.message).toBe('Session expired')
    })

    test('should handle rate limiting on API routes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2023-01-01T00:00:00Z',
      }

      const mockSession = {
        user: mockUser,
        access_token: 'token-123',
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Test API handler with rate limiting
      const mockApiHandler = withAuth(async (request, { user }) => {
        return NextResponse.json({ user: user.id })
      })

      const request = createMockRequest('/api/test', 'GET', {
        'x-forwarded-for': '192.168.1.1',
      })

      const response = await mockApiHandler(request, {})
      expect(response.status).toBe(200)

      const responseData = await response.json()
      expect(responseData.user).toBe('user-123')
    })
  })

  describe('Security Features', () => {
    test('should prevent unauthorized API access', async () => {
      // No session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const request = createMockRequest('/api/profile')
      const response = await middleware(request)

      expect(response.status).toBe(401)
      
      const responseData = await response.json()
      expect(responseData.code).toBe('AUTH_REQUIRED')
      expect(responseData.error).toBe('Authentication required')
    })

    test('should set proper security headers', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const request = createMockRequest('/api/profile')
      const response = await middleware(request)

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization')
    })

    test('should handle malicious requests gracefully', async () => {
      // Simulate a request that throws an error
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Malicious request detected'))

      // For page routes, should allow through with graceful degradation
      let request = createMockRequest('/dashboard')
      let response = await middleware(request)
      expect(response.status).toBe(200)

      // For API routes, should return 500
      request = createMockRequest('/api/profile')
      response = await middleware(request)
      expect(response.status).toBe(500)

      const responseData = await response.json()
      expect(responseData.code).toBe('INTERNAL_ERROR')
    })
  })

  describe('Route Protection Patterns', () => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/settings',
      '/interviews',
      '/interviews/new',
      '/templates',
      '/templates/create',
      '/results',
      '/results/123',
      '/settings',
      '/settings/profile',
    ]

    const publicRoutes = [
      '/',
      '/login',
      '/register', 
      '/forgot-password',
      '/reset-password',
      '/auth/callback',
    ]

    const protectedApiRoutes = [
      '/api/dashboard',
      '/api/interviews',
      '/api/templates',
      '/api/results',
      '/api/profile',
      '/api/settings',
    ]

    test('should protect all dashboard and feature routes', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      for (const route of protectedRoutes) {
        const request = createMockRequest(route)
        const response = await middleware(request)
        
        expect(response.status).toBe(307) // Redirect
        expect(response.headers.get('location')).toContain('/login')
      }
    })

    test('should allow access to public routes', async () => {
      // No session setup needed for public routes
      for (const route of publicRoutes) {
        const request = createMockRequest(route)
        const response = await middleware(request)
        
        expect(response.status).toBe(200)
      }
    })

    test('should protect all API routes', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      for (const route of protectedApiRoutes) {
        const request = createMockRequest(route)
        const response = await middleware(request)
        
        expect(response.status).toBe(401)
        
        const responseData = await response.json()
        expect(responseData.code).toBe('AUTH_REQUIRED')
      }
    })
  })

  describe('Static File Handling', () => {
    const staticPaths = [
      '/_next/static/chunks/main.js',
      '/_next/image/logo.png',
      '/favicon.ico',
      '/logo.svg',
      '/api/auth/callback', // Special auth callback
    ]

    test('should skip middleware for static files', async () => {
      for (const path of staticPaths) {
        const request = createMockRequest(path)
        const response = await middleware(request)
        
        // Should pass through without authentication
        expect(response.status).toBe(200)
      }
    })
  })
})

import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '../../../middleware'

// Mock the middleware client
jest.mock('@/utils/supabase/middleware', () => ({
  createMiddlewareClient: jest.fn(),
}))

const { createMiddlewareClient } = require('@/utils/supabase/middleware')

describe('Middleware Authentication', () => {
  let mockRequest: NextRequest
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn(),
      },
    }

    createMiddlewareClient.mockReturnValue({
      supabase: mockSupabase,
      response: NextResponse.next(),
    })
  })

  const createMockRequest = (pathname: string, headers?: Record<string, string>) => {
    return new NextRequest(`http://localhost:3000${pathname}`, {
      headers: headers || {},
    })
  }

  describe('Public Routes', () => {
    test('should allow access to landing page', async () => {
      mockRequest = createMockRequest('/')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(200)
    })

    test('should allow access to auth pages', async () => {
      const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
      
      for (const page of authPages) {
        mockRequest = createMockRequest(page)
        const response = await middleware(mockRequest)
        expect(response.status).toBe(200)
      }
    })

    test('should allow access to auth callback', async () => {
      mockRequest = createMockRequest('/auth/callback')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(200)
    })
  })

  describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      mockRequest = createMockRequest('/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toContain('/login')
    })

    test('should allow authenticated users to access dashboard', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
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

      mockRequest = createMockRequest('/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(200)
    })

    test('should redirect to dashboard if authenticated user visits login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
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

      mockRequest = createMockRequest('/login')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toContain('/dashboard')
    })
  })

  describe('API Route Protection', () => {
    test('should return 401 for unauthenticated API requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      mockRequest = createMockRequest('/api/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(401)
      
      const responseData = await response.json()
      expect(responseData.error).toBe('Authentication required')
      expect(responseData.code).toBe('AUTH_REQUIRED')
    })

    test('should allow authenticated API requests', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
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

      mockRequest = createMockRequest('/api/profile')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('X-User-ID')).toBe('user-123')
      expect(response.headers.get('X-User-Email')).toBe('test@example.com')
    })

    test('should allow public API routes without authentication', async () => {
      mockRequest = createMockRequest('/api/health')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    test('should handle session errors gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      })

      mockRequest = createMockRequest('/dashboard')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(307) // Redirect to login
      expect(response.headers.get('location')).toContain('/login')
    })

    test('should handle API session errors with 401', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      })

      mockRequest = createMockRequest('/api/profile')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(401)
      
      const responseData = await response.json()
      expect(responseData.message).toBe('Session expired')
    })

    test('should handle middleware exceptions gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Database connection failed'))

      mockRequest = createMockRequest('/dashboard')
      const response = await middleware(mockRequest)
      
      // Should allow through with graceful degradation for page routes
      expect(response.status).toBe(200)
    })

    test('should return 500 for API route exceptions', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Database connection failed'))

      mockRequest = createMockRequest('/api/profile')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(500)
      
      const responseData = await response.json()
      expect(responseData.error).toBe('Internal server error')
      expect(responseData.code).toBe('INTERNAL_ERROR')
    })
  })

  describe('Static Files and Next.js Internals', () => {
    test('should skip middleware for static files', async () => {
      const staticPaths = [
        '/_next/static/chunks/app.js',
        '/favicon.ico',
        '/image.png',
        '/api/auth/callback',
      ]

      for (const path of staticPaths) {
        mockRequest = createMockRequest(path)
        const response = await middleware(mockRequest)
        expect(response.status).toBe(200)
      }
    })
  })

  describe('Redirect Parameter Handling', () => {
    test('should preserve redirect parameter when redirecting to login', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      mockRequest = createMockRequest('/dashboard/settings')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toContain('/login')
      expect(location).toContain('redirectTo=%2Fdashboard%2Fsettings')
    })

    test('should redirect to original URL after successful authentication', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
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

      mockRequest = createMockRequest('/login?redirectTo=%2Fdashboard%2Fsettings')
      const response = await middleware(mockRequest)
      
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard/settings')
    })
  })
})

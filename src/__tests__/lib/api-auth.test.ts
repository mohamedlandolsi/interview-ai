import { NextRequest } from 'next/server'
import {
  getAuthenticatedUser,
  verifyAuthentication,
  withAuth,
  createAuthErrorResponse,
  validateMethod,
  rateLimit,
  handleCors,
} from '../../lib/api-auth'

// Mock the server client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('API Authentication Utilities', () => {
  let mockSupabase: {
    auth: {
      getSession: jest.Mock
      getUser: jest.Mock
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn(),
      },
    }

    const { createClient } = jest.requireMock('@/utils/supabase/server')
    createClient.mockResolvedValue(mockSupabase)
  })

  const createMockRequest = (method = 'GET', url = 'http://localhost:3000/api/test', headers?: Record<string, string>) => {
    return new NextRequest(url, {
      method,
      headers: headers || {},
    })
  }

  describe('getAuthenticatedUser', () => {
    test('should return user when authenticated', async () => {
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

      const request = createMockRequest()
      const result = await getAuthenticatedUser(request)

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    test('should return error when no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const request = createMockRequest()
      const result = await getAuthenticatedUser(request)

      expect(result.user).toBeNull()
      expect(result.error).toEqual({
        error: 'No Session',
        message: 'No active session found',
        code: 'NO_SESSION',
        statusCode: 401,
      })
    })

    test('should handle exceptions gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest()
      const result = await getAuthenticatedUser(request)

      expect(result.user).toBeNull()
      expect(result.error?.code).toBe('INTERNAL_ERROR')
      expect(result.error?.statusCode).toBe(500)
    })
  })

  describe('withAuth HOC', () => {
    test('should call handler with user when authenticated', async () => {
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

      const mockHandler = jest.fn().mockResolvedValue(new Response('Success'))
      const wrappedHandler = withAuth(mockHandler)

      const request = createMockRequest()
      await wrappedHandler(request, {})

      expect(mockHandler).toHaveBeenCalledWith(request, { user: mockUser })
    })

    test('should return 401 when not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const mockHandler = jest.fn()
      const wrappedHandler = withAuth(mockHandler)

      const request = createMockRequest()
      const response = await wrappedHandler(request, {})

      expect(mockHandler).not.toHaveBeenCalled()
      expect(response.status).toBe(401)
    })
  })

  describe('validateMethod', () => {
    test('should return null for allowed methods', () => {
      const request = createMockRequest('GET')
      const result = validateMethod(request, ['GET', 'POST'])

      expect(result).toBeNull()
    })

    test('should return 405 for disallowed methods', async () => {
      const request = createMockRequest('DELETE')
      const result = validateMethod(request, ['GET', 'POST'])

      expect(result?.status).toBe(405)
      
      const responseData = await result?.json()
      expect(responseData.code).toBe('METHOD_NOT_ALLOWED')
      expect(responseData.allowedMethods).toEqual(['GET', 'POST'])
    })
  })

  describe('rateLimit', () => {
    test('should allow requests within limit', () => {
      const request = createMockRequest('GET', 'http://localhost:3000/api/test', {
        'x-forwarded-for': '192.168.1.1',
      })
      
      const result = rateLimit(request, { maxRequests: 5, windowMs: 60000 })
      expect(result).toBeNull()
    })
  })

  describe('handleCors', () => {
    test('should return CORS response for OPTIONS request', () => {
      const request = createMockRequest('OPTIONS')
      const result = handleCors(request)

      expect(result?.status).toBe(200)
      expect(result?.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(result?.headers.get('Access-Control-Allow-Methods')).toContain('GET')
    })

    test('should return null for non-OPTIONS request', () => {
      const request = createMockRequest('GET')
      const result = handleCors(request)

      expect(result).toBeNull()
    })
  })

  describe('createAuthErrorResponse', () => {
    test('should create proper error response', async () => {
      const response = createAuthErrorResponse('Test Error', 'Test message', 'TEST_CODE', 400)

      expect(response.status).toBe(400)
      
      const responseData = await response.json()
      expect(responseData.error).toBe('Test Error')
      expect(responseData.message).toBe('Test message')
      expect(responseData.code).toBe('TEST_CODE')
      expect(responseData.timestamp).toBeDefined()

      // Check security headers
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })
  })
})

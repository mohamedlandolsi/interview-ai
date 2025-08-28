import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { handleCors, rateLimit } from '@/lib/api-auth'
import { generateApiKey, createApiKeyPrefix, hashApiKey } from '@/lib/crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Available permissions for API keys
const AVAILABLE_PERMISSIONS = [
  'interviews:read',
  'interviews:create', 
  'interviews:update',
  'interviews:delete',
  'templates:read',
  'templates:create',
  'templates:update',
  'templates:delete',
  'candidates:read',
  'candidates:create',
  'candidates:update',
  'results:read',
  'webhooks:send'
] as const

type ApiPermission = typeof AVAILABLE_PERMISSIONS[number]

/**
 * GET /api/integrations/apikeys
 * Fetch all API keys for the company (without actual keys)
 */
export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 30, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  return withAdminAuth(async (request, { auth }) => {
    try {
      const apiKeys = await prisma.apiKey.findMany({
        where: {
          companyId: auth.profile.companyId
        },
        select: {
          id: true,
          prefix: true,
          name: true,
          permissions: true,
          lastUsedAt: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({ 
        apiKeys,
        availablePermissions: AVAILABLE_PERMISSIONS
      })

    } catch (error) {
      console.error('Failed to fetch API keys:', error)
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * POST /api/integrations/apikeys
 * Generate a new API key
 */
export async function POST(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting (stricter for API key generation)
  const rateLimitResponse = rateLimit(request, { maxRequests: 5, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  return withAdminAuth(async (request, { auth }) => {
    try {
      const body = await request.json()
      const { name, permissions } = body

      // Validate input
      if (!name || !permissions || !Array.isArray(permissions)) {
        return NextResponse.json(
          { error: 'Name and permissions are required' },
          { status: 400 }
        )
      }

      if (name.length < 3 || name.length > 50) {
        return NextResponse.json(
          { error: 'Name must be between 3 and 50 characters' },
          { status: 400 }
        )
      }

      // Validate permissions
      const invalidPermissions = permissions.filter(
        (perm: string) => !AVAILABLE_PERMISSIONS.includes(perm as ApiPermission)
      )
      
      if (invalidPermissions.length > 0) {
        return NextResponse.json(
          { 
            error: `Invalid permissions: ${invalidPermissions.join(', ')}`,
            availablePermissions: AVAILABLE_PERMISSIONS
          },
          { status: 400 }
        )
      }

      // Check if name already exists for this company
      const existingKey = await prisma.apiKey.findFirst({
        where: {
          companyId: auth.profile.companyId,
          name: name
        }
      })

      if (existingKey) {
        return NextResponse.json(
          { error: 'An API key with this name already exists' },
          { status: 409 }
        )
      }

      // Generate new API key
      const apiKey = generateApiKey()
      const prefix = createApiKeyPrefix(apiKey)
      const hashedKey = await hashApiKey(apiKey)

      // Store in database
      const newApiKey = await prisma.apiKey.create({
        data: {
          companyId: auth.profile.companyId,
          key: hashedKey,
          prefix,
          name,
          permissions
        },
        select: {
          id: true,
          prefix: true,
          name: true,
          permissions: true,
          createdAt: true
        }
      })

      return NextResponse.json({
        apiKey: {
          ...newApiKey,
          key: apiKey // Return the actual key only once
        },
        message: 'API key created successfully. Please copy it now - it will not be shown again.'
      }, { status: 201 })

    } catch (error) {
      console.error('Failed to create API key:', error)
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      )
    }
  })(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}

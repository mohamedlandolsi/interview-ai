import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { handleCors, rateLimit } from '@/lib/api-auth'
import { testVapiConnection } from '@/lib/vapi-integration'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/integrations/vapi/test
 * Test the Vapi API connection
 */
export async function POST(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting (stricter for test requests)
  const rateLimitResponse = rateLimit(request, { maxRequests: 5, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  return withAdminAuth(async (request, { auth }) => {
    try {
      // Get the company integration
      const integration = await prisma.companyIntegration.findUnique({
        where: {
          companyId: auth.profile.companyId
        }
      })

      if (!integration || !integration.vapiApiKey) {
        return NextResponse.json(
          { 
            success: false,
            message: 'No Vapi API key configured. Please add your API key first.'
          },
          { status: 400 }
        )
      }

      // Test the connection
      const testResult = await testVapiConnection(integration.vapiApiKey)

      return NextResponse.json(testResult)

    } catch (error) {
      console.error('Vapi connection test failed:', error)
      return NextResponse.json(
        { 
          success: false,
          message: 'Connection test failed due to an internal error'
        },
        { status: 500 }
      )
    }
  })(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}

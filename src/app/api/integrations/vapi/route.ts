import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { handleCors, rateLimit } from '@/lib/api-auth'
import { encrypt, decrypt } from '@/lib/crypto'
import { testVapiConnection } from '@/lib/vapi-integration'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/integrations/vapi
 * Fetch Vapi configuration for the company
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
      const integration = await prisma.companyIntegration.findUnique({
        where: {
          companyId: auth.profile.companyId
        }
      })

      if (!integration) {
        return NextResponse.json({
          vapiApiKey: null,
          vapiAssistantId: null,
          vapiVoiceProvider: null,
          vapiVoiceId: null,
          vapiLanguage: null,
          isConfigured: false
        })
      }

      // Decrypt the API key for editing (admin-only access)
      const decryptedApiKey = integration.vapiApiKey ? decrypt(integration.vapiApiKey) : null

      return NextResponse.json({
        vapiApiKey: decryptedApiKey,
        vapiAssistantId: integration.vapiAssistantId,
        vapiVoiceProvider: integration.vapiVoiceProvider,
        vapiVoiceId: integration.vapiVoiceId,
        vapiLanguage: integration.vapiLanguage,
        isConfigured: !!integration.vapiApiKey
      })

    } catch (error) {
      console.error('Failed to fetch Vapi configuration:', error)
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * PATCH /api/integrations/vapi
 * Update Vapi configuration for the company
 */
export async function PATCH(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 10, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  return withAdminAuth(async (request, { auth }) => {
    try {
      const body = await request.json()
      const {
        vapiApiKey,
        vapiAssistantId,
        vapiVoiceProvider,
        vapiVoiceId,
        vapiLanguage
      } = body

      // Encrypt the API key if provided and not empty
      const encryptedApiKey = vapiApiKey && vapiApiKey.trim() !== '' ? encrypt(vapiApiKey) : undefined

      const integration = await prisma.companyIntegration.upsert({
        where: {
          companyId: auth.profile.companyId
        },
        update: {
          ...(encryptedApiKey !== undefined && { vapiApiKey: encryptedApiKey }),
          ...(vapiAssistantId !== undefined && { vapiAssistantId }),
          ...(vapiVoiceProvider !== undefined && { vapiVoiceProvider }),
          ...(vapiVoiceId !== undefined && { vapiVoiceId }),
          ...(vapiLanguage !== undefined && { vapiLanguage })
        },
        create: {
          companyId: auth.profile.companyId,
          vapiApiKey: encryptedApiKey,
          vapiAssistantId,
          vapiVoiceProvider,
          vapiVoiceId,
          vapiLanguage
        }
      })

      return NextResponse.json({
        message: 'Vapi configuration updated successfully',
        isConfigured: !!integration.vapiApiKey
      })

    } catch (error) {
      console.error('Failed to update Vapi configuration:', error)
      return NextResponse.json(
        { error: 'Failed to update configuration' },
        { status: 500 }
      )
    }
  })(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}

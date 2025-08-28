import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { handleCors, rateLimit } from '@/lib/api-auth'
import { isValidWebhookUrl } from '@/lib/crypto'
import { testWebhook, WEBHOOK_EVENTS } from '@/lib/webhook-service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/integrations/webhooks
 * Fetch all webhooks for the company
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
      const webhooks = await prisma.webhook.findMany({
        where: {
          companyId: auth.profile.companyId
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({ webhooks })

    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch webhooks' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * POST /api/integrations/webhooks
 * Create a new webhook
 */
export async function POST(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 10, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  return withAdminAuth(async (request, { auth }) => {
    try {
      const body = await request.json()
      const { url, events } = body

      // Validate input
      if (!url || !events || !Array.isArray(events)) {
        return NextResponse.json(
          { error: 'URL and events are required' },
          { status: 400 }
        )
      }

      // Validate URL format
      if (!isValidWebhookUrl(url)) {
        return NextResponse.json(
          { error: 'Invalid webhook URL. Must be HTTPS and not localhost.' },
          { status: 400 }
        )
      }

      // Validate events
      const invalidEvents = events.filter(event => !WEBHOOK_EVENTS.includes(event))
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { 
            error: `Invalid events: ${invalidEvents.join(', ')}`,
            validEvents: WEBHOOK_EVENTS
          },
          { status: 400 }
        )
      }

      // Check if webhook URL already exists for this company
      const existingWebhook = await prisma.webhook.findFirst({
        where: {
          companyId: auth.profile.companyId,
          url: url
        }
      })

      if (existingWebhook) {
        return NextResponse.json(
          { error: 'A webhook with this URL already exists' },
          { status: 409 }
        )
      }

      // Create the webhook
      const webhook = await prisma.webhook.create({
        data: {
          companyId: auth.profile.companyId,
          url,
          events
        }
      })

      return NextResponse.json({ 
        webhook,
        message: 'Webhook created successfully'
      }, { status: 201 })

    } catch (error) {
      console.error('Failed to create webhook:', error)
      return NextResponse.json(
        { error: 'Failed to create webhook' },
        { status: 500 }
      )
    }
  })(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}

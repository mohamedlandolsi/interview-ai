import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { handleCors, rateLimit } from '@/lib/api-auth'
import { testWebhook } from '@/lib/webhook-service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * DELETE /api/integrations/webhooks/[id]
 * Delete a specific webhook
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 20, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  return withAdminAuth(async (request, { auth }) => {
    try {
      const { id } = await context.params

      // Find the webhook and verify it belongs to the user's company
      const webhook = await prisma.webhook.findFirst({
        where: {
          id,
          companyId: auth.profile.companyId
        }
      })

      if (!webhook) {
        return NextResponse.json(
          { error: 'Webhook not found' },
          { status: 404 }
        )
      }

      // Delete the webhook
      await prisma.webhook.delete({
        where: { id }
      })

      return NextResponse.json({
        message: 'Webhook deleted successfully'
      })

    } catch (error) {
      console.error('Failed to delete webhook:', error)
      return NextResponse.json(
        { error: 'Failed to delete webhook' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * POST /api/integrations/webhooks/[id]/test
 * Test a specific webhook
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting (stricter for test requests)
  const rateLimitResponse = rateLimit(request, { maxRequests: 5, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  return withAdminAuth(async (request, { auth }) => {
    try {
      const { id } = await context.params

      // Find the webhook and verify it belongs to the user's company
      const webhook = await prisma.webhook.findFirst({
        where: {
          id,
          companyId: auth.profile.companyId
        }
      })

      if (!webhook) {
        return NextResponse.json(
          { error: 'Webhook not found' },
          { status: 404 }
        )
      }

      // Test the webhook
      const testResult = await testWebhook(webhook.url, auth.profile.companyId)

      return NextResponse.json(testResult)

    } catch (error) {
      console.error('Failed to test webhook:', error)
      return NextResponse.json(
        { 
          success: false,
          message: 'Webhook test failed due to an internal error'
        },
        { status: 500 }
      )
    }
  })(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}

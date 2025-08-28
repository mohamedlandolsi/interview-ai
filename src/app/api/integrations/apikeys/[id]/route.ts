import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/admin-auth'
import { handleCors, rateLimit } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * DELETE /api/integrations/apikeys/[id]
 * Delete a specific API key
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

      // Find the API key and verify it belongs to the user's company
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id,
          companyId: auth.profile.companyId
        }
      })

      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key not found' },
          { status: 404 }
        )
      }

      // Delete the API key
      await prisma.apiKey.delete({
        where: { id }
      })

      return NextResponse.json({
        message: 'API key deleted successfully'
      })

    } catch (error) {
      console.error('Failed to delete API key:', error)
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      )
    }
  })(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}

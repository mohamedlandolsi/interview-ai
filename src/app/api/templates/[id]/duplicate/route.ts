import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the template to duplicate
    const originalTemplate = await prisma.interviewTemplate.findUnique({
      where: { id }
    })

    if (!originalTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Create a copy of the template
    const duplicatedTemplate = await prisma.interviewTemplate.create({
      data: {
        title: `${originalTemplate.title} (Copy)`,
        description: originalTemplate.description,
        questions: originalTemplate.questions,
        company_id: user.id, // Set to current user's company
        created_by: user.id, // Set current user as creator
      },
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      template: duplicatedTemplate,
      message: 'Template duplicated successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error duplicating template:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate template' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: resolvedParams.id },
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            role: true
          }
        },
        _count: {
          select: {
            sessions: true
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Transform the template to match the expected format
    const transformedTemplate = {
      id: template.id,
      name: template.name || template.title,
      title: template.title,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      duration: template.duration,
      tags: template.tags || [],
      questions: Array.isArray(template.questions) ? template.questions.length : 0,
      rawQuestions: template.rawQuestions || template.questions,
      usageCount: template.usage_count,
      lastUsed: template.last_used?.toISOString(),
      isBuiltIn: template.is_built_in,
      creator: template.creator,
      created_at: template.created_at.toISOString(),
      updated_at: template.updated_at.toISOString(),
      _count: template._count
    }

    return NextResponse.json({
      success: true,
      template: transformedTemplate
    })

  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    
    // Check if template exists and user has permission to edit
    const existingTemplate = await prisma.interviewTemplate.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (existingTemplate.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }    const body = await request.json()
    const { 
      name, 
      title, 
      description, 
      category, 
      difficulty, 
      duration, 
      tags, 
      questions, 
      rawQuestions 
    } = body

    // Update the template
    const updatedTemplate = await prisma.interviewTemplate.update({
      where: { id: resolvedParams.id },
      data: {
        title: name || title || existingTemplate.title,
        name: name || title || existingTemplate.name || existingTemplate.title,
        description: description !== undefined ? description : existingTemplate.description,
        category: category || existingTemplate.category,
        difficulty: difficulty || existingTemplate.difficulty,
        duration: duration || existingTemplate.duration,
        tags: tags || existingTemplate.tags,
        questions: questions || rawQuestions || existingTemplate.questions,
        rawQuestions: rawQuestions || questions || existingTemplate.rawQuestions,
        updated_at: new Date()
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

    // Transform the response to match expected format
    const transformedTemplate = {
      id: updatedTemplate.id,
      name: updatedTemplate.name || updatedTemplate.title,
      title: updatedTemplate.title,
      description: updatedTemplate.description,
      category: updatedTemplate.category,
      difficulty: updatedTemplate.difficulty,
      duration: updatedTemplate.duration,
      tags: updatedTemplate.tags || [],
      questions: Array.isArray(updatedTemplate.questions) ? updatedTemplate.questions.length : 0,
      rawQuestions: updatedTemplate.rawQuestions || updatedTemplate.questions,
      usageCount: updatedTemplate.usage_count,
      lastUsed: updatedTemplate.last_used?.toISOString(),
      isBuiltIn: updatedTemplate.is_built_in,
      creator: updatedTemplate.creator,
      created_at: updatedTemplate.created_at.toISOString(),
      updated_at: updatedTemplate.updated_at.toISOString()
    }

    return NextResponse.json({
      success: true,
      template: transformedTemplate,
      message: 'Template updated successfully'
    })

  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    
    // Check if template exists and user has permission to delete
    const existingTemplate = await prisma.interviewTemplate.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    if (existingTemplate.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Delete the template
    await prisma.interviewTemplate.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}

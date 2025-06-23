import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { getInterviewLink } from '@/lib/url-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user (interviewer)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { templateId, position, duration, description } = body    // Validate required fields
    if (!position) {
      return NextResponse.json(
        { error: 'Position is required' },
        { status: 400 }
      )
    }    // Verify template exists and user has access to it (if templateId is provided)
    let template = null
    if (templateId) {
      template = await prisma.interviewTemplate.findFirst({
        where: {
          id: templateId,
          OR: [
            { created_by: user.id },
            { is_built_in: true }
          ]
        }
      })

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Create interview session
    const session = await prisma.interviewSession.create({
      data: {
        template_id: templateId,
        interviewer_id: user.id,
        candidate_name: '', // Will be filled by candidate
        candidate_email: '', // Will be filled by candidate
        position: position,
        status: 'scheduled',
        duration: duration || (template?.duration) || 30,
        // Additional metadata for the session
        metrics: {
          sessionType: 'candidate_link',
          description: description || `Interview for ${position} position`,
          createdBy: user.id,
          templateName: template?.title || 'General Interview'
        }
      },
      include: {
        template: templateId ? {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            duration: true
          }
        } : false
      }
    })    // Generate shareable link
    const interviewLink = getInterviewLink(session.id)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        templateId: session.template_id,
        position: session.position,
        duration: session.duration,
        link: interviewLink,
        template: session.template,
        createdAt: session.created_at
      }
    })

  } catch (error) {
    console.error('Error creating interview session:', error)
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get user's interview sessions
    const sessions = await prisma.interviewSession.findMany({
      where: {
        interviewer_id: user.id,
        status: {
          in: ['scheduled', 'in_progress']
        }
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true
          }
        }      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    })

    const sessionsWithLinks = sessions.map(session => ({
      id: session.id,
      templateId: session.template_id,
      candidateName: session.candidate_name,
      candidateEmail: session.candidate_email,
      position: session.position,
      status: session.status,
      duration: session.duration,
      link: getInterviewLink(session.id),
      template: session.template,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }))

    return NextResponse.json({
      sessions: sessionsWithLinks
    })

  } catch (error) {
    console.error('Error fetching interview sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview sessions' },
      { status: 500 }
    )
  }
}

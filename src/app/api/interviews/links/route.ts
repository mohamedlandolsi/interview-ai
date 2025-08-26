import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { getInterviewLink } from '@/lib/url-utils'

export async function POST(request: NextRequest) {
  console.log('📝 Interview link generation request received')
  
  try {
    const supabase = await createClient()
    
    // Get the current user (interviewer)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔐 Auth check:', { 
      hasUser: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      authError: authError?.message 
    })
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { templateId, position, duration, description } = body
    
    console.log('📋 Request data:', { templateId, position, duration, description })

    // Check if user has a profile (required for creating interview sessions)
    console.log('👤 Checking user profile...')
    let userProfile = await prisma.profile.findUnique({
      where: { id: user.id }
    })
    
    if (!userProfile) {
      console.log('👤 User profile not found, attempting to create one...')
      
      try {
        // Import the createUserProfile function
        const { createUserProfile } = await import('@/lib/auth-database')
        
        // Create profile for the user
        userProfile = await createUserProfile(user.id, {
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'interviewer' // Default role
        })
        
        console.log('✅ User profile created successfully:', { id: userProfile.id, name: userProfile.full_name })
      } catch (profileError) {
        console.error('❌ Failed to create user profile:', profileError)
        return NextResponse.json(
          { 
            error: 'Failed to create user profile. Please try refreshing the page or contact support.',
            code: 'PROFILE_CREATION_FAILED',
            details: profileError instanceof Error ? profileError.message : String(profileError)
          },
          { status: 500 }
        )
      }
    } else {
      console.log('✅ User profile found:', { id: userProfile.id, name: userProfile.full_name })
    }

    // Validate required fields
    if (!position) {
      console.error('❌ Position is required')
      return NextResponse.json(
        { error: 'Position is required' },
        { status: 400 }
      )
    }    // Verify template exists and user has access to it (if templateId is provided)
    let template = null
    let finalTemplateId = templateId
    
    if (templateId) {
      console.log('🔍 Looking for template:', templateId)
      
      template = await prisma.interviewTemplate.findFirst({
        where: {
          id: templateId,
          OR: [
            { created_by: user.id },
            { is_built_in: true }
          ]
        }
      })

      console.log('📋 Template search result:', {
        found: !!template,
        templateId,
        userId: user.id
      })

      if (!template) {
        // Let's also check if the template exists at all
        const templateExists = await prisma.interviewTemplate.findUnique({
          where: { id: templateId },
          select: { id: true, title: true, created_by: true, is_built_in: true }
        })
        
        console.error('❌ Template access denied:', {
          templateId,
          userId: user.id,
          templateExists: !!templateExists,
          templateDetails: templateExists
        })
        
        return NextResponse.json(
          { 
            error: 'Template not found or access denied',
            details: templateExists 
              ? `You do not have permission to use the template "${templateExists.title}". Please select a different template or create a general interview.`
              : 'Template does not exist',
            code: 'TEMPLATE_ACCESS_DENIED'
          },
          { status: 403 }
        )
      } else {
        console.log('✅ Template access granted:', { id: template.id, title: template.title })
      }
    } else {
      // For general interviews, use the default general template
      console.log('🔍 Creating general interview, finding default template...')
      
      template = await prisma.interviewTemplate.findFirst({
        where: {
          title: { contains: 'General', mode: 'insensitive' },
          is_built_in: true
        }
      })
      
      if (template) {
        finalTemplateId = template.id
        console.log('✅ Using default general template:', { id: template.id, title: template.title })
      } else {
        console.error('❌ No general template found')
        return NextResponse.json(
          { 
            error: 'Default general interview template not found',
            details: 'Please contact support to set up general interview templates',
            code: 'DEFAULT_TEMPLATE_MISSING'
          },
          { status: 500 }
        )
      }
    }

    // Create interview session
    console.log('💾 Creating interview session...')
    const session = await prisma.interviewSession.create({
      data: {
        template_id: finalTemplateId,
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
          templateName: template?.title || 'General Interview',
          isGeneralInterview: !templateId // Mark if this was originally a general interview
        }
      },
      include: {
        template: finalTemplateId ? {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            duration: true
          }
        } : false
      }
    })
    
    console.log('✅ Interview session created:', session.id)    // Generate shareable link
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
        createdAt: session.created_at,
        isGeneralInterview: !templateId // Indicate if this was originally a general interview
      }
    })

  } catch (error) {
    console.error('💥 Error creating interview session:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create interview session'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for specific error types
      if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'User profile not found. Please complete your profile setup.'
        statusCode = 403
      } else if (error.message.includes('authentication')) {
        errorMessage = 'Authentication failed. Please log in again.'
        statusCode = 401
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : String(error) : undefined
      },
      { status: statusCode }
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

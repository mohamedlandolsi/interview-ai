import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  console.log('🗑️ Interview deletion request received for ID:', id)
  
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

    // First, check if the interview session exists and belongs to the user
    const existingSession = await prisma.interviewSession.findFirst({
      where: {
        id: id,
        interviewer_id: user.id // Ensure user can only delete their own interviews
      }
    })

    if (!existingSession) {
      console.error('❌ Interview session not found or access denied:', {
        sessionId: id,
        userId: user.id
      })
      return NextResponse.json(
        { 
          error: 'Interview session not found or you do not have permission to delete it',
          code: 'INTERVIEW_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    console.log('✅ Interview session found:', { 
      id: existingSession.id, 
      status: existingSession.status,
      candidateName: existingSession.candidate_name,
      position: existingSession.position
    })

    // Check if the interview is in progress - prevent deletion of active interviews
    if (existingSession.status === 'in_progress') {
      console.error('❌ Cannot delete interview in progress:', {
        sessionId: id,
        status: existingSession.status
      })
      return NextResponse.json(
        { 
          error: 'Cannot delete an interview that is currently in progress',
          code: 'INTERVIEW_IN_PROGRESS'
        },
        { status: 400 }
      )
    }

    // Delete the interview session
    console.log('🗑️ Deleting interview session...')
    await prisma.interviewSession.delete({
      where: {
        id: id
      }
    })

    console.log('✅ Interview session deleted successfully:', id)

    return NextResponse.json({
      success: true,
      message: 'Interview session deleted successfully',
      deletedSession: {
        id: existingSession.id,
        candidateName: existingSession.candidate_name,
        position: existingSession.position,
        status: existingSession.status
      }
    })

  } catch (error) {
    console.error('💥 Error deleting interview session:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to delete interview session'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for specific error types
      if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Cannot delete interview session due to related data. Please contact support.'
        statusCode = 400
      } else if (error.message.includes('Record to delete does not exist')) {
        errorMessage = 'Interview session not found'
        statusCode = 404
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  
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

    // Get the specific interview session
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: id,
        interviewer_id: user.id // Ensure user can only access their own interviews
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            name: true,
            category: true,
            difficulty: true,
            duration: true
          }
        },
        interviewer: {
          select: {
            id: true,
            full_name: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      session: {
        id: session.id,
        templateId: session.template_id,
        candidateName: session.candidate_name,
        candidateEmail: session.candidate_email,
        position: session.position,
        status: session.status,
        duration: session.duration,
        overallScore: session.overall_score,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        template: session.template,
        interviewer: session.interviewer,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }
    })

  } catch (error) {
    console.error('Error fetching interview session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview session' },
      { status: 500 }
    )
  }
}

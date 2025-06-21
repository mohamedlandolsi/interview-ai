import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    // Get interview session
    const session = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            duration: true,
            rawQuestions: true,
            questions: true
          }
        },
        interviewer: {
          select: {
            id: true,
            full_name: true,
            company_name: true
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

    // Check if session is still valid (not completed or cancelled)
    if (session.status === 'completed' || session.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Interview session is no longer active' },
        { status: 410 } // Gone
      )
    }

    return NextResponse.json({
      session: {
        id: session.id,
        position: session.position,
        duration: session.duration,
        status: session.status,
        candidateName: session.candidate_name,
        candidateEmail: session.candidate_email,
        template: session.template,
        interviewer: session.interviewer,
        needsCandidateInfo: !session.candidate_name || !session.candidate_email
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const body = await request.json()
    const { candidateName, candidateEmail, candidatePhone } = body

    // Validate required fields
    if (!candidateName || !candidateEmail) {
      return NextResponse.json(
        { error: 'Candidate name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(candidateEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if session exists and is valid
    const existingSession = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId
      }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }

    if (existingSession.status === 'completed' || existingSession.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Interview session is no longer active' },
        { status: 410 }
      )
    }

    // Update session with candidate information
    const updatedSession = await prisma.interviewSession.update({
      where: {
        id: sessionId
      },
      data: {
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        // Store additional candidate info in metrics if provided
        metrics: {
          ...((existingSession.metrics as any) || {}),
          candidatePhone: candidatePhone || null,
          candidateInfoSubmittedAt: new Date().toISOString()
        }
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            duration: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        candidateName: updatedSession.candidate_name,
        candidateEmail: updatedSession.candidate_email,
        position: updatedSession.position,
        duration: updatedSession.duration,
        template: updatedSession.template
      }
    })

  } catch (error) {
    console.error('Error updating interview session:', error)
    return NextResponse.json(
      { error: 'Failed to update interview session' },
      { status: 500 }
    )
  }
}

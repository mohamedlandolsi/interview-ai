import { NextRequest, NextResponse } from 'next/server'
import { createInterviewSession, updateSessionWithCallId } from '@/lib/interview-session'
import { getSessionDefaults } from '@/lib/session-defaults'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      candidateName, 
      candidateEmail, 
      position, 
      templateId, 
      interviewerId, 
      vapiCallId, 
      vapiAssistantId,
      sessionId // If updating existing session
    } = body

    // Get defaults for missing values
    const defaults = await getSessionDefaults()
    const finalTemplateId = templateId || defaults.templateId
    const finalInterviewerId = interviewerId || defaults.interviewerId    // Validate required fields
    if (!candidateName || !position) {
      return NextResponse.json(
        { error: 'Missing required fields: candidateName, position' },
        { status: 400 }
      )
    }

    let session

    if (sessionId && vapiCallId) {
      // Update existing session with call ID
      session = await updateSessionWithCallId({
        sessionId,
        vapiCallId,
        vapiAssistantId
      })
    } else if (vapiCallId) {      // Create new session with call ID
      session = await createInterviewSession({
        candidateName,
        candidateEmail: candidateEmail || `${candidateName.replace(/\s+/g, '').toLowerCase()}@interview.temp`,
        position,
        templateId: finalTemplateId,
        interviewerId: finalInterviewerId,
        vapiCallId,
        vapiAssistantId: vapiAssistantId || ''
      })
    } else {      // Create session without call ID (to be updated later)
      session = await createInterviewSession({
        candidateName,
        candidateEmail: candidateEmail || `${candidateName.replace(/\s+/g, '').toLowerCase()}@interview.temp`,
        position,
        templateId: finalTemplateId,
        interviewerId: finalInterviewerId,
        vapiCallId: '', // Will be updated when call starts
        vapiAssistantId: vapiAssistantId || ''
      })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        candidateName: session.candidate_name,
        position: session.position,
        status: session.status,
        createdAt: session.created_at
      }
    })

  } catch (error) {
    console.error('Error creating/updating interview session:', error)
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const callId = searchParams.get('callId')

    if (!sessionId && !callId) {
      return NextResponse.json(
        { error: 'Session ID or Call ID required' },
        { status: 400 }
      )
    }

    // Implementation for getting session details
    // This would fetch from your database
    return NextResponse.json({
      success: true,
      message: 'Session retrieval endpoint'
    })

  } catch (error) {
    console.error('Error retrieving interview session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve interview session' },
      { status: 500 }
    )
  }
}

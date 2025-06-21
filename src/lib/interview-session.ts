import { prisma } from '@/lib/prisma'

export interface CreateInterviewSessionData {
  candidateName: string
  candidateEmail: string
  position: string
  templateId: string
  interviewerId: string
  vapiCallId: string
  vapiAssistantId: string
}

export interface UpdateSessionWithCallId {
  sessionId: string
  vapiCallId: string
  vapiAssistantId: string
}

// Create a new interview session with Vapi integration
export async function createInterviewSession(data: CreateInterviewSessionData) {
  try {
    const session = await prisma.interviewSession.create({
      data: {
        candidate_name: data.candidateName,
        candidate_email: data.candidateEmail,
        position: data.position,
        template_id: data.templateId,
        interviewer_id: data.interviewerId,
        vapi_call_id: data.vapiCallId,
        vapi_assistant_id: data.vapiAssistantId,
        status: 'in_progress',
        started_at: new Date(),
        real_time_messages: []
      }
    })
    
    return session
  } catch (error) {
    console.error('Error creating interview session:', error)
    throw error
  }
}

// Update existing session with Vapi call ID
export async function updateSessionWithCallId(data: UpdateSessionWithCallId) {
  try {
    const session = await prisma.interviewSession.update({
      where: { id: data.sessionId },
      data: {
        vapi_call_id: data.vapiCallId,
        vapi_assistant_id: data.vapiAssistantId,
        status: 'in_progress',
        started_at: new Date()
      }
    })
    
    return session
  } catch (error) {
    console.error('Error updating session with call ID:', error)
    throw error
  }
}

// Get interview session by call ID
export async function getSessionByCallId(callId: string) {
  try {
    const session = await prisma.interviewSession.findFirst({
      where: { vapi_call_id: callId },
      include: {
        template: true,
        interviewer: true
      }
    })
    
    return session
  } catch (error) {
    console.error('Error getting session by call ID:', error)
    throw error
  }
}

// Get real-time messages for a session
export async function getSessionMessages(sessionId: string) {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      select: {
        real_time_messages: true,
        final_transcript: true,
        conversation_summary: true
      }
    })
    
    return session
  } catch (error) {
    console.error('Error getting session messages:', error)
    throw error
  }
}

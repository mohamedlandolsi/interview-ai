import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getSessionByCallId } from '@/lib/interview-session'
import { getSessionDefaults } from '@/lib/session-defaults'

// Types for Vapi webhook events
interface VapiWebhookEvent {
  type: string
  call?: {
    id: string
    assistantId: string
    customer?: {
      number: string
    }
    status: string
    startedAt?: string
    endedAt?: string
    cost?: number
    costBreakdown?: any
    messages?: any[]
    phoneCallProvider?: string
    phoneCallProviderId?: string
  }
  message?: {
    type: string
    content: string
    role: 'user' | 'assistant' | 'system'
    time: number
    endTime?: number
    secondsFromStart: number
  }
  artifact?: {
    type: string
    transcript?: string
    recordingUrl?: string
    stereoRecordingUrl?: string
    summary?: string | any
    evaluation?: {
      score?: number
      feedback?: string
      successful?: boolean
      [key: string]: any
    }
    data?: {
      strengths?: string[]
      areas_for_improvement?: string[]
      question_scores?: any
      [key: string]: any
    }
    [key: string]: any
  }
  timestamp: string
}

// Webhook event handlers
const handleCallStarted = async (event: VapiWebhookEvent) => {
  console.log('Call started:', event.call?.id)
  
  try {
    if (!event.call?.id) return
    
    // Find existing session by call ID
    let session = await getSessionByCallId(event.call.id)
    
    if (session) {
      // Update existing session
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          status: 'in_progress',
          started_at: new Date(event.call?.startedAt || event.timestamp),
          vapi_assistant_id: event.call?.assistantId,
        }
      })
      console.log('Updated existing session for call:', event.call.id)
    } else {
      // Try to find a session that was created without a call ID and update it
      // Look for recent sessions without call IDs
      const recentSession = await prisma.interviewSession.findFirst({
        where: {
          AND: [
            { vapi_call_id: { in: ['', null] } },
            { created_at: { gte: new Date(Date.now() - 10 * 60 * 1000) } }, // Within last 10 minutes
            { status: 'scheduled' }
          ]
        },
        orderBy: { created_at: 'desc' }
      })

      if (recentSession) {
        // Update this session with the call ID
        await prisma.interviewSession.update({
          where: { id: recentSession.id },
          data: {
            vapi_call_id: event.call.id,
            vapi_assistant_id: event.call?.assistantId,
            status: 'in_progress',
            started_at: new Date(event.call?.startedAt || event.timestamp),
          }
        })
        console.log('Updated recent session with call ID:', event.call.id, 'Session:', recentSession.id)      } else {
        // Create a new session for orphaned calls
        console.log('Creating new session for orphaned call:', event.call.id)
        
        const defaults = await getSessionDefaults()
        
        await prisma.interviewSession.create({
          data: {
            candidate_name: 'Unknown Candidate',
            candidate_email: 'unknown@example.com',
            position: 'Unknown Position',
            template_id: defaults.templateId,
            interviewer_id: defaults.interviewerId,
            vapi_call_id: event.call.id,
            vapi_assistant_id: event.call.assistantId || '',
            status: 'in_progress',
            started_at: new Date(event.call?.startedAt || event.timestamp),
            real_time_messages: []
          }
        })
      }
    }
  } catch (error) {
    console.error('Error handling call start:', error)
  }
}

const handleCallEnded = async (event: VapiWebhookEvent) => {
  console.log('Call ended:', event.call?.id)
  
  try {
    // Update interview session with final data
    await prisma.interviewSession.updateMany({
      where: { vapi_call_id: event.call?.id },
      data: {
        status: 'completed',
        completed_at: new Date(event.call?.endedAt || event.timestamp),
        vapi_cost: event.call?.cost,
        vapi_cost_breakdown: event.call?.costBreakdown,
        duration: event.call?.endedAt && event.call?.startedAt 
          ? Math.round((new Date(event.call.endedAt).getTime() - new Date(event.call.startedAt).getTime()) / 60000)
          : undefined
      }
    })
    
    console.log('Interview session updated for ended call:', event.call?.id)
  } catch (error) {
    console.error('Error handling call end:', error)
  }
}

const handleTranscript = async (event: VapiWebhookEvent) => {
  console.log('Transcript received:', event.message?.content)
  
  try {
    if (event.call?.id && event.message) {
      // Update the session with real-time transcript data
      const session = await prisma.interviewSession.findFirst({
        where: { vapi_call_id: event.call.id }
      })
      
      if (session) {
        // Add the new message to the real_time_messages array
        const currentMessages = session.real_time_messages || []
        const newMessage = {
          type: event.message.type,
          content: event.message.content,
          role: event.message.role,
          time: event.message.time,
          endTime: event.message.endTime,
          secondsFromStart: event.message.secondsFromStart,
          timestamp: event.timestamp
        }
        
        await prisma.interviewSession.update({
          where: { id: session.id },
          data: {
            real_time_messages: [...currentMessages, newMessage]
          }
        })
      }
    }
  } catch (error) {
    console.error('Error handling transcript:', error)
  }
}

const handleArtifact = async (event: VapiWebhookEvent) => {
  console.log('Artifact received:', event.artifact?.type)
  
  try {
    if (event.call?.id && event.artifact) {
      const updateData: any = {}
      
      // Handle different types of artifacts
      switch (event.artifact.type) {
        case 'transcript':
          updateData.final_transcript = event.artifact.transcript
          updateData.recording_url = event.artifact.recordingUrl
          updateData.stereo_recording_url = event.artifact.stereoRecordingUrl
          break
            case 'summary':
          updateData.vapi_summary = event.artifact.summary
          updateData.conversation_summary = typeof event.artifact.summary === 'string' 
            ? event.artifact.summary 
            : JSON.stringify(event.artifact.summary)
          
          // Extract Q&A data if available in the summary
          if (event.artifact.summary && typeof event.artifact.summary === 'object') {
            const summary = event.artifact.summary
            
            // Handle questions array
            if (summary.questions && Array.isArray(summary.questions)) {
              updateData.question_scores = summary.questions
              
              // Calculate average score from questions
              const validScores = summary.questions
                .map((q: any) => q.score)
                .filter((score: any) => typeof score === 'number')
              
              if (validScores.length > 0) {
                const averageScore = validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length
                updateData.analysis_score = Math.round(averageScore * 10) // Convert to 0-100 scale if needed
              }
            }
            
            // Handle overall flow and insights
            if (summary.overallFlow) {
              updateData.key_insights = [summary.overallFlow]
            }
            
            // Handle average score
            if (summary.averageScore !== undefined) {
              updateData.analysis_score = Math.round(summary.averageScore * 10) // Convert to 0-100 scale
            }
          }
          break
            case 'success-evaluation':
          updateData.vapi_success_evaluation = event.artifact
          // Extract score and evaluation data more comprehensively
          if (event.artifact.evaluation) {
            const evaluation = event.artifact.evaluation
            if (evaluation.score !== undefined) {
              updateData.analysis_score = evaluation.score
            }
            if (evaluation.feedback) {
              updateData.analysis_feedback = evaluation.feedback
            }
            if (evaluation.successful !== undefined) {
              updateData.hiring_recommendation = evaluation.successful ? 'Yes' : 'No'
            }
          }
          // Handle direct artifact data (sometimes evaluation data is at root level)
          if (event.artifact.score !== undefined) {
            updateData.analysis_score = event.artifact.score
          }
          if (event.artifact.feedback) {
            updateData.analysis_feedback = event.artifact.feedback
          }
          if (event.artifact.successful !== undefined) {
            updateData.hiring_recommendation = event.artifact.successful ? 'Yes' : 'No'
          }
          break
            case 'structured-data':
          updateData.vapi_structured_data = event.artifact.data
          // Process structured data to extract insights based on our schema
          if (event.artifact.data) {
            const structuredData = event.artifact.data
            
            // Extract category scores
            if (structuredData.categoryScores) {
              updateData.analysis_score = structuredData.overallScore || 0
              updateData.category_scores = structuredData.categoryScores
            }
            
            // Extract strengths and areas for improvement
            if (structuredData.strengths) {
              updateData.strengths = Array.isArray(structuredData.strengths) 
                ? structuredData.strengths 
                : [structuredData.strengths]
            }
            if (structuredData.areasForImprovement) {
              updateData.areas_for_improvement = Array.isArray(structuredData.areasForImprovement)
                ? structuredData.areasForImprovement
                : [structuredData.areasForImprovement]
            }
            
            // Extract question responses and scores
            if (structuredData.questionResponses) {
              updateData.question_scores = structuredData.questionResponses
            }
            
            // Extract hiring recommendation and reasoning
            if (structuredData.hiringRecommendation) {
              updateData.hiring_recommendation = structuredData.hiringRecommendation
              updateData.analysis_feedback = structuredData.reasoning || ''
            }
            
            // Extract key insights
            if (structuredData.keyInsights) {
              updateData.key_insights = structuredData.keyInsights
            }
            
            // Extract interview metrics
            if (structuredData.interviewMetrics) {
              updateData.interview_metrics = structuredData.interviewMetrics
            }
          }
          break
          
        default:
          // Handle generic artifacts
          updateData.final_transcript = event.artifact.transcript
          updateData.recording_url = event.artifact.recordingUrl
          updateData.stereo_recording_url = event.artifact.stereoRecordingUrl
          updateData.conversation_summary = event.artifact.summary
      }
      
      // Update session with artifacts
      await prisma.interviewSession.updateMany({
        where: { vapi_call_id: event.call.id },
        data: updateData
      })
      
      console.log(`${event.artifact.type} artifact saved for call:`, event.call.id)
    }
  } catch (error) {
    console.error('Error handling artifact:', error)
  }
}

const handleFunctionCall = async (event: VapiWebhookEvent) => {
  console.log('Function call received:', event)
  
  // Here you can:
  // - Handle custom function calls from your assistant
  // - Integrate with external APIs
  // - Perform database operations
  // - Return data to the assistant
  
  // Example: If your assistant calls a function to get user data
  // if (event.message?.functionCall?.name === 'getUserData') {
  //   const userData = await getUserData(event.message.functionCall.parameters.userId)
  //   return { userData }
  // }
}

// Webhook signature verification (recommended for production)
const verifyWebhookSignature = (payload: string, signature: string): boolean => {
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET
  
  // Skip verification in development if secret is not set
  if (!webhookSecret) {
    console.warn('VAPI_WEBHOOK_SECRET not set - skipping signature verification')
    return true
  }
  
  try {
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(payload, 'utf8')
      .digest('hex')
    
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace('sha256=', '')
    
    return expectedSignature === cleanSignature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const payload = await request.text()
      // Get headers for signature verification
    const headersList = await headers()
    const signature = headersList.get('x-vapi-signature') || ''
    
    // Verify webhook signature (recommended for production)
    if (!verifyWebhookSignature(payload, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    // Parse the webhook event
    const event: VapiWebhookEvent = JSON.parse(payload)
    
    console.log('Received Vapi webhook:', event.type)
    
    // Handle different event types
    switch (event.type) {
      case 'call-start':
        await handleCallStarted(event)
        break
        
      case 'call-end':
        await handleCallEnded(event)
        break
        
      case 'transcript':
        await handleTranscript(event)
        break
        
      case 'artifact':
        await handleArtifact(event)
        break
        
      case 'function-call':
        await handleFunctionCall(event)
        break
        
      case 'speech-start':
        console.log('User started speaking')
        break
        
      case 'speech-end':
        console.log('User stopped speaking')
        break
        
      case 'hang':
        console.log('Call was hung up')
        break
        
      default:
        console.log('Unhandled event type:', event.type)
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: `Processed ${event.type} event` 
    })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  // Some webhook providers send GET requests for verification
  return NextResponse.json({ 
    message: 'Vapi webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}

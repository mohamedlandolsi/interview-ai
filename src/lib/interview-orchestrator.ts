/**
 * Interview Orchestrator Service
 * Core logic for managing AI-powered interviews from start to finish
 * Triggered by Vapi webhooks and orchestrates the entire interview flow
 */

import { prisma } from '@/lib/prisma'
import { InterviewSession, InterviewTemplate, InterviewStatus } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createNotification } from './notification-service'

// Types for Vapi webhook events
export interface VapiWebhookPayload {
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
  }
  message?: {
    type: string
    content: string
    role: 'user' | 'assistant' | 'system'
    time: number
    endTime?: number
    secondsFromStart: number
  }
  artifact?: any
  timestamp: string
}

// Response types for Vapi
export interface VapiAssistantResponse {
  assistant?: {
    type: 'text'
    content: string
  }
}

interface QuestionObject {
  type: string
  text: string
  category?: string
  weight?: number
}

export class InterviewOrchestrator {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  /**
   * Main handler for Vapi webhook events
   * Routes events to appropriate handlers based on event type
   */
  static async handleVapiEvent(event: VapiWebhookPayload): Promise<VapiAssistantResponse | null> {
    console.log('🎯 InterviewOrchestrator.handleVapiEvent:', event.type)

    try {
      switch (event.type) {
        case 'assistant-request':
          return await this.handleAssistantRequest(event)
        
        case 'transcript':
          await this.handleTranscriptMessage(event)
          return null
        
        case 'call-start':
          await this.initializeInterview(event)
          return null
        
        case 'call-end':
          await this.concludeInterview(event)
          return null
        
        default:
          console.log('🔄 Unhandled event type in orchestrator:', event.type)
          return null
      }
    } catch (error) {
      console.error('❌ Error in InterviewOrchestrator.handleVapiEvent:', error)
      return {
        assistant: {
          type: 'text',
          content: 'I apologize, but I encountered an error. Let me try to continue with the interview.'
        }
      }
    }
  }

  /**
   * Initialize interview when call starts
   * Set up the session state and prepare for first question
   */
  private static async initializeInterview(event: VapiWebhookPayload): Promise<void> {
    if (!event.call?.id) return

    console.log('🚀 Initializing interview for call:', event.call.id)

    try {
      // Find or create session
      let session = await this.findSessionByCallId(event.call.id)
      
      if (session) {
        // Update existing session
        const updatedSession = await prisma.interviewSession.update({
          where: { id: session.id },
          data: {
            status: 'in_progress',
            started_at: new Date(event.call.startedAt || event.timestamp),
            vapi_assistant_id: event.call.assistantId,
            current_question_index: 0,
          }
        })

        // Create notification for interview started
        await createNotification({
          profileId: session.interviewer_id,
          type: 'INTERVIEW_STARTED',
          message: `Interview with ${session.candidate_name} has started.`,
          link: `/interviews/${session.id}`
        })
      }
    } catch (error) {
      console.error('❌ Error initializing interview:', error)
    }
  }

  /**
   * Handle assistant request - core logic for providing next question or response
   */
  private static async handleAssistantRequest(event: VapiWebhookPayload): Promise<VapiAssistantResponse> {
    if (!event.call?.id) {
      return {
        assistant: {
          type: 'text',
          content: 'Hello! Welcome to your interview. Let me start with the first question.'
        }
      }
    }

    console.log('🤖 Handling assistant request for call:', event.call.id)

    try {
      // Get session and template data
      const session = await this.getSessionWithTemplate(event.call.id)
      
      if (!session) {
        console.error('❌ No session found for call:', event.call.id)
        return {
          assistant: {
            type: 'text',
            content: 'I apologize, but I cannot find your interview session. Please contact support.'
          }
        }
      }

      // Check if interview should be concluded based on time
      if (await this.shouldConcludeInterview(session)) {
        return await this.generateConcludingResponse(session)
      }

      // Get next question based on current state
      return await this.getNextQuestion(session)

    } catch (error) {
      console.error('❌ Error in handleAssistantRequest:', error)
      return {
        assistant: {
          type: 'text',
          content: 'I apologize for the technical difficulty. Let me continue with the next question.'
        }
      }
    }
  }

  /**
   * Handle transcript messages to save conversation history
   */
  private static async handleTranscriptMessage(event: VapiWebhookPayload): Promise<void> {
    if (!event.call?.id || !event.message) return

    console.log('📝 Handling transcript message for call:', event.call.id)

    try {
      const session = await this.findSessionByCallId(event.call.id)
      if (!session) return

      // Add message to real-time messages
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

      // If this is a user response, advance to next question
      if (event.message.role === 'user' && event.message.content.trim().length > 10) {
        await this.advanceToNextQuestion(session)
      }

    } catch (error) {
      console.error('❌ Error handling transcript message:', error)
    }
  }

  /**
   * Conclude interview when call ends
   */
  private static async concludeInterview(event: VapiWebhookPayload): Promise<void> {
    if (!event.call?.id) return

    console.log('🏁 Concluding interview for call:', event.call.id)

    try {
      const updatedSessions = await prisma.interviewSession.updateMany({
        where: { vapi_call_id: event.call.id },
        data: {
          status: 'completed',
          completed_at: new Date(event.call.endedAt || event.timestamp),
          vapi_cost: event.call.cost,
          vapi_cost_breakdown: event.call.costBreakdown,
          duration: event.call.endedAt && event.call.startedAt 
            ? Math.round((new Date(event.call.endedAt).getTime() - new Date(event.call.startedAt).getTime()) / 60000)
            : undefined
        }
      })

      // Get the session details to create a notification
      const session = await prisma.interviewSession.findFirst({
        where: { vapi_call_id: event.call.id }
      })

      if (session) {
        // Create notification for interview completed
        await createNotification({
          profileId: session.interviewer_id,
          type: 'INTERVIEW_COMPLETED',
          message: `Interview with ${session.candidate_name} has been completed.`,
          link: `/interviews/${session.id}`
        })
      }
    } catch (error) {
      console.error('❌ Error concluding interview:', error)
    }
  }

  /**
   * Get next question based on current interview state
   */
  private static async getNextQuestion(session: InterviewSession & { template: InterviewTemplate }): Promise<VapiAssistantResponse> {
    const { template } = session

    // Parse template questions
    const templateQuestions = this.parseTemplateQuestions(template.questions)
    
    // Check if we're still within template questions
    if (session.current_question_index < templateQuestions.length) {
      const question = templateQuestions[session.current_question_index]
      
      console.log(`📋 Asking template question ${session.current_question_index + 1}/${templateQuestions.length}:`, question.text)
      
      return {
        assistant: {
          type: 'text',
          content: question.text
        }
      }
    }

    // Check if we should generate dynamic questions
    if (await this.shouldGenerateDynamicQuestion(session)) {
      const dynamicQuestion = await this.generateDynamicQuestion(session, templateQuestions)
      
      if (dynamicQuestion) {
        console.log('🧠 Generated dynamic question:', dynamicQuestion)
        return {
          assistant: {
            type: 'text',
            content: dynamicQuestion
          }
        }
      }
    }

    // No more questions - start concluding
    return await this.generateConcludingResponse(session)
  }

  /**
   * Parse template questions from JSON format
   */
  private static parseTemplateQuestions(questionsJson: any): QuestionObject[] {
    try {
      if (Array.isArray(questionsJson)) {
        return questionsJson.map(q => {
          if (typeof q === 'string') {
            return { type: 'text_response', text: q }
          }
          
          // Handle new format with title field
          if (q.title) {
            return { 
              type: q.type || 'text_response', 
              text: q.title,
              category: q.category,
              weight: q.points
            }
          }
          
          // Handle legacy format with text field
          if (q.text) {
            return {
              type: q.type || 'text_response',
              text: q.text,
              category: q.category,
              weight: q.weight
            }
          }
          
          return q
        })
      }
      
      if (typeof questionsJson === 'object' && questionsJson.questions) {
        return questionsJson.questions
      }
      
      return []
    } catch (error) {
      console.error('❌ Error parsing template questions:', error)
      return []
    }
  }

  /**
   * Check if we should generate a dynamic question
   */
  private static async shouldGenerateDynamicQuestion(session: InterviewSession & { template: InterviewTemplate }): Promise<boolean> {
    if (!session.started_at || !session.template.duration) {
      return false
    }

    const elapsedMinutes = (Date.now() - session.started_at.getTime()) / (1000 * 60)
    const remainingMinutes = session.template.duration - elapsedMinutes
    const remainingPercentage = remainingMinutes / session.template.duration

    // Generate dynamic questions if more than 25% time remains
    return remainingPercentage > 0.25 && remainingMinutes > 2
  }

  /**
   * Generate a dynamic question using Gemini AI
   */
  private static async generateDynamicQuestion(
    session: InterviewSession & { template: InterviewTemplate },
    templateQuestions: QuestionObject[]
  ): Promise<string | null> {
    try {
      console.log('🧠 Generating dynamic question using Gemini AI...')

      const { template } = session
      const askedQuestions = templateQuestions.map(q => q.text)

      // Get conversation history for context
      const recentMessages = session.real_time_messages?.slice(-10) || []
      const conversationContext = recentMessages
        .filter((msg: any) => msg.role === 'user')
        .map((msg: any) => msg.content)
        .join('\n')

      const prompt = `
You are an expert interviewer conducting a ${template.category || 'professional'} interview for the position: ${session.position}.

INTERVIEW CONTEXT:
- Template: ${template.title}
- Description: ${template.description || 'Not provided'}
- Category: ${template.category || 'General'}
- Difficulty: ${template.difficulty || 'Intermediate'}
- Tags: ${template.tags?.join(', ') || 'None'}
- Persona Instructions: ${template.instruction || 'Be professional and thorough'}

ALREADY ASKED QUESTIONS:
${askedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

RECENT CANDIDATE RESPONSES:
${conversationContext}

REQUIREMENTS:
1. Generate ONE follow-up question that builds on the candidate's previous responses
2. The question should align with the interview category and difficulty level
3. Avoid repeating any of the already asked questions
4. Make it specific to the ${session.position} role
5. Keep the question concise and clear
6. Focus on evaluating skills, experience, or cultural fit

Generate only the question text, nothing else:
      `.trim()

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const result = await model.generateContent(prompt)
      const response = result.response
      const question = response.text()?.trim()
      
      if (question && question.length > 10) {
        return question
      }

      return null

    } catch (error) {
      console.error('❌ Error generating dynamic question:', error)
      return null
    }
  }

  /**
   * Check if interview should be concluded based on time
   */
  private static async shouldConcludeInterview(session: InterviewSession & { template: InterviewTemplate }): Promise<boolean> {
    if (!session.started_at || !session.template.duration) {
      return false
    }

    const elapsedMinutes = (Date.now() - session.started_at.getTime()) / (1000 * 60)
    const totalDuration = session.template.duration
    const elapsedPercentage = elapsedMinutes / totalDuration

    // Conclude if 90% of time has passed or less than 3 minutes remain
    return elapsedPercentage >= 0.9 || (totalDuration - elapsedMinutes) <= 3
  }

  /**
   * Generate concluding response for the interview
   */
  private static async generateConcludingResponse(session: InterviewSession & { template: InterviewTemplate }): Promise<VapiAssistantResponse> {
    const { template } = session
    
    const personalizedClosing = `
Thank you, ${session.candidate_name}, for taking the time to interview for the ${session.position} position. 

You've provided some great insights today. Our team will review your responses and we'll be in touch within the next few business days with next steps.

Is there anything else you'd like to add or any questions you have about the role or our company before we conclude?

Thank you again, and have a wonderful day!
    `.trim()

    // Update session to mark as concluding
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: 'completed'
      }
    })

    return {
      assistant: {
        type: 'text',
        content: personalizedClosing
      }
    }
  }

  /**
   * Advance to next question by incrementing the index
   */
  private static async advanceToNextQuestion(session: InterviewSession): Promise<void> {
    try {
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          current_question_index: session.current_question_index + 1
        }
      })
      
      console.log(`📈 Advanced to question index: ${session.current_question_index + 1}`)
    } catch (error) {
      console.error('❌ Error advancing to next question:', error)
    }
  }

  /**
   * Find session by Vapi call ID
   */
  private static async findSessionByCallId(callId: string): Promise<InterviewSession | null> {
    try {
      return await prisma.interviewSession.findFirst({
        where: { vapi_call_id: callId }
      })
    } catch (error) {
      console.error('❌ Error finding session by call ID:', error)
      return null
    }
  }

  /**
   * Get session with template data
   */
  private static async getSessionWithTemplate(callId: string): Promise<(InterviewSession & { template: InterviewTemplate }) | null> {
    try {
      return await prisma.interviewSession.findFirst({
        where: { vapi_call_id: callId },
        include: {
          template: true
        }
      })
    } catch (error) {
      console.error('❌ Error getting session with template:', error)
      return null
    }
  }

  /**
   * Utility method to get elapsed time in minutes
   */
  private static getElapsedMinutes(session: InterviewSession): number {
    if (!session.started_at) return 0
    return (Date.now() - session.started_at.getTime()) / (1000 * 60)
  }

  /**
   * Utility method to get remaining time in minutes
   */
  private static getRemainingMinutes(session: InterviewSession & { template: InterviewTemplate }): number {
    if (!session.template.duration) return 0
    const elapsed = this.getElapsedMinutes(session)
    return Math.max(0, session.template.duration - elapsed)
  }
}

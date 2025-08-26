import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the interview session with complete analysis data
    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            duration: true,
            tags: true,
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

    // Check if user has access to this session
    if (session.interviewer_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Return comprehensive session data including analysis results
    const result = {
      id: session.id,
      candidate_name: session.candidate_name,
      candidate_email: session.candidate_email,
      position: session.position,
      status: session.status,
      started_at: session.started_at,
      completed_at: session.completed_at,
      duration: session.duration,
      
      // Template information
      template: session.template,
      
      // Interview data
      transcript: session.final_transcript || session.transcript,
      recording_url: session.recording_url,
      stereo_recording_url: session.stereo_recording_url,
      
      // Analysis results
      analysis_score: session.analysis_score,
      analysis_feedback: session.analysis_feedback,
      strengths: session.strengths,
      areas_for_improvement: session.areas_for_improvement,
      category_scores: session.category_scores,
      hiring_recommendation: session.hiring_recommendation,
      key_insights: session.key_insights,
      interview_metrics: session.interview_metrics,
      
      // Additional Vapi analysis data
      vapi_summary: session.vapi_summary,
      vapi_success_evaluation: session.vapi_success_evaluation,
      vapi_structured_data: session.vapi_structured_data,
      question_scores: session.question_scores,
      
      // Cost and metadata
      vapi_cost: session.vapi_cost,
      vapi_cost_breakdown: session.vapi_cost_breakdown,
      
      // Timestamps
      created_at: session.created_at,
      updated_at: session.updated_at
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching interview result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InterviewAnalysisService } from '@/lib/interview-analysis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const callId = searchParams.get('callId')

    if (!sessionId && !callId) {
      return NextResponse.json(
        { error: 'Session ID or Call ID is required' },
        { status: 400 }
      )
    }

    // Find the interview session
    const session = await prisma.interviewSession.findFirst({
      where: sessionId 
        ? { id: sessionId }
        : { vapi_call_id: callId },
      include: {
        template: true,
        interviewer: true
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found' },
        { status: 404 }
      )
    }    // Enhanced analysis using the new service
    let enhancedAnalysis = null
    try {
      enhancedAnalysis = await InterviewAnalysisService.analyzeInterview({
        vapiSummary: (session as any).vapi_summary,
        vapiSuccessEvaluation: (session as any).vapi_success_evaluation,
        vapiStructuredData: (session as any).vapi_structured_data,
        finalTranscript: (session as any).final_transcript,
        candidateName: session.candidate_name,
        position: session.position,
        duration: session.duration
      })
    } catch (analysisError) {
      console.error('Error in enhanced analysis:', analysisError)
      // Continue with basic data if analysis fails
    }

    // Calculate overall score (prioritize enhanced analysis)
    let overallScore = enhancedAnalysis?.overallScore || session.overall_score || 0
    if (!overallScore && (session as any).analysis_score) {
      overallScore = (session as any).analysis_score
    }

    // Process question scores from structured data
    let questionScores = (session as any).question_scores
    if (!questionScores && (session as any).vapi_structured_data) {
      questionScores = (session as any).vapi_structured_data.question_scores || null
    }

    // Format the results with enhanced data
    const results = {
      id: session.id,
      candidateName: session.candidate_name,
      candidateEmail: session.candidate_email,
      position: session.position,
      duration: session.duration || 0,
      overallScore,      analysisScore: enhancedAnalysis?.overallScore || (session as any).analysis_score || 0,
      analysisFeedback: enhancedAnalysis?.detailedFeedback || (session as any).analysis_feedback || '',
      strengths: enhancedAnalysis?.strengths || (session as any).strengths || [],
      areasForImprovement: enhancedAnalysis?.areasForImprovement || (session as any).areas_for_improvement || [],
      questionScores,
      vapiSummary: (session as any).vapi_summary,
      vapiSuccessEvaluation: (session as any).vapi_success_evaluation,
      vapiStructuredData: (session as any).vapi_structured_data,
      finalTranscript: (session as any).final_transcript || '',
      conversationSummary: (session as any).conversation_summary || '',
      recordingUrl: (session as any).recording_url || '',
      completedAt: session.completed_at?.toISOString() || '',
      status: session.status,
      templateTitle: session.template?.title || 'Unknown Template',
      interviewerName: session.interviewer?.full_name || 'Unknown Interviewer',
      
      // Enhanced analysis data
      enhancedAnalysis: enhancedAnalysis ? {
        categoryScores: enhancedAnalysis.categoryScores,
        hiringRecommendation: enhancedAnalysis.hiringRecommendation,
        keyInsights: enhancedAnalysis.keyInsights,
        questionAnalysis: enhancedAnalysis.questionAnalysis,
        interviewFlow: enhancedAnalysis.interviewFlow,
        summaryReport: InterviewAnalysisService.generateSummaryReport(
          enhancedAnalysis,
          session.candidate_name,
          session.position
        )
      } : null
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Error fetching interview results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview results' },
      { status: 500 }
    )
  }
}

// Create or update interview results
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sessionId,
      overallScore,
      analysisScore,
      analysisFeedback,
      strengths,
      areasForImprovement,
      questionScores
    } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }    // Update the session with manual scoring/feedback
    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        overall_score: overallScore,
        ...(analysisScore && { analysis_score: analysisScore }),
        ...(analysisFeedback && { analysis_feedback: analysisFeedback }),
        ...(strengths && { strengths: strengths }),
        ...(areasForImprovement && { areas_for_improvement: areasForImprovement }),
        ...(questionScores && { question_scores: questionScores }),
        updated_at: new Date()
      } as any
    })

    return NextResponse.json({
      success: true,
      message: 'Interview results updated successfully',
      session: updatedSession
    })

  } catch (error) {
    console.error('Error updating interview results:', error)
    return NextResponse.json(
      { error: 'Failed to update interview results' },
      { status: 500 }
    )
  }
}

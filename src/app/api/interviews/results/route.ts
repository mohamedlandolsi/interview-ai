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
    }    // Enhanced analysis using the new service (only if no existing analysis data)
    let enhancedAnalysis = null
    const hasExistingAnalysis = (session as any).analysis_score > 0 || 
                               ((session as any).strengths && (session as any).strengths.length > 0) ||
                               ((session as any).category_scores && Object.keys((session as any).category_scores || {}).length > 0);
    
    if (!hasExistingAnalysis) {
      console.log('🔄 No existing analysis found, generating enhanced analysis...');
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

        // Save the generated analysis to the database for future use
        if (enhancedAnalysis && enhancedAnalysis.overallScore > 0) {
          console.log('💾 Saving generated analysis to database...');
          try {
            await prisma.interviewSession.update({
              where: { id: sessionId },
              data: {
                analysis_score: enhancedAnalysis.overallScore,
                analysis_feedback: enhancedAnalysis.detailedFeedback,
                strengths: enhancedAnalysis.strengths,
                areas_for_improvement: enhancedAnalysis.areasForImprovement,
                category_scores: enhancedAnalysis.categoryScores,
                hiring_recommendation: enhancedAnalysis.hiringRecommendation,
                key_insights: enhancedAnalysis.keyInsights,
                interview_metrics: enhancedAnalysis.interviewFlow
              }
            });
            console.log('✅ Analysis saved to database successfully');
          } catch (saveError) {
            console.error('❌ Failed to save analysis to database:', saveError);
            // Continue even if save fails - we still have the analysis in memory
          }
        }
      } catch (analysisError) {
        console.error('Error in enhanced analysis:', analysisError)
        // Continue with basic data if analysis fails
      }
    }

    // Calculate overall score (prioritize existing database analysis)
    let overallScore = (session as any).analysis_score || session.overall_score || enhancedAnalysis?.overallScore || 0

    // Process question scores from structured data
    let questionScores = (session as any).question_scores
    if (!questionScores && (session as any).vapi_structured_data) {
      questionScores = (session as any).vapi_structured_data.question_scores || null
    }

    // Format the results prioritizing database data over enhanced analysis
    const results = {
      id: session.id,
      candidateName: session.candidate_name,
      candidateEmail: session.candidate_email,
      position: session.position,
      duration: session.duration || 0,
      overallScore,
      analysisScore: (session as any).analysis_score || enhancedAnalysis?.overallScore || 0,
      analysisFeedback: (session as any).analysis_feedback || enhancedAnalysis?.detailedFeedback || '',
      strengths: (session as any).strengths || enhancedAnalysis?.strengths || [],
      areasForImprovement: (session as any).areas_for_improvement || enhancedAnalysis?.areasForImprovement || [],
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
      
      // Enhanced analysis data (use database category_scores if available)
      enhancedAnalysis: {
        categoryScores: (session as any).category_scores || enhancedAnalysis?.categoryScores || {},
        hiringRecommendation: (session as any).hiring_recommendation || enhancedAnalysis?.hiringRecommendation || 'Pending',
        keyInsights: (session as any).key_insights || enhancedAnalysis?.keyInsights || [],
        questionAnalysis: enhancedAnalysis?.questionAnalysis || [],
        interviewFlow: (session as any).interview_metrics || enhancedAnalysis?.interviewFlow || {},
        summaryReport: enhancedAnalysis ? InterviewAnalysisService.generateSummaryReport(
          {
            ...enhancedAnalysis,
            overallScore: (session as any).analysis_score || enhancedAnalysis.overallScore,
            categoryScores: (session as any).category_scores || enhancedAnalysis.categoryScores,
            hiringRecommendation: (session as any).hiring_recommendation || enhancedAnalysis.hiringRecommendation,
            strengths: (session as any).strengths || enhancedAnalysis.strengths,
            areasForImprovement: (session as any).areas_for_improvement || enhancedAnalysis.areasForImprovement,
            keyInsights: (session as any).key_insights || enhancedAnalysis.keyInsights
          },
          session.candidate_name,
          session.position
        ) : `Analysis for ${session.candidate_name} - ${session.position}`
      }
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

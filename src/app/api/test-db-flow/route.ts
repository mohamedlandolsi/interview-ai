/**
 * Test Database Save/Fetch Flow for Interview Results
 * This endpoint simulates the complete flow of saving and fetching interview results
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, testData } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Test data to simulate Vapi webhook artifacts
    const mockAnalysisData = testData || {
      vapi_summary: {
        questions: [
          {
            question: "Tell me about your React experience",
            answer: "I have 3+ years of experience with React, including hooks, context API, and state management",
            score: 8,
            keyPoints: ["3+ years experience", "Hooks knowledge", "State management"],
            evaluation: "Strong technical background demonstrated"
          },
          {
            question: "Describe a challenging project you worked on",
            answer: "I led a team to rebuild our e-commerce platform using React and Node.js",
            score: 9,
            keyPoints: ["Leadership experience", "Full-stack development", "E-commerce domain"],
            evaluation: "Excellent project management and technical skills"
          }
        ],
        overallFlow: "Candidate showed strong engagement and clear communication throughout the interview",
        averageScore: 8.5
      },
      vapi_success_evaluation: {
        successful: true,
        score: 85,
        feedback: "Candidate demonstrates strong technical skills and good communication. Recommended for hire.",
        categoryScores: {
          communication: 90,
          technical: 85,
          experience: 80,
          culturalFit: 85
        }
      },
      vapi_structured_data: {
        overallScore: 85,
        categoryScores: {
          communication: 90,
          technical: 85,
          experience: 80,
          culturalFit: 85
        },
        strengths: [
          "Excellent communication skills",
          "Strong React and JavaScript knowledge",
          "Good problem-solving approach",
          "Leadership experience"
        ],
        areasForImprovement: [
          "Could benefit from more backend experience",
          "Would like to see more system design knowledge"
        ],
        hiringRecommendation: "Strong Yes",
        reasoning: "Candidate shows excellent technical skills, strong communication, and leadership potential. Would be a great addition to the team.",
        keyInsights: [
          "Candidate has strong front-end expertise",
          "Shows leadership potential",
          "Good cultural fit based on responses"
        ],
        questionResponses: [
          {
            question: "Tell me about your React experience",
            responseQuality: 85,
            feedback: "Comprehensive answer with specific examples",
            keyPoints: ["3+ years experience", "Hooks knowledge"]
          }
        ],
        interviewMetrics: {
          engagement: 90,
          clarity: 85,
          completeness: 80
        }
      },
      final_transcript: "Complete interview transcript would be here...",
      conversation_summary: "Professional interview with strong technical discussion",
      recording_url: "https://example.com/recording.mp3",
      analysis_score: 85,
      analysis_feedback: "Strong candidate with excellent technical and communication skills",
      hiring_recommendation: "Strong Yes"
    };

    // Step 1: Update the session with all analysis data (simulating webhook)
    console.log('📝 Saving analysis data to database...');
    
    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        // Vapi Analysis Results
        vapi_summary: mockAnalysisData.vapi_summary,
        vapi_success_evaluation: mockAnalysisData.vapi_success_evaluation,
        vapi_structured_data: mockAnalysisData.vapi_structured_data,
        
        // Processed fields
        analysis_score: mockAnalysisData.analysis_score,
        analysis_feedback: mockAnalysisData.analysis_feedback,
        strengths: mockAnalysisData.vapi_structured_data.strengths,
        areas_for_improvement: mockAnalysisData.vapi_structured_data.areasForImprovement,
        question_scores: mockAnalysisData.vapi_structured_data.questionResponses,
        
        // Enhanced fields
        category_scores: mockAnalysisData.vapi_structured_data.categoryScores,
        hiring_recommendation: mockAnalysisData.vapi_structured_data.hiringRecommendation,
        key_insights: mockAnalysisData.vapi_structured_data.keyInsights,
        interview_metrics: mockAnalysisData.vapi_structured_data.interviewMetrics,
        
        // Other data
        final_transcript: mockAnalysisData.final_transcript,
        conversation_summary: mockAnalysisData.conversation_summary,
        recording_url: mockAnalysisData.recording_url,
        
        // Mark as completed
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Analysis data saved successfully');

    // Step 2: Fetch the results (simulating results API)
    console.log('📊 Fetching results from database...');
    
    const fetchedSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        template: true,
        interviewer: true
      }
    });

    if (!fetchedSession) {
      throw new Error('Session not found after save');
    }

    // Step 3: Format results (same as results API)
    const formattedResults = {
      id: fetchedSession.id,
      candidateName: fetchedSession.candidate_name,
      candidateEmail: fetchedSession.candidate_email,
      position: fetchedSession.position,
      duration: fetchedSession.duration || 0,
      overallScore: (fetchedSession as any).analysis_score || 0,
      analysisScore: (fetchedSession as any).analysis_score || 0,
      analysisFeedback: (fetchedSession as any).analysis_feedback || '',
      strengths: (fetchedSession as any).strengths || [],
      areasForImprovement: (fetchedSession as any).areas_for_improvement || [],
      questionScores: (fetchedSession as any).question_scores,
      vapiSummary: (fetchedSession as any).vapi_summary,
      vapiSuccessEvaluation: (fetchedSession as any).vapi_success_evaluation,
      vapiStructuredData: (fetchedSession as any).vapi_structured_data,
      finalTranscript: (fetchedSession as any).final_transcript || '',
      conversationSummary: (fetchedSession as any).conversation_summary || '',
      recordingUrl: (fetchedSession as any).recording_url || '',
      completedAt: fetchedSession.completed_at?.toISOString() || '',
      status: fetchedSession.status,
      templateTitle: fetchedSession.template?.title || 'Test Template',
      interviewerName: fetchedSession.interviewer?.full_name || 'Test Interviewer',
      
      // Enhanced analysis data
      categoryScores: (fetchedSession as any).category_scores,
      hiringRecommendation: (fetchedSession as any).hiring_recommendation,
      keyInsights: (fetchedSession as any).key_insights,
      interviewMetrics: (fetchedSession as any).interview_metrics
    };

    console.log('✅ Results fetched and formatted successfully');

    // Step 4: Validation
    const validationResults = {
      hasSummary: !!(fetchedSession as any).vapi_summary,
      hasSuccessEvaluation: !!(fetchedSession as any).vapi_success_evaluation,
      hasStructuredData: !!(fetchedSession as any).vapi_structured_data,
      hasAnalysisScore: !!(fetchedSession as any).analysis_score,
      hasStrengths: !!((fetchedSession as any).strengths?.length),
      hasAreasForImprovement: !!((fetchedSession as any).areas_for_improvement?.length),
      hasQuestionScores: !!(fetchedSession as any).question_scores,
      hasCategoryScores: !!(fetchedSession as any).category_scores,
      hasHiringRecommendation: !!(fetchedSession as any).hiring_recommendation,
      hasKeyInsights: !!((fetchedSession as any).key_insights?.length),
      hasInterviewMetrics: !!(fetchedSession as any).interview_metrics
    };

    const allFieldsPresent = Object.values(validationResults).every(Boolean);

    return NextResponse.json({
      success: true,
      message: 'Database save/fetch flow test completed',
      testResults: {
        sessionId,
        saveSuccessful: true,
        fetchSuccessful: true,
        allFieldsPresent,
        validationResults,
        sampleData: {
          overallScore: formattedResults.overallScore,
          strengthsCount: formattedResults.strengths.length,
          questionCount: formattedResults.vapiSummary?.questions?.length || 0,
          hiringRecommendation: formattedResults.hiringRecommendation
        }
      },
      formattedResults // Include the full results for inspection
    });

  } catch (error) {
    console.error('Database save/fetch test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database save/fetch flow test failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({
      error: 'sessionId parameter is required',
      usage: 'GET /api/test-db-flow?sessionId=your-session-id'
    }, { status: 400 });
  }

  try {
    // Check if session exists
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        template: true,
        interviewer: true
      }
    });

    if (!session) {
      return NextResponse.json({
        error: 'Session not found',
        sessionId
      }, { status: 404 });
    }

    // Check what data is currently saved
    const dataStatus = {
      basicInfo: {
        candidateName: session.candidate_name,
        position: session.position,
        status: session.status
      },
      vapiData: {
        hasSummary: !!(session as any).vapi_summary,
        hasSuccessEvaluation: !!(session as any).vapi_success_evaluation,
        hasStructuredData: !!(session as any).vapi_structured_data,
        hasTranscript: !!(session as any).final_transcript
      },
      analysisData: {
        hasAnalysisScore: !!(session as any).analysis_score,
        hasAnalysisFeedback: !!(session as any).analysis_feedback,
        hasStrengths: !!((session as any).strengths?.length),
        hasAreasForImprovement: !!((session as any).areas_for_improvement?.length),
        hasQuestionScores: !!(session as any).question_scores
      },
      enhancedData: {
        hasCategoryScores: !!(session as any).category_scores,
        hasHiringRecommendation: !!(session as any).hiring_recommendation,
        hasKeyInsights: !!((session as any).key_insights?.length),
        hasInterviewMetrics: !!(session as any).interview_metrics
      }
    };

    return NextResponse.json({
      success: true,
      sessionId,
      dataStatus,
      instructions: {
        testSaveFlow: `POST /api/test-db-flow with { "sessionId": "${sessionId}" }`,
        viewResults: `/results?session=${sessionId}`,
        fetchResults: `/api/interviews/results?sessionId=${sessionId}`
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

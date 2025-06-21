import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Type for category scores to handle JSON fields safely
interface CategoryScores {
  technical?: number
  communication?: number
  problemSolving?: number
  leadership?: number
  culturalFit?: number
  cultural_fit?: number
  adaptability?: number
}

// Helper function to safely parse JSON fields
function safeParseCategoryScores(scores: any): CategoryScores {
  if (!scores) return {}
  if (typeof scores === 'string') {
    try {
      return JSON.parse(scores)
    } catch {
      return {}
    }
  }
  return scores as CategoryScores
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const position = searchParams.get('position') || ''
    const status = searchParams.get('status') || ''
    const scoreMin = searchParams.get('scoreMin') ? parseInt(searchParams.get('scoreMin')!) : undefined
    const scoreMax = searchParams.get('scoreMax') ? parseInt(searchParams.get('scoreMax')!) : undefined

    const offset = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (search) {
      where.OR = [
        { candidate_name: { contains: search, mode: 'insensitive' } },
        { candidate_email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (position) {
      where.position = { contains: position, mode: 'insensitive' }
    }

    if (status) {
      where.status = status
    }

    if (scoreMin !== undefined || scoreMax !== undefined) {
      where.overall_score = {}
      if (scoreMin !== undefined) where.overall_score.gte = scoreMin
      if (scoreMax !== undefined) where.overall_score.lte = scoreMax
    }

    // Get sessions with template and interviewer info
    const sessions = await prisma.interviewSession.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            title: true,
            name: true
          }
        },
        interviewer: {
          select: {
            id: true,
            full_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: offset,
      take: limit
    })    // Get total count for pagination
    const totalCount = await prisma.interviewSession.count({ where })

    // Format the results to match the expected structure
    const formattedResults = sessions.map(session => {
      const categoryScores = safeParseCategoryScores(session.category_scores)
      const keyInsights = Array.isArray(session.key_insights) ? session.key_insights : []
      const strengths = Array.isArray(session.strengths) ? session.strengths : []
      const areasForImprovement = Array.isArray(session.areas_for_improvement) ? session.areas_for_improvement : []
      
      return {
      id: session.id,
      candidateName: session.candidate_name,
      candidateEmail: session.candidate_email,
      position: session.position,
      interviewDate: session.created_at,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      duration: session.duration || 0,
      overallScore: session.overall_score || session.analysis_score || 0,
      status: session.status,
      
      // Template and interviewer info
      templateTitle: session.template?.title || session.template?.name || 'Unknown Template',
      interviewerName: session.interviewer?.full_name || 'Unknown Interviewer',
      
      // Vapi data
      vapiCallId: session.vapi_call_id,
      vapiAssistantId: session.vapi_assistant_id,
      vapiCost: session.vapi_cost,      
      // Analysis data
      analysisScore: session.analysis_score,
      analysisFeedback: session.analysis_feedback,
      strengths: strengths,
      areasForImprovement: areasForImprovement,
      
      // Transcript and recordings
      finalTranscript: session.final_transcript || '',
      conversationSummary: session.conversation_summary || '',
      recordingUrl: session.recording_url,
      transcriptPreview: session.final_transcript ? 
        session.final_transcript.substring(0, 100) + '...' : 
        'No transcript available',
      
      // Vapi analysis results
      vapiSummary: session.vapi_summary,
      vapiSuccessEvaluation: session.vapi_success_evaluation,
      vapiStructuredData: session.vapi_structured_data,
      
      // Enhanced analysis
      categoryScores: categoryScores,
      hiringRecommendation: session.hiring_recommendation,
      keyInsights: keyInsights,
      interviewMetrics: session.interview_metrics,
        // Derived metrics for compatibility with existing UI
      metrics: {
        technical: categoryScores.technical || 0,
        communication: categoryScores.communication || 0,
        problemSolving: categoryScores.problemSolving || categoryScores.technical || 0,
        culturalFit: categoryScores.culturalFit || categoryScores.cultural_fit || 0
      },
      
      // AI insights from various sources
      aiInsights: [
        ...strengths,
        ...keyInsights,
        ...(session.analysis_feedback ? [session.analysis_feedback] : [])
      ].filter(Boolean).slice(0, 5), // Limit to top 5 insights
      
      // Competency scores (derived from available data)
      competencyScores: {
        'Technical Skills': categoryScores.technical || session.analysis_score || 0,
        'Communication': categoryScores.communication || session.analysis_score || 0,
        'Problem Solving': categoryScores.problemSolving || categoryScores.technical || session.analysis_score || 0,
        'Leadership': categoryScores.leadership || session.analysis_score || 0,        'Cultural Fit': categoryScores.culturalFit || categoryScores.cultural_fit || session.analysis_score || 0,
        'Adaptability': categoryScores.adaptability || session.analysis_score || 0
      }
    }
    })

    return NextResponse.json({
      success: true,
      results: formattedResults,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        search,
        position,
        status,
        scoreMin,
        scoreMax
      }
    })

  } catch (error) {
    console.error('Error fetching interview results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview results', details: error },
      { status: 500 }
    )
  }
}

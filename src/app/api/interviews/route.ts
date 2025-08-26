import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const position = searchParams.get('position') || ''
    const status = searchParams.get('status') || ''
    const interviewer = searchParams.get('interviewer') || ''

    const offset = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {
      interviewer_id: user.id // Only show interviews for the current user
    }
    
    if (search) {
      where.OR = [
        { candidate_name: { contains: search, mode: 'insensitive' } },
        { candidate_email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (position && position !== 'All Positions') {
      where.position = { contains: position, mode: 'insensitive' }
    }

    if (status && status !== 'All Status') {
      where.status = status
    }

    // Get sessions with template and interviewer info
    const sessions = await prisma.interviewSession.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            title: true,
            name: true,
            duration: true
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
    })

    // Get total count for pagination
    const totalCount = await prisma.interviewSession.count({ where })

    // Format the results to match the expected UI structure
    const formattedInterviews = sessions.map(session => {
      // Calculate progress based on status
      let progress = 0
      if (session.status === 'completed' || session.status === 'cancelled') {
        progress = 100
      } else if (session.status === 'in_progress') {
        progress = 50 // Could be calculated based on actual interview time
      }

      return {
        id: session.id,
        candidateName: session.candidate_name,
        candidateEmail: session.candidate_email,
        position: session.position,
        scheduledTime: session.created_at.toISOString(), // Use created_at as scheduled time
        duration: session.template?.duration || session.duration || 45,
        status: session.status,
        interviewer: session.interviewer?.full_name || 'Unknown',
        progress,
        transcript: session.final_transcript || session.transcript || 'No transcript available',
        notes: session.ai_insights?.join('; ') || 'No notes available',
        vapi_call_id: session.vapi_call_id,
        overall_score: session.overall_score,
        analysis_score: session.analysis_score,
        started_at: session.started_at,
        completed_at: session.completed_at
      }
    })

    return NextResponse.json({
      success: true,
      interviews: formattedInterviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test basic database connectivity
    const profileCount = await prisma.profile.count()
    const templateCount = await prisma.interviewTemplate.count()
    const sessionCount = await prisma.interviewSession.count()

    // Get sample data
    const recentProfiles = await prisma.profile.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        full_name: true,
        role: true,
        created_at: true,
        _count: {
          select: {
            interview_templates: true,
            interview_sessions: true
          }
        }
      }
    })

    const recentTemplates = await prisma.interviewTemplate.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        created_at: true,
        creator: {
          select: {
            full_name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Prisma database connection successful',
      stats: {
        profiles: profileCount,
        templates: templateCount,
        sessions: sessionCount
      },
      sample_data: {
        recent_profiles: recentProfiles,
        recent_templates: recentTemplates
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

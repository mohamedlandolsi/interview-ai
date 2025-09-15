import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthentication, handleCors, rateLimit } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  time: string
  timestamp: Date
  icon: string
  iconColor: string
}

export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  // Apply rate limiting
  const rateLimitResponse = rateLimit(request, { maxRequests: 30, windowMs: 60000 })
  if (rateLimitResponse) return rateLimitResponse

  // Verify authentication
  const { user, response } = await verifyAuthentication(request)
  if (response) return response

  try {
    const userId = user.id

    // Get user's profile to check company
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!profile?.companyId) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const activities: ActivityItem[] = []

    // Get recent interview sessions
    const recentSessions = await prisma.interviewSession.findMany({
      where: {
        interviewer: {
          companyId: profile.companyId
        }
      },
      include: {
        interviewer: true,
        template: true
      },
      orderBy: { updated_at: 'desc' },
      take: 10
    })

    // Add interview activities
    for (const session of recentSessions) {
      if (session.status === 'completed' && session.completed_at) {
        activities.push({
          id: `interview-completed-${session.id}`,
          type: 'interview_completed',
          title: 'Interview Completed',
          description: `${session.candidate_name} completed ${session.position} interview`,
          time: getTimeAgo(session.completed_at),
          timestamp: session.completed_at,
          icon: 'CheckCircle',
          iconColor: 'text-green-500'
        })
      } else if (session.status === 'in_progress' && session.started_at) {
        activities.push({
          id: `interview-started-${session.id}`,
          type: 'interview_started',
          title: 'Interview Started',
          description: `${session.candidate_name} started ${session.position} interview`,
          time: getTimeAgo(session.started_at),
          timestamp: session.started_at,
          icon: 'Clock',
          iconColor: 'text-orange-500'
        })
      } else if (session.status === 'scheduled') {
        activities.push({
          id: `interview-scheduled-${session.id}`,
          type: 'interview_scheduled',
          title: 'Interview Scheduled',
          description: `${session.candidate_name} scheduled for ${session.position} interview`,
          time: getTimeAgo(session.created_at),
          timestamp: session.created_at,
          icon: 'Calendar',
          iconColor: 'text-blue-500'
        })
      }
    }

    // Get recent interview templates
    const recentTemplates = await prisma.interviewTemplate.findMany({
      where: {
        creator: {
          companyId: profile.companyId
        }
      },
      include: {
        creator: true
      },
      orderBy: { created_at: 'desc' },
      take: 5
    })

    // Add template activities
    for (const template of recentTemplates) {
      activities.push({
        id: `template-created-${template.id}`,
        type: 'template_created',
        title: 'Template Created',
        description: `New ${template.title} interview template created`,
        time: getTimeAgo(template.created_at),
        timestamp: template.created_at,
        icon: 'FileText',
        iconColor: 'text-purple-500'
      })
    }

    // Get recent notifications for system alerts
    const recentNotifications = await prisma.notification.findMany({
      where: {
        profile: {
          companyId: profile.companyId
        },
        type: 'GENERAL_ANNOUNCEMENT'
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    // Add notification activities
    for (const notification of recentNotifications) {
      activities.push({
        id: `notification-${notification.id}`,
        type: 'system_alert',
        title: 'System Alert',
        description: notification.message,
        time: getTimeAgo(notification.createdAt),
        timestamp: notification.createdAt,
        icon: 'AlertCircle',
        iconColor: 'text-red-500'
      })
    }

    // Sort all activities by timestamp (most recent first) and limit to 8
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8)
      .map(({ timestamp, ...activity }) => activity) // Remove timestamp from response

    return NextResponse.json({
      success: true,
      activities: sortedActivities
    })

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  } else {
    return date.toLocaleDateString()
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadNotificationCount 
} from '@/lib/notification-service'

/**
 * GET /api/notifications
 * Fetch notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get query parameters
    const url = new URL(request.url)
    const limit = url.searchParams.get('limit')
    const limitNumber = limit ? parseInt(limit, 10) : undefined

    // Fetch notifications
    const notifications = await getUserNotifications(profile.id, limitNumber)
    const unreadCount = await getUnreadNotificationCount(profile.id)

    return NextResponse.json({
      notifications,
      unreadCount,
      success: true
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 * Body: { notificationId?: string } - if provided, marks specific notification as read
 * If no notificationId, marks all notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { notificationId } = body

    if (notificationId) {
      // Mark specific notification as read
      await markNotificationAsRead(notificationId, profile.id)
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      })
    } else {
      // Mark all notifications as read
      const result = await markAllNotificationsAsRead(profile.id)
      return NextResponse.json({
        success: true,
        message: `${result.count} notifications marked as read`
      })
    }

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

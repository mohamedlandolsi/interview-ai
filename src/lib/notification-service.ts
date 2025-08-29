import { PrismaClient, NotificationType } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateNotificationData {
  profileId: string
  type: NotificationType
  message: string
  link?: string
}

/**
 * Creates a new notification for a user
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        profileId: data.profileId,
        type: data.type,
        message: data.message,
        link: data.link,
      },
    })

    console.log(`Notification created for user ${data.profileId}: ${data.message}`)
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string, profileId: string) {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        profileId: profileId, // Ensure user can only mark their own notifications
      },
      data: {
        isRead: true,
      },
    })

    return notification
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(profileId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        profileId: profileId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    console.log(`Marked ${result.count} notifications as read for user ${profileId}`)
    return result
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(profileId: string, limit?: number) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        profileId: profileId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return notifications
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    throw error
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(profileId: string) {
  try {
    const count = await prisma.notification.count({
      where: {
        profileId: profileId,
        isRead: false,
      },
    })

    return count
  } catch (error) {
    console.error('Error fetching unread notification count:', error)
    throw error
  }
}

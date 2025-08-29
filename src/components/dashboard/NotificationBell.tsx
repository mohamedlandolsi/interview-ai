"use client"

import { useState } from 'react'
import { Bell, Clock, FileText, MessageSquare, Users, CheckCircle2 } from 'lucide-react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'INTERVIEW_STARTED' | 'INTERVIEW_COMPLETED' | 'RESULTS_READY' | 'TEMPLATE_SHARED' | 'GENERAL_ANNOUNCEMENT'
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

interface NotificationResponse {
  notifications: Notification[]
  unreadCount: number
  success: boolean
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

// Icon mapping for notification types
const getNotificationIcon = (type: Notification['type']) => {
  const iconClass = "h-4 w-4 mr-3 flex-shrink-0"
  
  switch (type) {
    case 'INTERVIEW_STARTED':
      return <Clock className={`${iconClass} text-blue-500`} />
    case 'INTERVIEW_COMPLETED':
      return <CheckCircle2 className={`${iconClass} text-green-500`} />
    case 'RESULTS_READY':
      return <FileText className={`${iconClass} text-purple-500`} />
    case 'TEMPLATE_SHARED':
      return <Users className={`${iconClass} text-orange-500`} />
    case 'GENERAL_ANNOUNCEMENT':
      return <MessageSquare className={`${iconClass} text-gray-500`} />
    default:
      return <Bell className={`${iconClass} text-gray-500`} />
  }
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Fetch notifications using SWR
  const { data, error, mutate } = useSWR<NotificationResponse>(
    '/api/notifications?limit=20',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0
  const isLoading = !data && !error

  // Mark all notifications as read when popover opens
  const handlePopoverOpen = async (open: boolean) => {
    setIsOpen(open)
    
    if (open && unreadCount > 0) {
      try {
        // Optimistically update UI
        mutate(
          {
            ...data!,
            notifications: notifications.map(n => ({ ...n, isRead: true })),
            unreadCount: 0
          },
          false
        )

        // Make API call to mark as read
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Empty body marks all as read
        })

        // Revalidate data
        mutate()
      } catch (error) {
        console.error('Error marking notifications as read:', error)
        // Revert optimistic update
        mutate()
      }
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      window.location.href = notification.link
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {/* Loading skeleton */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="h-4 w-4 bg-muted rounded-full flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Failed to load notifications
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          !notification.isRead ? 'font-medium' : 'font-normal'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

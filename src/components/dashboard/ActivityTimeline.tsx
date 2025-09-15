"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, UserPlus, FileText, AlertCircle, Calendar } from "lucide-react"
import { useRecentActivity } from "@/hooks/useRecentActivity"

// Icon mapping for different activity types
const iconMap = {
  CheckCircle,
  Clock,
  UserPlus,
  FileText,
  AlertCircle,
  Calendar,
}

export function ActivityTimeline() {
  const { activities, loading, error } = useRecentActivity()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load recent activity
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity will appear here as you use the platform
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.map((activity, index) => {
          const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Clock
          
          return (
            <div key={activity.id} className="relative flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${activity.iconColor}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              {index < activities.length - 1 && (
                <div 
                  className="absolute left-8 mt-8 w-px h-6 bg-border" 
                  style={{ marginLeft: '15px' }} 
                />
              )}
            </div>
          )
        })}
        <div className="pt-4 border-t">
          <button className="text-sm text-primary hover:underline">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, UserPlus, FileText, AlertCircle } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "interview_completed",
    title: "Interview Completed",
    description: "Sarah Wilson completed Frontend Developer interview",
    time: "2 minutes ago",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    id: 2,
    type: "candidate_invited",
    title: "Candidate Invited",
    description: "Invitation sent to Michael Chen for Product Manager role",
    time: "15 minutes ago",
    icon: UserPlus,
    iconColor: "text-blue-500",
  },
  {
    id: 3,
    type: "template_created",
    title: "Template Created",
    description: "New Backend Developer interview template created",
    time: "1 hour ago",
    icon: FileText,
    iconColor: "text-purple-500",
  },
  {
    id: 4,
    type: "interview_started",
    title: "Interview Started",
    description: "Emma Thompson started UI/UX Designer interview",
    time: "2 hours ago",
    icon: Clock,
    iconColor: "text-orange-500",
  },
  {
    id: 5,
    type: "system_alert",
    title: "System Alert",
    description: "Interview server maintenance scheduled for tonight",
    time: "3 hours ago",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
]

export function ActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${activity.iconColor}`}>
              <activity.icon className="h-4 w-4" />
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
              <div className="absolute left-8 mt-8 w-px h-6 bg-border" style={{ marginLeft: '15px' }} />
            )}
          </div>
        ))}
        <div className="pt-4 border-t">
          <button className="text-sm text-primary hover:underline">
            View all activity
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

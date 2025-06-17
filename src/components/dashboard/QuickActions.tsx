import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Users, Settings, BarChart3 } from "lucide-react"

const quickActions = [
  {
    title: "New Interview",
    description: "Start a new interview session",
    icon: Plus,
    action: "primary",
    href: "/dashboard/interviews/new"
  },
  {
    title: "Create Template",
    description: "Design a new interview template",
    icon: FileText,
    action: "secondary",
    href: "/dashboard/templates/new"
  },
  {
    title: "Invite Candidates",
    description: "Send interview invitations",
    icon: Users,
    action: "outline",
    href: "/dashboard/candidates/invite"
  },
  {
    title: "View Analytics",
    description: "Check performance metrics",
    icon: BarChart3,
    action: "outline",
    href: "/dashboard/analytics"
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant={action.action as any}
            className="h-auto p-4 flex flex-col items-start space-y-2 hover:scale-105 transition-transform"
            onClick={() => console.log(`Navigate to ${action.href}`)}
          >
            <div className="flex items-center space-x-2 w-full">
              <action.icon className="h-5 w-5" />
              <span className="font-medium">{action.title}</span>
            </div>
            <p className="text-xs text-left opacity-70 leading-relaxed">
              {action.description}
            </p>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

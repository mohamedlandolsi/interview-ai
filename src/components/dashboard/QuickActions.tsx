"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Users, BarChart3, Eye, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/hooks/useAuth"
import { useDashboardStats } from "@/hooks/useDashboardStats"

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  variant: "default" | "secondary" | "outline" | "destructive"
  href: string
  permission?: string
  role?: string
  showWhen?: (stats: any) => boolean
}

export function QuickActions() {
  const router = useRouter()
  const { hasPermission, isAdmin, role } = usePermissions()
  const { stats } = useDashboardStats()

  // Define all possible actions with permissions and conditions
  const allActions: QuickAction[] = [
    {
      title: "New Interview",
      description: "Start a new interview session",
      icon: Plus,
      variant: "default",
      href: "/interviews",
      permission: "interviews:create"
    },
    {
      title: "Create Template",
      description: "Design a new interview template",
      icon: FileText,
      variant: "secondary",
      href: "/templates",
      permission: "templates:create"
    },
    {
      title: "View Results",
      description: "Check completed interviews",
      icon: Eye,
      variant: "outline",
      href: "/results",
      permission: "results:read",
      showWhen: (stats) => stats?.totalInterviews > 0
    },
    {
      title: "View Analytics",
      description: "Check performance metrics",
      icon: BarChart3,
      variant: "outline",
      href: "/results",
      permission: "results:read",
      showWhen: (stats) => stats?.totalInterviews > 2
    },
    {
      title: "System Settings",
      description: "Manage integrations and system",
      icon: Settings,
      variant: "outline",
      href: "/settings",
      role: "admin"
    },
    {
      title: "First Interview",
      description: "Get started with your first interview",
      icon: Plus,
      variant: "default",
      href: "/interviews",
      permission: "interviews:create",
      showWhen: (stats) => stats?.totalInterviews === 0
    }
  ]

  // Filter actions based on permissions and conditions
  const visibleActions = allActions.filter(action => {
    // Check role-based access
    if (action.role) {
      if (action.role === "admin" && !isAdmin()) return false
    }

    // Check permission-based access
    if (action.permission) {
      if (!hasPermission(action.permission)) return false
    }

    // Check conditional display
    if (action.showWhen) {
      if (!action.showWhen(stats)) return false
    }

    return true
  })

  // Remove duplicates and prioritize based on stats
  const finalActions = (() => {
    const actionMap = new Map<string, QuickAction>()
    
    visibleActions.forEach(action => {
      const key = action.href
      
      // Prioritize contextual actions
      if (action.title.includes("First") && stats?.totalInterviews === 0) {
        actionMap.set(key, action)
      } else if (!action.title.includes("First")) {
        actionMap.set(key, action)
      }
    })
    
    return Array.from(actionMap.values()).slice(0, 4) // Limit to 4 actions
  })()

  const handleActionClick = (href: string) => {
    router.push(href)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {finalActions.map((action, index) => (
          <Button
            key={`${action.href}-${index}`}
            variant={action.variant}
            className="h-auto p-4 flex flex-col items-start space-y-2 hover:scale-105 transition-transform"
            onClick={() => handleActionClick(action.href)}
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
        
        {finalActions.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No actions available</p>
            <p className="text-xs">Contact admin for access</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

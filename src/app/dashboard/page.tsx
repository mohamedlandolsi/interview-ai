"use client"

import { DashboardLayout } from "@/components/Layout"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline"
import { ChartPlaceholder } from "@/components/dashboard/ChartPlaceholder"
import { DashboardRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'there'
  }

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}  
          <div className="flex flex-col space-y-2">            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {loading ? (
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              ) : (
                `Welcome back, ${getDisplayName()}! 👋`
              )}
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your interviews today.
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts and Tables */}
            <div className="lg:col-span-2 space-y-6">
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartPlaceholder title="Interview Trends" />
                <ChartPlaceholder title="Success Rate" />
              </div>

              {/* Recent Interviews Table */}
              <RecentInterviewsTable />
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <QuickActions />

              {/* Activity Timeline */}
              <ActivityTimeline />
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder title="Performance by Department" height="h-48" />
            <ChartPlaceholder title="Interview Duration Analysis" height="h-48" />
          </div>
        </div>
      </DashboardLayout>
    </DashboardRoute>
  )
}

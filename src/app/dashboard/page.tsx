"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { RecentInterviewsTable } from "@/components/dashboard/RecentInterviewsTable"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline"
import { ChartPlaceholder } from "@/components/dashboard/ChartPlaceholder"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Section */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, John! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your interviews today.
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
        </main>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StatsCards() {
  const { stats, loading, error, refetch } = useDashboardStats()

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              Failed to load dashboard statistics: {error}
              <button 
                onClick={refetch}
                className="ml-4 text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      title: "Total Interviews",
      value: stats.totalInterviews.toLocaleString(),
      change: `+${((stats.totalInterviews / Math.max(stats.totalInterviews - stats.thisMonth, 1)) * 100 - 100).toFixed(1)}%`,
      changeType: "positive" as const,
      icon: Users,
      description: "All time"
    },
    {
      title: "This Month",
      value: stats.thisMonth.toString(),
      change: stats.monthlyGrowth,
      changeType: (stats.monthlyGrowth.startsWith('+') || stats.monthlyGrowth === '0.0%') ? "positive" as const : "negative" as const,
      icon: Calendar,
      description: "Compared to last month"
    },
    {
      title: "Success Rate",
      value: stats.successRate,
      change: stats.successRateTrend,
      changeType: (stats.successRateTrend.startsWith('+') || stats.successRateTrend === '0.0%') ? "positive" as const : "negative" as const,
      icon: TrendingUp,
      description: "Interview completion rate"
    },
    {
      title: "Avg Duration",
      value: stats.avgDuration,
      change: stats.durationTrend,
      changeType: (stats.durationTrend.startsWith('-')) ? "positive" as const : "negative" as const, // Negative duration change is good
      icon: Clock,
      description: "Average interview time"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {stat.change}
              </span>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

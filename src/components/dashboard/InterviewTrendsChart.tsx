"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useDashboardCharts } from "@/hooks/useDashboardCharts"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

export function InterviewTrendsChart() {
  const { data, loading, error } = useDashboardCharts()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 animate-pulse">
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
            <div className="text-center space-y-2">
              <div className="text-muted-foreground text-2xl">⚠️</div>
              <p className="text-sm text-muted-foreground">Failed to load chart</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data?.interviewTrends || []

  // Calculate trend
  const recentTrend = chartData.length >= 2 
    ? chartData[chartData.length - 1].interviews - chartData[chartData.length - 2].interviews
    : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
            Total Interviews: {payload[0]?.value}
          </p>
          <p className="text-green-600">
            <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-2"></span>
            Completed: {payload[1]?.value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Interview Trends</span>
          <div className="flex items-center text-sm">
            {recentTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : recentTrend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            ) : null}
            <span className={`text-xs ${recentTrend > 0 ? 'text-green-600' : recentTrend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {recentTrend > 0 ? `+${recentTrend}` : recentTrend} this month
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No interview data yet</p>
              <p className="text-xs text-muted-foreground">Start your first interview to see trends</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="interviews" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                name="Total Interviews"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
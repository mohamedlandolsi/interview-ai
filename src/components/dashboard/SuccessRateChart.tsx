"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useDashboardCharts } from "@/hooks/useDashboardCharts"
import { Target, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

export function SuccessRateChart() {
  const { data, loading, error } = useDashboardCharts()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 animate-pulse">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 mx-auto text-muted-foreground" />
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
          <CardTitle>Success Rate</CardTitle>
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
  const statusData = data?.statusDistribution || []

  // Calculate trend
  const recentTrend = chartData.length >= 2 
    ? chartData[chartData.length - 1].successRate - chartData[chartData.length - 2].successRate
    : 0

  // Calculate overall success rate
  const totalInterviews = statusData.reduce((sum, item) => sum + item.count, 0)
  const completedInterviews = statusData.find(item => item.status === 'completed')?.count || 0
  const overallSuccessRate = totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0

  // Prepare pie chart data
  const pieData = statusData.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    percentage: totalInterviews > 0 ? Math.round((item.count / totalInterviews) * 100) : 0
  }))

  const COLORS = {
    'Completed': 'hsl(var(--chart-2))',
    'In-progress': 'hsl(var(--chart-3))',
    'Pending': 'hsl(var(--chart-4))',
    'Failed': 'hsl(var(--chart-5))',
    'Cancelled': 'hsl(var(--muted))'
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-green-600">
            <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-2"></span>
            Success Rate: {payload[0]?.value}%
          </p>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            Count: {data.value} ({data.percentage}%)
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
          <span>Success Rate</span>
          <div className="flex items-center text-sm">
            {recentTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : recentTrend < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            ) : null}
            <span className={`text-xs ${recentTrend > 0 ? 'text-green-600' : recentTrend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {recentTrend > 0 ? `+${recentTrend}%` : `${recentTrend}%`} change
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No success data yet</p>
              <p className="text-xs text-muted-foreground">Complete interviews to see success rates</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Success Rate Display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{overallSuccessRate}%</div>
              <div className="text-sm text-muted-foreground">Overall Success Rate</div>
            </div>

            {/* Success Rate Trend Area Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-muted-foreground text-xs"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  className="text-muted-foreground text-xs"
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="hsl(var(--chart-2))" 
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Status Distribution - Mini Pie Chart */}
            {pieData.length > 0 && (
              <div className="flex items-center justify-center">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.name as keyof typeof COLORS] || 'hsl(var(--muted))'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="ml-4 space-y-1">
                  {pieData.slice(0, 3).map((entry, index) => (
                    <div key={entry.name} className="flex items-center text-xs">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] || 'hsl(var(--muted))' }}
                      />
                      <span className="text-muted-foreground">{entry.name}: {entry.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
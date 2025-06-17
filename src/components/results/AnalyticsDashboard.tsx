'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

interface AnalyticsDashboardProps {
  results: any[]
}

export function AnalyticsDashboard({ results }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState('month')

  // Calculate date ranges
  const now = new Date()
  const ranges = {
    week: { start: startOfWeek(now), end: endOfWeek(now) },
    month: { start: startOfMonth(now), end: endOfMonth(now) },
    quarter: { start: subDays(now, 90), end: now }
  }

  const currentRange = ranges[dateRange as keyof typeof ranges]
  const filteredResults = results.filter(r => 
    r.interviewDate >= currentRange.start && r.interviewDate <= currentRange.end
  )

  // Calculate metrics
  const totalInterviews = filteredResults.length
  const avgScore = Math.round(filteredResults.reduce((acc, r) => acc + r.overallScore, 0) / totalInterviews || 0)
  const highPerformers = filteredResults.filter(r => r.overallScore >= 80).length
  const passRate = Math.round((highPerformers / totalInterviews) * 100) || 0

  // Position analysis
  const positionStats = filteredResults.reduce((acc, result) => {
    if (!acc[result.position]) {
      acc[result.position] = { count: 0, totalScore: 0, avgScore: 0 }
    }
    acc[result.position].count++
    acc[result.position].totalScore += result.overallScore
    acc[result.position].avgScore = Math.round(acc[result.position].totalScore / acc[result.position].count)
    return acc
  }, {} as Record<string, { count: number; totalScore: number; avgScore: number }>)

  // Score distribution
  const scoreRanges = {
    'Excellent (90-100)': filteredResults.filter(r => r.overallScore >= 90).length,
    'Good (80-89)': filteredResults.filter(r => r.overallScore >= 80 && r.overallScore < 90).length,
    'Average (70-79)': filteredResults.filter(r => r.overallScore >= 70 && r.overallScore < 80).length,
    'Poor (<70)': filteredResults.filter(r => r.overallScore < 70).length
  }

  // Competency averages
  const competencyAverages = filteredResults.reduce((acc, result) => {
    Object.entries(result.metrics).forEach(([key, value]) => {
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0, avg: 0 }
      }
      acc[key].total += value as number
      acc[key].count++
      acc[key].avg = Math.round(acc[key].total / acc[key].count)
    })
    return acc
  }, {} as Record<string, { total: number; count: number; avg: number }>)

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Interview Analytics Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex gap-2">
              {['week', 'month', 'quarter'].map(range => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                      <p className="text-2xl font-bold">{totalInterviews}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">{avgScore}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                      <p className="text-2xl font-bold">{passRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">High Performers</p>
                      <p className="text-2xl font-bold">{highPerformers}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(scoreRanges).map(([range, count]) => {
                    const percentage = Math.round((count / totalInterviews) * 100) || 0
                    return (
                      <div key={range} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{range}</span>
                          <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Position</CardTitle>
              </CardHeader>              <CardContent>
                <div className="space-y-4">
                  {Object.entries(positionStats).map(([position, stats]) => {
                    const positionData = stats as { count: number; totalScore: number; avgScore: number }
                    return (
                      <div key={position} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">{position}</h3>
                          <Badge variant="outline">{positionData.count} interviews</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Average Score: </span>
                            <span className="font-medium">{positionData.avgScore}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Candidates: </span>
                            <span className="font-medium">{positionData.count}</span>
                          </div>
                        </div>
                        <Progress value={positionData.avgScore} className="h-2 mt-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competencies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Competency Scores</CardTitle>
              </CardHeader>              <CardContent>
                <div className="space-y-4">
                  {Object.entries(competencyAverages).map(([competency, data]) => {
                    const competencyData = data as { total: number; count: number; avg: number }
                    return (
                      <div key={competency} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {competency.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-sm font-bold">{competencyData.avg}%</span>
                        </div>
                        <Progress value={competencyData.avg} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trend analysis will be available with more historical data.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

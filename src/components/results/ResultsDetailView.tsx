'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  User, 
  Calendar, 
  Clock, 
  Star, 
  Download, 
  MessageSquare, 
  BarChart3, 
  Brain,
  TrendingUp,
  Award,
  Target
} from 'lucide-react'
import { format } from 'date-fns'
import { CompetencyRadarChart } from './CompetencyRadarChart'
import { ScoreChart } from './ScoreChart'
import { TranscriptViewer } from './TranscriptViewer'

interface ResultsDetailViewProps {
  result: any
}

// Mock detailed transcript data
const mockTranscript = [
  {
    timestamp: '00:00:15',
    speaker: 'Interviewer',
    content: 'Thank you for joining us today. Can you start by telling me about your experience with React and TypeScript?'
  },
  {
    timestamp: '00:00:25',
    speaker: 'Candidate',
    content: 'Absolutely! I have been working with React for about 4 years now, and TypeScript for the last 2 years in my current role at TechCorp. I\'ve built several large-scale applications using React with TypeScript, including a customer dashboard that serves over 10,000 users daily.'
  },
  {
    timestamp: '00:01:10',
    speaker: 'Interviewer',
    content: 'That sounds impressive. Can you walk me through a challenging technical problem you solved recently?'
  },
  {
    timestamp: '00:01:20',
    speaker: 'Candidate',
    content: 'Sure! We had a performance issue with our main dashboard where the initial load time was over 8 seconds. I implemented code splitting, lazy loading, and optimized our Redux state management. We also added React.memo and useMemo in strategic places. The result was a 60% reduction in load time.'
  },
  {
    timestamp: '00:02:30',
    speaker: 'Interviewer',
    content: 'Excellent problem-solving approach. How do you stay updated with the latest developments in React and frontend technologies?'
  },
  {
    timestamp: '00:02:40',
    speaker: 'Candidate',
    content: 'I follow several approaches: I read the official React blog, follow key developers on Twitter, participate in our local React meetup, and I have a side project where I experiment with new features. Recently, I\'ve been exploring React Server Components and the new concurrent features.'
  }
]

const mockDetailedAnalysis = {
  strengths: [
    'Demonstrates deep technical knowledge of React and TypeScript',
    'Shows practical problem-solving skills with real-world examples',
    'Excellent communication and articulation of complex concepts',
    'Proactive about staying current with technology trends',
    'Quantifies achievements with specific metrics'
  ],
  areasForImprovement: [
    'Could benefit from more leadership experience examples',
    'Limited discussion of system design at scale',
    'Opportunity to demonstrate more cross-functional collaboration'
  ],
  recommendations: [
    'Strong candidate for senior individual contributor role',
    'Consider for team lead position with mentoring responsibilities',
    'Excellent fit for high-visibility technical projects'
  ],
  overallAssessment: 'This candidate demonstrates exceptional technical competency with strong problem-solving abilities. Their experience with performance optimization and modern React patterns makes them a valuable addition to any development team. Communication skills are excellent, making them suitable for client-facing or cross-team collaboration roles.'
}

export function ResultsDetailView({ result }: ResultsDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!result) return null
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 80) return 'text-blue-600 dark:text-blue-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">          <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{result.candidateName}</h2>            <p className="text-muted-foreground">{result.candidateEmail}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(result.interviewDate, 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {result.duration} minutes
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold">{result.overallScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <Badge variant="outline">{result.position}</Badge>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>              <CardContent className="space-y-4">
                {Object.entries(result.metrics).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`font-bold ${getScoreColor(value as number)}`}>
                        {value as number}%
                      </span>
                    </div>
                    <Progress 
                      value={value as number} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Competency Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Competency Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CompetencyRadarChart data={result.competencyScores} />
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                <div className="bg-green-500/10 dark:bg-green-500/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Top Strength</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {Object.entries(result.metrics).reduce((a, b) => 
                      result.metrics[a[0]] > result.metrics[b[0]] ? a : b
                    )[0].replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Overall Performance</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {result.overallScore >= 90 ? 'Exceptional' :
                     result.overallScore >= 80 ? 'Strong' :  
                     result.overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
                <div className="bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">Interview Duration</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {result.duration > 45 ? 'Comprehensive' :
                     result.duration > 30 ? 'Standard' : 'Brief'} discussion
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Full Interview Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.finalTranscript ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                      {result.finalTranscript}
                    </pre>
                  </div>
                  
                  {result.recordingUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Recording available</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={result.recordingUrl} target="_blank" rel="noopener noreferrer">
                          Listen to Recording
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No transcript available for this interview</p>
                  <p className="text-sm text-gray-400 mt-2">
                    The interview may still be in progress or the transcript is being processed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Analysis (Gemini 2.5 Flash)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths */}
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-3">Strengths</h3>
                {result.strengths && result.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {result.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No strengths analysis available yet</p>
                )}
              </div>

              <Separator />

              {/* Areas for Improvement */}
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-3">Areas for Improvement</h3>
                {result.areasForImprovement && result.areasForImprovement.length > 0 ? (
                  <ul className="space-y-2">
                    {result.areasForImprovement.map((area: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{area}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No improvement areas analysis available yet</p>
                )}
              </div>

              <Separator />

              {/* Key Insights */}
              {result.keyInsights && result.keyInsights.length > 0 && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-3">Key Insights</h3>
                    <ul className="space-y-2">
                      {result.keyInsights.map((insight: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />
                </>
              )}

              {/* Overall Assessment */}
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">Overall Assessment</h3>
                {result.analysisFeedback ? (
                  <p className="text-sm leading-relaxed">{result.analysisFeedback}</p>
                ) : (
                  <p className="text-sm text-gray-500">No overall assessment available yet</p>
                )}
              </div>

              {/* Hiring Recommendation */}
              {result.hiringRecommendation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold mb-3">Hiring Recommendation</h3>
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={
                        result.hiringRecommendation === 'Strong Hire' || result.hiringRecommendation === 'Hire' 
                          ? 'default' 
                          : result.hiringRecommendation === 'Maybe' 
                          ? 'secondary' 
                          : 'destructive'
                      }
                      className="text-lg px-4 py-2"
                    >
                      {result.hiringRecommendation}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Recommendation based on comprehensive AI analysis
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Scoring Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreChart data={result.competencyScores} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scoring Methodology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-500/10 dark:bg-green-500/20 rounded border border-green-200 dark:border-green-800">
                    <span className="font-medium">Excellent (90-100)</span>
                    <Badge variant="default">Exceeds Expectations</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded border border-blue-200 dark:border-blue-800">
                    <span className="font-medium">Good (80-89)</span>
                    <Badge variant="secondary">Meets Expectations</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <span className="font-medium">Average (70-79)</span>
                    <Badge variant="outline">Partially Meets</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-500/10 dark:bg-red-500/20 rounded border border-red-200 dark:border-red-800">
                    <span className="font-medium">Poor (&lt;70)</span>
                    <Badge variant="destructive">Below Expectations</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Technical Skills:</strong> Code quality, best practices, problem-solving approach</p>
                  <p><strong>Communication:</strong> Clarity, articulation, listening skills</p>
                  <p><strong>Problem Solving:</strong> Analytical thinking, creativity, systematic approach</p>
                  <p><strong>Cultural Fit:</strong> Team collaboration, company values alignment</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

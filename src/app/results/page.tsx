'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Search, Filter, Download, Eye, Clock, User, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { ResultsDetailView } from '@/components/results/ResultsDetailView'
import { AnalyticsDashboard } from '@/components/results/AnalyticsDashboard'

// Export functions (simplified for now)
const exportToPDF = (results: any[], filename: string) => {
  console.log('Exporting to PDF:', filename, results.length, 'results')
  // TODO: Implement actual PDF export
}

const exportToCSV = (results: any[], filename: string) => {
  const headers = ['Candidate Name', 'Email', 'Position', 'Interview Date', 'Duration', 'Overall Score', 'Status']
  const csvData = results.map(result => [
    result.candidateName,
    result.candidateEmail,
    result.position,
    format(result.interviewDate, 'yyyy-MM-dd'),
    result.duration.toString(),
    result.overallScore.toString(),
    result.status
  ])
  
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Mock data - replace with actual API data
const mockInterviewResults = [
  {
    id: '1',
    candidateName: 'John Smith',
    candidateEmail: 'john.smith@email.com',
    position: 'Senior Software Engineer',
    interviewDate: new Date('2024-06-15'),
    duration: 45,
    overallScore: 85,
    status: 'completed',
    metrics: {
      technical: 88,
      communication: 82,
      problemSolving: 87,
      culturalFit: 83
    },
    transcriptPreview: 'Can you tell me about your experience with React and TypeScript? Well, I have been working with React for about 4 years now...',
    aiInsights: ['Strong technical background', 'Excellent problem-solving approach', 'Good communication skills'],
    competencyScores: {
      'Technical Skills': 88,
      'Communication': 82,
      'Problem Solving': 87,
      'Leadership': 78,
      'Cultural Fit': 83,
      'Adaptability': 85
    }
  },
  {
    id: '2',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    position: 'Product Manager',
    interviewDate: new Date('2024-06-14'),
    duration: 50,
    overallScore: 92,
    status: 'completed',
    metrics: {
      technical: 85,
      communication: 95,
      problemSolving: 90,
      culturalFit: 94
    },
    transcriptPreview: 'How do you prioritize features in a product roadmap? I use a combination of user research, business impact analysis...',
    aiInsights: ['Exceptional leadership qualities', 'Strategic thinking', 'Strong stakeholder management'],
    competencyScores: {
      'Technical Skills': 85,
      'Communication': 95,
      'Problem Solving': 90,
      'Leadership': 94,
      'Cultural Fit': 94,
      'Adaptability': 88
    }
  },
  {
    id: '3',
    candidateName: 'Mike Davis',
    candidateEmail: 'mike.davis@email.com',
    position: 'UX Designer',
    interviewDate: new Date('2024-06-13'),
    duration: 40,
    overallScore: 78,
    status: 'completed',
    metrics: {
      technical: 80,
      communication: 75,
      problemSolving: 82,
      culturalFit: 76
    },
    transcriptPreview: 'Can you walk me through your design process? I typically start with user research and personas...',
    aiInsights: ['Creative problem solver', 'User-focused approach', 'Could improve presentation skills'],
    competencyScores: {
      'Technical Skills': 80,
      'Communication': 75,
      'Problem Solving': 82,
      'Leadership': 70,
      'Cultural Fit': 76,
      'Adaptability': 79
    }
  }
]

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Filter and search logic
  const filteredResults = useMemo(() => {
    return mockInterviewResults.filter(result => {
      const matchesSearch = result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.position.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPosition = positionFilter === 'all' || result.position === positionFilter
      
      const matchesScore = scoreFilter === 'all' || 
                          (scoreFilter === 'excellent' && result.overallScore >= 90) ||
                          (scoreFilter === 'good' && result.overallScore >= 80 && result.overallScore < 90) ||
                          (scoreFilter === 'average' && result.overallScore >= 70 && result.overallScore < 80) ||
                          (scoreFilter === 'poor' && result.overallScore < 70)
      
      const matchesDate = dateFilter === 'all' ||
                         (dateFilter === 'today' && format(result.interviewDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) ||
                         (dateFilter === 'week' && result.interviewDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (dateFilter === 'month' && result.interviewDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      
      return matchesSearch && matchesPosition && matchesScore && matchesDate
    })
  }, [searchTerm, positionFilter, scoreFilter, dateFilter])

  const uniquePositions = [...new Set(mockInterviewResults.map(r => r.position))]
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950'
    if (score >= 80) return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950'
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 80) return 'secondary'
    if (score >= 70) return 'outline'
    return 'destructive'
  }

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  const handleExportPDF = () => {
    exportToPDF(filteredResults, 'interview-results')
  }

  const handleExportCSV = () => {
    exportToCSV(filteredResults, 'interview-results')
  }

  const handleExportSingle = (result: any) => {
    exportToPDF([result], `${result.candidateName}-results`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Results</h1>
          <p className="text-muted-foreground mt-1">Review and analyze interview performance data</p>
        </div>
        <div className="flex gap-2">
          <AnalyticsDashboard results={filteredResults} />
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Scores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="excellent">Excellent (90+)</SelectItem>
                <SelectItem value="good">Good (80-89)</SelectItem>
                <SelectItem value="average">Average (70-79)</SelectItem>
                <SelectItem value="poor">Poor (&lt;70)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredResults.length}</div>
            <div className="text-sm text-muted-foreground">Total Interviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(filteredResults.reduce((acc, r) => acc + r.overallScore, 0) / filteredResults.length || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {filteredResults.filter(r => r.overallScore >= 80).length}
            </div>
            <div className="text-sm text-muted-foreground">High Performers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(filteredResults.reduce((acc, r) => acc + r.duration, 0) / filteredResults.length || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Duration (min)</div>
          </CardContent>
        </Card>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredResults.map((result) => (
          <Card key={result.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">                  <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{result.candidateName}</h3>
                    <p className="text-sm text-muted-foreground">{result.candidateEmail}</p>
                  </div>
                </div>
                <Badge variant={getScoreBadgeVariant(result.overallScore)} className="text-lg px-3 py-1">
                  {result.overallScore}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{result.position}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(result.interviewDate, 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {result.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4" />
                  {result.status}
                </div>
              </div>              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-xs font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getScoreColor(value as number)}`}>
                      {value as number}
                    </span>
                  </div>
                ))}
              </div>

              {/* Transcript Preview */}
              <div className="bg-muted p-3 rounded">
                <h4 className="text-sm font-medium mb-2">Transcript Preview</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {expandedCards.has(result.id) 
                    ? result.transcriptPreview 
                    : `${result.transcriptPreview.substring(0, 100)}...`
                  }
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardExpansion(result.id)}
                  className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                >
                  {expandedCards.has(result.id) ? (
                    <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                  ) : (
                    <>Show More <ChevronDown className="h-3 w-3 ml-1" /></>
                  )}
                </Button>
              </div>              {/* AI Insights Preview */}
              {expandedCards.has(result.id) && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                  <h4 className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">AI Insights</h4>
                  <ul className="text-xs space-y-1">
                    {result.aiInsights.map((insight, index) => (
                      <li key={index} className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Interview Results - {selectedResult?.candidateName}</DialogTitle>
                    </DialogHeader>
                    <ResultsDetailView result={selectedResult} />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={() => handleExportSingle(result)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>      {filteredResults.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

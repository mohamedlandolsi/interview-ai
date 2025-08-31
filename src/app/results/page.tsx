'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Search, Filter, Download, Eye, Clock, User, Star, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { ResultsDetailView } from '@/components/results/ResultsDetailView'
import { AnalyticsDashboard } from '@/components/results/AnalyticsDashboard'
import { DashboardLayout } from '@/components/Layout'
import { DashboardRoute } from '@/components/auth/ProtectedRoute'

// Export functions
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
    format(new Date(result.interviewDate), 'yyyy-MM-dd'),
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

export default function ResultsPage() {
  const [interviewResults, setInterviewResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [generatingDemo, setGeneratingDemo] = useState(false)
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Fetch interview results from API
  const fetchResults = async (page: number = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(positionFilter !== 'all' && { position: positionFilter }),
        ...(scoreFilter !== 'all' && { 
          scoreMin: scoreFilter === 'excellent' ? '90' : scoreFilter === 'good' ? '80' : scoreFilter === 'average' ? '70' : '0',
          scoreMax: scoreFilter === 'excellent' ? '100' : scoreFilter === 'good' ? '89' : scoreFilter === 'average' ? '79' : '69'
        })
      })

      const response = await fetch(`/api/interviews/results/list?${searchParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }

      const data = await response.json()
      
      if (data.success) {
        setInterviewResults(data.results)
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch results')
      }
    } catch (err) {
      console.error('Error fetching results:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch results')
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchResults()
  }, [])

  // Refetch when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchResults(1)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, positionFilter, scoreFilter])

  // Generate demo analysis for empty results
  const generateDemoAnalysis = async () => {
    setGeneratingDemo(true)
    try {
      const response = await fetch('/api/interviews/generate-demo-analysis/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 10
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate demo analysis')
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh the results after generating demo data
        await fetchResults(1)
        
        // Show success message
        console.log(`✅ Demo analysis generated: ${data.successCount} successful, ${data.errorCount} errors`)
      } else {
        throw new Error(data.error || 'Failed to generate demo analysis')
      }
    } catch (err) {
      console.error('Error generating demo analysis:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate demo analysis')
    } finally {
      setGeneratingDemo(false)
    }
  }

  // Client-side date filtering (since it's complex to do server-side)
  const filteredResults = useMemo(() => {
    return interviewResults.filter(result => {
      if (dateFilter === 'all') return true
      
      const resultDate = new Date(result.interviewDate)
      const now = new Date()
      
      switch (dateFilter) {
        case 'today':
          return resultDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return resultDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return resultDate >= monthAgo
        default:
          return true
      }
    })
  }, [interviewResults, dateFilter])

  const uniquePositions = [...new Set(filteredResults.map(r => r.position))]
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 80) return 'secondary'
    if (score >= 70) return 'outline'
    return 'destructive'
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'in_progress': return 'secondary'
      case 'scheduled': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Unknown date'
    }
  }

  if (error) {
    return (
      <DashboardRoute>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4 text-red-600">Error Loading Results</h1>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchResults()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </DashboardRoute>
    )
  }

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
                <p className="text-gray-600">
                  View and analyze results from all interview sessions
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={generateDemoAnalysis}
                  disabled={generatingDemo}
                  variant="outline"
                  size="sm"
                >
                  {generatingDemo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Generate Demo Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="mb-8">
            <AnalyticsDashboard results={filteredResults} />
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters & Search
                </span>
                <Button
                  onClick={() => fetchResults()}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Position" />
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
                    <SelectValue placeholder="Score Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="excellent">Excellent (90-100)</SelectItem>
                    <SelectItem value="good">Good (80-89)</SelectItem>
                    <SelectItem value="average">Average (70-79)</SelectItem>
                    <SelectItem value="poor">Poor (&lt;70)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => exportToCSV(filteredResults, 'interview-results')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    onClick={() => exportToPDF(filteredResults, 'interview-results')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading results...
                  </span>
                ) : (
                  `Showing ${filteredResults.length} of ${pagination.total} results`
                )}
              </p>
              
              {pagination.totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => fetchResults(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => fetchResults(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    size="sm"
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Results List */}
          {loading && interviewResults.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading interview results...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">No interview results found</p>
                <p className="text-sm text-gray-400 mb-6">
                  {interviewResults.length === 0
                     ? "No interviews have been conducted yet."
                     : "Try adjusting your search or filter criteria."}
                </p>
                
                {interviewResults.length === 0 && (
                  <div className="space-y-4">
                    <Button 
                      onClick={generateDemoAnalysis}
                      disabled={generatingDemo}
                      className="mr-4"
                    >
                      {generatingDemo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Demo Analysis...
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Generate Demo Analysis with AI
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-gray-400 block">
                      This will create realistic interview analysis using Gemini 2.5 Flash for demonstration
                    </span>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/interviews'}
                      className="mt-2"
                    >
                      Conduct Real Interview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold">{result.candidateName}</h3>
                          <p className="text-sm text-gray-600">{result.candidateEmail}</p>
                        </div>
                        <Badge variant="outline">{result.position}</Badge>
                        <Badge variant={getStatusBadgeVariant(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                            {result.overallScore}
                          </div>
                          <p className="text-xs text-gray-500">Overall Score</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(result.id)}
                        >
                          {expandedCards.has(result.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{formatDate(result.interviewDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{result.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{result.interviewerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm">{result.templateTitle}</span>
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getScoreColor(result.metrics.technical)}`}>
                          {result.metrics.technical}
                        </div>
                        <p className="text-xs text-gray-500">Technical</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getScoreColor(result.metrics.communication)}`}>
                          {result.metrics.communication}
                        </div>
                        <p className="text-xs text-gray-500">Communication</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getScoreColor(result.metrics.problemSolving)}`}>
                          {result.metrics.problemSolving}
                        </div>
                        <p className="text-xs text-gray-500">Problem Solving</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getScoreColor(result.metrics.culturalFit)}`}>
                          {result.metrics.culturalFit}
                        </div>
                        <p className="text-xs text-gray-500">Cultural Fit</p>
                      </div>
                    </div>

                    {/* AI Insights Preview */}
                    {result.aiInsights && result.aiInsights.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Key Insights:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.aiInsights.slice(0, 3).map((insight: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {insight.length > 50 ? insight.substring(0, 50) + '...' : insight}
                            </Badge>
                          ))}
                          {result.aiInsights.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.aiInsights.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {expandedCards.has(result.id) && (
                      <div className="border-t pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Strengths</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {result.strengths && result.strengths.map((strength: string, index: number) => (
                                <li key={index}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Areas for Improvement</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {result.areasForImprovement && result.areasForImprovement.map((area: string, index: number) => (
                                <li key={index}>• {area}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {result.transcriptPreview && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Transcript Preview</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {result.transcriptPreview}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedResult(result)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Full Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Interview Results - {result.candidateName}</DialogTitle>
                              </DialogHeader>
                              {selectedResult && <ResultsDetailView result={selectedResult} />}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/results/individual?session=${result.id}`, '_blank')}
                          >
                            Open Full Results
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </DashboardRoute>
  )
}

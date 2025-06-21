'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/Layout'
import { DashboardRoute } from '@/components/auth/ProtectedRoute'

export default function ResultsTestPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedResults, setSelectedResults] = useState<any>(null)

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/sessions')
      const data = await response.json()
      setSessions(data.recentSessions || [])
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async (sessionId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/interviews/results?sessionId=${sessionId}`)
      const data = await response.json()
      setSelectedResults(data.results)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setLoading(false)
    }
  }

  const testFullFlow = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/test-full-flow', { method: 'POST' })
      const data = await response.json()
      alert(`Test completed! Session: ${data.sessionId}`)
      fetchSessions() // Refresh the list
    } catch (error) {
      console.error('Failed to run test:', error)
      alert('Test failed!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Interview Results Test</h1>
            <p className="text-gray-600">
              Test and verify interview session creation and results display.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Sessions List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Interview Sessions
                  <div className="space-x-2">
                    <Button onClick={fetchSessions} disabled={loading} size="sm">
                      Refresh
                    </Button>
                    <Button onClick={testFullFlow} disabled={loading} size="sm" variant="outline">
                      Run Test Flow
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-gray-500">No sessions found. Click "Run Test Flow" to create one.</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{session.candidate_name}</h3>
                          <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{session.position}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          {session.vapi_call_id || 'No call ID'} | {new Date(session.created_at).toLocaleDateString()}
                        </p>
                        <Button 
                          onClick={() => fetchResults(session.id)}
                          disabled={loading}
                          size="sm"
                          className="w-full"
                        >
                          View Results
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Results Display */}
            <Card>
              <CardHeader>
                <CardTitle>Results Details</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedResults ? (
                  <p className="text-gray-500">Select a session to view results</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Candidate</p>
                        <p className="text-lg">{selectedResults.candidateName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Position</p>
                        <p className="text-lg">{selectedResults.position}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Overall Score</p>
                        <p className="text-2xl font-bold text-green-600">{selectedResults.overallScore}/100</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-lg">{selectedResults.duration || 0} min</p>
                      </div>
                    </div>

                    {selectedResults.strengths && selectedResults.strengths.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Strengths</p>
                        <div className="space-y-1">
                          {selectedResults.strengths.map((strength: string, index: number) => (
                            <Badge key={index} variant="default" className="mr-2">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedResults.areasForImprovement && selectedResults.areasForImprovement.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Areas for Improvement</p>
                        <div className="space-y-1">
                          {selectedResults.areasForImprovement.map((area: string, index: number) => (
                            <Badge key={index} variant="secondary" className="mr-2">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedResults.analysisFeedback && (
                      <div>
                        <p className="text-sm font-medium mb-2">Analysis Feedback</p>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedResults.analysisFeedback}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => window.open(`/results/individual?session=${selectedResults.id}`, '_blank')}
                        className="w-full"
                      >
                        Open Full Results Page
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </DashboardRoute>
  )
}

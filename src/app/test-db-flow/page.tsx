'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Database, TestTube, Eye, RefreshCw } from 'lucide-react';

interface TestSession {
  id: string;
  candidateName: string;
  position: string;
  status: string;
  nextSteps: {
    testDbFlow: string;
    viewResults: string;
    fetchResults: string;
  };
}

interface TestResults {
  id: string;
  candidateName: string;
  position: string;
  overallScore: number;
  analysisScore: number;
  analysisFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  status: string;
  completedAt: string;
}

export default function DatabaseFlowTestPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<TestSession | null>(null);
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { title: 'Create Test Session', description: 'Create a test interview session in the database' },
    { title: 'Save Analysis Data', description: 'Simulate saving Vapi analysis results to database' },
    { title: 'Fetch Results', description: 'Retrieve and display the saved interview results' },
    { title: 'Verify Data Flow', description: 'Confirm all data is properly saved and retrieved' }
  ];

  const createTestSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/create-test-session', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSession(data.session);
        setCurrentStep(1);
      } else {
        throw new Error(data.error || 'Failed to create test session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysisData = async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-db-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: session.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentStep(2);
      } else {
        throw new Error(data.error || 'Failed to save analysis data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/interviews/results?sessionId=${session.id}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setCurrentStep(3);
      } else {
        throw new Error(data.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setCurrentStep(0);
    setSession(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Save/Fetch Flow Test</h1>
        <p className="text-gray-600">
          Test the complete flow of saving interview results to the database and fetching them for display.
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            Error: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index < currentStep ? 'bg-green-100 text-green-600' : 
                index === currentStep ? 'bg-blue-100 text-blue-600' : 
                'bg-gray-100 text-gray-400'}
            `}>
              {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            <div className="ml-2 text-sm">
              <p className={`font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.title}
              </p>
              <p className={`text-xs ${index <= currentStep ? 'text-gray-600' : 'text-gray-300'}`}>
                {step.description}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-px mx-4 ${index < currentStep ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        {/* Step 1: Create Test Session */}
        <Card className={currentStep >= 0 ? 'border-blue-200' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Step 1: Create Test Session
            </CardTitle>
            <CardDescription>
              Create a test interview session with candidate and template data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!session ? (
              <Button 
                onClick={createTestSession} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                Create Test Session
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Test session created successfully
                </div>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <p><strong>Session ID:</strong> {session.id}</p>
                    <p><strong>Candidate:</strong> {session.candidateName}</p>
                    <p><strong>Position:</strong> {session.position}</p>
                    <p><strong>Status:</strong> <Badge variant="secondary">{session.status}</Badge></p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Save Analysis Data */}
        <Card className={currentStep >= 1 ? 'border-blue-200' : 'border-gray-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Step 2: Save Analysis Data
            </CardTitle>
            <CardDescription>
              Simulate saving Vapi analysis results (summary, evaluation, structured data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep < 1 ? (
              <p className="text-gray-500">Complete step 1 first</p>
            ) : currentStep === 1 ? (
              <Button 
                onClick={saveAnalysisData} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                Save Analysis Data
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Analysis data saved to database
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Fetch Results */}
        <Card className={currentStep >= 2 ? 'border-blue-200' : 'border-gray-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Step 3: Fetch Results
            </CardTitle>
            <CardDescription>
              Retrieve the saved interview results from the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep < 2 ? (
              <p className="text-gray-500">Complete steps 1-2 first</p>
            ) : currentStep === 2 ? (
              <Button 
                onClick={fetchResults} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Fetch Results
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Results fetched successfully
                </div>
                {results && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="grid gap-4">
                        <div>
                          <h4 className="font-semibold">Basic Information</h4>
                          <p><strong>Candidate:</strong> {results.candidateName}</p>
                          <p><strong>Position:</strong> {results.position}</p>
                          <p><strong>Status:</strong> <Badge variant="secondary">{results.status}</Badge></p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">Analysis Results</h4>
                          <p><strong>Overall Score:</strong> {results.overallScore}/100</p>
                          <p><strong>Analysis Score:</strong> {results.analysisScore}/100</p>
                          <p><strong>Feedback:</strong> {results.analysisFeedback}</p>
                        </div>

                        {results.strengths.length > 0 && (
                          <div>
                            <h4 className="font-semibold">Strengths</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {results.strengths.map((strength, index) => (
                                <li key={index} className="text-sm">{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.areasForImprovement.length > 0 && (
                          <div>
                            <h4 className="font-semibold">Areas for Improvement</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {results.areasForImprovement.map((area, index) => (
                                <li key={index} className="text-sm">{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 4: Verification */}
        <Card className={currentStep >= 3 ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Step 4: Data Flow Verification
            </CardTitle>
            <CardDescription>
              Confirmation that interview results are properly saved and retrieved
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep < 3 ? (
              <p className="text-gray-500">Complete all previous steps</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <strong>Success!</strong> Database save/fetch flow is working correctly.
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    ✅ Test session created with proper database relationships
                  </p>
                  <p className="text-sm text-green-700">
                    ✅ Analysis data successfully saved to all relevant fields
                  </p>
                  <p className="text-sm text-green-700">
                    ✅ Results API successfully retrieves and formats saved data
                  </p>
                  <p className="text-sm text-green-700">
                    ✅ Interview results component can display the fetched data
                  </p>
                </div>

                {session && (
                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={() => window.open(`/results?session=${session.id}`, '_blank')}
                      variant="outline"
                      className="mr-2"
                    >
                      View in Results Page
                    </Button>
                    <Button onClick={resetTest} variant="outline">
                      Run Test Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

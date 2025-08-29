'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InterviewComponent } from '@/components/interviews/InterviewComponent';
import InterviewPageErrorBoundary from '@/components/interviews/InterviewErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Briefcase, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface InterviewSession {
  id: string;
  templateId: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  duration: number;
  status: string;
  template: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    rawQuestions: any[];
    questions: any[];
  };
}

// Error Boundary Component
class InterviewErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: string) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Interview Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error.message || 'An unexpected error occurred');
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Something went wrong with the interview component. Please refresh the page and try again.
            {this.state.error && (
              <details className="mt-2">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default function CandidateInterviewConductPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [shouldRedirectToInfo, setShouldRedirectToInfo] = useState(false);
  // Add global error handlers for debugging
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in interview conduct page:', event.reason);
      setError(`Unhandled error: ${event.reason}`);
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error in interview conduct page:', event.error);
      setError(`Application error: ${event.error?.message || event.error}`);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError('Invalid session ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/interviews/links/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Interview session not found');
          } else if (response.status === 410) {
            setError('This interview session is no longer active');
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            setError(`Failed to load interview session: ${errorText}`);
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        // Validate response data
        if (!data || !data.session) {
          setError('Invalid response from server');
          setLoading(false);
          return;
        }
        
        // Check if candidate info is still needed
        if (data.session.needsCandidateInfo) {
          // Use setTimeout to ensure redirect happens after render
          setTimeout(() => {
            router.push(`/interview/${sessionId}`);
          }, 0);
          setShouldRedirectToInfo(true);
          return;
        }

        setSession(data.session);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err instanceof Error ? err.message : 'Failed to load interview session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession().catch((err) => {
      console.error('Unhandled error in fetchSession:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    });
  }, [sessionId, router]);

  const handleInterviewStart = useCallback(() => {
    setInterviewStarted(true);
  }, []);

  const handleInterviewEnd = useCallback((duration: number) => {
    setInterviewCompleted(true);
    // Here you could update the session status via API
  }, []);

  const handleInterviewError = useCallback((error: string) => {
    console.error('Interview error:', error);
    setError(error);
  }, []);

  const handleBackToInfo = () => {
    router.push(`/interview/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading interview...</span>
        </div>
      </div>    );
  }

  // Show loading while redirecting to info page
  if (shouldRedirectToInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Redirecting to candidate form...</span>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Load Interview</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleBackToInfo} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <InterviewPageErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToInfo}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">AI Interview Session</h1>
              <p className="text-muted-foreground">
                Welcome, {session.candidateName}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
          {/* Interview Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.candidateName}</p>
                    <p className="text-sm text-muted-foreground">Candidate</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.position}</p>
                    <p className="text-sm text-muted-foreground">Position</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.duration} minutes</p>
                    <p className="text-sm text-muted-foreground">Estimated Duration</p>
                  </div>
                </div>

                {session.template && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{session.template.title}</p>
                      <p className="text-sm text-muted-foreground">Interview Template</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status and Actions */}
            {interviewCompleted && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg text-green-600">Interview Complete</CardTitle>
                  <CardDescription>
                    Thank you for completing the interview. Your responses have been recorded.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    The hiring team will review your interview and get back to you soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Interview Component */}
          <div className="lg:col-span-2">
            <InterviewComponent
              sessionId={sessionId}
              templateId={session.templateId}
              candidateName={session.candidateName}
              position={session.position}
              useEnhancedAnalysis={true}
              onInterviewStart={handleInterviewStart}
              onInterviewEnd={handleInterviewEnd}
              onError={handleInterviewError}
            />
          </div>
        </div>

        {/* Pre-Interview Instructions */}
        {!interviewStarted && !interviewCompleted && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Before You Begin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Technical Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Stable internet connection</li>
                    <li>• Working microphone and speakers/headphones</li>
                    <li>• Modern web browser (Chrome, Firefox, Safari)</li>
                    <li>• Quiet environment for optimal recording</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interview Tips:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Speak clearly and at a comfortable pace</li>
                    <li>• Take your time to think before answering</li>
                    <li>• Ask for clarification if needed</li>
                    <li>• Be authentic and honest in your responses</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </InterviewPageErrorBoundary>
  );
}

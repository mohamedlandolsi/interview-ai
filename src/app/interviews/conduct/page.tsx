'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { InterviewComponent } from '@/components/interviews';
import { DashboardLayout } from '@/components/Layout';
import { DashboardRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Briefcase, Clock, FileText } from 'lucide-react';

interface InterviewSession {
  id: string;
  templateId?: string;
  candidateName?: string;
  position?: string;
  estimatedDuration?: number;
  startTime?: Date;
  endTime?: Date;
}

export default function ConductInterviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [session, setSession] = useState<InterviewSession>({
    id: `INT-${Date.now()}`,
    templateId: searchParams.get('template') || undefined,
    candidateName: searchParams.get('candidate') || 'Anonymous Candidate',
    position: searchParams.get('position') || 'General Interview',
    estimatedDuration: parseInt(searchParams.get('duration') || '30'),
  });
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const handleInterviewStart = useCallback(() => {
    setInterviewStarted(true);
    setSession(prev => ({
      ...prev,
      startTime: new Date()
    }));
  }, []);

  const handleInterviewEnd = useCallback((duration: number) => {
    setInterviewCompleted(true);
    setSession(prev => ({
      ...prev,
      endTime: new Date()
    }));
  }, []);

  const handleInterviewError = useCallback((error: string) => {
    console.error('Interview error:', error);
    // You could show a toast notification here
  }, []);

  const handleBackToInterviews = () => {
    router.push('/interviews');
  };

  const handleViewResults = () => {
    router.push(`/results?session=${session.id}`);
  };

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToInterviews}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Interviews
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Live Interview Session</h1>
              <p className="text-muted-foreground">Session ID: {session.id}</p>
            </div>
          </div>

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
                      <p className="font-medium">{session.estimatedDuration} minutes</p>
                      <p className="text-sm text-muted-foreground">Estimated Duration</p>
                    </div>
                  </div>

                  {session.templateId && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Template {session.templateId}</p>
                        <p className="text-sm text-muted-foreground">Interview Template</p>
                      </div>
                    </div>
                  )}

                  {session.startTime && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">Started at:</p>
                      <p className="text-sm text-muted-foreground">
                        {session.startTime.toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  {session.endTime && (
                    <div>
                      <p className="text-sm font-medium">Ended at:</p>
                      <p className="text-sm text-muted-foreground">
                        {session.endTime.toLocaleTimeString()}
                      </p>
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
                      The interview has been successfully completed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button onClick={handleViewResults} className="w-full">
                      View Results
                    </Button>
                    <Button 
                      onClick={handleBackToInterviews} 
                      variant="outline" 
                      className="w-full"
                    >
                      Back to Interviews
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Interview Component */}            <div className="lg:col-span-2">
              <InterviewComponent
                templateId={session.templateId}
                assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}
                candidateName={session.candidateName}
                position={session.position}
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
      </DashboardLayout>
    </DashboardRoute>
  );
}

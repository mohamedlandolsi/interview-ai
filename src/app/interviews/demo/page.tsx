'use client';

import React, { useCallback } from 'react';
import { InterviewComponent } from '@/components/interviews';
import { DashboardLayout } from '@/components/Layout';
import { DashboardRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Mic, Volume2, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function InterviewDemoPage() {
  const handleInterviewStart = useCallback(() => {
    console.log('Demo interview started');
  }, []);

  const handleInterviewEnd = useCallback((duration: number) => {
    console.log('Demo interview ended, duration:', duration);
  }, []);

  const handleInterviewError = useCallback((error: string) => {
    console.error('Demo interview error:', error);
  }, []);

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Interview Component Demo</h1>
            <p className="text-muted-foreground">
              Test the voice-powered interview functionality with Vapi integration
            </p>
            <Badge variant="secondary" className="mt-2">
              <Zap className="w-3 h-3 mr-1" />
              Powered by Vapi AI
            </Badge>
          </div>

          {/* Demo Alert */}
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a demo environment. The AI interviewer will conduct a sample interview session.
              Make sure your microphone is enabled and you're in a quiet environment.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Feature Overview */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features</CardTitle>
                  <CardDescription>
                    What this component includes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mic className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Voice Recognition</p>
                      <p className="text-sm text-muted-foreground">
                        Real-time speech-to-text processing
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">AI Responses</p>
                      <p className="text-sm text-muted-foreground">
                        Natural conversation with AI interviewer
                      </p>
                    </div>
                  </div>                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Enhanced Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        AI-powered Q&A analysis and scoring
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Comprehensive Feedback</p>
                      <p className="text-sm text-muted-foreground">
                        Detailed insights and hiring recommendations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demo Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">Software Engineer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">15-20 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Analysis:</span>
                    <Badge variant="secondary" className="text-xs">Enhanced AI</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Features:</span>
                    <span className="font-medium">Q&A + Scoring</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Model:</span>
                    <span className="font-medium">GPT-4 + Vapi</span>
                  </div>
                </CardContent>
              </Card>
            </div>            {/* Interview Component Demo */}
            <div className="lg:col-span-2">
              <InterviewComponent
                templateId="demo-template"
                assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID}
                candidateName="Demo Candidate"
                position="Software Engineer"
                templateQuestions={[
                  "Tell me about yourself and your background in software development.",
                  "Describe a challenging technical problem you've solved recently.",
                  "How do you approach learning new technologies?",
                  "What interests you about this role and our company?",
                  "Do you have any questions for me?"
                ]}
                useEnhancedAnalysis={true}
                onInterviewStart={handleInterviewStart}
                onInterviewEnd={handleInterviewEnd}
                onError={handleInterviewError}
              />
            </div>
          </div>

          {/* Usage Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How to Use This Component</CardTitle>
              <CardDescription>
                Integration guide for developers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Import the Component</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">
                      {`import { InterviewComponent } from '@/components/interviews';`}
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Basic Usage</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">
                      {`<InterviewComponent
  templateId="your-template-id"
  assistantId="your-vapi-assistant-id"
  onInterviewStart={() => console.log('Started')}
  onInterviewEnd={(duration) => console.log('Ended:', duration)}
  onError={(error) => console.error('Error:', error)}
/>`}
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Required Environment Variables</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-sm">
                      {`NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </DashboardRoute>
  );
}

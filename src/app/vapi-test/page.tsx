'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout';
import { DashboardRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Target,
  BarChart3,
  Settings,
  Play,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';

interface ConfigTestResults {
  status: string;
  configuration: any;
  prompts: any;
  integration: any;
  environment: any;
  summary: any;
}

export default function VapiPromptsTestPage() {
  const [testResults, setTestResults] = useState<ConfigTestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-vapi-config');
      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }
      const data = await response.json();
      setTestResults(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestResults();
  }, []);

  const StatusIcon = ({ condition }: { condition: boolean }) => (
    condition ? 
      <CheckCircle className="w-5 h-5 text-green-600" /> : 
      <XCircle className="w-5 h-5 text-red-600" />
  );

  const StatusBadge = ({ condition, trueText = "Configured", falseText = "Missing" }: { 
    condition: boolean; 
    trueText?: string; 
    falseText?: string; 
  }) => (
    <Badge variant={condition ? "success" : "destructive"}>
      {condition ? trueText : falseText}
    </Badge>
  );

  if (loading) {
    return (
      <DashboardRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Testing Vapi Configuration...</p>
            </div>
          </div>
        </DashboardLayout>
      </DashboardRoute>
    );
  }

  if (error) {
    return (
      <DashboardRoute>
        <DashboardLayout>
          <div className="container mx-auto px-4 py-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error testing configuration: {error}
                <Button onClick={fetchTestResults} variant="outline" size="sm" className="ml-4">
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </DashboardLayout>
      </DashboardRoute>
    );
  }

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Vapi Analysis Prompts Test Results</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Comprehensive test of all three Vapi analysis prompt fields and their integration with your AI interview application
            </p>
            
            {testResults?.summary && (
              <div className="flex justify-center gap-4 mb-6">
                <StatusBadge 
                  condition={testResults.summary.allPromptsConfigured} 
                  trueText="All Prompts Ready" 
                  falseText="Prompts Missing" 
                />
                <StatusBadge 
                  condition={testResults.summary.schemaComplete} 
                  trueText="Schema Complete" 
                  falseText="Schema Incomplete" 
                />
                <StatusBadge 
                  condition={testResults.summary.environmentReady} 
                  trueText="Environment Ready" 
                  falseText="Environment Issues" 
                />
              </div>
            )}

            <Button onClick={fetchTestResults} variant="outline" className="mb-8">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Test Results
            </Button>
          </div>

          {testResults && (
            <>
              {/* Overall Status */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Overall Configuration Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <StatusIcon condition={testResults.summary.allPromptsConfigured} />
                      <p className="mt-2 font-medium">All Prompts</p>
                      <p className="text-sm text-muted-foreground">
                        {testResults.summary.allPromptsConfigured ? 'Configured' : 'Missing'}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <StatusIcon condition={testResults.summary.schemaComplete} />
                      <p className="mt-2 font-medium">Data Schema</p>
                      <p className="text-sm text-muted-foreground">
                        {testResults.summary.schemaComplete ? 'Complete' : 'Incomplete'}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <StatusIcon condition={testResults.summary.environmentReady} />
                      <p className="mt-2 font-medium">Environment</p>
                      <p className="text-sm text-muted-foreground">
                        {testResults.summary.environmentReady ? 'Ready' : 'Issues'}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted">
                      <StatusIcon condition={testResults.summary.ready} />
                      <p className="mt-2 font-medium">System Ready</p>
                      <p className="text-sm text-muted-foreground">
                        {testResults.summary.ready ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Prompt Analysis */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Summary Prompt Configuration
                  </CardTitle>
                  <CardDescription>
                    Tests the Q&A summary prompt that extracts interview question-answer pairs with scoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Configuration Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Prompt Configured:</span>
                          <StatusBadge condition={testResults.prompts.summary.configured} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Required Elements:</span>
                          <StatusBadge condition={testResults.prompts.summary.hasRequiredElements} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Prompt Length:</span>
                          <Badge variant="outline">{testResults.prompts.summary.promptLength} chars</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Timeout:</span>
                          <Badge variant="outline">{testResults.prompts.summary.timeout}s</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Features Tested</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Question-answer extraction</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Response quality scoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Key points identification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>JSON format output</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Evaluation Prompt Analysis */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Success Evaluation Prompt Configuration
                  </CardTitle>
                  <CardDescription>
                    Tests the success evaluation prompt that assesses interview success across multiple criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Configuration Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Prompt Configured:</span>
                          <StatusBadge condition={testResults.prompts.successEvaluation.configured} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Required Elements:</span>
                          <StatusBadge condition={testResults.prompts.successEvaluation.hasRequiredElements} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Prompt Length:</span>
                          <Badge variant="outline">{testResults.prompts.successEvaluation.promptLength} chars</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Timeout:</span>
                          <Badge variant="outline">{testResults.prompts.successEvaluation.timeout}s</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Evaluation Criteria</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Communication Skills (25%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Technical Competency (30%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Professional Experience (25%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Cultural Fit (20%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Structured Data Prompt Analysis */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Structured Data Prompt Configuration
                  </CardTitle>
                  <CardDescription>
                    Tests the structured data extraction prompt that creates detailed performance analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Configuration Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Prompt Configured:</span>
                          <StatusBadge condition={testResults.prompts.structuredData.configured} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Schema Complete:</span>
                          <StatusBadge condition={testResults.prompts.structuredData.hasRequiredProperties} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Prompt Length:</span>
                          <Badge variant="outline">{testResults.prompts.structuredData.promptLength} chars</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Schema Properties:</span>
                          <Badge variant="outline">{testResults.prompts.structuredData.schemaProperties}</Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Category Scores</h4>
                      <div className="space-y-1 text-sm">
                        {testResults.prompts.structuredData.categoryScores.map((category: string) => (
                          <div key={category} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="capitalize">{category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Integration & Environment */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Question Integration</CardTitle>
                    <CardDescription>How well questions are integrated into the assistant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Questions Integrated:</span>
                        <Badge variant="outline">
                          {testResults.integration.questionsInSystemMessage}/{testResults.integration.totalTestQuestions}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>System Message Length:</span>
                        <Badge variant="outline">{testResults.integration.systemMessageLength} chars</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Environment Variables</CardTitle>
                    <CardDescription>Required environment configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Public Key:</span>
                        <StatusBadge condition={testResults.environment.vapiPublicKey} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Assistant ID:</span>
                        <StatusBadge condition={testResults.environment.vapiAssistantId} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Private Key:</span>
                        <StatusBadge condition={testResults.environment.vapiPrivateKey} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Webhook Secret:</span>
                        <StatusBadge condition={testResults.environment.vapiWebhookSecret} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center mt-8">
                <Button asChild>
                  <a href="/interviews/demo" className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Try Demo Interview
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/vapi-config" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Configuration
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api/test-vapi-config" target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Raw Results
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </DashboardRoute>
  );
}

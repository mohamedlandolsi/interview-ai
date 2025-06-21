'use client';

import React from 'react';
import { DashboardLayout } from '@/components/Layout';
import { DashboardRoute } from '@/components/auth/ProtectedRoute';
import VapiAssistantManager from '@/components/vapi/VapiAssistantManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Zap, 
  BarChart3, 
  MessageSquare,
  Target,
  CheckCircle
} from 'lucide-react';

export default function VapiConfigurationPage() {
  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Vapi AI Configuration</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Configure and manage AI-powered interview assistants with comprehensive analysis capabilities
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Q&A Analysis
                </CardTitle>
                <CardDescription>
                  Detailed question-answer extraction with scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Individual question scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Key points extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Response quality assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Overall interview flow analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Success Evaluation
                </CardTitle>
                <CardDescription>
                  Comprehensive interview success assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Communication skills (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Technical competency (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Professional experience (25%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Cultural fit assessment (20%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Structured Data
                </CardTitle>
                <CardDescription>
                  AI-powered data extraction and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Category-based scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Strengths identification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Improvement recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Hiring recommendations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Analysis Configuration
              </CardTitle>
              <CardDescription>
                Current Vapi analysis settings based on your enhanced configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Summary Analysis
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <Badge variant="outline">10 seconds</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Messages:</span>
                      <Badge variant="outline">2</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Output Format:</span>
                      <Badge variant="outline">JSON</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    Success Evaluation
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <Badge variant="outline">10 seconds</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Evaluation:</span>
                      <Badge variant="outline">Multi-criteria</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rubric:</span>
                      <Badge variant="outline">Weighted</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    Structured Data
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <Badge variant="outline">10 seconds</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Schema:</span>
                      <Badge variant="outline">Comprehensive</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categories:</span>
                      <Badge variant="outline">4 Core Areas</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assistant Manager */}
          <VapiAssistantManager />

          {/* Integration Guide */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>
                How to use these enhanced analysis features in your interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">1. Create Specialized Assistants</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the assistant manager above to create role-specific interview assistants with 
                      pre-configured questions and evaluation criteria.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Enhanced Interview Flow</h4>
                    <p className="text-sm text-muted-foreground">
                      Your interviews will now automatically include comprehensive analysis with 
                      Q&A extraction, success evaluation, and structured data insights.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. Comprehensive Results</h4>
                    <p className="text-sm text-muted-foreground">
                      View detailed results with category breakdowns, hiring recommendations, 
                      and actionable feedback for each candidate.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">4. Export & Share</h4>
                    <p className="text-sm text-muted-foreground">
                      Download comprehensive reports in Markdown format for easy sharing 
                      with your hiring team and HR departments.
                    </p>
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

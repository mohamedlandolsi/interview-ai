'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Briefcase,
  Star,
  MessageSquare,
  Download,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Volume2
} from 'lucide-react';

interface InterviewResults {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  duration: number
  overallScore: number
  analysisScore: number
  analysisFeedback: string
  strengths: string[]
  areasForImprovement: string[]
  questionScores: any
  vapiSummary: any
  vapiSuccessEvaluation: any
  vapiStructuredData: any
  finalTranscript: string
  conversationSummary: string
  recordingUrl: string
  completedAt: string
  status: string
  enhancedAnalysis?: {
    categoryScores: {
      communication: number
      technical: number
      experience: number
      culturalFit: number
    }
    hiringRecommendation: 'Strong Yes' | 'Yes' | 'Maybe' | 'No'
    keyInsights: string[]
    questionAnalysis: Array<{
      question: string
      answer: string
      score: number
      feedback: string
      keyPoints: string[]
    }>
    interviewFlow: {
      engagement: number
      clarity: number
      completeness: number
    }
    summaryReport: string
  }
}

export const InterviewResultsComponent: React.FC = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchResults(sessionId);
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchResults = async (id: string) => {
    try {
      const response = await fetch(`/api/interviews/results?sessionId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Yes': return 'text-green-700 bg-green-100';
      case 'Yes': return 'text-green-600 bg-green-50';
      case 'Maybe': return 'text-yellow-600 bg-yellow-50';
      case 'No': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderQuestionAnswerPairs = (summary: any, enhancedAnalysis?: any) => {
    // Use enhanced analysis if available, otherwise fall back to summary
    const questions = enhancedAnalysis?.questionAnalysis || summary?.questions || [];

    if (!questions || questions.length === 0) return null;

    return questions.map((item: any, index: number) => (
      <div key={index} className="border rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
            Q{index + 1}
          </div>
          <div className="flex-1">
            <p className="font-medium text-blue-900">{item.question}</p>
          </div>
          {item.score && (
            <Badge variant={getScoreBadgeVariant(item.score)} className="text-xs">
              {item.score}/100
            </Badge>
          )}
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
            A
          </div>
          <div className="flex-1">
            <p className="text-gray-700">{item.answer}</p>
            {item.keyPoints && item.keyPoints.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-600 mb-1">Key Points:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {item.keyPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.feedback && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <strong>Feedback:</strong> {item.feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Analyzing interview results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!results) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No results found for this session.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Interview Results
              </CardTitle>
              <CardDescription>
                Complete analysis and evaluation of the interview session
              </CardDescription>
            </div>
            <Badge 
              variant={results.status === 'completed' ? 'default' : 'secondary'}
              className="text-lg px-3 py-1"
            >
              {results.status === 'completed' ? (
                <><CheckCircle className="w-4 h-4 mr-1" />Completed</>
              ) : (
                <><XCircle className="w-4 h-4 mr-1" />Incomplete</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{results.candidateName}</p>
                <p className="text-xs text-muted-foreground">{results.candidateEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{results.position}</p>
                <p className="text-xs text-muted-foreground">Position</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{Math.round(results.duration)} minutes</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(results.analysisScore)}`}>
                {results.analysisScore}/100
              </div>
              <Progress value={results.analysisScore} className="mt-2" />
            </div>
            {results.analysisFeedback && (
              <Alert>
                <Star className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {results.analysisFeedback}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Category Scores */}
      {results.enhancedAnalysis?.categoryScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Detailed Category Analysis
            </CardTitle>
            <CardDescription>
              Performance breakdown across key evaluation areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(results.enhancedAnalysis.categoryScores).map(([category, score]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(score as number)}`}>
                      {score}/100
                    </span>
                  </div>
                  <Progress value={score as number} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hiring Recommendation */}
      {results.enhancedAnalysis?.hiringRecommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Hiring Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-bold ${getRecommendationColor(results.enhancedAnalysis.hiringRecommendation)}`}>
                {results.enhancedAnalysis.hiringRecommendation === 'Strong Yes' && <CheckCircle className="w-5 h-5 mr-2" />}
                {results.enhancedAnalysis.hiringRecommendation === 'Yes' && <CheckCircle className="w-5 h-5 mr-2" />}
                {results.enhancedAnalysis.hiringRecommendation === 'Maybe' && <AlertCircle className="w-5 h-5 mr-2" />}
                {results.enhancedAnalysis.hiringRecommendation === 'No' && <XCircle className="w-5 h-5 mr-2" />}
                {results.enhancedAnalysis.hiringRecommendation}
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Based on comprehensive analysis of communication, technical skills, experience, and cultural fit
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview Flow Analysis */}
      {results.enhancedAnalysis?.interviewFlow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interview Flow Analysis
            </CardTitle>
            <CardDescription>
              Analysis of engagement, clarity, and response completeness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {results.enhancedAnalysis.interviewFlow.engagement}/100
                </div>
                <div className="text-sm font-medium">Engagement</div>
                <Progress value={results.enhancedAnalysis.interviewFlow.engagement} className="h-2" />
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {results.enhancedAnalysis.interviewFlow.clarity}/100
                </div>
                <div className="text-sm font-medium">Clarity</div>
                <Progress value={results.enhancedAnalysis.interviewFlow.clarity} className="h-2" />
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-purple-600">
                  {results.enhancedAnalysis.interviewFlow.completeness}/100
                </div>
                <div className="text-sm font-medium">Completeness</div>
                <Progress value={results.enhancedAnalysis.interviewFlow.completeness} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.strengths && results.strengths.length > 0 ? (
              <ul className="space-y-2">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No specific strengths identified</p>
            )}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.areasForImprovement && results.areasForImprovement.length > 0 ? (
              <ul className="space-y-2">
                {results.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No specific areas for improvement identified</p>
            )}
          </CardContent>
        </Card>
      </div>      {/* Question & Answer Summary */}
      {(results.vapiSummary || results.enhancedAnalysis?.questionAnalysis) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Interview Questions & Answers
            </CardTitle>
            <CardDescription>
              Detailed breakdown of each question and response with AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {renderQuestionAnswerPairs(results.vapiSummary, results.enhancedAnalysis)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      {results.enhancedAnalysis?.keyInsights && results.enhancedAnalysis.keyInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.enhancedAnalysis.keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-900">{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Evaluation */}
      {results.vapiSuccessEvaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Success Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.vapiSuccessEvaluation.successful !== undefined && (
                <div className="flex items-center gap-2">
                  {results.vapiSuccessEvaluation.successful ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Successful
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Needs Improvement
                    </Badge>
                  )}
                </div>
              )}
              {results.vapiSuccessEvaluation.details && (
                <div className="text-sm text-muted-foreground">
                  {results.vapiSuccessEvaluation.details}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {results.recordingUrl && (
              <Button variant="outline" size="sm" className="gap-2">
                <Volume2 className="w-4 h-4" />
                Play Recording
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              View Full Transcript
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                if (results.enhancedAnalysis?.summaryReport) {
                  const blob = new Blob([results.enhancedAnalysis.summaryReport], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `interview-report-${results.candidateName.replace(/\s+/g, '-')}.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }
              }}
            >
              <Download className="w-4 h-4" />
              Download Report
            </Button>
            {results.enhancedAnalysis?.summaryReport && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(results.enhancedAnalysis!.summaryReport);
                }}
              >
                <FileText className="w-4 h-4" />
                Copy Summary
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

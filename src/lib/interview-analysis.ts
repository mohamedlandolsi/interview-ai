/**
 * AI Analysis Service for Interview Results
 * Processes Vapi analysis data and provides enhanced scoring, insights, and recommendations
 */

interface InterviewAnalysisData {
  vapiSummary?: any;
  vapiSuccessEvaluation?: any;
  vapiStructuredData?: any;
  finalTranscript?: string;
  candidateName: string;
  position: string;
  duration?: number;
}

interface EnhancedAnalysisResult {
  overallScore: number;
  categoryScores: {
    communication: number;
    technical: number;
    experience: number;
    culturalFit: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  hiringRecommendation: 'Strong Yes' | 'Yes' | 'Maybe' | 'No';
  keyInsights: string[];
  questionAnalysis: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
    keyPoints: string[];
  }>;
  interviewFlow: {
    engagement: number;
    clarity: number;
    completeness: number;
  };
}

export class InterviewAnalysisService {
  
  /**
   * Process all available Vapi analysis data and generate comprehensive insights
   */
  static async analyzeInterview(data: InterviewAnalysisData): Promise<EnhancedAnalysisResult> {
    const analysis: EnhancedAnalysisResult = {
      overallScore: 0,
      categoryScores: {
        communication: 0,
        technical: 0,
        experience: 0,
        culturalFit: 0
      },
      strengths: [],
      areasForImprovement: [],
      detailedFeedback: '',
      hiringRecommendation: 'Maybe',
      keyInsights: [],
      questionAnalysis: [],
      interviewFlow: {
        engagement: 0,
        clarity: 0,
        completeness: 0
      }
    };

    // Process Vapi Structured Data (primary source for scores)
    if (data.vapiStructuredData) {
      this.processStructuredData(data.vapiStructuredData, analysis);
    }

    // Process Vapi Summary for Q&A analysis
    if (data.vapiSummary) {
      this.processSummary(data.vapiSummary, analysis);
    }

    // Process Success Evaluation
    if (data.vapiSuccessEvaluation) {
      this.processSuccessEvaluation(data.vapiSuccessEvaluation, analysis);
    }

    // Generate additional insights based on transcript length and duration
    if (data.finalTranscript && data.duration) {
      this.analyzeInterviewFlow(data.finalTranscript, data.duration, analysis);
    }

    // Calculate overall score if not provided
    if (analysis.overallScore === 0) {
      analysis.overallScore = this.calculateOverallScore(analysis.categoryScores);
    }

    // Generate detailed feedback
    analysis.detailedFeedback = this.generateDetailedFeedback(analysis, data);

    // Determine hiring recommendation if not provided
    if (analysis.hiringRecommendation === 'Maybe') {
      analysis.hiringRecommendation = this.determineHiringRecommendation(analysis.overallScore);
    }

    return analysis;
  }

  /**
   * Process Vapi structured data
   */
  private static processStructuredData(structuredData: any, analysis: EnhancedAnalysisResult) {
    if (structuredData.overallScore) {
      analysis.overallScore = structuredData.overallScore;
    }

    if (structuredData.categoryScores) {
      analysis.categoryScores = {
        communication: structuredData.categoryScores.communication || 0,
        technical: structuredData.categoryScores.technical || 0,
        experience: structuredData.categoryScores.experience || 0,
        culturalFit: structuredData.categoryScores.culturalFit || 0
      };
    }

    if (Array.isArray(structuredData.strengths)) {
      analysis.strengths = structuredData.strengths;
    }

    if (Array.isArray(structuredData.areasForImprovement)) {
      analysis.areasForImprovement = structuredData.areasForImprovement;
    }

    if (structuredData.hiringRecommendation) {
      analysis.hiringRecommendation = structuredData.hiringRecommendation;
    }

    if (Array.isArray(structuredData.keyInsights)) {
      analysis.keyInsights = structuredData.keyInsights;
    }

    if (Array.isArray(structuredData.questionResponses)) {
      analysis.questionAnalysis = structuredData.questionResponses.map((qr: any) => ({
        question: qr.question || '',
        answer: qr.answer || '',
        score: qr.responseQuality || 0,
        feedback: qr.feedback || '',
        keyPoints: qr.keyPoints || []
      }));
    }
  }

  /**
   * Process Vapi summary for Q&A pairs
   */
  private static processSummary(summary: any, analysis: EnhancedAnalysisResult) {
    if (summary.questions && Array.isArray(summary.questions)) {
      const summaryQuestions = summary.questions.map((q: any) => ({
        question: q.question || '',
        answer: q.answer || '',
        score: q.score || 0,
        feedback: q.evaluation || '',
        keyPoints: q.keyPoints || []
      }));

      // Merge with existing question analysis or replace if empty
      if (analysis.questionAnalysis.length === 0) {
        analysis.questionAnalysis = summaryQuestions;
      } else {
        // Merge data, prioritizing existing analysis
        summaryQuestions.forEach(sq => {
          const existing = analysis.questionAnalysis.find(qa => 
            qa.question.toLowerCase().includes(sq.question.toLowerCase().substring(0, 20))
          );
          if (!existing) {
            analysis.questionAnalysis.push(sq);
          }
        });
      }
    }

    if (summary.overallFlow) {
      analysis.keyInsights.push(`Interview Flow: ${summary.overallFlow}`);
    }
  }

  /**
   * Process success evaluation
   */
  private static processSuccessEvaluation(evaluation: any, analysis: EnhancedAnalysisResult) {
    if (evaluation.successful !== undefined) {
      // Convert boolean success to recommendation
      if (evaluation.successful === true && analysis.hiringRecommendation === 'Maybe') {
        analysis.hiringRecommendation = analysis.overallScore >= 80 ? 'Strong Yes' : 'Yes';
      } else if (evaluation.successful === false && analysis.hiringRecommendation === 'Maybe') {
        analysis.hiringRecommendation = 'No';
      }
    }

    if (evaluation.details) {
      analysis.keyInsights.push(evaluation.details);
    }

    if (evaluation.feedback) {
      analysis.detailedFeedback = evaluation.feedback;
    }
  }

  /**
   * Analyze interview flow based on transcript and duration
   */
  private static analyzeInterviewFlow(transcript: string, duration: number, analysis: EnhancedAnalysisResult) {
    const wordCount = transcript.split(/\s+/).length;
    const wordsPerMinute = wordCount / duration;

    // Analyze engagement based on speaking pace and interaction
    const interactionCount = (transcript.match(/interviewer:|candidate:/gi) || []).length;
    
    analysis.interviewFlow = {
      engagement: this.calculateEngagementScore(wordsPerMinute, interactionCount, duration),
      clarity: this.calculateClarityScore(transcript),
      completeness: this.calculateCompletenessScore(transcript, duration)
    };

    // Add flow insights
    if (analysis.interviewFlow.engagement < 60) {
      analysis.areasForImprovement.push("Increase engagement and participation in interview discussions");
    }
    if (analysis.interviewFlow.clarity < 70) {
      analysis.areasForImprovement.push("Improve clarity and structure in responses");
    }
    if (analysis.interviewFlow.completeness < 70) {
      analysis.areasForImprovement.push("Provide more complete and detailed answers to questions");
    }
  }

  /**
   * Calculate overall score from category scores
   */
  private static calculateOverallScore(categoryScores: any): number {
    const scores = Object.values(categoryScores) as number[];
    const validScores = scores.filter(score => score > 0);
    
    if (validScores.length === 0) return 0;
    
    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
  }

  /**
   * Generate detailed feedback narrative
   */
  private static generateDetailedFeedback(analysis: EnhancedAnalysisResult, data: InterviewAnalysisData): string {
    const parts: string[] = [];

    parts.push(`Overall Performance: ${analysis.overallScore}/100`);
    
    // Category breakdown
    const categories = Object.entries(analysis.categoryScores)
      .filter(([_, score]) => score > 0)
      .map(([category, score]) => `${category}: ${score}/100`)
      .join(', ');
    
    if (categories) {
      parts.push(`Category Breakdown: ${categories}`);
    }

    // Strengths
    if (analysis.strengths.length > 0) {
      parts.push(`Key Strengths: ${analysis.strengths.join('; ')}`);
    }

    // Areas for improvement
    if (analysis.areasForImprovement.length > 0) {
      parts.push(`Areas for Improvement: ${analysis.areasForImprovement.join('; ')}`);
    }

    // Key insights
    if (analysis.keyInsights.length > 0) {
      parts.push(`Additional Insights: ${analysis.keyInsights.join('; ')}`);
    }

    return parts.join('\n\n');
  }

  /**
   * Determine hiring recommendation based on overall score
   */
  private static determineHiringRecommendation(overallScore: number): 'Strong Yes' | 'Yes' | 'Maybe' | 'No' {
    if (overallScore >= 85) return 'Strong Yes';
    if (overallScore >= 75) return 'Yes';
    if (overallScore >= 60) return 'Maybe';
    return 'No';
  }

  /**
   * Calculate engagement score based on speaking patterns
   */
  private static calculateEngagementScore(wordsPerMinute: number, interactionCount: number, duration: number): number {
    // Optimal range: 150-200 words per minute
    const paceScore = wordsPerMinute >= 150 && wordsPerMinute <= 200 ? 100 : 
                     Math.max(0, 100 - Math.abs(wordsPerMinute - 175) * 2);
    
    // Interaction frequency (should have good back-and-forth)
    const expectedInteractions = duration * 2; // Rough estimate
    const interactionScore = Math.min(100, (interactionCount / expectedInteractions) * 100);
    
    return Math.round((paceScore + interactionScore) / 2);
  }

  /**
   * Calculate clarity score based on transcript analysis
   */
  private static calculateClarityScore(transcript: string): number {
    // Simple heuristics for clarity
    const sentences = transcript.split(/[.!?]+/).length;
    const words = transcript.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Optimal range: 15-25 words per sentence
    const clarityBase = avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25 ? 100 :
                       Math.max(0, 100 - Math.abs(avgWordsPerSentence - 20) * 3);
    
    // Check for filler words (very basic check)
    const fillerWords = (transcript.match(/\b(um|uh|like|you know|actually|basically)\b/gi) || []).length;
    const fillerPenalty = Math.min(30, fillerWords * 2);
    
    return Math.max(0, Math.round(clarityBase - fillerPenalty));
  }

  /**
   * Calculate completeness score
   */
  private static calculateCompletenessScore(transcript: string, duration: number): number {
    const wordCount = transcript.split(/\s+/).length;
    
    // Expected word count based on duration (rough estimate)
    const expectedWords = duration * 150; // 150 words per minute average
    const completenessRatio = Math.min(1, wordCount / expectedWords);
    
    return Math.round(completenessRatio * 100);
  }

  /**
   * Generate a summary report for easy consumption
   */
  static generateSummaryReport(analysis: EnhancedAnalysisResult, candidateName: string, position: string): string {
    const report = `
# Interview Analysis Report

**Candidate:** ${candidateName}
**Position:** ${position}
**Overall Score:** ${analysis.overallScore}/100
**Recommendation:** ${analysis.hiringRecommendation}

## Category Scores
- Communication: ${analysis.categoryScores.communication}/100
- Technical: ${analysis.categoryScores.technical}/100
- Experience: ${analysis.categoryScores.experience}/100
- Cultural Fit: ${analysis.categoryScores.culturalFit}/100

## Strengths
${analysis.strengths.map(s => `• ${s}`).join('\n')}

## Areas for Improvement
${analysis.areasForImprovement.map(a => `• ${a}`).join('\n')}

## Interview Flow Analysis
- Engagement: ${analysis.interviewFlow.engagement}/100
- Clarity: ${analysis.interviewFlow.clarity}/100
- Completeness: ${analysis.interviewFlow.completeness}/100

## Key Insights
${analysis.keyInsights.map(i => `• ${i}`).join('\n')}

## Detailed Feedback
${analysis.detailedFeedback}
    `.trim();

    return report;
  }
}

export default InterviewAnalysisService;

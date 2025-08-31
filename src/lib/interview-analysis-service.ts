/**
 * Interview Analysis Service
 * Comprehensive post-interview analysis using Gemini 2.5 Pro
 * Analyzes completed interview transcripts and generates structured results
 */

import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { InterviewSession, InterviewTemplate } from '@prisma/client'
import { createNotification } from './notification-service'

// Types for analysis results
interface AnalysisResult {
  analysis_score: number
  analysis_feedback: string
  strengths: string[]
  areas_for_improvement: string[]
  category_scores: Record<string, number>
  hiring_recommendation: string
  key_insights: string[]
  interview_metrics?: {
    communication_clarity: number
    technical_depth: number
    problem_solving: number
    engagement_level: number
    completeness: number
  }
}

export class InterviewAnalysisService {
  private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

  /**
   * PRODUCTION-READY: Save analysis results directly from Vapi webhook
   * This is the primary method for processing Vapi's post-call analysis
   */
  static async saveAnalysisFromWebhook(sessionId: string, webhookData: any): Promise<boolean> {
    console.log('🔍 Processing Vapi analysis from webhook for session:', sessionId)

    try {
      // Extract analysis data from webhook payload
      const analysisData = this.extractAnalysisFromWebhook(webhookData)
      if (!analysisData) {
        console.error('❌ No valid analysis data found in webhook payload')
        return false
      }

      // Map analysis data to our Prisma schema
      const mappedData = this.mapAnalysisToSchema(analysisData, webhookData)

      // Save to database
      const updateResult = await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          ...mappedData,
          status: 'completed',
          completed_at: new Date()
        }
      })

      // Create notification for results ready
      await createNotification({
        profileId: updateResult.interviewer_id,
        type: 'RESULTS_READY',
        message: `Results for ${updateResult.candidate_name} are ready.`,
        link: `/results/individual?id=${sessionId}`
      })

      console.log('✅ Vapi analysis results saved successfully for session:', sessionId)
      console.log(`   - Overall Score: ${mappedData.analysis_score}`)
      console.log(`   - Hiring Recommendation: ${mappedData.hiring_recommendation}`)
      return true

    } catch (error) {
      console.error('❌ Error saving analysis from webhook:', error)
      return false
    }
  }

  /**
   * Extract analysis data from Vapi webhook payload
   */
  private static extractAnalysisFromWebhook(webhookData: any): any | null {
    try {
      // Vapi sends analysis in the 'message' field for end-of-call-report events
      if (webhookData.message?.analysis) {
        return webhookData.message.analysis
      }

      // Sometimes analysis is in 'artifact' field
      if (webhookData.artifact) {
        return {
          summary: webhookData.artifact.summary,
          successEvaluation: webhookData.artifact.evaluation,
          structuredData: webhookData.artifact.data
        }
      }

      return null
    } catch (error) {
      console.error('Error extracting analysis from webhook:', error)
      return null
    }
  }

  /**
   * Map Vapi analysis data to our Prisma schema fields
   */
  private static mapAnalysisToSchema(analysisData: any, webhookData: any): any {
    const mappedData: any = {}

    try {
      // Extract transcript and recording
      if (webhookData.message?.transcript) {
        mappedData.final_transcript = webhookData.message.transcript
      }
      if (webhookData.message?.recordingUrl) {
        mappedData.recording_url = webhookData.message.recordingUrl
      }

      // Process structured data (this is the main analysis result)
      if (analysisData.structuredData) {
        const structured = analysisData.structuredData

        // Overall score (0-100)
        if (structured.overallScore !== undefined) {
          mappedData.analysis_score = structured.overallScore
        }

        // Category scores
        if (structured.categoryScores) {
          mappedData.category_scores = structured.categoryScores
        }

        // Strengths and areas for improvement
        if (structured.strengths && Array.isArray(structured.strengths)) {
          mappedData.strengths = structured.strengths
        }
        if (structured.areasForImprovement && Array.isArray(structured.areasForImprovement)) {
          mappedData.areas_for_improvement = structured.areasForImprovement
        }

        // Hiring recommendation
        if (structured.hiringRecommendation) {
          mappedData.hiring_recommendation = structured.hiringRecommendation
        }

        // Detailed reasoning/feedback
        if (structured.reasoning) {
          mappedData.analysis_feedback = structured.reasoning
        }

        // Key insights
        if (structured.keyInsights && Array.isArray(structured.keyInsights)) {
          mappedData.key_insights = structured.keyInsights
        }

        // Question responses (individual question analysis)
        if (structured.questionResponses && Array.isArray(structured.questionResponses)) {
          mappedData.question_scores = structured.questionResponses
        }

        // Interview metrics
        if (structured.interviewMetrics) {
          mappedData.interview_metrics = structured.interviewMetrics
        }
      }

      // Process summary (Q&A analysis)
      if (analysisData.summary) {
        mappedData.conversation_summary = typeof analysisData.summary === 'string' 
          ? analysisData.summary 
          : JSON.stringify(analysisData.summary)
        mappedData.vapi_summary = analysisData.summary
      }

      // Process success evaluation
      if (analysisData.successEvaluation) {
        mappedData.vapi_success_evaluation = analysisData.successEvaluation
        
        // Extract score if available
        if (analysisData.successEvaluation.score !== undefined) {
          mappedData.analysis_score = analysisData.successEvaluation.score
        }
      }

      // Store raw Vapi structured data for debugging
      if (analysisData.structuredData) {
        mappedData.vapi_structured_data = analysisData.structuredData
      }

      console.log('✅ Analysis data mapped successfully:', Object.keys(mappedData))
      return mappedData

    } catch (error) {
      console.error('Error mapping analysis data:', error)
      return mappedData
    }
  }

  /**
   * Main function to generate and save comprehensive interview analysis
   */
  static async generateAndSaveAnalysis(sessionId: string): Promise<boolean> {
    console.log('🔍 Starting analysis for session:', sessionId)

    try {
      // Step 1: Data Gathering
      const sessionData = await this.gatherSessionData(sessionId)
      if (!sessionData) {
        console.error('❌ Failed to gather session data for:', sessionId)
        return false
      }

      // Step 2: Generate Analysis
      const analysisResult = await this.performAnalysis(sessionData)
      if (!analysisResult) {
        console.error('❌ Failed to generate analysis for:', sessionId)
        return false
      }

      // Step 3: Save Results
      const saveSuccess = await this.saveAnalysisResults(sessionId, analysisResult)
      if (!saveSuccess) {
        console.error('❌ Failed to save analysis results for:', sessionId)
        return false
      }

      console.log('✅ Analysis completed successfully for session:', sessionId)
      return true

    } catch (error) {
      console.error('❌ Error in generateAndSaveAnalysis:', error)
      return false
    }
  }

  /**
   * Step 1: Gather session data and validate requirements
   */
  private static async gatherSessionData(sessionId: string): Promise<(InterviewSession & { template: InterviewTemplate }) | null> {
    try {
      const session = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
          template: true
        }
      })

      if (!session) {
        console.error('❌ Session not found:', sessionId)
        return null
      }

      if (session.status !== 'completed') {
        console.error('❌ Session not completed yet:', sessionId, 'Status:', session.status)
        return null
      }

      const transcript = session.final_transcript || session.transcript
      if (!transcript || transcript.trim().length < 50) {
        console.error('❌ No valid transcript found for session:', sessionId)
        return null
      }

      console.log('✅ Session data gathered successfully')
      console.log(`   - Candidate: ${session.candidate_name}`)
      console.log(`   - Position: ${session.position}`)
      console.log(`   - Template: ${session.template.title}`)
      console.log(`   - Transcript length: ${transcript.length} characters`)

      return session

    } catch (error) {
      console.error('❌ Error gathering session data:', error)
      return null
    }
  }

  /**
   * Step 2: Perform comprehensive analysis using Gemini 2.5 Pro
   */
  private static async performAnalysis(
    sessionData: InterviewSession & { template: InterviewTemplate }
  ): Promise<AnalysisResult | null> {
    try {
      console.log('🧠 Generating analysis with Gemini 2.5 Pro...')

      const prompt = this.constructAnalysisPrompt(sessionData)
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent analysis
          maxOutputTokens: 8192
        }
      })

      const result = await model.generateContent(prompt)
      const response = result.response
      const analysisText = response.text()

      console.log('📊 Raw analysis response length:', analysisText.length)

      // Parse the JSON response
      const analysisResult = this.parseAnalysisResponse(analysisText)
      if (!analysisResult) {
        console.error('❌ Failed to parse analysis response')
        return null
      }

      console.log('✅ Analysis generated successfully')
      console.log(`   - Overall Score: ${analysisResult.analysis_score}/100`)
      console.log(`   - Recommendation: ${analysisResult.hiring_recommendation}`)
      console.log(`   - Strengths: ${analysisResult.strengths.length}`)
      console.log(`   - Areas for improvement: ${analysisResult.areas_for_improvement.length}`)

      return analysisResult

    } catch (error) {
      console.error('❌ Error performing analysis:', error)
      return null
    }
  }

  /**
   * Construct comprehensive analysis prompt for Gemini
   */
  private static constructAnalysisPrompt(
    sessionData: InterviewSession & { template: InterviewTemplate }
  ): string {
    const { template } = sessionData
    const transcript = sessionData.final_transcript || sessionData.transcript || ''
    
    // Parse template questions for context
    const templateQuestions = this.parseTemplateQuestions(template.questions)
    const questionsText = templateQuestions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')

    return `
You are an expert HR analyst and senior technical recruiter tasked with evaluating a candidate's interview performance. You have extensive experience in talent assessment across multiple industries and excel at providing structured, actionable feedback.

INTERVIEW CONTEXT:
====================
Candidate Name: ${sessionData.candidate_name}
Position Applied For: ${sessionData.position}
Interview Template: ${template.title}
Template Description: ${template.description || 'Not provided'}
Interview Category: ${template.category || 'General'}
Difficulty Level: ${template.difficulty || 'Intermediate'}
Template Tags: ${template.tags?.join(', ') || 'None specified'}
Interview Duration: ${sessionData.duration || 'Unknown'} minutes

INTERVIEW TEMPLATE QUESTIONS:
=============================
${questionsText}

EVALUATION INSTRUCTIONS:
========================
Analyze the following interview transcript based on the provided interview template and context. Your analysis should be thorough, fair, and actionable.

EVALUATION CRITERIA:
1. **Communication Skills**: Clarity of expression, articulation, ability to explain complex concepts
2. **Technical Knowledge**: Depth of knowledge relevant to the position and template category
3. **Problem-Solving Abilities**: Logical thinking, approach to challenges, creativity in solutions
4. **Cultural Fit**: Alignment with professional values, collaboration potential
5. **Experience Relevance**: How well their background matches the role requirements
6. **Question Response Quality**: Completeness, relevance, and insight in answers

FULL INTERVIEW TRANSCRIPT:
==========================
${transcript}

ANALYSIS REQUIREMENTS:
=====================
Provide a comprehensive evaluation that includes:
1. An overall performance score (0-100 scale)
2. Detailed feedback explaining the score
3. Specific strengths demonstrated by the candidate
4. Areas where the candidate could improve
5. Category-specific scores based on the interview template
6. A clear hiring recommendation
7. Key insights about the candidate's potential

OUTPUT FORMAT:
==============
You MUST respond with ONLY a valid JSON object in the following exact format. Do not include any text before or after the JSON:

{
  "analysis_score": 85.5,
  "analysis_feedback": "Comprehensive feedback explaining the overall assessment, highlighting key observations about the candidate's performance across all evaluation criteria. This should be 3-4 detailed sentences.",
  "strengths": [
    "Specific strength 1 with concrete examples from the transcript",
    "Specific strength 2 with concrete examples from the transcript",
    "Specific strength 3 with concrete examples from the transcript"
  ],
  "areas_for_improvement": [
    "Specific area 1 with suggestions for improvement",
    "Specific area 2 with suggestions for improvement"
  ],
  "category_scores": {
    "Communication": 88,
    "Technical Knowledge": 82,
    "Problem Solving": 90,
    "Cultural Fit": 85
  },
  "hiring_recommendation": "Strong Hire",
  "key_insights": [
    "Key insight 1 about candidate's potential and fit",
    "Key insight 2 about candidate's potential and fit",
    "Key insight 3 about candidate's potential and fit"
  ],
  "interview_metrics": {
    "communication_clarity": 87,
    "technical_depth": 83,
    "problem_solving": 89,
    "engagement_level": 92,
    "completeness": 78
  }
}

IMPORTANT NOTES:
- Use hiring recommendations: "Strong Hire", "Hire", "Maybe", "No Hire"
- All scores should be between 0-100
- Provide specific, actionable feedback based on the actual transcript content
- Be fair and objective in your assessment
- Focus on job-relevant criteria based on the position and template
    `.trim()
  }

  /**
   * Parse template questions from JSON format
   */
  private static parseTemplateQuestions(questionsJson: any): Array<{ text: string; type?: string }> {
    try {
      if (Array.isArray(questionsJson)) {
        return questionsJson.map(q => {
          if (typeof q === 'string') {
            return { text: q, type: 'text_response' }
          }
          if (q.title) {
            return { text: q.title, type: q.type || 'text_response' }
          }
          if (q.text) {
            return { text: q.text, type: q.type || 'text_response' }
          }
          return { text: q.toString(), type: 'unknown' }
        })
      }
      return []
    } catch (error) {
      console.error('❌ Error parsing template questions:', error)
      return []
    }
  }

  /**
   * Parse and validate the analysis response from Gemini
   */
  private static parseAnalysisResponse(responseText: string): AnalysisResult | null {
    try {
      // Clean the response text
      let cleanedText = responseText.trim()
      
      // Remove any markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```$/, '')
      }

      // Parse JSON
      const analysisResult = JSON.parse(cleanedText) as AnalysisResult

      // Validate required fields
      if (!this.validateAnalysisResult(analysisResult)) {
        console.error('❌ Analysis result validation failed')
        return null
      }

      return analysisResult

    } catch (error) {
      console.error('❌ Error parsing analysis response:', error)
      console.error('Response text:', responseText.substring(0, 500) + '...')
      
      // Retry with a more aggressive cleaning approach
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0]) as AnalysisResult
          if (this.validateAnalysisResult(analysisResult)) {
            return analysisResult
          }
        }
      } catch (retryError) {
        console.error('❌ Retry parsing also failed:', retryError)
      }
      
      return null
    }
  }

  /**
   * Validate the analysis result structure
   */
  private static validateAnalysisResult(result: any): result is AnalysisResult {
    return (
      typeof result === 'object' &&
      typeof result.analysis_score === 'number' &&
      result.analysis_score >= 0 &&
      result.analysis_score <= 100 &&
      typeof result.analysis_feedback === 'string' &&
      Array.isArray(result.strengths) &&
      Array.isArray(result.areas_for_improvement) &&
      typeof result.category_scores === 'object' &&
      typeof result.hiring_recommendation === 'string' &&
      Array.isArray(result.key_insights)
    )
  }

  /**
   * Step 3: Save analysis results to database
   */
  private static async saveAnalysisResults(sessionId: string, analysisResult: AnalysisResult): Promise<boolean> {
    try {
      console.log('💾 Saving analysis results to database...')

      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          analysis_score: analysisResult.analysis_score,
          analysis_feedback: analysisResult.analysis_feedback,
          strengths: analysisResult.strengths,
          areas_for_improvement: analysisResult.areas_for_improvement,
          category_scores: analysisResult.category_scores,
          hiring_recommendation: analysisResult.hiring_recommendation,
          key_insights: analysisResult.key_insights,
          interview_metrics: analysisResult.interview_metrics || {},
          updated_at: new Date()
        }
      })

      console.log('✅ Analysis results saved successfully')
      return true

    } catch (error) {
      console.error('❌ Error saving analysis results:', error)
      return false
    }
  }

  /**
   * Utility function to trigger analysis for a specific session
   * Can be called manually or from other services
   */
  static async triggerAnalysisForSession(sessionId: string): Promise<void> {
    console.log('🚀 Manual analysis trigger for session:', sessionId)
    
    // Run analysis asynchronously to avoid blocking
    this.generateAndSaveAnalysis(sessionId)
      .then((success) => {
        if (success) {
          console.log('✅ Manual analysis completed for session:', sessionId)
        } else {
          console.error('❌ Manual analysis failed for session:', sessionId)
        }
      })
      .catch((error) => {
        console.error('❌ Manual analysis error for session:', sessionId, error)
      })
  }

  /**
   * Batch analysis for multiple sessions
   * Useful for processing backlog or re-analyzing sessions
   */
  static async batchAnalysis(sessionIds: string[]): Promise<{ successful: string[], failed: string[] }> {
    console.log('📊 Starting batch analysis for', sessionIds.length, 'sessions')
    
    const results = {
      successful: [] as string[],
      failed: [] as string[]
    }

    for (const sessionId of sessionIds) {
      try {
        const success = await this.generateAndSaveAnalysis(sessionId)
        if (success) {
          results.successful.push(sessionId)
        } else {
          results.failed.push(sessionId)
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error('❌ Batch analysis error for session:', sessionId, error)
        results.failed.push(sessionId)
      }
    }

    console.log('📊 Batch analysis completed:', results)
    return results
  }
}

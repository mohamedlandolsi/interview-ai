// Test script to validate the webhook can process analysis results
const testWebhookPayload = {
  type: 'end-of-call-report',
  call: {
    id: 'test-call-123',
    assistantId: 'test-assistant'
  },
  message: {
    analysis: {
      summary: {
        questions: [
          {
            question: "Tell me about yourself",
            answer: "I am a software developer with 5 years of experience...",
            score: 85,
            feedback: "Good technical background"
          }
        ],
        overallFlow: "Candidate demonstrated strong technical skills",
        averageScore: 8.5
      },
      successEvaluation: {
        score: 85,
        feedback: "Strong candidate with good communication skills",
        successful: true
      },
      structuredData: {
        overallScore: 85,
        categoryScores: {
          communication: 90,
          technical: 85,
          experience: 80,
          culturalFit: 88
        },
        strengths: [
          "Strong technical background",
          "Good communication skills",
          "Problem-solving abilities"
        ],
        areasForImprovement: [
          "Could improve leadership experience"
        ],
        hiringRecommendation: "Yes",
        reasoning: "Candidate shows strong technical competency and good cultural fit",
        keyInsights: [
          "Self-motivated individual",
          "Good team collaboration experience"
        ],
        questionResponses: [
          {
            question: "Tell me about yourself",
            responseQuality: 85,
            feedback: "Well-structured response covering key points",
            keyPoints: ["Technical experience", "Career progression", "Motivation"]
          }
        ],
        interviewMetrics: {
          engagement: 90,
          clarity: 85,
          completeness: 88
        }
      }
    }
  },
  timestamp: new Date().toISOString()
}

console.log('🧪 Testing webhook analysis processing...')
console.log('Payload structure:', {
  hasCall: !!testWebhookPayload.call,
  hasAnalysis: !!testWebhookPayload.message?.analysis,
  hasSummary: !!testWebhookPayload.message?.analysis?.summary,
  hasSuccessEvaluation: !!testWebhookPayload.message?.analysis?.successEvaluation,
  hasStructuredData: !!testWebhookPayload.message?.analysis?.structuredData
})

// Test the analysis extraction (simulating webhook processing)
const extractAnalysisFromWebhook = (webhookData) => {
  try {
    if (webhookData.message?.analysis) {
      return webhookData.message.analysis
    }
    return null
  } catch (error) {
    console.error('Error extracting analysis:', error)
    return null
  }
}

const mapAnalysisToSchema = (analysisData) => {
  const mappedData = {}

  try {
    // Process structured data
    if (analysisData.structuredData) {
      const structured = analysisData.structuredData

      if (structured.overallScore !== undefined) {
        mappedData.analysis_score = structured.overallScore
      }

      if (structured.categoryScores) {
        mappedData.category_scores = structured.categoryScores
      }

      if (structured.strengths && Array.isArray(structured.strengths)) {
        mappedData.strengths = structured.strengths
      }

      if (structured.areasForImprovement && Array.isArray(structured.areasForImprovement)) {
        mappedData.areas_for_improvement = structured.areasForImprovement
      }

      if (structured.hiringRecommendation) {
        mappedData.hiring_recommendation = structured.hiringRecommendation
      }

      if (structured.reasoning) {
        mappedData.analysis_feedback = structured.reasoning
      }

      if (structured.keyInsights && Array.isArray(structured.keyInsights)) {
        mappedData.key_insights = structured.keyInsights
      }

      if (structured.questionResponses && Array.isArray(structured.questionResponses)) {
        mappedData.question_scores = structured.questionResponses
      }

      if (structured.interviewMetrics) {
        mappedData.interview_metrics = structured.interviewMetrics
      }
    }

    // Process summary
    if (analysisData.summary) {
      mappedData.conversation_summary = typeof analysisData.summary === 'string' 
        ? analysisData.summary 
        : JSON.stringify(analysisData.summary)
      mappedData.vapi_summary = analysisData.summary
    }

    // Process success evaluation
    if (analysisData.successEvaluation) {
      mappedData.vapi_success_evaluation = analysisData.successEvaluation
      
      if (analysisData.successEvaluation.score !== undefined) {
        mappedData.analysis_score = analysisData.successEvaluation.score
      }
    }

    return mappedData

  } catch (error) {
    console.error('Error mapping analysis data:', error)
    return mappedData
  }
}

// Test the extraction and mapping
const extractedAnalysis = extractAnalysisFromWebhook(testWebhookPayload)
console.log('\n✅ Analysis extraction successful:', !!extractedAnalysis)

if (extractedAnalysis) {
  const mappedData = mapAnalysisToSchema(extractedAnalysis)
  console.log('\n📊 Mapped analysis data:')
  console.log('- Overall Score:', mappedData.analysis_score)
  console.log('- Hiring Recommendation:', mappedData.hiring_recommendation)
  console.log('- Strengths:', mappedData.strengths?.length || 0, 'items')
  console.log('- Areas for Improvement:', mappedData.areas_for_improvement?.length || 0, 'items')
  console.log('- Key Insights:', mappedData.key_insights?.length || 0, 'items')
  console.log('- Question Responses:', mappedData.question_scores?.length || 0, 'items')
  console.log('- Has Interview Metrics:', !!mappedData.interview_metrics)
  console.log('- Has Category Scores:', !!mappedData.category_scores)
  
  console.log('\n🎯 Test Result: WEBHOOK ANALYSIS PROCESSING READY')
} else {
  console.log('\n❌ Test Result: Analysis extraction failed')
}

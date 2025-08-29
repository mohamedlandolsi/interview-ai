// Test script for the enhanced Vapi analysis pipeline
const { buildAssistantFromTemplate } = require('./src/lib/vapi-assistant-builder')
const { InterviewAnalysisService } = require('./src/lib/interview-analysis-service')

async function testAnalysisPipeline() {
  console.log('🔍 Testing Enhanced Vapi Analysis Pipeline')
  console.log('=' * 50)

  // Test 1: Verify assistant config includes analysis fields
  console.log('\n1. Testing Assistant Config with Analysis Fields')
  try {
    const assistantConfig = await buildAssistantFromTemplate('test-template-id', 'test-session-id')
    
    console.log('✅ Assistant config generated successfully')
    console.log('   - Model:', assistantConfig.model?.model)
    console.log('   - Voice Provider:', assistantConfig.voice?.provider)
    console.log('   - Summary Prompt:', assistantConfig.summaryPrompt ? '✅ Present' : '❌ Missing')
    console.log('   - Success Evaluation:', assistantConfig.successEvaluationPrompt ? '✅ Present' : '❌ Missing')
    console.log('   - Structured Data Prompt:', assistantConfig.structuredDataPrompt ? '✅ Present' : '❌ Missing')
    console.log('   - Structured Data Schema:', assistantConfig.structuredDataSchema ? '✅ Present' : '❌ Missing')
    
    if (assistantConfig.structuredDataSchema) {
      console.log('   - Schema Properties:', Object.keys(assistantConfig.structuredDataSchema.properties || {}))
    }
    
  } catch (error) {
    console.error('❌ Assistant config test failed:', error.message)
  }

  // Test 2: Test webhook analysis data extraction
  console.log('\n2. Testing Webhook Analysis Processing')
  try {
    // Mock webhook payload with analysis data
    const mockWebhookPayload = {
      type: 'end-of-call-report',
      call: { id: 'test-call-123' },
      message: {
        analysis: {
          summary: {
            questions: [
              { question: 'Tell me about yourself', response: 'I am a developer...', score: 8 },
              { question: 'What are your strengths?', response: 'Problem solving...', score: 9 }
            ],
            averageScore: 8.5
          },
          successEvaluation: {
            score: 85,
            feedback: 'Strong technical background',
            successful: true
          },
          structuredData: {
            overallScore: 85,
            categoryScores: {
              technical: 90,
              communication: 80,
              problemSolving: 85
            },
            strengths: ['Technical expertise', 'Clear communication'],
            areasForImprovement: ['More confidence', 'Leadership examples'],
            hiringRecommendation: 'Yes',
            reasoning: 'Candidate demonstrates strong technical skills...',
            keyInsights: ['Good problem-solving approach', 'Needs more leadership experience'],
            questionResponses: [
              { id: 1, score: 8, feedback: 'Good technical answer' },
              { id: 2, score: 9, feedback: 'Excellent communication' }
            ]
          }
        },
        transcript: 'Full interview transcript...',
        recordingUrl: 'https://example.com/recording.mp3'
      }
    }

    // Test the analysis extraction and mapping
    const extractedData = InterviewAnalysisService.extractAnalysisFromWebhook?.(mockWebhookPayload)
    if (extractedData) {
      console.log('✅ Analysis data extracted successfully')
      console.log('   - Summary:', extractedData.summary ? '✅' : '❌')
      console.log('   - Success Evaluation:', extractedData.successEvaluation ? '✅' : '❌')
      console.log('   - Structured Data:', extractedData.structuredData ? '✅' : '❌')
    }

    const mappedData = InterviewAnalysisService.mapAnalysisToSchema?.(extractedData, mockWebhookPayload)
    if (mappedData) {
      console.log('✅ Analysis data mapped successfully')
      console.log('   - Fields mapped:', Object.keys(mappedData).length)
      console.log('   - Overall Score:', mappedData.analysis_score)
      console.log('   - Hiring Recommendation:', mappedData.hiring_recommendation)
      console.log('   - Strengths Count:', mappedData.strengths?.length || 0)
      console.log('   - Areas for Improvement Count:', mappedData.areas_for_improvement?.length || 0)
    }

  } catch (error) {
    console.error('❌ Webhook analysis test failed:', error.message)
  }

  // Test 3: Verify the new format compliance
  console.log('\n3. Testing Vapi Format Compliance')
  try {
    const assistantConfig = await buildAssistantFromTemplate('test-template-id', 'test-session-id')
    
    // Check if new fields are at the top level (not nested in analysisSchema)
    const hasOldFormat = assistantConfig.analysisSchema !== undefined
    const hasNewFormat = assistantConfig.summaryPrompt && 
                         assistantConfig.successEvaluationPrompt && 
                         assistantConfig.structuredDataPrompt && 
                         assistantConfig.structuredDataSchema

    console.log('   - Old Format (analysisSchema):', hasOldFormat ? '❌ Still present' : '✅ Removed')
    console.log('   - New Format (top-level fields):', hasNewFormat ? '✅ Implemented' : '❌ Missing')
    
    if (hasNewFormat) {
      console.log('   - Format Migration: ✅ Complete')
    } else {
      console.log('   - Format Migration: ❌ Incomplete')
    }

  } catch (error) {
    console.error('❌ Format compliance test failed:', error.message)
  }

  console.log('\n🎉 Analysis Pipeline Test Complete!')
  console.log('\nNext Steps:')
  console.log('1. Start an interview session')
  console.log('2. Monitor webhook endpoint for end-of-call-report events')
  console.log('3. Verify analysis data is saved to the database')
  console.log('4. Check that results display properly in the frontend')
}

// Run the test
testAnalysisPipeline().catch(console.error)

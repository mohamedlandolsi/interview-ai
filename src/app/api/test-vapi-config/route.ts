/**
 * Simple configuration display for testing Vapi prompts
 * Run this with: npx next dev then visit /api/test-vapi-config
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInterviewAssistantConfig } from '@/lib/vapi-assistant-config';

export async function GET(request: NextRequest) {
  try {
    const testCandidate = "John Doe";
    const testPosition = "Senior Software Engineer";
    const testQuestions = [
      "Tell me about your experience with React and Node.js",
      "Describe a challenging project you worked on recently",
      "How do you handle code reviews and feedback?",
      "What's your approach to debugging complex issues?",
      "How do you stay updated with new technologies?"
    ];

    const config = createInterviewAssistantConfig(testCandidate, testPosition, testQuestions);

    const testResults = {
      status: 'success',
      message: 'Vapi Analysis Prompts Configuration Test',
      timestamp: new Date().toISOString(),
      
      configuration: {
        assistantName: config.name,
        candidate: testCandidate,
        position: testPosition,
        voiceProvider: config.voice?.provider,
        model: `${config.model?.provider} - ${config.model?.model}`,
        temperature: config.model?.temperature,
        recordingEnabled: config.recordingEnabled,
        maxDuration: config.maxDurationSeconds ? `${config.maxDurationSeconds/60} minutes` : null,
        minMessagesToTrigger: config.analysisSchema?.minMessagesToTriggerAnalysis
      },

      prompts: {
        summary: {
          configured: !!config.analysisSchema?.summaryPrompt,
          promptLength: config.analysisSchema?.summaryPrompt?.length || 0,
          timeout: config.analysisSchema?.summaryRequestTimeoutSeconds,
          hasRequiredElements: config.analysisSchema?.summaryPrompt ? 
            ['question-answer pairs', 'score', 'JSON', 'key points'].every(element => 
              config.analysisSchema.summaryPrompt.toLowerCase().includes(element.toLowerCase())
            ) : false
        },
        
        successEvaluation: {
          configured: !!config.analysisSchema?.successEvaluationPrompt,
          promptLength: config.analysisSchema?.successEvaluationPrompt?.length || 0,
          timeout: config.analysisSchema?.successEvaluationRequestTimeoutSeconds,
          hasRequiredElements: config.analysisSchema?.successEvaluationPrompt ? 
            ['communication skills', 'technical competency', 'professional experience', 'cultural fit', 'hiring recommendation'].every(element => 
              config.analysisSchema.successEvaluationPrompt.toLowerCase().includes(element.toLowerCase())
            ) : false
        },
        
        structuredData: {
          configured: !!config.analysisSchema?.structuredDataPrompt,
          promptLength: config.analysisSchema?.structuredDataPrompt?.length || 0,
          timeout: config.analysisSchema?.structuredDataRequestTimeoutSeconds,
          schemaConfigured: !!config.analysisSchema?.structuredDataSchema,
          schemaProperties: config.analysisSchema?.structuredDataSchema?.properties ? 
            Object.keys(config.analysisSchema.structuredDataSchema.properties).length : 0,
          hasRequiredProperties: config.analysisSchema?.structuredDataSchema?.properties ? 
            ['overallScore', 'categoryScores', 'strengths', 'areasForImprovement', 'hiringRecommendation', 'reasoning'].every(prop => 
              !!config.analysisSchema.structuredDataSchema.properties[prop]
            ) : false,
          categoryScores: config.analysisSchema?.structuredDataSchema?.properties?.categoryScores?.properties ? 
            Object.keys(config.analysisSchema.structuredDataSchema.properties.categoryScores.properties) : []
        }
      },

      integration: {
        questionsInSystemMessage: config.model?.messages?.[0]?.content ? 
          testQuestions.filter(q => config.model.messages[0].content.includes(q)).length : 0,
        totalTestQuestions: testQuestions.length,
        systemMessageLength: config.model?.messages?.[0]?.content?.length || 0
      },

      environment: {
        vapiPublicKey: !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
        vapiAssistantId: !!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        vapiPrivateKey: !!process.env.VAPI_PRIVATE_KEY,
        vapiWebhookSecret: !!process.env.VAPI_WEBHOOK_SECRET
      },

      summary: {
        allPromptsConfigured: !!(
          config.analysisSchema?.summaryPrompt && 
          config.analysisSchema?.successEvaluationPrompt && 
          config.analysisSchema?.structuredDataPrompt
        ),
        schemaComplete: !!config.analysisSchema?.structuredDataSchema,
        environmentReady: !!(
          process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && 
          process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID && 
          process.env.VAPI_PRIVATE_KEY && 
          process.env.VAPI_WEBHOOK_SECRET
        ),
        ready: !!(
          config.analysisSchema?.summaryPrompt && 
          config.analysisSchema?.successEvaluationPrompt && 
          config.analysisSchema?.structuredDataPrompt &&
          config.analysisSchema?.structuredDataSchema &&
          process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
        )
      }
    };

    return NextResponse.json(testResults, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Vapi configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

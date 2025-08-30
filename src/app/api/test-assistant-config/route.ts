import { NextRequest, NextResponse } from 'next/server'
import { buildAssistantFromTemplate } from '@/lib/vapi-assistant-builder'

export async function GET(request: NextRequest) {
  try {
    // Test with a mock template
    const mockTemplate = {
      id: 'test-template',
      title: 'Test Interview',
      name: 'Test Interview',
      description: 'A test interview template',
      instruction: 'Conduct a professional interview',
      category: 'Technical',
      difficulty: 'Intermediate',
      duration: 30,
      tags: ['software', 'developer'],
      questions: [
        {
          id: '1',
          text: 'Tell me about yourself',
          category: 'General',
          followUp: 'What motivates you?'
        }
      ],
      rawQuestions: [
        {
          id: '1',
          text: 'Tell me about yourself',
          category: 'General',
          followUp: 'What motivates you?'
        }
      ],
      company_id: 'test-company',
      created_by: 'test-user',
      usage_count: 0,
      last_used: null,
      is_built_in: false,
      created_at: new Date(),
      updated_at: new Date()
    }

    // Build assistant config with our new analysis fields
    const assistantConfig = buildAssistantFromTemplate({
      template: mockTemplate,
      sessionId: 'test-session-123',
      candidateName: 'Test Candidate',
      position: 'Software Developer'
    })

    // Check if analysis fields are present
    const hasAnalysisFields = {
      hasSummaryPrompt: !!assistantConfig.analysis?.summaryPrompt,
      hasSuccessEvaluationPrompt: !!assistantConfig.analysis?.successEvaluationPrompt,
      hasStructuredDataPrompt: !!assistantConfig.analysis?.structuredDataPrompt,
      hasStructuredDataSchema: !!assistantConfig.analysis?.structuredDataSchema,
      summaryPromptLength: assistantConfig.analysis?.summaryPrompt?.length || 0,
      successEvaluationPromptLength: assistantConfig.analysis?.successEvaluationPrompt?.length || 0,
      structuredDataPromptLength: assistantConfig.analysis?.structuredDataPrompt?.length || 0,
      structuredDataSchemaKeys: assistantConfig.analysis?.structuredDataSchema ? Object.keys(assistantConfig.analysis.structuredDataSchema) : []
    }

    return NextResponse.json({
      success: true,
      message: 'Assistant config generated successfully with analysis fields',
      analysisFieldsStatus: hasAnalysisFields,
      assistantConfig: {
        name: assistantConfig.name,
        model: assistantConfig.model,
        voice: assistantConfig.voice,
        analysis: assistantConfig.analysis,
        // Include first 100 chars of each analysis field for verification
        summaryPromptPreview: assistantConfig.analysis?.summaryPrompt?.substring(0, 100) + '...',
        successEvaluationPromptPreview: assistantConfig.analysis?.successEvaluationPrompt?.substring(0, 100) + '...',
        structuredDataPromptPreview: assistantConfig.analysis?.structuredDataPrompt?.substring(0, 100) + '...',
        structuredDataSchemaPreview: assistantConfig.analysis?.structuredDataSchema
      }
    })

  } catch (error) {
    console.error('Error testing assistant config:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate assistant config',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

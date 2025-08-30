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

    // Check if analysis fields are present (updated to analysisPlan)
    const sp = assistantConfig.analysisPlan?.summaryPlan?.messages?.[0]?.content
    const ep = assistantConfig.analysisPlan?.successEvaluationPlan?.messages?.[0]?.content
    const dp = assistantConfig.analysisPlan?.structuredDataPlan?.messages?.[0]?.content
    const ds = assistantConfig.analysisPlan?.structuredDataPlan?.schema

    const hasAnalysisFields = {
      hasSummaryPrompt: !!sp,
      hasSuccessEvaluationPrompt: !!ep,
      hasStructuredDataPrompt: !!dp,
      hasStructuredDataSchema: !!ds,
      summaryPromptLength: sp?.length || 0,
      successEvaluationPromptLength: ep?.length || 0,
      structuredDataPromptLength: dp?.length || 0,
      structuredDataSchemaKeys: ds ? Object.keys(ds) : []
    }

    return NextResponse.json({
      success: true,
      message: 'Assistant config generated successfully with analysis fields',
      analysisFieldsStatus: hasAnalysisFields,
      assistantConfig: {
        name: assistantConfig.name,
        model: assistantConfig.model,
        voice: assistantConfig.voice,
        server: assistantConfig.server,
        analysisPlan: assistantConfig.analysisPlan,
        // Include first 100 chars of each analysis field for verification
        summaryPromptPreview: sp ? sp.substring(0, 100) + '...' : undefined,
        successEvaluationPromptPreview: ep ? ep.substring(0, 100) + '...' : undefined,
        structuredDataPromptPreview: dp ? dp.substring(0, 100) + '...' : undefined,
        structuredDataSchemaPreview: ds
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

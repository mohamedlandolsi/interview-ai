/**
 * Debug endpoint to test assistant configuration without creating it
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildAssistantFromTemplate, validateAssistantConfig } from '@/lib/vapi-assistant-builder';

export async function POST() {
  try {
    console.log('🧪 Testing assistant configuration...');
    
    // Create a mock template for testing
    const mockTemplate = {
      id: 'test-template',
      title: 'Test Interview Template',
      name: 'Test Interview Template',
      description: 'A test template for debugging',
      instruction: 'Conduct a professional interview and ask relevant questions.',
      category: 'Technical',
      difficulty: 'Intermediate',
      duration: 30,
      tags: ['test'],
      questions: ['Tell me about yourself', 'What are your strengths?'],
      rawQuestions: [
        { title: 'Tell me about yourself', type: 'open' },
        { title: 'What are your strengths?', type: 'open' }
      ],
      company_id: 'test-company',
      created_by: 'test-user',
      usage_count: 0,
      last_used: null,
      is_built_in: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Build the assistant configuration
    const assistantConfig = buildAssistantFromTemplate({
      template: mockTemplate,
      sessionId: 'test-session-123',
      candidateName: 'Test Candidate',
      position: 'Software Engineer',
      companyIntegration: null
    });

    console.log('🔧 Built assistant config...');
    console.log('📋 Voice config:', JSON.stringify(assistantConfig.voice, null, 2));
    console.log('📋 Server URL:', assistantConfig.serverUrl);
    console.log('📋 Full config:', JSON.stringify(assistantConfig, null, 2));

    // Validate the configuration
    const validation = validateAssistantConfig(assistantConfig);
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return NextResponse.json({
        error: 'Invalid assistant configuration',
        details: validation.errors,
        config: assistantConfig
      }, { status: 400 });
    }

    console.log('✅ Configuration validated successfully');

    return NextResponse.json({
      success: true,
      message: 'Configuration generated and validated successfully',
      config: assistantConfig,
      validation: validation
    });

  } catch (error) {
    console.error('❌ Error testing configuration:', error);
    return NextResponse.json({
      error: 'Error testing configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

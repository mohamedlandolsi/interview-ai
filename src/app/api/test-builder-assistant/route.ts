/**
 * Test endpoint to create an assistant using our builder
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildAssistantFromTemplate, validateAssistantConfig } from '@/lib/vapi-assistant-builder';

export async function POST() {
  try {
    console.log('🧪 Testing assistant builder...');
    
    // Check if private key exists
    if (!process.env.VAPI_PRIVATE_KEY) {
      return NextResponse.json({
        error: 'VAPI_PRIVATE_KEY environment variable is not set'
      }, { status: 500 });
    }

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
    console.log('📋 Config preview:', JSON.stringify({
      name: assistantConfig.name,
      model: assistantConfig.model?.provider + '/' + assistantConfig.model?.model,
      voice: assistantConfig.voice?.provider + '/' + assistantConfig.voice?.voiceId,
      transcriber: assistantConfig.transcriber?.provider,
      maxDuration: assistantConfig.maxDurationSeconds,
      endCallPhrases: assistantConfig.endCallPhrases?.length || 0,
      hasServerUrl: !!assistantConfig.serverUrl,
      webhookUrl: assistantConfig.serverUrl
    }, null, 2));

    // Validate the configuration
    const validation = validateAssistantConfig(assistantConfig);
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return NextResponse.json({
        error: 'Invalid assistant configuration',
        details: validation.errors
      }, { status: 400 });
    }

    console.log('✅ Configuration validated successfully');

    // Try to create the assistant in Vapi
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    console.log('📡 Vapi API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Vapi API error:', response.status, errorData);
      
      try {
        const parsedError = JSON.parse(errorData);
        console.error('📋 Parsed error details:', parsedError);
      } catch {
        console.error('📋 Raw error response:', errorData);
      }
      
      return NextResponse.json({
        error: 'Vapi API assistant creation failed',
        status: response.status,
        details: errorData,
        configUsed: assistantConfig
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ Assistant created successfully:', data.id);

    return NextResponse.json({
      success: true,
      message: 'Assistant created using builder successfully',
      assistantId: data.id,
      configUsed: assistantConfig
    });

  } catch (error) {
    console.error('❌ Error testing assistant builder:', error);
    return NextResponse.json({
      error: 'Error testing assistant builder',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

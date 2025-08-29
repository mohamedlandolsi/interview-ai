/**
 * API endpoint for starting interviews with transient Vapi assistants
 * POST /api/interviews/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { buildAssistantFromTemplate, validateAssistantConfig } from '@/lib/vapi-assistant-builder';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/url-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { interviewSessionId, candidateName, position } = body;

    if (!interviewSessionId || !candidateName || !position) {
      return NextResponse.json(
        { error: 'Missing required fields: interviewSessionId, candidateName, position' },
        { status: 400 }
      );
    }

    // Get the interview session with template and company integration
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: interviewSessionId,
        interviewer_id: user.id // Ensure user owns this session
      },
      include: {
        template: true,
        interviewer: {
          include: {
            company: {
              include: {
                integration: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Interview session not found or access denied' },
        { status: 404 }
      );
    }

    if (!session.template) {
      return NextResponse.json(
        { error: 'Interview template not found for this session' },
        { status: 400 }
      );
    }

    // Build the assistant configuration
    const assistantConfig = buildAssistantFromTemplate({
      template: session.template,
      sessionId: interviewSessionId,
      candidateName,
      position,
      companyIntegration: session.interviewer.company?.integration || null,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || getBaseUrl()
    });

    // Validate the configuration
    const validation = validateAssistantConfig(assistantConfig);
    if (!validation.isValid) {
      console.error('Invalid assistant configuration:', validation.errors);
      return NextResponse.json(
        { error: 'Failed to create valid assistant configuration', details: validation.errors },
        { status: 500 }
      );
    }

    console.log('🔧 Assistant config preview:', JSON.stringify({
      name: assistantConfig.name,
      model: assistantConfig.model?.provider + '/' + assistantConfig.model?.model,
      voice: assistantConfig.voice?.provider + '/' + assistantConfig.voice?.voiceId,
      transcriber: assistantConfig.transcriber?.provider,
      maxDuration: assistantConfig.maxDurationSeconds,
      endCallPhrases: assistantConfig.endCallPhrases?.length || 0,
      hasServerUrl: !!assistantConfig.serverUrl,
      webhookUrl: assistantConfig.serverUrl
    }, null, 2));

    // Also log first 500 chars of system prompt for debugging
    if (assistantConfig.model?.messages?.[0]?.content) {
      console.log('📋 System prompt preview:', assistantConfig.model.messages[0].content.substring(0, 500) + '...');
    }

    // Create the assistant in Vapi
    const vapiResponse = await createVapiAssistant(assistantConfig);
    
    if (!vapiResponse.success) {
      console.error('Failed to create Vapi assistant:', vapiResponse.error);
      return NextResponse.json(
        { error: 'Failed to create Vapi assistant', details: vapiResponse.error },
        { status: 500 }
      );
    }

    // Update the session with the new assistant ID
    await prisma.interviewSession.update({
      where: { id: interviewSessionId },
      data: {
        vapi_assistant_id: vapiResponse.assistantId,
        status: 'in_progress',
        started_at: new Date()
      }
    });

    console.log(`Created transient Vapi assistant ${vapiResponse.assistantId} for session ${interviewSessionId}`);

    return NextResponse.json({
      success: true,
      assistantId: vapiResponse.assistantId,
      sessionId: interviewSessionId,
      publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    });

  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a transient assistant in Vapi
 */
async function createVapiAssistant(config: any): Promise<{ success: boolean; assistantId?: string; error?: string }> {
  try {
    console.log('🚀 Creating Vapi assistant with config...');
    console.log('📝 Config size:', JSON.stringify(config).length, 'characters');
    
    // Check if private key exists
    if (!process.env.VAPI_PRIVATE_KEY) {
      console.error('❌ VAPI_PRIVATE_KEY environment variable is not set');
      return {
        success: false,
        error: 'VAPI_PRIVATE_KEY environment variable is not set'
      };
    }

    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    console.log('📡 Vapi API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Vapi API error response:', response.status, errorData);
      
      // Try to parse the error as JSON for more details
      try {
        const parsedError = JSON.parse(errorData);
        console.error('📋 Parsed error details:', parsedError);
      } catch {
        console.error('📋 Raw error response:', errorData);
      }
      
      return {
        success: false,
        error: `Vapi API error: ${response.status} - ${errorData}`
      };
    }

    const data = await response.json();
    
    if (!data.id) {
      console.error('Vapi assistant created but no ID returned:', data);
      return {
        success: false,
        error: 'Vapi assistant created but no ID returned'
      };
    }

    return {
      success: true,
      assistantId: data.id
    };

  } catch (error) {
    console.error('Error creating Vapi assistant:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

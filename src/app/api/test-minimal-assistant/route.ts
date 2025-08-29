/**
 * Test endpoint to create a minimal Vapi assistant
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🧪 Testing minimal Vapi assistant creation...');
    
    // Check if private key exists
    if (!process.env.VAPI_PRIVATE_KEY) {
      return NextResponse.json({
        error: 'VAPI_PRIVATE_KEY environment variable is not set'
      }, { status: 500 });
    }

    // Create a minimal assistant configuration
    const minimalConfig = {
      name: "Test Assistant",
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        temperature: 0.1,
        messages: [{
          role: "system",
          content: "You are a professional AI interviewer. Be friendly and ask interview questions."
        }]
      },
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB"
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US"
      },
      firstMessage: "Hello! I'm your AI interviewer today. Are you ready to begin?",
      recordingEnabled: true,
      endCallMessage: "Thank you for your time today!",
      endCallPhrases: ["goodbye", "end interview"],
      endCallFunctionEnabled: false,
      maxDurationSeconds: 1800,
      silenceTimeoutSeconds: 60,
      responseDelaySeconds: 1.0,
      backgroundDenoisingEnabled: true
    };

    console.log('📋 Minimal config:', JSON.stringify(minimalConfig, null, 2));

    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalConfig)
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
        details: errorData
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ Minimal assistant created successfully:', data.id);

    return NextResponse.json({
      success: true,
      message: 'Minimal assistant created successfully',
      assistantId: data.id,
      assistantData: data
    });

  } catch (error) {
    console.error('❌ Error creating minimal assistant:', error);
    return NextResponse.json({
      error: 'Error creating minimal assistant',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

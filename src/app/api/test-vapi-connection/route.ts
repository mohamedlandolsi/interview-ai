/**
 * Test endpoint to verify Vapi API connectivity
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Vapi API connectivity...');
    
    // Check if private key exists
    if (!process.env.VAPI_PRIVATE_KEY) {
      return NextResponse.json({
        error: 'VAPI_PRIVATE_KEY environment variable is not set'
      }, { status: 500 });
    }

    // Test by listing assistants (should work if auth is correct)
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Vapi API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Vapi API error:', response.status, errorData);
      return NextResponse.json({
        error: 'Vapi API connection failed',
        status: response.status,
        details: errorData
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ Vapi API connection successful');
    console.log('📊 Existing assistants count:', data.length || 0);

    return NextResponse.json({
      success: true,
      message: 'Vapi API connection successful',
      existingAssistants: data.length || 0,
      apiKeyLength: process.env.VAPI_PRIVATE_KEY.length
    });

  } catch (error) {
    console.error('❌ Error testing Vapi API:', error);
    return NextResponse.json({
      error: 'Error testing Vapi API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

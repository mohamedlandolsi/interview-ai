import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Creating test interview session...');

    // For now, just return a successful response without database operations
    // to verify the route works
    const sessionId = 'test-session-' + Date.now();

    console.log('Test session created:', sessionId);

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      message: 'Test interview session created successfully (mock)'
    });

  } catch (error) {
    console.error('Error creating test session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create a test session',
    endpoint: '/api/create-test-session'
  });
}

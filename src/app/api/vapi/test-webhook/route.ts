import { NextRequest, NextResponse } from 'next/server'

// Test webhook with sample events
export async function POST(request: NextRequest) {
  try {
    const { eventType = 'call-start' } = await request.json()
    
    // Sample webhook events for testing
    const sampleEvents = {
      'call-start': {
        type: 'call-start',
        call: {
          id: 'test-call-' + Date.now(),
          assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
          status: 'in-progress',
          startedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString()
      },
      'transcript': {
        type: 'transcript',
        call: {
          id: 'test-call-' + Date.now(),
          assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        },
        message: {
          type: 'transcript',
          content: 'Hello, I am the AI interviewer. How are you today?',
          role: 'assistant' as const,
          time: Date.now(),
          secondsFromStart: 5
        },
        timestamp: new Date().toISOString()
      },
      'call-end': {
        type: 'call-end',
        call: {
          id: 'test-call-' + Date.now(),
          assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
          status: 'completed',
          startedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          endedAt: new Date().toISOString(),
          cost: 0.50,
          costBreakdown: {
            transport: 0.10,
            transcription: 0.15,
            model: 0.25
          }
        },
        timestamp: new Date().toISOString()
      }
    }

    const testEvent = sampleEvents[eventType as keyof typeof sampleEvents]
    
    if (!testEvent) {
      return NextResponse.json(
        { error: 'Invalid event type. Use: call-start, transcript, or call-end' },
        { status: 400 }
      )
    }

    // Send test event to our webhook
    const webhookUrl = new URL('/api/vapi/webhook', request.url).toString()
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vapi-signature': 'test-signature' // For testing
      },
      body: JSON.stringify(testEvent)
    })

    const webhookResult = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      message: `Test ${eventType} event sent to webhook`,
      testEvent,
      webhookResponse: {
        status: webhookResponse.status,
        result: webhookResult
      }
    })

  } catch (error) {
    console.error('Error testing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook test endpoint',
    usage: {
      'POST /api/vapi/test-webhook': 'Send test events to webhook',
      'body': { eventType: 'call-start | transcript | call-end' }
    },
    examples: [
      'POST /api/vapi/test-webhook with body: {"eventType": "call-start"}',
      'POST /api/vapi/test-webhook with body: {"eventType": "transcript"}',
      'POST /api/vapi/test-webhook with body: {"eventType": "call-end"}'
    ]
  })
}

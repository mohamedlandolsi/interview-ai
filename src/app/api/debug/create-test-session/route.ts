import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST SESSION CREATION ===')
      // Create a test session to verify database connectivity
    const testSession = await prisma.interviewSession.create({
      data: {
        candidate_name: 'Test Candidate',
        candidate_email: 'test@example.com',
        position: 'Test Position',
        template_id: 'cmc3vp3ck0001f4ro00vtiqra', // Use actual template ID
        interviewer_id: '4e638dca-7b20-4a2c-9393-a66c45ae2586', // Use actual profile ID
        vapi_call_id: 'test-call-' + Date.now(),
        vapi_assistant_id: 'test-assistant',
        status: 'scheduled',
        real_time_messages: []
      }
    })

    console.log('Test session created:', testSession.id)

    return NextResponse.json({
      success: true,
      session: testSession,
      message: 'Test session created successfully'
    })

  } catch (error) {
    console.error('Test session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create test session', details: error },
      { status: 500 }
    )
  }
}

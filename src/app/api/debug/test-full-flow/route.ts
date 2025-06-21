import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TESTING FULL INTERVIEW FLOW ===')
    
    // Step 1: Simulate creating a session (like useVapi does)
    console.log('Step 1: Creating interview session...')
    const sessionResponse = await fetch('http://localhost:3000/api/interviews/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidateName: 'John Doe',
        candidateEmail: 'john.doe@example.com',
        position: 'Senior Developer',
        templateId: 'cmc3vp3ck0001f4ro00vtiqra',
        interviewerId: '4e638dca-7b20-4a2c-9393-a66c45ae2586',
        // No vapiCallId yet - will be updated when call starts
      })
    });

    if (!sessionResponse.ok) {
      throw new Error('Failed to create session: ' + await sessionResponse.text())
    }

    const sessionData = await sessionResponse.json();
    const sessionId = sessionData.session.id;
    console.log('Session created:', sessionId)

    // Step 2: Simulate Vapi call start (webhook call-started)
    console.log('Step 2: Simulating call start...')
    const testCallId = 'test-call-' + Date.now()
    
    // Update the session with call ID
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        vapi_call_id: testCallId,
        status: 'in_progress',
        started_at: new Date(),
      }
    })
    console.log('Session updated with call ID:', testCallId)

    // Step 3: Simulate some analysis results (webhook analysis events)
    console.log('Step 3: Adding analysis results...')
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        vapi_summary: {
          questions: [
            {
              question: "Tell me about your experience with React?",
              answer: "I have 5 years of experience building React applications...",
              score: 85
            },
            {
              question: "How do you handle state management?",
              answer: "I typically use Redux for complex apps and useState for simpler ones...",
              score: 78
            }
          ]
        },
        vapi_success_evaluation: {
          score: 82,
          successful: true,
          feedback: "Great technical knowledge and clear communication"
        },
        vapi_structured_data: {
          strengths: ["Strong technical skills", "Clear communication"],
          areas_for_improvement: ["Could elaborate more on architecture decisions"],
          overall_rating: "Strong Yes"
        },
        analysis_score: 82,
        analysis_feedback: "Excellent candidate with strong technical background",
        strengths: ["React expertise", "Problem-solving skills"],
        areas_for_improvement: ["Architecture knowledge could be deeper"],
        final_transcript: "Q: Tell me about your experience with React? A: I have 5 years of experience...",
        conversation_summary: "Technical interview covering React, state management, and problem-solving abilities"
      }
    })
    console.log('Analysis results added')

    // Step 4: Simulate call end
    console.log('Step 4: Simulating call end...')
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completed_at: new Date(),
        duration: 25, // 25 minutes
        vapi_cost: 2.50,
        recording_url: 'https://example.com/recording.mp3'
      }
    })
    console.log('Call ended and session completed')

    // Step 5: Test results retrieval
    console.log('Step 5: Testing results retrieval...')
    const resultsResponse = await fetch(`http://localhost:3000/api/interviews/results?sessionId=${sessionId}`, {
      method: 'GET',
    });

    if (!resultsResponse.ok) {
      throw new Error('Failed to fetch results: ' + await resultsResponse.text())
    }

    const resultsData = await resultsResponse.json();
    console.log('Results retrieved successfully:', !!resultsData.results)

    return NextResponse.json({
      success: true,
      message: 'Full interview flow test completed successfully',
      sessionId,
      callId: testCallId,
      resultsUrl: `/results/individual?session=${sessionId}`,
      testResults: {
        sessionCreated: true,
        callSimulated: true,
        analysisAdded: true,
        callEnded: true,
        resultsRetrieved: true,
        overallScore: resultsData.results?.overallScore || 0
      }
    })

  } catch (error) {
    console.error('Test flow failed:', error)
    return NextResponse.json(
      { error: 'Test flow failed', details: error },
      { status: 500 }
    )
  }
}

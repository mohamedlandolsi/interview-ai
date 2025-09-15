// Debug script to check Vapi webhook calls and session analysis generation
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const debug = async () => {
  try {
    console.log('🔍 Checking Vapi Webhook and Analysis Generation');
    console.log('================================================');
    
    // Get the most recent session that should have gotten analysis
    const recentSession = await prisma.interviewSession.findFirst({
      where: {
        status: 'completed'
      },
      orderBy: { completed_at: 'desc' },
      include: {
        template: true
      }
    });
    
    if (!recentSession) {
      console.log('❌ No completed sessions found');
      return;
    }
    
    console.log(`\n🎯 Most Recent Completed Session: ${recentSession.id}`);
    console.log(`Completed At: ${recentSession.completed_at}`);
    console.log(`Status: ${recentSession.status}`);
    console.log(`Duration: ${recentSession.duration} minutes`);
    
    // Check what data this session has
    console.log('\n📊 Session Data Analysis:');
    console.log(`Analysis Score: ${recentSession.analysis_score || 'NULL'}`);
    console.log(`Strengths: ${(recentSession.strengths || []).length} items`);
    console.log(`Areas for Improvement: ${(recentSession.areas_for_improvement || []).length} items`);
    console.log(`Category Scores: ${Object.keys(recentSession.category_scores || {}).length} categories`);
    console.log(`Hiring Recommendation: ${recentSession.hiring_recommendation || 'NULL'}`);
    
    console.log('\n🤖 Vapi Data:');
    console.log(`Vapi Summary: ${recentSession.vapi_summary ? 'Present' : 'NULL'}`);
    console.log(`Vapi Success Evaluation: ${recentSession.vapi_success_evaluation ? 'Present' : 'NULL'}`);
    console.log(`Vapi Structured Data: ${recentSession.vapi_structured_data ? 'Present' : 'NULL'}`);
    console.log(`Final Transcript: ${recentSession.final_transcript ? `Present (${recentSession.final_transcript.length} chars)` : 'NULL'}`);
    console.log(`Recording URL: ${recentSession.recording_url || 'NULL'}`);
    
    // Test webhook endpoint manually
    console.log('\n🔧 Testing Webhook Endpoint...');
    
    try {
      const webhookUrl = 'http://localhost:3000/api/vapi/webhook';
      console.log(`Testing: ${webhookUrl}`);
      
      // Create a mock webhook payload for testing
      const mockPayload = {
        type: 'end-of-call-report',
        sessionId: recentSession.id,
        call: {
          id: `mock-call-${Date.now()}`,
          status: 'completed',
          endedReason: 'user-hangup',
          duration: 120, // 2 minutes in seconds
          summary: 'Test summary from mock webhook',
          successEvaluation: 'The interview was conducted successfully with good candidate engagement.',
          structuredData: {
            overallScore: 88,
            categoryScores: {
              'Communication': 90,
              'Technical Knowledge': 85,
              'Problem Solving': 88
            },
            strengths: ['Good communication', 'Strong problem-solving'],
            areasForImprovement: ['Needs more technical depth'],
            hiringRecommendation: 'Hire'
          },
          recordingUrl: 'https://test-recording.example.com/test.mp3',
          transcript: 'This is a test transcript for webhook testing...'
        },
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vapi-Secret': process.env.VAPI_WEBHOOK_SECRET || 'test-secret'
        },
        body: JSON.stringify(mockPayload)
      });
      
      console.log(`Webhook Response Status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.text();
        console.log(`Webhook Response: ${result}`);
        console.log('✅ Webhook endpoint is accessible');
      } else {
        const error = await response.text();
        console.log(`❌ Webhook Error: ${error}`);
      }
      
    } catch (webhookError) {
      console.log(`❌ Webhook Test Failed: ${webhookError.message}`);
      console.log('This might indicate the development server is not running or webhook endpoint is not accessible');
    }
    
    // Check environment variables
    console.log('\n🔐 Environment Configuration:');
    console.log(`VAPI_WEBHOOK_SECRET: ${process.env.VAPI_WEBHOOK_SECRET ? 'Set' : 'Missing'}`);
    console.log(`VAPI_PRIVATE_KEY: ${process.env.VAPI_PRIVATE_KEY ? 'Set' : 'Missing'}`);
    console.log(`NEXT_PUBLIC_VAPI_ASSISTANT_ID: ${process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? 'Set' : 'Missing'}`);
    
    // Check if sessions are being updated after completion
    console.log('\n🔄 Recent Session Updates:');
    const recentUpdates = await prisma.interviewSession.findMany({
      where: {
        completed_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { completed_at: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        completed_at: true,
        analysis_score: true,
        vapi_summary: true,
        final_transcript: true
      }
    });
    
    console.log(`Found ${recentUpdates.length} sessions completed in last 24 hours:`);
    recentUpdates.forEach(session => {
      console.log(`- ${session.id}: Score=${session.analysis_score || 'NULL'}, Transcript=${session.final_transcript ? 'Yes' : 'No'}, Summary=${session.vapi_summary ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

debug();

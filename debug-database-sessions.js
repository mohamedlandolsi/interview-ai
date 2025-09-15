/**
 * Debug script to check the current state of interview sessions in the database
 * and see what data is actually being stored
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugInterviewSessions() {
  console.log('🔍 Debugging Interview Sessions Data');
  console.log('=====================================');
  
  try {
    // Get recent interview sessions
    const sessions = await prisma.interviewSession.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        candidate_name: true,
        status: true,
        created_at: true,
        completed_at: true,
        analysis_score: true,
        category_scores: true,
        strengths: true,
        areas_for_improvement: true,
        hiring_recommendation: true,
        key_insights: true,
        question_scores: true,
        interview_metrics: true,
        analysis_feedback: true,
        final_transcript: true,
        recording_url: true,
        vapi_summary: true,
        vapi_success_evaluation: true,
        vapi_structured_data: true
      }
    });

    if (sessions.length === 0) {
      console.log('❌ No interview sessions found in database');
      return;
    }

    console.log(`📊 Found ${sessions.length} recent interview sessions:`);
    console.log('='.repeat(50));

    sessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session ID: ${session.id}`);
      console.log(`   Candidate: ${session.candidate_name}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Created: ${session.created_at}`);
      console.log(`   Completed: ${session.completed_at || 'Not completed'}`);
      
      console.log('\n   📊 Analysis Data:');
      console.log(`   - Analysis Score: ${session.analysis_score}`);
      console.log(`   - Category Scores: ${session.category_scores ? JSON.stringify(session.category_scores) : 'null'}`);
      console.log(`   - Strengths: ${session.strengths ? JSON.stringify(session.strengths) : 'null'}`);
      console.log(`   - Areas for Improvement: ${session.areas_for_improvement ? JSON.stringify(session.areas_for_improvement) : 'null'}`);
      console.log(`   - Hiring Recommendation: ${session.hiring_recommendation || 'null'}`);
      console.log(`   - Key Insights: ${session.key_insights ? JSON.stringify(session.key_insights) : 'null'}`);
      console.log(`   - Interview Metrics: ${session.interview_metrics ? JSON.stringify(session.interview_metrics) : 'null'}`);
      console.log(`   - Analysis Feedback: ${session.analysis_feedback ? session.analysis_feedback.substring(0, 100) + '...' : 'null'}`);
      
      console.log('\n   📝 Raw Data:');
      console.log(`   - Final Transcript: ${session.final_transcript ? 'Present (' + session.final_transcript.length + ' chars)' : 'null'}`);
      console.log(`   - Recording URL: ${session.recording_url || 'null'}`);
      console.log(`   - Vapi Summary: ${session.vapi_summary ? 'Present' : 'null'}`);
      console.log(`   - Vapi Success Evaluation: ${session.vapi_success_evaluation ? 'Present' : 'null'}`);
      console.log(`   - Vapi Structured Data: ${session.vapi_structured_data ? 'Present' : 'null'}`);
      
      if (session.vapi_structured_data) {
        console.log('\n   🔍 Vapi Structured Data Sample:');
        try {
          const structuredData = typeof session.vapi_structured_data === 'string' 
            ? JSON.parse(session.vapi_structured_data) 
            : session.vapi_structured_data;
          console.log('   Keys:', Object.keys(structuredData));
          if (structuredData.overallScore) {
            console.log(`   Original overallScore: ${structuredData.overallScore}`);
          }
        } catch (e) {
          console.log('   Error parsing structured data:', e.message);
        }
      }
    });

    // Check if there are any webhooks or analysis issues
    console.log('\n\n🔍 Debugging Recommendations:');
    console.log('==============================');
    
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const sessionsWithAnalysis = sessions.filter(s => s.analysis_score !== null && s.analysis_score !== 0);
    const sessionsWithVapiData = sessions.filter(s => s.vapi_structured_data !== null);
    
    console.log(`✅ Completed sessions: ${completedSessions.length}/${sessions.length}`);
    console.log(`✅ Sessions with analysis score: ${sessionsWithAnalysis.length}/${sessions.length}`);
    console.log(`✅ Sessions with Vapi data: ${sessionsWithVapiData.length}/${sessions.length}`);
    
    if (sessionsWithVapiData.length === 0) {
      console.log('\n❌ ISSUE: No sessions have Vapi structured data');
      console.log('   This suggests the webhook is not receiving or processing data correctly');
    }
    
    if (sessionsWithAnalysis.length === 0) {
      console.log('\n❌ ISSUE: No sessions have analysis scores');
      console.log('   This suggests the data mapping is not working');
    }

  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugInterviewSessions();


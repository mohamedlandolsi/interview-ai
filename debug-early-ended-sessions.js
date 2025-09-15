// Debug script to check sessions that were ended early vs completed naturally
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const debug = async () => {
  try {
    console.log('🔍 Analyzing Interview Sessions by Completion Status');
    console.log('=====================================================');
    
    // Get recent sessions with different statuses
    const sessions = await prisma.interviewSession.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        template: true
      }
    });
    
    console.log(`\n📊 Found ${sessions.length} recent sessions:\n`);
    
    for (const session of sessions) {
      console.log(`Session ID: ${session.id}`);
      console.log(`Status: ${session.status}`);
      console.log(`Duration: ${session.duration || 0} minutes`);
      console.log(`Completed At: ${session.completed_at ? new Date(session.completed_at).toISOString() : 'Not completed'}`);
      console.log(`Template: ${session.template?.title || 'Unknown'} (${session.template?.estimated_duration || 0} min expected)`);
      
      // Check if it has analysis data
      const hasAnalysis = session.analysis_score > 0 || 
                         (session.strengths && session.strengths.length > 0) ||
                         (session.category_scores && Object.keys(session.category_scores || {}).length > 0);
      
      console.log(`Has Analysis Data: ${hasAnalysis ? '✅ YES' : '❌ NO'}`);
      
      if (hasAnalysis) {
        console.log(`  - Analysis Score: ${session.analysis_score}`);
        console.log(`  - Strengths: ${(session.strengths || []).length} items`);
        console.log(`  - Category Scores: ${Object.keys(session.category_scores || {}).length} categories`);
      }
      
      // Check Vapi data
      const hasVapiData = session.vapi_summary || session.vapi_structured_data || session.final_transcript;
      console.log(`Has Vapi Data: ${hasVapiData ? '✅ YES' : '❌ NO'}`);
      
      if (hasVapiData) {
        console.log(`  - Summary: ${session.vapi_summary ? 'Present' : 'Missing'}`);
        console.log(`  - Structured Data: ${session.vapi_structured_data ? 'Present' : 'Missing'}`);
        console.log(`  - Transcript: ${session.final_transcript ? 'Present' : 'Missing'}`);
      }
      
      // Determine completion status
      const expectedDuration = session.template?.estimated_duration || 5;
      const actualDuration = session.duration || 0;
      const completionRatio = actualDuration / expectedDuration;
      
      let completionStatus = 'Unknown';
      if (session.status === 'completed' && completionRatio >= 0.8) {
        completionStatus = 'Fully Completed';
      } else if (session.status === 'completed' && completionRatio >= 0.3) {
        completionStatus = 'Partially Completed';
      } else if (session.status === 'ended' || session.status === 'failed') {
        completionStatus = 'Ended Early';
      } else if (session.status === 'in_progress') {
        completionStatus = 'Still In Progress';
      }
      
      console.log(`Completion Status: ${completionStatus} (${Math.round(completionRatio * 100)}% of expected duration)`);
      console.log(`Created: ${new Date(session.created_at).toISOString()}`);
      console.log('---'.repeat(20));
    }
    
    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    const withAnalysis = sessions.filter(s => s.analysis_score > 0 || (s.strengths && s.strengths.length > 0));
    const withVapiData = sessions.filter(s => s.vapi_summary || s.vapi_structured_data || s.final_transcript);
    const completed = sessions.filter(s => s.status === 'completed');
    const endedEarly = sessions.filter(s => s.status === 'ended' || s.status === 'failed');
    
    console.log(`Total Sessions: ${sessions.length}`);
    console.log(`With Analysis Data: ${withAnalysis.length} (${Math.round(withAnalysis.length/sessions.length*100)}%)`);
    console.log(`With Vapi Data: ${withVapiData.length} (${Math.round(withVapiData.length/sessions.length*100)}%)`);
    console.log(`Status - Completed: ${completed.length}`);
    console.log(`Status - Ended Early: ${endedEarly.length}`);
    console.log(`Status - Other: ${sessions.length - completed.length - endedEarly.length}`);
    
    // Check correlation between completion and analysis
    const completedWithAnalysis = completed.filter(s => s.analysis_score > 0 || (s.strengths && s.strengths.length > 0));
    const endedEarlyWithAnalysis = endedEarly.filter(s => s.analysis_score > 0 || (s.strengths && s.strengths.length > 0));
    
    console.log(`\n🔗 Completion vs Analysis Correlation:`);
    console.log(`Completed sessions with analysis: ${completedWithAnalysis.length}/${completed.length} (${Math.round(completedWithAnalysis.length/completed.length*100)}%)`);
    console.log(`Early-ended sessions with analysis: ${endedEarlyWithAnalysis.length}/${endedEarly.length} (${endedEarly.length > 0 ? Math.round(endedEarlyWithAnalysis.length/endedEarly.length*100) : 0}%)`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

debug();

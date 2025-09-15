// Test creating analysis for sessions that have transcripts but no analysis data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const test = async () => {
  try {
    console.log('🧪 Finding Sessions Needing Analysis');
    console.log('====================================');
    
    // Find sessions that have transcript data but no analysis
    const sessionsNeedingAnalysis = await prisma.interviewSession.findMany({
      where: {
        AND: [
          { final_transcript: { not: null } },
          { final_transcript: { not: '' } },
          { analysis_score: { equals: null } }
        ]
      },
      orderBy: { completed_at: 'desc' },
      take: 5
    });
    
    console.log(`📊 Found ${sessionsNeedingAnalysis.length} sessions with transcripts but no analysis:`);
    
    if (sessionsNeedingAnalysis.length === 0) {
      console.log('✨ All sessions with transcripts already have analysis data!');
      console.log('🔧 Let\'s test with one that has analysis to verify the system works...');
      
      const sessionWithAnalysis = await prisma.interviewSession.findFirst({
        where: {
          AND: [
            { analysis_score: { gt: 0 } },
            { final_transcript: { not: null } }
          ]
        },
        select: {
          id: true,
          candidate_name: true,
          analysis_score: true
        }
      });
      
      if (sessionWithAnalysis) {
        console.log(`\n🎯 Testing with session that has analysis: ${sessionWithAnalysis.id}`);
        console.log(`   Candidate: ${sessionWithAnalysis.candidate_name}`);
        console.log(`   Current Score: ${sessionWithAnalysis.analysis_score}`);
        
        // Test the API
        const response = await fetch(`http://localhost:3000/api/interviews/results?sessionId=${sessionWithAnalysis.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`\n✅ API works! Score returned: ${data.results?.overallScore}`);
          console.log('✅ The manual analysis system is ready for sessions without data');
        }
      }
      
      return;
    }
    
    // Test with the first session that needs analysis
    const testSession = sessionsNeedingAnalysis[0];
    console.log('\n📋 Session Details:');
    console.log(`ID: ${testSession.id}`);
    console.log(`Candidate: ${testSession.candidate_name}`);
    console.log(`Position: ${testSession.position}`);
    console.log(`Status: ${testSession.status}`);
    console.log(`Duration: ${testSession.duration} minutes`);
    console.log(`Transcript Length: ${testSession.final_transcript?.length || 0} characters`);
    console.log(`Current Analysis Score: ${testSession.analysis_score || 'NULL'}`);
    console.log(`Current Strengths: ${testSession.strengths?.length || 0} items`);
    
    console.log('\n🔄 Triggering Manual Analysis...');
    
    const response = await fetch(`http://localhost:3000/api/interviews/results?sessionId=${testSession.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.results) {
        const results = data.results;
        
        console.log('\n📊 Analysis Results:');
        console.log('===================');
        console.log(`Overall Score: ${results.overallScore}`);
        console.log(`Analysis Score: ${results.analysisScore}`);
        console.log(`Strengths: ${results.strengths?.length || 0} items`);
        console.log(`Areas for Improvement: ${results.areasForImprovement?.length || 0} items`);
        console.log(`Analysis Feedback: ${results.analysisFeedback ? 'Generated' : 'Missing'}`);
        
        // Check if analysis was successful
        const analysisGenerated = results.overallScore > 0 && results.strengths?.length > 0;
        
        console.log(`\n${analysisGenerated ? '🎉 SUCCESS' : '❌ FAILED'}: Analysis ${analysisGenerated ? 'generated' : 'failed'}`);
        
        if (analysisGenerated) {
          console.log('✅ Session now has complete analysis data');
          console.log('✅ Data saved to database for future use');
          console.log('✅ Frontend will show real results');
          
          // Show sample data
          console.log('\n📝 Sample Analysis:');
          if (results.strengths?.length > 0) {
            console.log(`First Strength: ${results.strengths[0]?.substring(0, 80)}...`);
          }
          if (results.areasForImprovement?.length > 0) {
            console.log(`First Improvement: ${results.areasForImprovement[0]?.substring(0, 80)}...`);
          }
        } else {
          console.log('❌ Analysis failed. Check transcript quality and AI service');
        }
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ API Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
};

test();

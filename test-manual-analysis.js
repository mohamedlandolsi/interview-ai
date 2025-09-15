// Test the manual analysis trigger by calling results API for a session without analysis
const test = async () => {
  try {
    console.log('🧪 Testing Manual Analysis Trigger');
    console.log('==================================');
    
    // Get a session that has transcript data but might need fresh analysis
    const sessionId = 'cmfcglsyn0001f444rno82p4l'; // This session has transcript data
    
    console.log(`🎯 Testing session: ${sessionId}`);
    console.log('This session currently has:');
    console.log('- Status: completed');
    console.log('- Has transcript: Yes');
    console.log('- Duration: 2 minutes');
    
    console.log('\n🔄 Calling results API to trigger analysis...');
    
    const response = await fetch(`http://localhost:3000/api/interviews/results?sessionId=${sessionId}`, {
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
        
        console.log('\n📊 Results After Manual Analysis:');
        console.log('=================================');
        console.log(`Overall Score: ${results.overallScore}`);
        console.log(`Analysis Score: ${results.analysisScore}`);
        console.log(`Strengths: ${results.strengths?.length || 0} items`);
        console.log(`Areas for Improvement: ${results.areasForImprovement?.length || 0} items`);
        console.log(`Analysis Feedback: ${results.analysisFeedback ? 'Present' : 'Missing'}`);
        
        if (results.enhancedAnalysis) {
          const categoryScores = results.enhancedAnalysis.categoryScores;
          console.log(`Category Scores: ${Object.keys(categoryScores || {}).length} categories`);
          console.log(`Hiring Recommendation: ${results.enhancedAnalysis.hiringRecommendation || 'Missing'}`);
        }
        
        // Check if analysis was successfully generated
        const hasAnalysisNow = results.overallScore > 0 && 
                              results.strengths?.length > 0 && 
                              results.areasForImprovement?.length > 0;
        
        console.log(`\n${hasAnalysisNow ? '🎉 SUCCESS' : '❌ FAILED'}: Manual analysis ${hasAnalysisNow ? 'generated' : 'failed'}`);
        
        if (hasAnalysisNow) {
          console.log('✅ The session now has analysis data!');
          console.log('✅ Future API calls will use the saved data instead of regenerating');
          console.log('✅ Frontend will display real results instead of zeros');
        } else {
          console.log('❌ Analysis generation failed. Possible reasons:');
          console.log('   - No transcript data available');
          console.log('   - Interview too short for meaningful analysis');
          console.log('   - AI analysis service error');
        }
        
        // Show sample of the generated data
        if (results.strengths?.length > 0) {
          console.log('\n📝 Sample Generated Data:');
          console.log(`First Strength: ${results.strengths[0]?.substring(0, 100)}...`);
        }
        
      } else {
        console.log('❌ API returned error:', data.error || 'Unknown error');
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ API request failed: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

test();

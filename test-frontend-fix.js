// Test script to verify the frontend will now display correct data
const test = async () => {
  try {
    // Test the results API that the frontend uses
    const response = await fetch('http://localhost:3000/api/interviews/results?sessionId=cmfcglsyn0001f444rno82p4l', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('🎯 Frontend Data Test Results:');
    console.log('===============================');
    
    if (data.success && data.results) {
      const results = data.results;
      
      console.log(`✅ Overall Score: ${results.overallScore} (should not be 0)`);
      console.log(`✅ Analysis Score: ${results.analysisScore} (should not be 0)`);
      console.log(`✅ Strengths Count: ${results.strengths?.length || 0} (should be > 0)`);
      console.log(`✅ Areas for Improvement: ${results.areasForImprovement?.length || 0} (should be > 0)`);
      console.log(`✅ Analysis Feedback: ${results.analysisFeedback ? 'Present' : 'Missing'} (should be Present)`);
      
      // Check enhanced analysis
      if (results.enhancedAnalysis) {
        const categoryScores = results.enhancedAnalysis.categoryScores;
        const hasValidScores = Object.values(categoryScores || {}).some(score => score > 0);
        console.log(`✅ Category Scores: ${hasValidScores ? 'Valid' : 'Invalid'} (should be Valid)`);
        console.log(`✅ Hiring Recommendation: ${results.enhancedAnalysis.hiringRecommendation || 'Missing'} (should not be Missing)`);
      }
      
      console.log('\n🔍 Raw Data Sample:');
      console.log(`- Overall Score: ${results.overallScore}`);
      console.log(`- First Strength: ${results.strengths?.[0]?.substring(0, 100)}...`);
      console.log(`- Category Scores:`, Object.keys(results.enhancedAnalysis?.categoryScores || {}));
      
      // Validation
      const isFixed = results.overallScore > 0 && 
                     results.analysisScore > 0 && 
                     results.strengths?.length > 0 && 
                     results.areasForImprovement?.length > 0;
      
      console.log(`\n${isFixed ? '🎉 SUCCESS' : '❌ FAILED'}: Frontend will now display ${isFixed ? 'real data' : 'zeros/nulls'}`);
      
    } else {
      console.log('❌ API returned no results');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

test();

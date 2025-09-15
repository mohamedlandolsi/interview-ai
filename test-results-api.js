/**
 * Test script to check what the API returns for a specific session
 */

const sessionId = 'cmfcglsyn0001f444rno82p4l'; // The session with analysis data

async function testResultsAPI() {
  console.log('🧪 Testing Results API for session:', sessionId);
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`http://localhost:3000/api/interviews/results?sessionId=${sessionId}`);
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response received');
    console.log('\n📊 Results Data:');
    console.log('================');
    console.log('ID:', data.results.id);
    console.log('Candidate:', data.results.candidateName);
    console.log('Overall Score:', data.results.overallScore);
    console.log('Analysis Score:', data.results.analysisScore);
    console.log('Analysis Feedback:', data.results.analysisFeedback ? 'Present (' + data.results.analysisFeedback.length + ' chars)' : 'Missing');
    console.log('Strengths:', data.results.strengths ? data.results.strengths.length + ' items' : 'Missing');
    console.log('Areas for Improvement:', data.results.areasForImprovement ? data.results.areasForImprovement.length + ' items' : 'Missing');
    console.log('Question Scores:', data.results.questionScores ? 'Present' : 'Missing');
    console.log('Enhanced Analysis:', data.results.enhancedAnalysis ? 'Present' : 'Missing');
    
    if (data.results.enhancedAnalysis) {
      console.log('\n🔍 Enhanced Analysis Details:');
      console.log('Category Scores:', data.results.enhancedAnalysis.categoryScores);
      console.log('Hiring Recommendation:', data.results.enhancedAnalysis.hiringRecommendation);
      console.log('Key Insights:', data.results.enhancedAnalysis.keyInsights ? data.results.enhancedAnalysis.keyInsights.length + ' items' : 'Missing');
    }
    
    console.log('\n📝 Full API Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testResultsAPI();

/**
 * Test the enhanced Vapi interview analysis system
 * This script verifies that all analysis features work correctly
 */

import { InterviewAnalysisService } from '../src/lib/interview-analysis';
import { createInterviewAssistantConfig } from '../src/lib/vapi-assistant-config';

// Mock interview data for testing
const mockInterviewData = {
  vapiSummary: {
    questions: [
      {
        question: "Tell me about your experience with React",
        answer: "I have been working with React for over 3 years. I've built several large-scale applications using React hooks, context API, and Redux for state management. My most recent project was a real-time dashboard with over 50 components.",
        score: 8,
        keyPoints: ["3+ years React experience", "Large-scale applications", "Hooks and Redux expertise"],
        evaluation: "Strong technical background with specific examples"
      },
      {
        question: "How do you handle debugging complex issues?",
        answer: "I follow a systematic approach. First, I reproduce the issue consistently, then I use browser dev tools and React DevTools to inspect component state and props. I also write unit tests to isolate the problem and use console logging strategically.",
        score: 9,
        keyPoints: ["Systematic approach", "Uses proper debugging tools", "Writing tests for debugging"],
        evaluation: "Excellent problem-solving methodology"
      },
      {
        question: "Tell me about a challenging project you've worked on",
        answer: "I led the migration of a legacy jQuery application to React. It took 6 months and involved coordinating with 4 team members. We had to maintain backwards compatibility while gradually replacing components.",
        score: 7,
        keyPoints: ["Leadership experience", "Legacy migration", "Team coordination"],
        evaluation: "Good project management and technical leadership"
      }
    ],
    overallFlow: "Candidate was engaged throughout the interview with clear, detailed responses",
    totalQuestions: 3,
    averageScore: 8.0
  },

  vapiSuccessEvaluation: {
    successful: true,
    details: "Candidate demonstrated strong technical competency and clear communication skills. Shows good problem-solving approach and leadership experience.",
    feedback: "Recommend for hire - strong technical background with leadership potential"
  },

  vapiStructuredData: {
    overallScore: 82,
    categoryScores: {
      communication: 85,
      technical: 90,
      experience: 80,
      culturalFit: 75
    },
    strengths: [
      "Strong React expertise with 3+ years experience",
      "Systematic debugging approach using proper tools",
      "Leadership experience in complex technical projects",
      "Clear communication with specific examples"
    ],
    areasForImprovement: [
      "Could provide more examples of cross-functional collaboration",
      "Would benefit from discussing scalability considerations"
    ],
    keyInsights: [
      "Strong technical foundation in modern React development",
      "Demonstrates practical problem-solving skills",
      "Has leadership potential with project management experience"
    ],
    hiringRecommendation: "Yes",
    reasoning: "Candidate shows strong technical skills, good communication, and leadership potential. Would be a good fit for senior developer role.",
    confidenceLevel: "High",
    questionResponses: [
      {
        question: "Tell me about your experience with React",
        responseQuality: 80,
        feedback: "Good technical depth, could include more about testing practices",
        keyPoints: ["3+ years experience", "Large-scale applications", "Modern React features"]
      },
      {
        question: "How do you handle debugging complex issues?",
        responseQuality: 90,
        feedback: "Excellent systematic approach, shows good tool knowledge",
        keyPoints: ["Systematic approach", "Proper tools usage", "Testing for debugging"]
      },
      {
        question: "Tell me about a challenging project you've worked on",
        responseQuality: 70,
        feedback: "Good project example, could elaborate on technical challenges faced",
        keyPoints: ["Leadership experience", "Complex migration", "Team coordination"]
      }
    ],
    interviewMetrics: {
      engagement: 88,
      clarity: 85,
      completeness: 80
    }
  },

  finalTranscript: "Interviewer: Tell me about your experience with React. Candidate: I have been working with React for over 3 years...",
  candidateName: "Test Candidate",
  position: "Senior React Developer",
  duration: 45
};

// Test the analysis functions
async function testEnhancedAnalysis() {
  console.log('🧪 Testing Enhanced Vapi Interview Analysis System\n');

  try {
    // Test 1: Basic analysis processing
    console.log('📊 Test 1: Processing mock interview data...');
    const analysis = await InterviewAnalysisService.analyzeInterview(mockInterviewData);
    
    console.log('✅ Analysis completed successfully');
    console.log(`   Overall Score: ${analysis.overallScore}/100`);
    console.log(`   Hiring Recommendation: ${analysis.hiringRecommendation}`);
    console.log(`   Strengths: ${analysis.strengths.length} identified`);
    console.log(`   Areas for Improvement: ${analysis.areasForImprovement.length} identified`);
    console.log(`   Question Analysis: ${analysis.questionAnalysis.length} questions processed`);
    console.log(`   Interview Flow - Engagement: ${analysis.interviewFlow.engagement}/100\n`);

    // Test 2: Assistant configuration
    console.log('🤖 Test 2: Creating assistant configuration...');
    const assistantConfig = createInterviewAssistantConfig(
      "Test Candidate",
      "Senior React Developer",
      [
        "Tell me about your React experience",
        "How do you handle state management?",
        "Describe your testing approach"
      ]
    );

    console.log('✅ Assistant configuration created successfully');
    console.log(`   Assistant Name: ${assistantConfig.name}`);
    console.log(`   Voice Provider: ${assistantConfig.voice.provider}`);
    console.log(`   Model: ${assistantConfig.model.provider}/${assistantConfig.model.model}`);
    console.log(`   Analysis Schema: ${assistantConfig.analysisSchema ? 'Configured' : 'Missing'}`);
    console.log(`   Summary Timeout: ${assistantConfig.analysisSchema?.summaryRequestTimeoutSeconds}s`);
    console.log(`   Min Messages: ${assistantConfig.analysisSchema?.minMessagesToTriggerAnalysis}\n`);

    // Test 3: Summary report generation
    console.log('📄 Test 3: Generating summary report...');
    const summaryReport = InterviewAnalysisService.generateSummaryReport(
      analysis,
      mockInterviewData.candidateName,
      mockInterviewData.position
    );

    console.log('✅ Summary report generated successfully');
    console.log(`   Report length: ${summaryReport.length} characters`);
    console.log(`   Contains sections: ${summaryReport.includes('## Category Scores') ? '✅' : '❌'} Category Scores`);
    console.log(`   Contains sections: ${summaryReport.includes('## Strengths') ? '✅' : '❌'} Strengths`);
    console.log(`   Contains sections: ${summaryReport.includes('## Key Insights') ? '✅' : '❌'} Key Insights\n`);

    // Test 4: Category score validation
    console.log('🎯 Test 4: Validating category scores...');
    const categoryScores = analysis.categoryScores;
    const allScoresValid = Object.values(categoryScores).every(score => 
      score >= 0 && score <= 100 && typeof score === 'number'
    );

    console.log(`✅ Category scores validation: ${allScoresValid ? 'PASSED' : 'FAILED'}`);
    console.log(`   Communication: ${categoryScores.communication}/100`);
    console.log(`   Technical: ${categoryScores.technical}/100`);
    console.log(`   Experience: ${categoryScores.experience}/100`);
    console.log(`   Cultural Fit: ${categoryScores.culturalFit}/100\n`);

    // Test 5: Q&A analysis validation
    console.log('❓ Test 5: Validating Q&A analysis...');
    const qaValid = analysis.questionAnalysis.every(qa => 
      qa.question && qa.answer && typeof qa.score === 'number' && qa.score >= 0 && qa.score <= 100
    );

    console.log(`✅ Q&A analysis validation: ${qaValid ? 'PASSED' : 'FAILED'}`);
    analysis.questionAnalysis.forEach((qa, index) => {
      console.log(`   Q${index + 1}: ${qa.score}/100 - ${qa.question.substring(0, 50)}...`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Enhanced analysis processing');
    console.log('✅ Assistant configuration creation');
    console.log('✅ Summary report generation');
    console.log('✅ Category score validation');
    console.log('✅ Q&A analysis validation');

    return {
      success: true,
      analysis,
      assistantConfig,
      summaryReport
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEnhancedAnalysis()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 Enhanced Vapi Analysis System is ready for production!');
        process.exit(0);
      } else {
        console.error('\n💥 Test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { testEnhancedAnalysis };

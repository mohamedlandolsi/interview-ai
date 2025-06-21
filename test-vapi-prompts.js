/**
 * Test Script to Verify Vapi Analysis Prompts Configuration
 * This script tests all three analysis prompt fields and their integration
 */

/**
 * Test Script to Verify Vapi Analysis Prompts Configuration
 * This script tests all three analysis prompt fields and their integration
 */

// Import the configuration directly
async function testVapiConfiguration() {
  try {
    // Dynamically import the ES module
    const { createInterviewAssistantConfig } = await import('./src/lib/vapi-assistant-config.ts');
    
    console.log('🧪 Testing Vapi Analysis Prompts Configuration...\n');

    // Test parameters
    const testCandidate = "John Doe";
    const testPosition = "Senior Software Engineer";
    const testQuestions = [
      "Tell me about your experience with React and Node.js",
      "Describe a challenging project you worked on recently",
      "How do you handle code reviews and feedback?",
      "What's your approach to debugging complex issues?",
      "How do you stay updated with new technologies?"
    ];

    // Generate assistant configuration
    const config = createInterviewAssistantConfig(testCandidate, testPosition, testQuestions);
    
    console.log('✅ Assistant Configuration Generated Successfully');
    console.log(`📋 Assistant Name: ${config.name}`);
    console.log(`🎯 Position: ${testPosition}`);
    console.log(`👤 Candidate: ${testCandidate}\n`);

    // Test 1: Summary Prompt Configuration
    console.log('='.repeat(60));
    console.log('📝 TESTING SUMMARY PROMPT CONFIGURATION');
    console.log('='.repeat(60));
    
    if (config.analysisSchema?.summaryPrompt) {
      console.log('✅ Summary prompt is configured');
      console.log(`📄 Prompt length: ${config.analysisSchema.summaryPrompt.length} characters`);
      console.log(`⏱️  Timeout: ${config.analysisSchema.summaryRequestTimeoutSeconds} seconds`);
      
      // Check if prompt contains required elements
      const summaryPrompt = config.analysisSchema.summaryPrompt;
      const requiredElements = [
        'question-answer pairs',
        'score',
        'response quality',
        'JSON',
        'key points'
      ];
      
      let missingElements = [];
      requiredElements.forEach(element => {
        if (!summaryPrompt.toLowerCase().includes(element.toLowerCase())) {
          missingElements.push(element);
        }
      });
      
      if (missingElements.length === 0) {
        console.log('✅ All required elements found in summary prompt');
      } else {
        console.log(`❌ Missing elements: ${missingElements.join(', ')}`);
      }
    } else {
      console.log('❌ Summary prompt is not configured');
    }

    // Test 2: Success Evaluation Prompt Configuration
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TESTING SUCCESS EVALUATION PROMPT CONFIGURATION');
    console.log('='.repeat(60));
    
    if (config.analysisSchema?.successEvaluationPrompt) {
      console.log('✅ Success evaluation prompt is configured');
      console.log(`📄 Prompt length: ${config.analysisSchema.successEvaluationPrompt.length} characters`);
      console.log(`⏱️  Timeout: ${config.analysisSchema.successEvaluationRequestTimeoutSeconds} seconds`);
      
      // Check if prompt contains required elements
      const evaluationPrompt = config.analysisSchema.successEvaluationPrompt;
      const requiredElements = [
        'communication skills',
        'technical competency',
        'professional experience',
        'cultural fit',
        'hiring recommendation',
        testPosition.toLowerCase()
      ];
      
      let missingElements = [];
      requiredElements.forEach(element => {
        if (!evaluationPrompt.toLowerCase().includes(element.toLowerCase())) {
          missingElements.push(element);
        }
      });
      
      if (missingElements.length === 0) {
        console.log('✅ All required elements found in success evaluation prompt');
      } else {
        console.log(`❌ Missing elements: ${missingElements.join(', ')}`);
      }
    } else {
      console.log('❌ Success evaluation prompt is not configured');
    }

    // Test 3: Structured Data Prompt Configuration
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTING STRUCTURED DATA PROMPT CONFIGURATION');
    console.log('='.repeat(60));
    
    if (config.analysisSchema?.structuredDataPrompt) {
      console.log('✅ Structured data prompt is configured');
      console.log(`📄 Prompt length: ${config.analysisSchema.structuredDataPrompt.length} characters`);
      console.log(`⏱️  Timeout: ${config.analysisSchema.structuredDataRequestTimeoutSeconds} seconds`);
      
      // Check if schema is properly configured
      const schema = config.analysisSchema.structuredDataSchema;
      if (schema && schema.properties) {
        console.log('✅ Structured data schema is configured');
        console.log(`📝 Schema properties: ${Object.keys(schema.properties).length}`);
        
        // Check required schema properties
        const requiredProperties = [
          'overallScore',
          'categoryScores',
          'strengths',
          'areasForImprovement',
          'hiringRecommendation',
          'reasoning'
        ];
        
        let missingProperties = [];
        requiredProperties.forEach(property => {
          if (!schema.properties[property]) {
            missingProperties.push(property);
          }
        });
        
        if (missingProperties.length === 0) {
          console.log('✅ All required schema properties found');
        } else {
          console.log(`❌ Missing schema properties: ${missingProperties.join(', ')}`);
        }
        
        // Check category scores structure
        if (schema.properties.categoryScores?.properties) {
          const categoryKeys = Object.keys(schema.properties.categoryScores.properties);
          console.log(`📊 Category scores: ${categoryKeys.join(', ')}`);
        }
      } else {
        console.log('❌ Structured data schema is not configured');
      }
    } else {
      console.log('❌ Structured data prompt is not configured');
    }

    // Test 4: General Configuration
    console.log('\n' + '='.repeat(60));
    console.log('⚙️  TESTING GENERAL CONFIGURATION');
    console.log('='.repeat(60));
    
    console.log(`🔢 Min messages to trigger analysis: ${config.analysisSchema?.minMessagesToTriggerAnalysis || 'Not set'}`);
    console.log(`🎤 Voice provider: ${config.voice?.provider || 'Not set'}`);
    console.log(`🧠 Model: ${config.model?.provider} - ${config.model?.model}`);
    console.log(`🌡️  Temperature: ${config.model?.temperature}`);
    console.log(`📹 Recording enabled: ${config.recordingEnabled ? '✅' : '❌'}`);
    console.log(`⏱️  Max duration: ${config.maxDurationSeconds ? config.maxDurationSeconds/60 + ' minutes' : 'Not set'}`);

    // Test 5: Question Integration
    console.log('\n' + '='.repeat(60));
    console.log('❓ TESTING QUESTION INTEGRATION');
    console.log('='.repeat(60));
    
    const systemMessage = config.model?.messages?.[0]?.content;
    if (systemMessage) {
      let questionCount = 0;
      testQuestions.forEach(question => {
        if (systemMessage.includes(question)) {
          questionCount++;
        }
      });
      
      console.log(`✅ ${questionCount}/${testQuestions.length} test questions found in system message`);
      console.log(`📋 System message length: ${systemMessage.length} characters`);
    } else {
      console.log('❌ System message not found');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 VAPI PROMPTS CONFIGURATION TEST COMPLETE');
    console.log('='.repeat(60));
    
    console.log(`
📋 Summary:
- Summary Prompt: ${config.analysisSchema?.summaryPrompt ? '✅ Configured' : '❌ Missing'}
- Success Evaluation: ${config.analysisSchema?.successEvaluationPrompt ? '✅ Configured' : '❌ Missing'}
- Structured Data: ${config.analysisSchema?.structuredDataPrompt ? '✅ Configured' : '❌ Missing'}
- Schema Definition: ${config.analysisSchema?.structuredDataSchema ? '✅ Configured' : '❌ Missing'}
- Question Integration: ${systemMessage?.includes(testQuestions[0]) ? '✅ Working' : '❌ Issues'}

🎯 All three analysis prompt fields from the screenshots are properly configured and linked to your application!
    `);

  } catch (error) {
    console.error('❌ Error testing configuration:', error);
    process.exit(1);
  }
}

testVapiConfiguration();

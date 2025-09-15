// Test script to verify webhook configuration is now included in assistants
const { buildAssistantFromTemplate, validateAssistantConfig } = require('./src/lib/vapi-assistant-builder');

const test = async () => {
  try {
    console.log('🧪 Testing Assistant Configuration with Webhook Setup');
    console.log('===================================================');
    
    // Mock template data
    const mockTemplate = {
      id: 'test-template',
      title: 'Test Interview Template',
      duration: 2, // 2 minutes
      questions: [
        { id: 1, text: 'Tell me about yourself', category: 'general' },
        { id: 2, text: 'What interests you about this role?', category: 'general' }
      ],
      instructions: 'Conduct a professional but friendly interview'
    };
    
    const sessionId = 'test-session-123';
    const candidateName = 'Test Candidate';
    const position = 'Test Developer';
    
    console.log('📋 Test Parameters:');
    console.log(`- Session ID: ${sessionId}`);
    console.log(`- Candidate: ${candidateName}`);
    console.log(`- Position: ${position}`);
    console.log(`- Template: ${mockTemplate.title}`);
    
    console.log('\n🔧 Environment Check:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`- APP_URL: ${process.env.APP_URL || 'not set'}`);
    console.log(`- VAPI_WEBHOOK_TUNNEL_URL: ${process.env.VAPI_WEBHOOK_TUNNEL_URL || 'not set'}`);
    
    // Build assistant configuration
    console.log('\n🏗️  Building Assistant Configuration...');
    const assistantConfig = buildAssistantFromTemplate({
      template: mockTemplate,
      sessionId,
      candidateName,
      position,
      companyIntegration: null
    });
    
    console.log('\n📊 Assistant Configuration Analysis:');
    console.log(`- Name: ${assistantConfig.name}`);
    console.log(`- Model: ${assistantConfig.model?.provider}/${assistantConfig.model?.model}`);
    console.log(`- Voice: ${assistantConfig.voice?.provider}/${assistantConfig.voice?.voiceId}`);
    console.log(`- Max Duration: ${assistantConfig.maxDurationSeconds} seconds`);
    console.log(`- Has Server URL: ${!!assistantConfig.server?.url}`);
    console.log(`- Webhook URL: ${assistantConfig.server?.url || 'NOT SET'}`);
    console.log(`- Has Analysis Plan: ${!!assistantConfig.analysisPlan}`);
    
    if (assistantConfig.analysisPlan) {
      console.log(`- Summary Plan: ${assistantConfig.analysisPlan.summaryPlan?.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`- Success Evaluation: ${assistantConfig.analysisPlan.successEvaluationPlan?.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`- Structured Data: ${assistantConfig.analysisPlan.structuredDataPlan?.enabled ? 'Enabled' : 'Disabled'}`);
    }
    
    // Validate configuration
    console.log('\n✅ Validating Configuration...');
    const validation = validateAssistantConfig(assistantConfig);
    
    if (validation.isValid) {
      console.log('✅ Configuration is VALID');
    } else {
      console.log('❌ Configuration is INVALID:');
      validation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    // Check if webhooks are properly configured
    const webhooksEnabled = !!assistantConfig.server?.url && !!assistantConfig.analysisPlan;
    console.log(`\n🔗 Webhooks Status: ${webhooksEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    
    if (webhooksEnabled) {
      console.log('🎉 SUCCESS: Interviews started with this config will send webhooks!');
      console.log(`   Webhook URL: ${assistantConfig.server.url}`);
    } else {
      console.log('⚠️  WARNING: Interviews will NOT generate analysis data!');
      console.log('   To fix: Ensure VAPI_WEBHOOK_TUNNEL_URL is set correctly');
    }
    
    // Show a small sample of the full config
    console.log('\n📝 Sample Configuration (truncated):');
    const configSample = {
      name: assistantConfig.name,
      model: { provider: assistantConfig.model?.provider },
      voice: { provider: assistantConfig.voice?.provider },
      server: assistantConfig.server,
      analysisPlan: assistantConfig.analysisPlan ? {
        summaryPlan: { enabled: assistantConfig.analysisPlan.summaryPlan?.enabled },
        successEvaluationPlan: { enabled: assistantConfig.analysisPlan.successEvaluationPlan?.enabled },
        structuredDataPlan: { enabled: assistantConfig.analysisPlan.structuredDataPlan?.enabled }
      } : null
    };
    
    console.log(JSON.stringify(configSample, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
};

test();

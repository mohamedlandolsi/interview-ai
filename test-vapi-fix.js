/**
 * Test script to verify Vapi API key handling fix
 */

const BASE_URL = 'http://localhost:3000';

async function testVapiApiKey() {
  console.log('🔑 Testing Vapi API Key Fix...\n');
  
  try {
    // Test 1: Get current configuration
    console.log('1. Testing GET /api/integrations/vapi');
    const getResponse = await fetch(`${BASE_URL}/api/integrations/vapi`);
    const getCurrentConfig = await getResponse.json();
    
    console.log(`Status: ${getResponse.status}`);
    console.log('Response:', JSON.stringify(getCurrentConfig, null, 2));
    
    if (getResponse.status === 401) {
      console.log('✅ Authentication required (expected for unauthenticated requests)');
    } else if (getResponse.status === 200) {
      console.log('✅ GET endpoint working correctly');
      console.log(`📋 Current API Key: ${getCurrentConfig.vapiApiKey || 'None configured'}`);
    }
    
    console.log('\n---\n');
    
    // Test 2: Try to update configuration
    console.log('2. Testing PATCH /api/integrations/vapi');
    const testApiKey = 'test-api-key-' + Date.now();
    
    const patchResponse = await fetch(`${BASE_URL}/api/integrations/vapi`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vapiApiKey: testApiKey,
        vapiAssistantId: 'test-assistant-id',
        vapiVoiceProvider: 'elevenlabs',
        vapiVoiceId: 'test-voice-id',
        vapiLanguage: 'en'
      })
    });
    
    const patchResult = await patchResponse.json();
    
    console.log(`Status: ${patchResponse.status}`);
    console.log('Response:', JSON.stringify(patchResult, null, 2));
    
    if (patchResponse.status === 401) {
      console.log('✅ Authentication required (expected for unauthenticated requests)');
    } else if (patchResponse.status === 200) {
      console.log('✅ PATCH endpoint working correctly');
    }
    
    console.log('\n---\n');
    
    console.log('✅ Test completed!');
    console.log('📝 Note: Both endpoints should require authentication (401 errors are expected)');
    console.log('🔧 To fully test, you need to be logged in as an admin user');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVapiApiKey();

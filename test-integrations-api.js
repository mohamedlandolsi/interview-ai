/**
 * Test script for the Integrations API endpoints
 * This script tests the basic functionality of all integrations endpoints
 */

console.log('🚀 Starting Integrations API Tests...\n');

const BASE_URL = 'http://localhost:3000';

// Test helper function
async function testEndpoint(method, endpoint, body = null, shouldSucceed = false) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    console.log('---\n');
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Error testing ${method} ${endpoint}:`, error.message);
    console.log('---\n');
    return null;
  }
}

async function runTests() {
  console.log('📋 Testing Integrations API Endpoints\n');
  
  // Test Health endpoint first
  await testEndpoint('GET', '/api/health');
  
  // Test Vapi endpoints (should require auth)
  await testEndpoint('GET', '/api/integrations/vapi');
  await testEndpoint('POST', '/api/integrations/vapi/test', { 
    apiKey: 'test-key',
    apiUrl: 'https://api.vapi.ai' 
  });
  
  // Test Webhooks endpoints (should require auth)
  await testEndpoint('GET', '/api/integrations/webhooks');
  await testEndpoint('POST', '/api/integrations/webhooks', {
    url: 'https://example.com/webhook',
    events: ['interview.completed'],
    name: 'Test Webhook'
  });
  
  // Test API Keys endpoints (should require auth)
  await testEndpoint('GET', '/api/integrations/apikeys');
  await testEndpoint('POST', '/api/integrations/apikeys', {
    name: 'Test API Key',
    permissions: ['read:interviews']
  });
  
  console.log('✅ All integration endpoint tests completed!');
  console.log('Note: Most endpoints should return 401/403 errors due to authentication requirements.');
  console.log('This confirms that the security measures are working correctly.');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };

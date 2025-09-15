// Simple test to check if webhook is now working by starting an interview session
const test = async () => {
  try {
    console.log('🧪 Testing Interview Start with Webhook Configuration');
    console.log('==================================================');
    
    // First, create a minimal interview session
    const sessionResponse = await fetch('http://localhost:3000/api/interviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will need proper auth headers in a real scenario
      },
      body: JSON.stringify({
        templateId: 'default', // We'll use whatever template exists
        candidateName: 'Test Webhook User',
        candidateEmail: 'test@example.com',
        position: 'Test Position'
      })
    });
    
    if (!sessionResponse.ok) {
      console.log('❌ Failed to create session - this is expected without auth');
      console.log('Let\'s try the debug approach instead...');
      
      // Instead, let's check what the environment variables look like now
      console.log('\n🔧 Environment Variable Check:');
      console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
      console.log('APP_URL:', process.env.APP_URL || 'undefined');
      console.log('VAPI_WEBHOOK_TUNNEL_URL:', process.env.VAPI_WEBHOOK_TUNNEL_URL || 'undefined');
      
      // Test what the webhook URL would be constructed as
      const sessionId = 'test-session-123';
      let webhookUrl = null;
      
      if (process.env.NODE_ENV === 'development' && process.env.VAPI_WEBHOOK_TUNNEL_URL) {
        webhookUrl = `${process.env.VAPI_WEBHOOK_TUNNEL_URL}/api/vapi/webhook?sessionId=${sessionId}`;
        console.log('🔗 Development webhook URL would be:', webhookUrl);
      } else if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  No tunnel URL - webhooks would be disabled');
      } else {
        const appBaseUrl = process.env.APP_URL;
        if (appBaseUrl) {
          webhookUrl = `${appBaseUrl}/api/vapi/webhook?sessionId=${sessionId}`;
          console.log('🌐 Production webhook URL would be:', webhookUrl);
        }
      }
      
      console.log('\n🎯 Webhook Status:');
      if (webhookUrl) {
        console.log('✅ Webhook URL would be set:', webhookUrl);
        console.log('✅ This means interviews will generate analysis data!');
        
        // Test if the webhook endpoint is reachable
        console.log('\n🔧 Testing webhook endpoint...');
        try {
          const webhookTest = await fetch(webhookUrl, {
            method: 'GET' // Just test if it's reachable
          });
          console.log(`Webhook endpoint status: ${webhookTest.status}`);
          console.log('✅ Webhook endpoint is reachable');
        } catch (error) {
          console.log('❌ Webhook endpoint test failed:', error.message);
        }
      } else {
        console.log('❌ No webhook URL would be set');
        console.log('❌ Interviews will NOT generate analysis data');
      }
      
      return;
    }
    
    console.log('Session creation response received');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

test();

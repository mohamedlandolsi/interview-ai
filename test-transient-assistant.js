/**
 * Test script for the transient assistant API endpoint
 */

// First, let's create a test session and then try to start an interview
async function testTransientAssistant() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Transient Assistant API...');
  
  try {
    // Step 1: Create a test session
    console.log('📝 Creating test session...');
    const sessionResponse = await fetch(`${baseUrl}/api/interviews/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'sb-access-token=your_token_here' // You'll need to get a real token
      },
      body: JSON.stringify({
        candidateName: 'Mohamed Landolsi',
        candidateEmail: 'mohamed.landolsi@example.com',
        position: 'test frontend'
      })
    });

    if (!sessionResponse.ok) {
      console.error('❌ Failed to create session:', sessionResponse.status, sessionResponse.statusText);
      const errorText = await sessionResponse.text();
      console.error('Error details:', errorText);
      return;
    }

    const sessionData = await sessionResponse.json();
    console.log('✅ Session created:', sessionData.session.id);

    // Step 2: Try to start an interview with transient assistant
    console.log('🚀 Starting interview with transient assistant...');
    const startResponse = await fetch(`${baseUrl}/api/interviews/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'sb-access-token=your_token_here' // You'll need to get a real token
      },
      body: JSON.stringify({
        interviewSessionId: sessionData.session.id,
        candidateName: 'Mohamed Landolsi',
        position: 'test frontend'
      })
    });

    console.log('📡 Start response status:', startResponse.status, startResponse.statusText);

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('❌ Failed to start interview:', errorText);
      return;
    }

    const startData = await startResponse.json();
    console.log('✅ Interview started successfully!');
    console.log('Assistant ID:', startData.assistantId);
    console.log('Session ID:', startData.sessionId);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Note: This test needs to be run with proper authentication
// For now, let's check the API directly via curl or browser dev tools
console.log('To test this endpoint, you need to:');
console.log('1. Login to the app in your browser');
console.log('2. Go to /interview/[session-id]/conduct page');
console.log('3. Try to start an interview');
console.log('4. Check the browser console and network tab for detailed error logs');

// Uncomment the line below to run the test (after setting up auth)
// testTransientAssistant();

// Basic test for /api/interviews/start transient assistant creation
// Run with: node test-interview-start.js

const fetch = global.fetch || require('node-fetch');

(async () => {
  const baseUrl = 'http://localhost:3000';
  const sessionId = process.env.TEST_INTERVIEW_SESSION_ID || 'dummy-session-id';

  console.log('--- Testing /api/interviews/start endpoint ---');
  console.log('Session ID:', sessionId);

  try {
    const res = await fetch(baseUrl + '/api/interviews/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewSessionId: sessionId,
        candidateName: 'Test Candidate',
        position: 'Software Engineer'
      })
    });

    const text = await res.text();
    console.log('Status:', res.status, res.statusText);
    console.log('Raw response:', text.substring(0, 500));

    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.log('Response not JSON parseable');
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
})();

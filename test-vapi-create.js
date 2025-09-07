const fetch = require('node-fetch');

const config = {
  name: 'Test Assistant',
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages: [{ role: 'system', content: 'You are a test assistant.' }]
  },
  voice: {
    provider: '11labs',
    voiceId: 'pNInz6obpgDQGcFmaJgB'
  },
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en-US'
  }
};

console.log('Testing Vapi assistant creation...');
console.log('Config:', JSON.stringify(config, null, 2));

fetch('https://api.vapi.ai/assistant', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 6f1ceebe-b292-48ac-a23e-b9962b5e7d26',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(config)
}).then(res => {
  console.log('Status:', res.status, res.statusText);
  return res.text();
}).then(text => {
  console.log('Response:', text);
  
  // Try to parse as JSON for better readability
  try {
    const json = JSON.parse(text);
    console.log('Parsed response:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('Raw response:', text);
  }
}).catch(err => {
  console.error('Error:', err);
});

/**
 * Quick test script to verify our enhanced Vapi validation works correctly
 */

const { validateAssistantConfig } = require('./src/lib/vapi-assistant-builder.ts');

// Test 1: Valid configuration should pass
console.log('=== Test 1: Valid Configuration ===');
const validConfig = {
  name: "Test Interview",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: "You are an AI interviewer."
      }
    ]
  },
  voice: {
    provider: "11labs",
    voiceId: "pNInz6obpgDQGcFmaJgB", // Valid 20-character ID
    stability: 0.6,
    similarityBoost: 0.9
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US"
  },
  serverUrl: "https://example.com/webhook",
  recordingEnabled: true,
  endCallFunctionEnabled: false,
  maxDurationSeconds: 1800,
  silenceTimeoutSeconds: 60
};

const validResult = validateAssistantConfig(validConfig);
console.log('Valid config result:', validResult);

// Test 2: Invalid voice provider should fail
console.log('\n=== Test 2: Invalid Voice Provider ===');
const invalidVoiceConfig = {
  ...validConfig,
  voice: {
    provider: "invalid_provider", // Invalid provider
    voiceId: "pNInz6obpgDQGcFmaJgB"
  }
};

const invalidVoiceResult = validateAssistantConfig(invalidVoiceConfig);
console.log('Invalid voice provider result:', invalidVoiceResult);

// Test 3: Invalid 11labs voice ID should fail
console.log('\n=== Test 3: Invalid 11labs Voice ID ===');
const invalidVoiceIdConfig = {
  ...validConfig,
  voice: {
    provider: "11labs",
    voiceId: "short" // Too short
  }
};

const invalidVoiceIdResult = validateAssistantConfig(invalidVoiceIdConfig);
console.log('Invalid voice ID result:', invalidVoiceIdResult);

// Test 4: Missing webhook URL should fail
console.log('\n=== Test 4: Missing Webhook URL ===');
const missingWebhookConfig = {
  ...validConfig,
  serverUrl: "" // Empty URL
};

const missingWebhookResult = validateAssistantConfig(missingWebhookConfig);
console.log('Missing webhook URL result:', missingWebhookResult);

console.log('\n=== Validation Test Complete ===');

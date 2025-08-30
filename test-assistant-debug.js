// Quick test of the assistant builder
const { buildAssistantFromTemplate, validateAssistantConfig } = require('./src/lib/vapi-assistant-builder.ts');

// Create a mock template
const mockTemplate = {
  id: 'test-123',
  title: 'Test Template',
  description: 'A test template',
  category: 'technical',
  difficulty: 'mid',
  duration: 30,
  instruction: 'Ask technical questions',
  questions: ['Tell me about yourself', 'What is your experience?'],
  rawQuestions: ['Tell me about yourself', 'What is your experience?'],
  created_at: new Date(),
  updated_at: new Date(),
  interviewer_id: 'test-user'
};

try {
  console.log('Testing assistant builder...');
  
  const config = buildAssistantFromTemplate({
    template: mockTemplate,
    sessionId: 'test-session',
    candidateName: 'Test Candidate',
    position: 'Software Developer',
    companyIntegration: null
  });

  console.log('Generated config:');
  console.log(JSON.stringify(config, null, 2));

  const validation = validateAssistantConfig(config);
  console.log('Validation result:', validation);

} catch (error) {
  console.error('Error:', error);
}

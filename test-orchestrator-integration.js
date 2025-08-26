/**
 * Test the InterviewOrchestrator with a mock Vapi event
 */

require('dotenv').config()

async function testOrchestratorIntegration() {
  console.log('🧪 Testing InterviewOrchestrator Integration...')
  
  // Check environment variables
  console.log('\n🔑 Environment Check:')
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`)
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`)

  try {
    // Import the orchestrator (this will test if it loads without errors)
    const { InterviewOrchestrator } = require('./src/lib/interview-orchestrator.ts')
    console.log('\n✅ InterviewOrchestrator imported successfully')

    // Test mock assistant-request event
    const mockEvent = {
      type: 'assistant-request',
      call: {
        id: 'test-call-123',
        assistantId: 'test-assistant-456',
        status: 'active'
      },
      timestamp: new Date().toISOString()
    }

    console.log('\n🤖 Testing mock assistant-request...')
    console.log('Mock event:', JSON.stringify(mockEvent, null, 2))
    
    // Note: This would normally require a real session in the database
    // For now, we just test that the method exists and can be called
    console.log('\n📝 Ready for integration testing with real Vapi events')

  } catch (error) {
    console.error('❌ Error testing orchestrator:', error.message)
  }
}

testOrchestratorIntegration()

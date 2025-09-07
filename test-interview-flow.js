#!/usr/bin/env node

/**
 * Test the complete interview flow to check error handling
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testInterviewFlow() {
  console.log('🧪 Testing Interview Flow Error Handling...\n');
  
  try {
    // Start dev server in background
    console.log('Starting dev server...');
    const devProcess = exec('npm run dev');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('Server should be running at http://localhost:3000\n');
    
    console.log('✅ To test manually:');
    console.log('1. Open http://localhost:3000');
    console.log('2. Navigate to an interview conduct page');
    console.log('3. Check that no React object errors appear in the console');
    console.log('4. Test error scenarios and verify they show as string messages');
    
    // Keep server running for manual testing
    process.stdin.resume();
    console.log('\nPress Ctrl+C to stop the server and exit...');
    
    process.on('SIGINT', () => {
      console.log('\nStopping dev server...');
      devProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testInterviewFlow();
}

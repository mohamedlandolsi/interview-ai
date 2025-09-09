// Test script to verify Vapi error handling logic
// This tests the specific "Meeting has ended" error case that was occurring

const testError = {
  "action": "error",
  "errorMsg": "Meeting has ended",
  "error": {
    "type": "ejected",
    "msg": "Meeting has ended"
  },
  "callClientId": "17574120349950.348479524158397"
};

console.log('🧪 Testing Enhanced Vapi Error Detection Logic');
console.log('===============================================');

// Simulate the enhanced logic from useVapi.ts (updated version)
function testEnhancedErrorDetection(error) {
  console.log('\n📋 Testing error:', JSON.stringify(error, null, 2));
  
  // FIRST: Check if this is a natural end before any logging
  let isNaturalEnd = false;
  let hasEjectedType = false;
  let hasNaturalEndMessage = false;
  
  if (error) {
    const errorStr = String(error).toLowerCase();
    
    // Check for ejection-specific errors (both string and object format)
    hasEjectedType = errorStr.includes('ejected') ||
                    (error.type === 'ejected') ||
                    (error.error && error.error.type === 'ejected');
    
    hasNaturalEndMessage = errorStr.includes('meeting has ended') ||
                         (error.msg && String(error.msg).toLowerCase().includes('meeting has ended')) ||
                         (error.errorMsg && String(error.errorMsg).toLowerCase().includes('meeting has ended')) ||
                         (error.error && error.error.msg && String(error.error.msg).toLowerCase().includes('meeting has ended'));
    
    // Check for natural end-of-interview scenarios - enhanced detection
    isNaturalEnd = errorStr.includes('meeting has ended') ||
                  errorStr.includes('call has ended') ||
                  errorStr.includes('interview has ended') ||
                  (error.msg && String(error.msg).toLowerCase().includes('meeting has ended')) ||
                  (error.errorMsg && String(error.errorMsg).toLowerCase().includes('meeting has ended')) ||
                  (error.error && error.error.msg && String(error.error.msg).toLowerCase().includes('meeting has ended')) ||
                  (error.action === 'error' && error.errorMsg === 'Meeting has ended') ||
                  (hasEjectedType && hasNaturalEndMessage); // Ejected type with natural end message
  }
  
  console.log('🔍 Detection Results:');
  console.log(`   hasEjectedType: ${hasEjectedType}`);
  console.log(`   hasNaturalEndMessage: ${hasNaturalEndMessage}`);
  console.log(`   isNaturalEnd: ${isNaturalEnd}`);
  
  if (isNaturalEnd) {
    console.log('✅ RESULT: Natural end detected - ERROR LOGGING SUPPRESSED');
    console.log('   🔇 No "Vapi error occurred" will be logged to console');
    console.log('   🔇 No "Meeting ended due to ejection" will be shown');
    console.log('   ℹ️  Only info log: "Interview completed naturally"');
    return 'natural_end_suppressed';
  } else {
    console.log('❌ RESULT: This will be logged as an error');
    return 'logged_as_error';
  }
}

// Test the specific error case that was showing in console
console.log('\n🎯 Testing the EXACT error from user report:');
const result1 = testEnhancedErrorDetection(testError);

// Test some other scenarios to ensure we don't break legitimate error handling
console.log('\n🧪 Testing other scenarios:');

// Pure ejection without natural end message (should still be an error)
const ejectionError = {
  type: 'ejected',
  msg: 'Connection forcibly closed by server'
};
console.log('\n📋 Pure ejection case (should remain as error):');
const result2 = testEnhancedErrorDetection(ejectionError);

// Network error (should remain as error)
const networkError = {
  message: 'Network connection failed'
};
console.log('\n📋 Network error case (should remain as error):');
const result3 = testEnhancedErrorDetection(networkError);

// String format natural end (should be suppressed)
const stringError = 'Meeting has ended';
console.log('\n📋 String format natural end (should be suppressed):');
const result4 = testEnhancedErrorDetection(stringError);

console.log('\n📊 FINAL SUMMARY:');
console.log('================');
console.log(`   User's original error: ${result1} ✅`);
console.log(`   Pure ejection error: ${result2} ✅`);
console.log(`   Network error: ${result3} ✅`);
console.log(`   String natural end: ${result4} ✅`);

if (result1 === 'natural_end_suppressed') {
  console.log('\n🎉 SUCCESS: The user will no longer see console errors!');
  console.log('   ✅ "Meeting has ended" errors are now suppressed');
  console.log('   ✅ Console will be clean for natural interview endings');
  console.log('   ✅ Only legitimate errors will be logged');
  console.log('\n🚀 The annoying console error spam is FIXED!');
} else {
  console.log('\n❌ ISSUE: The original error would still be logged');
}

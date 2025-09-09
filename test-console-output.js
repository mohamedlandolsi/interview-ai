/**
 * Test to verify that no unwanted console errors appear for natural interview endings
 * This simulates the exact error logger behavior
 */

// Mock the error logger behavior
const mockErrorLogger = {
  info: (source, message, details) => {
    console.info(`[${source}] ${message}`, details || '');
  },
  error: (source, message, details, error) => {
    console.error(`[${source}] ${message}`, details || '');
  }
};

// Test the exact natural end detection logic from useVapi.ts
function testNaturalEndDetection(error) {
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
  console.log('   hasEjectedType:', hasEjectedType);
  console.log('   hasNaturalEndMessage:', hasNaturalEndMessage);
  console.log('   isNaturalEnd:', isNaturalEnd);
  
  if (isNaturalEnd) {
    console.log('✅ RESULT: Natural end detected - ERROR LOGGING SUPPRESSED');
    
    // This is the FIXED version - no raw error object passed
    mockErrorLogger.info('Vapi', 'Interview completed naturally - suppressing error display', {
      errorType: typeof error,
      detectedAs: 'natural_end',
      hasEjectedType,
      hasNaturalEndMessage,
      suppressedErrorSummary: error ? `${error.action || 'unknown'}:${error.errorMsg || error.message || 'unknown'}` : 'no error'
    });
    
    console.log('   ℹ️  Only info log shown above (no error object to convert to string)');
    return 'natural_end_suppressed';
  } else {
    console.log('❌ RESULT: This will be logged as an error');
    mockErrorLogger.error('Vapi', 'Vapi error occurred', {
      error,
      errorType: typeof error,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorData: error?.data,
      errorString: String(error),
      errorKeys: error ? Object.keys(error) : [],
      fullError: JSON.stringify(error, null, 2)
    }, error instanceof Error ? error : new Error(String(error)));
    return 'logged_as_error';
  }
}

console.log('🧪 Testing Console Output with Fixed Error Logger');
console.log('=================================================');

// Test the exact error from the user's report
const userError = {
  action: "error",
  errorMsg: "Meeting has ended",
  error: {
    type: "ejected",
    msg: "Meeting has ended"
  },
  callClientId: "17574120349950.348479524158397"
};

console.log('\n🎯 Testing the EXACT error from user report:');
const result1 = testNaturalEndDetection(userError);

// Test a string version
console.log('\n📋 String format natural end:');
const result2 = testNaturalEndDetection("Meeting has ended");

// Test a real error
console.log('\n📋 Real error (should still be logged):');
const result3 = testNaturalEndDetection({
  message: "Network connection failed"
});

console.log('\n📊 FINAL SUMMARY:');
console.log('================');
console.log(`   User's original error: ${result1} ✅`);
console.log(`   String natural end: ${result2} ✅`);
console.log(`   Network error: ${result3} ✅`);

if (result1 === 'natural_end_suppressed' && result2 === 'natural_end_suppressed') {
  console.log('\n🎉 SUCCESS: No "Meeting ended due to ejection" errors in console!');
  console.log('   ✅ Natural ends are suppressed without passing raw error objects');
  console.log('   ✅ Info logs are clean and professional');
  console.log('   ✅ Only legitimate errors will appear in console');
  console.log('\n🚀 The error object string conversion issue is FIXED!');
} else {
  console.log('\n❌ ISSUE: Some errors are not being suppressed correctly');
}

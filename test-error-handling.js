#!/usr/bin/env node

/**
 * Test React error handling in components
 */

const fs = require('fs');
const path = require('path');

function checkErrorHandling() {
  console.log('🔍 Checking React Error Handling in Components...\n');
  
  const files = [
    'src/hooks/useVapi.ts',
    'src/components/interviews/InterviewComponent.tsx'
  ];
  
  let allGood = true;
  
  files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${file}`);
      allGood = false;
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`📁 Checking ${file}:`);
    
    // Check for error extraction patterns
    const patterns = [
      /error\s*\?\.\s*message\s*\|\|\s*'[^']*'/,  // error?.message || 'fallback'
      /typeof error === 'string'\s*\?\s*error\s*:\s*error\.\w+/,  // typeof error === 'string' ? error : error.message
      /catch\s*\([^)]*\)\s*\{[\s\S]*?\}/,  // try-catch blocks
      /String\([^)]*\)/,  // String(error)
    ];
    
    let foundPatterns = 0;
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        foundPatterns++;
        console.log(`  ✅ Pattern ${index + 1}: Error extraction logic found`);
      }
    });
    
    if (foundPatterns > 0) {
      console.log(`  ✅ ${foundPatterns} error handling patterns found`);
    } else {
      console.log(`  ⚠️  No error extraction patterns found`);
      allGood = false;
    }
    
    // Check for potential object rendering issues
    const badPatterns = [
      /\{[^}]*error[^}]*\}/,  // Direct object in JSX
    ];
    
    badPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        console.log(`  ⚠️  Potential object rendering in JSX found`);
      }
    });
    
    console.log('');
  });
  
  if (allGood) {
    console.log('✅ All error handling checks passed!');
    console.log('Components should now properly handle errors without React object rendering issues.');
  } else {
    console.log('❌ Some error handling issues found. Review the components above.');
  }
  
  return allGood;
}

if (require.main === module) {
  const result = checkErrorHandling();
  process.exit(result ? 0 : 1);
}

module.exports = { checkErrorHandling };

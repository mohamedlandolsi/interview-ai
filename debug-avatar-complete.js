#!/usr/bin/env node

/**
 * Complete debugging script for avatar upload flow
 */

console.log('🔍 Complete Avatar Upload Flow Debug')
console.log('===================================\n')

// Test the API endpoint directly
async function testAvatarAPI() {
  try {
    // Create a test form data with a small image
    console.log('📡 Testing Profile API endpoint...')
    
    const response = await fetch('http://localhost:3000/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Profile API Response:')
      console.log('   Profile ID:', data.profile?.id)
      console.log('   Avatar URL:', data.profile?.avatar_url)
      console.log('   Updated At:', data.profile?.updated_at)
      console.log('   Full Name:', data.profile?.full_name)
      
      if (data.profile?.avatar_url) {
        console.log('   Has cache-busting:', data.profile.avatar_url.includes('?t=') ? 'YES' : 'NO')
        
        // Test if the avatar URL is accessible
        console.log('\n🌐 Testing avatar URL accessibility...')
        try {
          const avatarResponse = await fetch(data.profile.avatar_url, { method: 'HEAD' })
          console.log('   Avatar URL status:', avatarResponse.status)
          console.log('   Avatar accessible:', avatarResponse.ok ? 'YES' : 'NO')
        } catch (error) {
          console.log('   Avatar URL error:', error.message)
        }
      } else {
        console.log('❌ No avatar URL found in profile')
      }
    } else {
      console.log('❌ Profile API failed:', response.status)
      const errorText = await response.text()
      console.log('   Error:', errorText)
    }
    
  } catch (error) {
    console.error('❌ API test error:', error.message)
  }
}

// Check component logic
function checkComponentLogic() {
  console.log('\n🔧 Checking Component Logic...')
  
  const fs = require('fs')
  const componentPath = './src/components/settings/ProfileSettings.tsx'
  const content = fs.readFileSync(componentPath, 'utf8')
  
  // Check getAvatarUrl function
  const getAvatarUrlMatch = content.match(/const getAvatarUrl = \(\) => \{[\s\S]*?\}/);
  if (getAvatarUrlMatch) {
    console.log('✅ getAvatarUrl function found')
    
    // Check if it handles uploadedAvatarUrl
    if (content.includes('uploadedAvatarUrl')) {
      console.log('✅ uploadedAvatarUrl handling present')
    } else {
      console.log('❌ uploadedAvatarUrl handling missing')
    }
    
    // Check if it handles profile?.avatar_url
    if (content.includes('profile?.avatar_url')) {
      console.log('✅ profile.avatar_url handling present')
    } else {
      console.log('❌ profile.avatar_url handling missing')
    }
    
    // Check if it has cache busting detection
    if (content.includes('?t=')) {
      console.log('✅ Cache-busting detection present')
    } else {
      console.log('❌ Cache-busting detection missing')
    }
  } else {
    console.log('❌ getAvatarUrl function not found')
  }
  
  // Check avatar upload handler
  if (content.includes('handleAvatarUpload')) {
    console.log('✅ Avatar upload handler present')
    
    if (content.includes('setUploadedAvatarUrl')) {
      console.log('✅ Temporary avatar URL setting present')
    } else {
      console.log('❌ Temporary avatar URL setting missing')
    }
    
    if (content.includes('refreshProfile')) {
      console.log('✅ Profile refresh call present')
    } else {
      console.log('❌ Profile refresh call missing')
    }
  } else {
    console.log('❌ Avatar upload handler not found')
  }
}

// Run all tests
async function runAllTests() {
  checkComponentLogic()
  await testAvatarAPI()
  
  console.log('\n🎯 Debug Summary:')
  console.log('1. Check if avatar URL is in database ✅ (from previous test)')
  console.log('2. Check if API returns avatar URL')
  console.log('3. Check if component handles avatar URL correctly')
  console.log('4. Check if browser can access avatar URL')
  console.log('\n💡 Next steps if issue persists:')
  console.log('   - Check browser console for errors')
  console.log('   - Verify Supabase Storage permissions')
  console.log('   - Check if CORS is properly configured')
  console.log('   - Inspect network requests in browser dev tools')
}

runAllTests()

#!/usr/bin/env node

/**
 * Test different avatar URL formats
 */

async function testAvatarFormats() {
  console.log('🧪 Testing Different Avatar URL Formats')
  console.log('======================================\n')
  
  const baseUrl = 'https://klpvbpihucordleemcoq.supabase.co/storage/v1/object/public/avatars/4e638dca-7b20-4a2c-9393-a66c45ae2586/avatar.jpg'
  const cacheBustedUrl = `${baseUrl}?t=1756632305508`
  
  async function testUrl(url, description) {
    console.log(`📡 Testing ${description}:`)
    console.log(`   URL: ${url}`)
    
    try {
      const response = await fetch(url, { method: 'HEAD' })
      console.log(`   Status: ${response.status}`)
      
      if (response.ok) {
        console.log('   ✅ Accessible')
        return true
      } else {
        console.log('   ❌ Not accessible')
        
        // Try to get error details
        try {
          const errorResponse = await fetch(url)
          const errorText = await errorResponse.text()
          console.log(`   Error: ${errorText.substring(0, 100)}...`)
        } catch (e) {
          console.log('   Could not get error details')
        }
        return false
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`)
      return false
    }
  }
  
  // Test base URL without query parameters
  const baseWorks = await testUrl(baseUrl, 'Base URL (no cache-busting)')
  console.log('')
  
  // Test with cache-busting
  const cacheBustedWorks = await testUrl(cacheBustedUrl, 'Cache-busted URL')
  console.log('')
  
  // Test with different cache-busting format
  const altCacheBusted = `${baseUrl}?v=1`
  const altWorks = await testUrl(altCacheBusted, 'Alternative cache-busting')
  console.log('')
  
  console.log('🎯 Results Summary:')
  console.log(`   Base URL works: ${baseWorks ? 'YES' : 'NO'}`)
  console.log(`   Cache-busted URL works: ${cacheBustedWorks ? 'YES' : 'NO'}`)
  console.log(`   Alternative cache-busting works: ${altWorks ? 'YES' : 'NO'}`)
  
  if (baseWorks && !cacheBustedWorks) {
    console.log('\n💡 Issue identified: Cache-busting query parameters break the URL')
    console.log('   Solution: Use different cache-busting approach or fix Supabase storage config')
  } else if (!baseWorks) {
    console.log('\n💡 Issue identified: File does not exist or storage permissions issue')
    console.log('   Solution: Check file upload and storage bucket configuration')
  }
}

testAvatarFormats()

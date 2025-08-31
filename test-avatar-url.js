#!/usr/bin/env node

/**
 * Test avatar URL accessibility
 */

async function testAvatarURL() {
  const avatarUrl = 'https://klpvbpihucordleemcoq.supabase.co/storage/v1/object/public/avatars/4e638dca-7b20-4a2c-9393-a66c45ae2586/avatar.jpg?t=1756632305508'
  
  console.log('🌐 Testing Avatar URL Accessibility')
  console.log('==================================\n')
  console.log('URL:', avatarUrl)
  console.log('')
  
  try {
    console.log('📡 Making HEAD request to avatar URL...')
    const response = await fetch(avatarUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    console.log('Response Status:', response.status)
    console.log('Response Headers:')
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`)
    }
    
    if (response.ok) {
      console.log('\n✅ Avatar URL is accessible!')
      
      // Try GET request to see actual content
      console.log('\n📡 Making GET request to check content...')
      const getResponse = await fetch(avatarUrl)
      const contentType = getResponse.headers.get('content-type')
      const contentLength = getResponse.headers.get('content-length')
      
      console.log('Content Type:', contentType)
      console.log('Content Length:', contentLength)
      
      if (contentType?.startsWith('image/')) {
        console.log('✅ Content is an image!')
      } else {
        console.log('❌ Content is not an image')
      }
      
    } else {
      console.log('\n❌ Avatar URL is not accessible')
      const errorText = await response.text()
      console.log('Error:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Error testing avatar URL:', error.message)
  }
}

testAvatarURL()

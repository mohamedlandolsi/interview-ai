#!/usr/bin/env node

/**
 * Test the actual storage URL and find the correct format
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testStorageURL() {
  console.log('🔍 Testing Supabase Storage URL Format')
  console.log('====================================\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing environment variables')
    return
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  try {
    // List files in the avatars bucket
    console.log('📋 Listing files in avatars bucket...')
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list('4e638dca-7b20-4a2c-9393-a66c45ae2586')
    
    if (error) {
      console.log('❌ Error listing files:', error.message)
      return
    }
    
    console.log('📁 Files found:')
    files.forEach(file => {
      console.log(`   • ${file.name} (${file.metadata?.size} bytes)`)
    })
    
    if (files.length === 0) {
      console.log('   No files found in the user folder')
      return
    }
    
    // Get the public URL for the avatar
    const filePath = `4e638dca-7b20-4a2c-9393-a66c45ae2586/avatar.jpg`
    console.log(`\n🔗 Getting public URL for: ${filePath}`)
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    console.log('Generated URL:', data.publicUrl)
    
    // Test the URL
    console.log('\n🧪 Testing generated URL...')
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' })
      console.log('Status:', response.status)
      console.log('Success:', response.ok ? 'YES' : 'NO')
      
      if (response.ok) {
        console.log('✅ Base URL works!')
        
        // Test with cache busting
        const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`
        console.log('\n🔄 Testing with cache busting...')
        console.log('Cache-busted URL:', cacheBustedUrl)
        
        const cacheBustedResponse = await fetch(cacheBustedUrl, { method: 'HEAD' })
        console.log('Cache-busted Status:', cacheBustedResponse.status)
        console.log('Cache-busted Success:', cacheBustedResponse.ok ? 'YES' : 'NO')
        
        if (cacheBustedResponse.ok) {
          console.log('✅ Cache-busted URL also works!')
        } else {
          console.log('❌ Cache-busted URL fails - may need different approach')
        }
        
      } else {
        const errorText = await fetch(data.publicUrl).then(r => r.text())
        console.log('Error:', errorText.substring(0, 100))
      }
      
    } catch (fetchError) {
      console.log('❌ Fetch error:', fetchError.message)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testStorageURL()

#!/usr/bin/env node

/**
 * Deep dive into bucket configuration and try alternative URL formats
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function debugBucketConfig() {
  console.log('🔧 Deep Bucket Configuration Debug')
  console.log('=================================\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  try {
    // Get bucket details
    console.log('🔍 Checking bucket configuration...')
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('avatars')
    
    if (bucketError) {
      console.log('❌ Error getting bucket:', bucketError.message)
      return
    }
    
    console.log('📦 Bucket Details:')
    console.log('   Name:', bucket.name)
    console.log('   ID:', bucket.id)
    console.log('   Public:', bucket.public)
    console.log('   Created:', bucket.created_at)
    console.log('   Updated:', bucket.updated_at)
    console.log('')
    
    if (!bucket.public) {
      console.log('⚠️  ISSUE FOUND: Bucket is not public!')
      console.log('   This is why the public URLs are failing.')
      console.log('   Fix: Make the bucket public in Supabase dashboard')
      return
    }
    
    // Try signed URL instead
    console.log('🔗 Testing signed URL (alternative approach)...')
    const filePath = '4e638dca-7b20-4a2c-9393-a66c45ae2586/avatar.jpg'
    
    const { data: signedUrl, error: signedError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(filePath, 60 * 60 * 24) // 24 hours
    
    if (signedError) {
      console.log('❌ Error creating signed URL:', signedError.message)
    } else {
      console.log('✅ Signed URL created:', signedUrl.signedUrl)
      
      // Test the signed URL
      try {
        const response = await fetch(signedUrl.signedUrl, { method: 'HEAD' })
        console.log('   Signed URL Status:', response.status)
        console.log('   Signed URL Works:', response.ok ? 'YES' : 'NO')
        
        if (response.ok) {
          console.log('\n💡 SOLUTION: Use signed URLs instead of public URLs')
          console.log('   Signed URLs work even when public URLs fail')
          console.log('   Update the upload API to return signed URLs')
        }
      } catch (e) {
        console.log('   Signed URL test failed:', e.message)
      }
    }
    
    // Check if we can upload a test file
    console.log('\n📤 Testing upload capability...')
    const testData = Buffer.from('test')
    const testPath = 'test/test.txt'
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testPath, testData, {
        contentType: 'text/plain',
        upsert: true
      })
    
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message)
    } else {
      console.log('✅ Upload capability confirmed')
      
      // Clean up test file
      await supabase.storage.from('avatars').remove([testPath])
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

debugBucketConfig()

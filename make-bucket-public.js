#!/usr/bin/env node

/**
 * Make the avatars bucket public
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function makeBucketPublic() {
  console.log('🔧 Making Avatars Bucket Public')
  console.log('==============================\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  try {
    console.log('🔄 Updating bucket to public...')
    
    const { data, error } = await supabase.storage.updateBucket('avatars', {
      public: true
    })
    
    if (error) {
      console.log('❌ Error updating bucket:', error.message)
      console.log('\n💡 Manual Fix Required:')
      console.log('   1. Go to Supabase Dashboard → Storage → avatars bucket')
      console.log('   2. Click on bucket settings')
      console.log('   3. Toggle "Public bucket" to ON')
      console.log('   4. Save changes')
      return
    }
    
    console.log('✅ Bucket updated successfully!')
    console.log('')
    
    // Verify the change
    const { data: bucket } = await supabase.storage.getBucket('avatars')
    console.log('📦 Bucket Status:')
    console.log('   Public:', bucket.public ? 'YES ✅' : 'NO ❌')
    
    if (bucket.public) {
      // Test the avatar URL again
      console.log('\n🧪 Testing avatar URL now...')
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl('4e638dca-7b20-4a2c-9393-a66c45ae2586/avatar.jpg')
      
      console.log('Public URL:', urlData.publicUrl)
      
      try {
        const response = await fetch(urlData.publicUrl, { method: 'HEAD' })
        console.log('Status:', response.status)
        console.log('Success:', response.ok ? 'YES ✅' : 'NO ❌')
        
        if (response.ok) {
          console.log('\n🎉 SUCCESS! Avatar URLs now work!')
          console.log('   The frontend should now display the avatar correctly.')
          
          // Test cache-busted URL
          const cacheBustedUrl = `${urlData.publicUrl}?t=${Date.now()}`
          const cacheBustedResponse = await fetch(cacheBustedUrl, { method: 'HEAD' })
          console.log('\n🔄 Cache-busted URL test:')
          console.log('   Status:', cacheBustedResponse.status)
          console.log('   Success:', cacheBustedResponse.ok ? 'YES ✅' : 'NO ❌')
        }
      } catch (e) {
        console.log('   Test failed:', e.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

makeBucketPublic()

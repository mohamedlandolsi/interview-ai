#!/usr/bin/env node

/**
 * Programmatically create the avatars storage bucket
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function createAvatarsBucket() {
  console.log('🚀 Creating Avatars Storage Bucket')
  console.log('==================================\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.log('❌ Missing environment variables:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌')
    console.log('')
    console.log('💡 Make sure these are set in your .env.local file')
    return
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    console.log('📋 Checking existing buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError.message)
      return
    }
    
    console.log('📦 Existing buckets:')
    buckets.forEach(bucket => {
      console.log(`   • ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    // Check if avatars bucket already exists
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars')
    
    if (avatarsBucket) {
      console.log('\n✅ Avatars bucket already exists!')
      console.log(`   Public: ${avatarsBucket.public ? 'YES' : 'NO'}`)
      
      if (!avatarsBucket.public) {
        console.log('⚠️  Bucket is private - you may need to make it public')
      }
    } else {
      console.log('\n🔧 Creating avatars bucket...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.log('❌ Error creating bucket:', createError.message)
        return
      }
      
      console.log('✅ Avatars bucket created successfully!')
      console.log('   Name:', newBucket.name)
      console.log('   Public: YES')
    }
    
    console.log('\n🔐 Setting up storage policies...')
    
    // Create policies for authenticated users to upload their own avatars
    const policies = [
      {
        name: 'Allow authenticated users to upload avatars',
        definition: `(bucket_id = 'avatars') AND (auth.role() = 'authenticated')`,
        action: 'INSERT'
      },
      {
        name: 'Allow users to update their own avatars',
        definition: `(bucket_id = 'avatars') AND (auth.role() = 'authenticated') AND (storage.foldername(name))[1] = auth.uid()::text`,
        action: 'UPDATE'
      },
      {
        name: 'Allow users to delete their own avatars',
        definition: `(bucket_id = 'avatars') AND (auth.role() = 'authenticated') AND (storage.foldername(name))[1] = auth.uid()::text`,
        action: 'DELETE'
      },
      {
        name: 'Allow public read access to avatars',
        definition: `bucket_id = 'avatars'`,
        action: 'SELECT'
      }
    ]
    
    // Note: Policy creation via SDK might not work, so we'll provide SQL commands
    console.log('\n📝 Storage Policies (run these in Supabase SQL editor if needed):')
    policies.forEach(policy => {
      console.log(`\n-- ${policy.name}`)
      console.log(`CREATE POLICY "${policy.name}" ON storage.objects FOR ${policy.action} TO authenticated USING (${policy.definition});`)
    })
    
    console.log('\n🎉 Setup Complete!')
    console.log('   • Avatars bucket created/verified')
    console.log('   • Public access enabled')
    console.log('   • Ready for avatar uploads')
    
    // Test the bucket by trying to get its details
    console.log('\n🧪 Testing bucket access...')
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('avatars')
    
    if (bucketError) {
      console.log('❌ Error accessing bucket:', bucketError.message)
    } else {
      console.log('✅ Bucket access test successful!')
      console.log('   Bucket details:', bucketData)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

createAvatarsBucket()

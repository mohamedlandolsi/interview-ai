/**
 * Test script to check Supabase bucket configuration for company-logos
 */

require('dotenv').config({ path: ['.env.local', '.env'] });
const { createClient } = require('@supabase/supabase-js');

async function checkBucketConfig() {
  console.log('🔍 Checking company-logos bucket configuration...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('📂 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public}, created: ${bucket.created_at})`);
    });
    
    // Check if company-logos bucket exists
    const companyLogosBucket = buckets.find(bucket => bucket.name === 'company-logos');
    
    if (!companyLogosBucket) {
      console.log('❌ company-logos bucket does not exist');
      
      // Create the bucket
      console.log('🛠️ Creating company-logos bucket...');
      const { data: createData, error: createError } = await supabase.storage.createBucket('company-logos', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
      } else {
        console.log('✅ company-logos bucket created successfully');
      }
    } else {
      console.log(`✅ company-logos bucket exists (public: ${companyLogosBucket.public})`);
      
      if (!companyLogosBucket.public) {
        console.log('🛠️ Making company-logos bucket public...');
        const { error: updateError } = await supabase.storage.updateBucket('company-logos', {
          public: true
        });
        
        if (updateError) {
          console.error('❌ Error making bucket public:', updateError);
        } else {
          console.log('✅ company-logos bucket is now public');
        }
      }
    }
    
    // Test upload a small file
    console.log('🧪 Testing file upload to company-logos bucket...');
    
    const testFile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGanRaGAAAAABJRU5ErkJggg==', 'base64');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload('test/test-logo.png', testFile, {
        contentType: 'image/png',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
    } else {
      console.log('✅ Upload test successful:', uploadData.path);
      
      // Test public URL generation
      const { data: urlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl('test/test-logo.png');
      
      console.log('🔗 Public URL:', urlData.publicUrl);
      
      // Clean up test file
      await supabase.storage
        .from('company-logos')
        .remove(['test/test-logo.png']);
      
      console.log('🧹 Test file cleaned up');
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  checkBucketConfig().then(() => {
    console.log('✅ Bucket configuration check complete');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { checkBucketConfig };

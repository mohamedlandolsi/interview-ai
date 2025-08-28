import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Not authenticated',
        details: authError?.message
      })
    }

    // Test storage bucket access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    console.log('Available buckets:', buckets)
    console.log('Buckets error:', bucketsError)

    // Test if avatars bucket exists
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars')
    
    // Test listing files in avatars bucket (if it exists)
    let avatarsContent = null
    let avatarsError = null
    
    if (avatarsBucket) {
      const { data, error } = await supabase.storage
        .from('avatars')
        .list(user.id, {
          limit: 10
        })
      avatarsContent = data
      avatarsError = error
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      storage: {
        bucketsAvailable: buckets?.map(b => b.name) || [],
        avatarsBucketExists: !!avatarsBucket,
        avatarsBucket: avatarsBucket,
        userFolderContent: avatarsContent,
        userFolderError: avatarsError
      }
    })

  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Avatar upload API called')
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('User auth check:', { user: user?.id, error: authError })
    
    if (authError || !user) {
      console.log('Unauthorized access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    console.log('File received:', { name: file?.name, size: file?.size, type: file?.type })
    
    if (!file) {
      console.log('No file provided in request')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate file path: user-id/avatar.png (consistent name for easy updates)
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar.${fileExt}`
    const filePath = `${user.id}/${fileName}`
    console.log('Generated file path:', filePath)

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()
    console.log('File converted to buffer, size:', fileBuffer.byteLength)

    // Create service client with service role key to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Upload to Supabase Storage using service role client
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Replace existing file
      })

    console.log('Supabase upload result:', { data: uploadData, error: uploadError })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload avatar: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get the public URL for the uploaded file
    // Using the regular client for public URL generation (this doesn't require RLS)
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    console.log('Generated URL data:', urlData)

    if (!urlData.publicUrl) {
      console.log('Failed to generate public URL')
      return NextResponse.json(
        { error: 'Failed to generate avatar URL' },
        { status: 500 }
      )
    }

    // --- CRITICAL CACHE-BUSTING FIX ---
    // Append a timestamp as a query parameter to bust the browser cache
    // This ensures the browser fetches the new image immediately
    const cacheBustedUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`
    console.log('🔄 Cache-busted URL created:', cacheBustedUrl)

    // Update the user's profile with the cache-busted avatar URL
    console.log('💾 Updating profile in database with cache-busted avatar URL:', cacheBustedUrl)
    console.log('👤 User ID:', user.id)
    
    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: { 
        avatar_url: cacheBustedUrl,
        updated_at: new Date()
      }
    })

    console.log('✅ Profile updated successfully in database:')
    console.log('   - User ID:', updatedProfile.id)
    console.log('   - Avatar URL:', updatedProfile.avatar_url)
    console.log('   - Updated at:', updatedProfile.updated_at)

    // Verify the update by reading it back
    const verifyProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true, avatar_url: true, updated_at: true }
    })
    console.log('🔍 Verification read from database:', verifyProfile)

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatar_url: cacheBustedUrl,
      profile: updatedProfile,
      verification: verifyProfile,
      cache_busted: true,
      timestamp: new Date().getTime()
    })

  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create service client with service role key to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // List files in user's folder to find avatar
    const { data: files, error: listError } = await serviceSupabase.storage
      .from('avatars')
      .list(user.id)

    if (listError) {
      console.error('List error:', listError)
      return NextResponse.json(
        { error: 'Failed to find avatar' },
        { status: 500 }
      )
    }

    // Find avatar file (should start with 'avatar.')
    const avatarFile = files?.find(file => file.name.startsWith('avatar.'))
    
    if (avatarFile) {
      // Delete the file using service client
      const { error: deleteError } = await serviceSupabase.storage
        .from('avatars')
        .remove([`${user.id}/${avatarFile.name}`])

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete avatar' },
          { status: 500 }
        )
      }
    }

    // Update the user's profile to remove avatar URL
    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: { 
        avatar_url: null,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      message: 'Avatar deleted successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error deleting avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

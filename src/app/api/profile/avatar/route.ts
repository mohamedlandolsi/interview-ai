import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
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

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
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
    // For public buckets, we can get the public URL directly
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    console.log('Generated URL data:', urlData)

    // For private buckets, we would need a signed URL instead:
    // const { data: urlData, error: urlError } = await supabase.storage
    //   .from('avatars')
    //   .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year expiry

    if (!urlData.publicUrl) {
      console.log('Failed to generate public URL')
      return NextResponse.json(
        { error: 'Failed to generate avatar URL' },
        { status: 500 }
      )
    }

    // Update the user's profile with the new avatar URL
    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: { 
        avatar_url: urlData.publicUrl,
        updated_at: new Date()
      }
    })

    console.log('Profile updated successfully:', { avatar_url: urlData.publicUrl })

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatar_url: urlData.publicUrl,
      profile: updatedProfile
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

    // List files in user's folder to find avatar
    const { data: files, error: listError } = await supabase.storage
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
      // Delete the file
      const { error: deleteError } = await supabase.storage
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

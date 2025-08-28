import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    // Get user's profile and verify role
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        company: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to upload logo
    if (!profile.role || !['admin', 'hr_manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and HR managers can upload company logos.' },
        { status: 403 }
      )
    }

    // Check if user has a company
    if (!profile.companyId) {
      return NextResponse.json(
        { error: 'No company associated with user' },
        { status: 400 }
      )
    }

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate file path: company-id/logo.extension
    const fileExt = file.name.split('.').pop()
    const fileName = `logo.${fileExt}`
    const filePath = `${profile.companyId}/${fileName}`

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    // Delete existing logo if any
    if (profile.company?.logoUrl) {
      const existingPath = profile.company.logoUrl.split('/').slice(-2).join('/')
      await supabase.storage
        .from('company-logos')
        .remove([existingPath])
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Replace existing file
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload logo: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Generate signed URL for the uploaded file (1 year expiry)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('company-logos')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year

    if (urlError || !urlData.signedUrl) {
      console.error('URL generation error:', urlError)
      return NextResponse.json(
        { error: 'Failed to generate logo URL' },
        { status: 500 }
      )
    }

    // Update the company's logo URL in the database
    const updatedCompany = await prisma.company.update({
      where: { id: profile.companyId },
      data: { 
        logoUrl: urlData.signedUrl,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Company logo uploaded successfully',
      logoUrl: urlData.signedUrl,
      company: updatedCompany
    })

  } catch (error) {
    console.error('Error uploading company logo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
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

    // Get user's profile and verify role
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        company: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete logo
    if (!profile.role || !['admin', 'hr_manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and HR managers can delete company logos.' },
        { status: 403 }
      )
    }

    // Check if user has a company with a logo
    if (!profile.companyId || !profile.company?.logoUrl) {
      return NextResponse.json(
        { error: 'No company logo to delete' },
        { status: 400 }
      )
    }

    // Extract file path from the URL
    const logoUrl = profile.company.logoUrl
    const filePath = `${profile.companyId}/logo.${logoUrl.split('.').pop()?.split('?')[0]}`

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('company-logos')
      .remove([filePath])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      // Continue even if file deletion fails (file might not exist)
    }

    // Update the company to remove logo URL
    const updatedCompany = await prisma.company.update({
      where: { id: profile.companyId },
      data: { 
        logoUrl: null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Company logo deleted successfully',
      company: updatedCompany
    })

  } catch (error) {
    console.error('Error deleting company logo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

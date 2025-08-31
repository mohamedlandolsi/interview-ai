import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Company logo upload API called')
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

    // Get user's profile and verify role
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        company: true
      }
    })

    if (!profile) {
      console.log('Profile not found for user:', user.id)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to upload logo
    if (!profile.role || !['admin', 'hr_manager'].includes(profile.role)) {
      console.log('Insufficient permissions. User role:', profile.role)
      return NextResponse.json(
        { error: 'Insufficient permissions. Only admins and HR managers can upload company logos.' },
        { status: 403 }
      )
    }

    // Check if user has a company
    if (!profile.companyId) {
      console.log('No company associated with user')
      return NextResponse.json(
        { error: 'No company associated with user' },
        { status: 400 }
      )
    }

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('logo') as File
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

    // Generate file path: company-id/logo.extension
    const fileExt = file.name.split('.').pop()
    const fileName = `logo.${fileExt}`
    const filePath = `${profile.companyId}/${fileName}`
    console.log('Generated file path:', filePath)

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()
    console.log('File converted to buffer, size:', fileBuffer.byteLength)

    // Create service client with service role key to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Delete existing logo if any (using service client)
    if (profile.company?.logoUrl) {
      const existingPath = profile.company.logoUrl.split('/').slice(-2).join('/')
      console.log('Deleting existing logo:', existingPath)
      await serviceSupabase.storage
        .from('company-logos')
        .remove([existingPath])
    }

    // Upload to Supabase Storage using service role client
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('company-logos')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true, // Replace existing file
      })

    console.log('Supabase upload result:', { data: uploadData, error: uploadError })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload logo: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get the public URL for the uploaded file
    // Using the regular client for public URL generation (this doesn't require RLS)
    const { data: urlData } = supabase.storage
      .from('company-logos')
      .getPublicUrl(filePath)

    console.log('Generated URL data:', urlData)

    if (!urlData.publicUrl) {
      console.log('Failed to generate public URL')
      return NextResponse.json(
        { error: 'Failed to generate logo URL' },
        { status: 500 }
      )
    }

    // --- CACHE-BUSTING FIX ---
    // Append a timestamp as a query parameter to bust the cache
    const cacheBustedUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`
    console.log('🔄 Cache-busted logo URL created:', cacheBustedUrl)

    // Update the company's logo URL in the database with cache-busted URL
    console.log('💾 Updating company in database with cache-busted logo URL:', cacheBustedUrl)
    console.log('🏢 Company ID:', profile.companyId)
    
    const updatedCompany = await prisma.company.update({
      where: { id: profile.companyId },
      data: { 
        logoUrl: cacheBustedUrl,
        updatedAt: new Date()
      }
    })

    console.log('✅ Company updated successfully in database:')
    console.log('   - Company ID:', updatedCompany.id)
    console.log('   - Logo URL:', updatedCompany.logoUrl)
    console.log('   - Updated at:', updatedCompany.updatedAt)

    return NextResponse.json({
      message: 'Company logo uploaded successfully',
      logoUrl: cacheBustedUrl,
      company: updatedCompany,
      cache_busted: true,
      timestamp: new Date().getTime()
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

    // Create service client with service role key to bypass RLS
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extract file path from the URL
    const logoUrl = profile.company.logoUrl
    const filePath = `${profile.companyId}/logo.${logoUrl.split('.').pop()?.split('?')[0]}`

    // Delete from Supabase Storage using service client
    const { error: deleteError } = await serviceSupabase.storage
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

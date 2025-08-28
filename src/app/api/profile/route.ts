import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createUserProfile, profileExists, getUserProfile } from '@/lib/auth-database'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

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

    // Check if profile already exists
    const exists = await profileExists(user.id)
    if (exists) {
      return NextResponse.json(
        { message: 'Profile already exists', exists: true },
        { status: 200 }
      )
    }

    // Parse the request body for profile data
    const body = await request.json()
    const {
      full_name,
      role = 'interviewer'
    } = body

    // Create the profile
    const profile = await createUserProfile(user.id, {
      email: user.email,
      full_name,
      avatar_url: user.user_metadata?.avatar_url,
      role: role as UserRole
    })

    return NextResponse.json(
      { 
        message: 'Profile created successfully', 
        profile,
        created: true 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get the user's profile
    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found', exists: false },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { profile, exists: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    // Parse the request body
    const body = await request.json()
    const updateData: any = {}

    // Only include fields that are provided in the request
    if (body.full_name !== undefined) updateData.full_name = body.full_name
    if (body.company_name !== undefined) updateData.company_name = body.company_name
    if (body.department !== undefined) updateData.department = body.department
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.timezone !== undefined) updateData.timezone = body.timezone
    if (body.notification_preferences !== undefined) {
      updateData.notification_preferences = body.notification_preferences
    }

    // Always update the timestamp
    updateData.updated_at = new Date()

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { id: user.id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse the request body for profile updates
    const body = await request.json()
    
    // Update the profile using our database function
    const { updateUserProfile } = await import('@/lib/auth-database')
    const updatedProfile = await updateUserProfile(user.id, body)
    
    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Profile updated successfully', 
        profile: updatedProfile 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

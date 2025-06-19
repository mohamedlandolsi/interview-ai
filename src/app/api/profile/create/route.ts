import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createUserProfile } from '@/lib/auth-database'

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

    // Create the profile for the current user
    const profile = await createUserProfile(user.id, {
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      role: 'interviewer' // Default role
    })

    return NextResponse.json(
      { 
        message: 'Profile created successfully', 
        profile 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating profile for current user:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

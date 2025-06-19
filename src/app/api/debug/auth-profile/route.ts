import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getUserProfile } from '@/lib/auth-database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          debug: {
            authError: authError?.message,
            hasUser: !!user
          }
        },
        { status: 401 }
      )
    }

    // Get the user's profile
    const profile = await getUserProfile(user.id)
    
    return NextResponse.json({
      debug: {
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        userId: user.id,
        userEmail: user.email,
        userEmailVerified: !!user.email_confirmed_at,
        profileExists: !!profile,
        profileRole: profile?.role || 'No role',
        profileEmailVerified: profile?.email_verified || false,
        profileOnboardingCompleted: profile?.onboarding_completed || false,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        profile: profile
      }
    })
  } catch (error) {
    console.error('Error in debug route:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}

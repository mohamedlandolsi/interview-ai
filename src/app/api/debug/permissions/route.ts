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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the user's profile
    const profile = await getUserProfile(user.id)
    
    // Define role permissions (same as in usePermissions hook)
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      interviewer: [
        'dashboard:access',
        'interviews:read', 
        'interviews:create', 
        'interviews:update', 
        'interviews:manage',
        'results:read',
        'templates:read',
        'templates:create',
        'templates:update'
      ],
      hr_manager: [
        'dashboard:access',
        'interviews:read', 
        'interviews:create', 
        'interviews:update', 
        'interviews:manage',
        'results:read',
        'templates:read',
        'templates:create',
        'templates:update'
      ],
      user: [
        'dashboard:access',
        'results:read'
      ],
    }

    const userPermissions = rolePermissions[profile?.role || 'user'] || []

    return NextResponse.json(
      { 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          email_confirmed: user.email_confirmed_at !== null
        },
        profile: profile ? {
          id: profile.id,
          full_name: profile.full_name,
          role: profile.role,
          email_verified: profile.email_verified,
          onboarding_completed: profile.onboarding_completed
        } : null,
        permissions: userPermissions,
        hasTemplateAccess: userPermissions.includes('*') || userPermissions.includes('templates:read'),
        hasInterviewAccess: userPermissions.includes('*') || userPermissions.includes('interviews:read'),
        hasDashboardAccess: userPermissions.includes('*') || userPermissions.includes('dashboard:access'),
        hasResultsAccess: userPermissions.includes('*') || userPermissions.includes('results:read')
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error checking permissions:', error)
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    )
  }
}

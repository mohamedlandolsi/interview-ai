import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { verifyAuthentication } from '@/lib/api-auth'
import { getUserProfile } from '@/lib/auth-database'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@prisma/client'

interface AuthenticatedAdminRequest {
  user: User;
  profile: {
    id: string;
    role: UserRole;
    companyId: string;
  };
}

/**
 * Verify that the user is authenticated and has admin permissions
 */
export async function verifyAdminAuth(
  request: NextRequest
): Promise<{ data: AuthenticatedAdminRequest; response: null } | { data: null; response: NextResponse }> {
  // First verify basic authentication
  const authResult = await verifyAuthentication(request);
  
  if (authResult.response) {
    return {
      data: null,
      response: authResult.response
    };
  }

  const user = authResult.user;

  try {
    // Get user profile to check role and company
    const profile = await getUserProfile(user.id);
    
    if (!profile) {
      return {
        data: null,
        response: NextResponse.json(
          { 
            error: 'Profile not found',
            message: 'User profile is required to access integrations'
          },
          { status: 403 }
        )
      };
    }

    if (!profile.companyId) {
      return {
        data: null,
        response: NextResponse.json(
          { 
            error: 'No company association',
            message: 'User must be associated with a company to manage integrations'
          },
          { status: 403 }
        )
      };
    }

    // Check if user has admin privileges
    const adminRoles: UserRole[] = ['admin', 'hr_manager'];
    
    if (!adminRoles.includes(profile.role)) {
      return {
        data: null,
        response: NextResponse.json(
          { 
            error: 'Insufficient permissions',
            message: 'Admin or HR Manager role required to access integrations'
          },
          { status: 403 }
        )
      };
    }

    return {
      data: {
        user,
        profile: {
          id: profile.id,
          role: profile.role,
          companyId: profile.companyId
        }
      },
      response: null
    };

  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return {
      data: null,
      response: NextResponse.json(
        { 
          error: 'Internal error',
          message: 'Failed to verify permissions'
        },
        { status: 500 }
      )
    };
  }
}

/**
 * Higher-order function for admin-protected API routes
 */
export function withAdminAuth<T = any>(
  handler: (request: NextRequest, context: { auth: AuthenticatedAdminRequest } & T) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, context: T = {} as T): Promise<NextResponse> => {
    const authResult = await verifyAdminAuth(request);
    
    if (authResult.response) {
      return authResult.response;
    }

    return handler(request, { 
      auth: authResult.data,
      ...context 
    });
  };
}

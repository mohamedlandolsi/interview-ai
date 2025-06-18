'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthFormState, AuthFormErrors } from '@/types/auth'

/**
 * Hook for handling authentication forms with validation
 */
export function useAuthForm() {
  const [state, setState] = useState<AuthFormState>({
    isLoading: false,
    errors: {},
  })

  const clearErrors = () => {
    setState(prev => ({ ...prev, errors: {} }))
  }

  const setError = (field: keyof AuthFormErrors, message: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: message }
    }))
  }

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }

  const setSuccess = (message: string) => {
    setState(prev => ({ ...prev, success: message, errors: {} }))
  }

  return {
    ...state,
    clearErrors,
    setError,
    setLoading,
    setSuccess,
  }
}

/**
 * Hook for requiring authentication with optional role/permission checks
 */
export function useRequireAuth(options?: {
  requiredRole?: 'admin' | 'interviewer' | 'user'
  requiredPermissions?: string[]
  redirectTo?: string
}) {
  const { user, loading, profile } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      router.push(options?.redirectTo || '/login')
      return
    }

    // Check role requirements
    if (options?.requiredRole && profile?.role !== options.requiredRole) {
      router.push('/unauthorized')
      return
    }

    // For now, we'll just check if user exists and has required role
    // In a real app, you'd implement proper permission checking
    setIsAuthorized(true)
  }, [user, loading, profile, router, options])

  return {
    user,
    profile,
    loading,
    isAuthorized,
  }
}

/**
 * Hook for checking user permissions
 */
export function usePermissions() {
  const { user, profile } = useAuth()
  const hasRole = (role: string): boolean => {
    return profile?.role === role
  }

  const hasPermission = (permission: string): boolean => {
    // In a real app, you'd check against user's actual permissions
    // For now, we'll use role-based checks
    if (!profile?.role) return false

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
      user: [
        'dashboard:access',
        'results:read'
      ],
    }

    const userPermissions = rolePermissions[profile.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  const isAdmin = (): boolean => hasRole('admin')
  const isInterviewer = (): boolean => hasRole('interviewer')
  const isUser = (): boolean => hasRole('user')

  return {
    hasRole,
    hasPermission,
    isAdmin,
    isInterviewer,
    isUser,
    role: profile?.role,
  }
}

import type { Profile } from '@/types/supabase'

/**
 * Hook for managing user profile
 */
export function useUserProfile() {
  const { profile, profileLoading, updateProfile, refreshProfile } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const updateUserProfile = async (updates: Partial<Profile>) => {
    try {
      setIsUpdating(true)
      setUpdateError(null)
      
      const { error } = await updateProfile(updates)
      
      if (error) {
        setUpdateError(error.message || 'Failed to update profile')
        return { success: false, error }
      }
      
      return { success: true, error: null }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile'
      setUpdateError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    profile,
    loading: profileLoading,
    isUpdating,
    updateError,
    updateProfile: updateUserProfile,
    refreshProfile,
    clearError: () => setUpdateError(null),
  }
}

/**
 * Hook for handling authentication redirects
 */
export function useAuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const redirectToLogin = (returnUrl?: string) => {
    const url = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'
    router.push(url)
  }

  const redirectToDashboard = () => {
    router.push('/dashboard')
  }

  const redirectAfterAuth = (returnUrl?: string) => {
    if (returnUrl && returnUrl !== '/login' && returnUrl !== '/register') {
      router.push(returnUrl)
    } else {
      redirectToDashboard()
    }
  }

  return {
    user,
    loading,
    redirectToLogin,
    redirectToDashboard,
    redirectAfterAuth,
  }
}

/**
 * Hook for checking if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, loading } = useAuth()
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  }
}

/**
 * Hook for managing authentication state in forms
 */
export function useAuthState() {
  const { user, session, loading, error } = useAuth()
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      setLastError(error.message)
    }
  }, [error])

  const clearError = () => setLastError(null)

  return {
    user,
    session,
    loading,
    error: lastError,
    clearError,
    isAuthenticated: !!user,
  }
}

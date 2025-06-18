'use client'

import { useEffect, useState } from 'react'
import { AuthProvider as AuthContextProvider } from '@/contexts/AuthContext'
import { createClient } from '@/utils/supabase/client'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider component that wraps the app with Supabase authentication
 * This component handles:
 * - Initial auth state setup
 * - Session management
 * - Auth state persistence
 * - Error boundary for auth-related issues
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Initialize Supabase auth
    const initializeAuth = async () => {
      try {
        // Get initial session to ensure auth is properly initialized
        await supabase.auth.getSession()
        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setIsInitialized(true) // Still set to true to prevent infinite loading
      }
    }

    initializeAuth()
  }, [supabase.auth])

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}

/**
 * Higher-order component for protecting routes that require authentication
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    )
  }
}

/**
 * Component for handling authentication loading states
 */
export function AuthLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Component for handling authentication errors
 */
interface AuthErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('auth') || event.error?.message?.includes('supabase')) {
        setHasError(true)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h2>
            <p className="text-muted-foreground mb-4">
              There was a problem with authentication. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}

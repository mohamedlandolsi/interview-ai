'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import type { Profile } from '@/types/supabase'

// Company interface
interface Company {
  id: string
  name: string
  website?: string | null
  industry?: string | null
  companySize?: string | null
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  logoUrl?: string | null
  createdAt: string
  updatedAt: string
}

// Enhanced user profile interface
interface UserProfile extends SupabaseUser {
  profile?: Profile
  isLoading?: boolean
}

// Define auth context type with enhanced functionality
interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  profile: Profile | null
  company: Company | null
  loading: boolean
  profileLoading: boolean
  error: AuthError | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, options?: { data?: any }) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'github' | 'linkedin') => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  company: null,
  loading: true,
  profileLoading: false,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithOAuth: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  resendVerification: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const supabase = createClient()
  
  // Fetch user profile from database using Prisma
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      setProfileLoading(true)
      
      console.log('🔍 AuthContext: Fetching profile for user:', userId)
      
      // Use our Prisma-based API route to fetch profile
      // Add cache busting to ensure fresh data
      const cacheBuster = new Date().getTime()
      const response = await fetch(`/api/profile?t=${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      })

      console.log('📡 AuthContext: Profile API response status:', response.status)

      if (!response.ok) {
        if (response.status === 404) {
          console.log('👤 AuthContext: Profile not found (404)')
          // Profile doesn't exist yet
          return null
        }
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const data = await response.json()
      const profileData = data.profile || null
      
      console.log('📊 AuthContext: Profile data received:', {
        id: profileData?.id,
        avatar_url: profileData?.avatar_url,
        updated_at: profileData?.updated_at,
        cacheBuster
      })
      
      return profileData
      
    } catch (error) {
      console.error('💥 AuthContext: Error fetching profile:', {
        error,
        userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    } finally {
      setProfileLoading(false)
    }
  }

  // Fetch company data
  const fetchCompany = async (): Promise<Company | null> => {
    try {
      const response = await fetch('/api/company', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No company found, which is valid
          setCompany(null)
          return null
        }
        throw new Error(`Failed to fetch company: ${response.status}`)
      }

      const data = await response.json()
      const companyData = data.company || null
      setCompany(companyData)
      return companyData
    } catch (error) {
      console.error('Error fetching company:', error)
      setCompany(null)
      return null
    }
  }

  // Create user profile in database using Prisma
  const createUserProfile = async (userId: string, email: string, metadata?: any): Promise<{ error: any }> => {
    try {
      const profileData = {
        full_name: metadata?.full_name || null,
        company_name: metadata?.company_name || null,
        role: 'interviewer', // Default role matching database schema
      }      // Use our Prisma-based API route to create profile
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create profile: ${response.status}`)
      }

      const data = await response.json()
      return { error: null }
      
    } catch (error) {
      console.error('Error creating profile:', {
        error,
        userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      return { error }
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    console.log('🔄 AuthContext: Starting profile refresh for user:', user?.id)
    if (user?.id) {
      const profileData = await fetchProfile(user.id)
      console.log('📋 AuthContext: Fetched profile data:', { 
        id: profileData?.id, 
        avatar_url: profileData?.avatar_url,
        updated_at: profileData?.updated_at 
      })
      setProfile(profileData)
      console.log('✅ AuthContext: Profile state updated')
      
      // Also fetch company data
      await fetchCompany()
    } else {
      console.log('❌ AuthContext: No user ID available for profile refresh')
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setError(error)
        } else {
          setSession(session)
          if (session?.user) {
            setUser(session.user as UserProfile)
            // Fetch user profile
            const profileData = await fetchProfile(session.user.id)
            setProfile(profileData)
            // Fetch company data
            await fetchCompany()
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()    // Listen for auth changes
    const {
      data: { subscription },    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email, 'Current path:', window.location.pathname)

      setSession(session)
      setError(null)

      if (session?.user) {
        setUser(session.user as UserProfile)
        
        // Fetch or create profile data when user signs in
        let profileData = await fetchProfile(session.user.id)
        
        // If no profile exists, create one (for new users or after email verification)
        if (!profileData && session.user.email) {
          console.log('Creating new user profile...')
          const { error: createError } = await createUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          )
          
          if (!createError) {
            // Fetch the newly created profile
            profileData = await fetchProfile(session.user.id)
          } else {
            console.error('Failed to create user profile:', createError)
          }
        }

        // Fetch company data
        await fetchCompany()
          // Update email verification status if verified
        if (profileData && session.user.email_confirmed_at && !profileData.email_verified) {
          try {
            const response = await fetch('/api/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email_verified: true
              }),
            })
            
            if (response.ok) {
              // Refresh profile data to get updated verification status
              profileData = await fetchProfile(session.user.id)
              // Also refresh company data
              await fetchCompany()
            }
          } catch (error) {
            console.error('Failed to update email verification status:', error)
          }
        }
        
        setProfile(profileData)
      } else {
        setUser(null)
        setProfile(null)
        setCompany(null)
      }

      setLoading(false)      // Handle different auth events
      switch (event) {        case 'SIGNED_IN':
          // Only redirect on actual sign-in from auth pages (not session restoration or from homepage)
          // Check if this is coming from a login page
          const currentPath = window.location.pathname
          const isOnAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath)
          
          console.log('SIGNED_IN event - currentPath:', currentPath, 'isOnAuthPage:', isOnAuthPage)
          
          // Only redirect if we're on an auth page AND user is confirmed
          if (session?.user && session.user.email_confirmed_at && isOnAuthPage) {
            console.log('Redirecting to dashboard from SIGNED_IN event')
            router.push('/dashboard')
          } else {
            console.log('Not redirecting - either not on auth page or user not confirmed')
          }
          break
        case 'SIGNED_OUT':
          // Redirect to login after sign out
          router.push('/login')
          break
        case 'TOKEN_REFRESHED':
          // Session was refreshed - don't redirect
          break
        case 'USER_UPDATED':
          // User data was updated, refresh profile
          if (session?.user) {
            await refreshProfile()
          }
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (err: any) {
      const error = err as AuthError
      setError(error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, options?: { data?: any }) => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options,
      })
      return { error }
    } catch (err: any) {
      const error = err as AuthError
      setError(error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with OAuth
  const signInWithOAuth = async (provider: 'google' | 'github' | 'linkedin') => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      return { error }
    } catch (err: any) {
      const error = err as AuthError
      setError(error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (err: any) {
      const error = err as AuthError
      setError(error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (err: any) {
      const error = err as AuthError
      setError(error)
      return { error }
    }
  }

  // Resend email verification
  const resendVerification = async (email: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        }
      })
      return { error }
    } catch (err: any) {
      const error = err as AuthError
      setError(error)
      return { error }
    }
  }
  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setProfileLoading(true)
      if (!user?.id) {
        return { error: new Error('No user logged in') }
      }

      // Use our Prisma-based API route to update profile
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update profile: ${response.status}`)
      }

      // Refresh profile data
      await refreshProfile()

      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setProfileLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    company,
    loading,
    profileLoading,
    error,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    resendVerification,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook for requiring authentication
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  return { user, loading }
}

// Hook for accessing user profile
export function useProfile() {
  const { profile, profileLoading, updateProfile, refreshProfile } = useAuth()
  return { profile, profileLoading, updateProfile, refreshProfile }
}

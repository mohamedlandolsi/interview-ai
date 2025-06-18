import type { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js'
import type { Profile } from './supabase'

// Enhanced auth-related interfaces

/**
 * Extended user interface that includes profile data
 */
export interface AuthUser extends SupabaseUser {
  profile?: Profile
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

/**
 * Profile state interface
 */
export interface ProfileState {
  profile: Profile | null
  loading: boolean
  error: any
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string
  password: string
}

/**
 * Sign up credentials with optional metadata
 */
export interface SignUpCredentials {
  email: string
  password: string
  options?: {
    data?: {
      full_name?: string
      avatar_url?: string
      company_name?: string
      role?: 'admin' | 'interviewer' | 'user'
    }
  }
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'linkedin' | 'microsoft'

/**
 * Authentication method response
 */
export interface AuthResponse {
  error: AuthError | null
  data?: {
    user?: AuthUser
    session?: Session
  }
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  full_name?: string
  avatar_url?: string
  company_id?: string
  role?: 'admin' | 'interviewer' | 'user'
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  email: string
  redirectTo?: string
}

/**
 * Auth form validation errors
 */
export interface AuthFormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  fullName?: string
  general?: string
}

/**
 * Auth form state
 */
export interface AuthFormState {
  isLoading: boolean
  errors: AuthFormErrors
  success?: string
}

/**
 * User session data with additional context
 */
export interface ExtendedSession extends Session {
  profile?: Profile
  permissions?: string[]
  company?: {
    id: string
    name: string
    role: string
  }
}

/**
 * Authentication event types
 */
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT' 
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'

/**
 * Authentication event handler
 */
export interface AuthEventHandler {
  event: AuthEvent
  session: Session | null
  user: AuthUser | null
}

/**
 * Role-based access control
 */
export interface RolePermissions {
  admin: string[]
  interviewer: string[]
  user: string[]
}

/**
 * Company membership data
 */
export interface CompanyMembership {
  company_id: string
  user_id: string
  role: 'admin' | 'interviewer' | 'user'
  permissions: string[]
  created_at: string
  updated_at: string
}

/**
 * Auth hook return type
 */
export interface UseAuthReturn {
  // User and session data
  user: AuthUser | null
  session: Session | null
  profile: Profile | null
  
  // Loading states
  loading: boolean
  profileLoading: boolean
  
  // Error state
  error: AuthError | null
  
  // Authentication methods
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>
  signInWithOAuth: (provider: OAuthProvider) => Promise<AuthResponse>
  signOut: () => Promise<AuthResponse>
  resetPassword: (data: PasswordResetData) => Promise<AuthResponse>
  
  // Profile methods
  updateProfile: (updates: ProfileUpdateData) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
  
  // Utility methods
  isAuthenticated: boolean
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

/**
 * Protected route props
 */
export interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'interviewer' | 'user'
  requiredPermissions?: string[]
  fallback?: React.ReactNode
  redirectTo?: string
  loadingMessage?: string
  showAccessRequirements?: boolean
}

/**
 * Auth guard configuration
 */
export interface AuthGuardConfig {
  requireAuth?: boolean
  requiredRole?: string
  requiredPermissions?: string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * Dashboard layout props
 */
export interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Dashboard header props
 */
export interface DashboardHeaderProps {
  onMenuClick?: () => void
}

/**
 * Dashboard sidebar props
 */
export interface DashboardSidebarProps {
  className?: string
  onClose?: () => void
}

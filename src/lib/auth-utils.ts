import { AuthError } from '@supabase/supabase-js'

/**
 * Utility functions for authentication error handling and user feedback
 */

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  EMAIL_NOT_CONFIRMED: 'Please check your email and click the confirmation link before signing in.',
  TOO_MANY_REQUESTS: 'Too many requests. Please wait a few minutes before trying again.',
  USER_NOT_FOUND: 'No account found with this email address.',
  EMAIL_RATE_LIMIT: 'Too many emails sent. Please wait before requesting another.',
  WEAK_PASSWORD: 'Password does not meet security requirements. Please choose a stronger password.',
  SIGNUP_DISABLED: 'New registrations are currently disabled.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_MISMATCH: "Passwords don't match.",
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
} as const

/**
 * Maps Supabase auth errors to user-friendly messages
 */
export function getAuthErrorMessage(error: AuthError | Error | null): string {
  if (!error) return ''

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
  }
  
  if (message.includes('email not confirmed')) {
    return AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED
  }
  
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS
  }
  
  if (message.includes('user not found')) {
    return AUTH_ERROR_MESSAGES.USER_NOT_FOUND
  }
  
  if (message.includes('email rate limit exceeded')) {
    return AUTH_ERROR_MESSAGES.EMAIL_RATE_LIMIT
  }
  
  if (message.includes('password should be at least') || message.includes('weak password')) {
    return AUTH_ERROR_MESSAGES.WEAK_PASSWORD
  }
  
  if (message.includes('signups not allowed')) {
    return AUTH_ERROR_MESSAGES.SIGNUP_DISABLED
  }
  
  if (message.includes('invalid email')) {
    return AUTH_ERROR_MESSAGES.INVALID_EMAIL
  }
  
  if (message.includes('unable to validate') || message.includes('session expired')) {
    return AUTH_ERROR_MESSAGES.SESSION_EXPIRED
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return AUTH_ERROR_MESSAGES.NETWORK_ERROR
  }

  // Return the original message if we can't map it
  return error.message || AUTH_ERROR_MESSAGES.GENERIC_ERROR
}

/**
 * Password validation utilities
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  let strengthScore = 0

  // Length check
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  } else {
    strengthScore += 1
  }

  // Uppercase check
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    strengthScore += 1
  }

  // Lowercase check
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    strengthScore += 1
  }

  // Numbers check
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    strengthScore += 1
  }

  // Special characters check
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else {
    strengthScore += 1
  }

  // Additional strength checks
  if (password.length >= 12) strengthScore += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strengthScore += 1

  const strength = strengthScore >= 6 ? 'strong' : strengthScore >= 4 ? 'medium' : 'weak'

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

/**
 * Email validation utility
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generates redirect URLs for auth flows
 */
export function getAuthRedirectURL(type: 'reset-password' | 'verify-email' | 'signup'): string {
  const baseURL = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  switch (type) {
    case 'reset-password':
      return `${baseURL}/reset-password`
    case 'verify-email':
      return `${baseURL}/verify-email`
    case 'signup':
      return `${baseURL}/dashboard`
    default:
      return baseURL
  }
}

/**
 * Extracts and parses auth tokens from URL parameters
 */
export function parseAuthTokensFromURL(): {
  accessToken: string | null
  refreshToken: string | null
  type: string | null
  tokenHash: string | null
} {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      type: null,
      tokenHash: null,
    }
  }

  const params = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  
  return {
    accessToken: params.get('access_token') || hash.get('access_token'),
    refreshToken: params.get('refresh_token') || hash.get('refresh_token'),
    type: params.get('type') || hash.get('type'),
    tokenHash: params.get('token_hash') || params.get('token') || hash.get('token_hash'),
  }
}

/**
 * Clears auth tokens from URL without triggering a page reload
 */
export function clearAuthTokensFromURL(): void {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  
  // Remove auth-related parameters
  url.searchParams.delete('access_token')
  url.searchParams.delete('refresh_token')
  url.searchParams.delete('type')
  url.searchParams.delete('token_hash')
  url.searchParams.delete('token')
  
  // Clear hash if it contains auth tokens
  if (url.hash.includes('access_token') || url.hash.includes('refresh_token')) {
    url.hash = ''
  }
  
  // Update URL without reloading
  window.history.replaceState({}, '', url.toString())
}

/**
 * Formats auth success/error messages for display
 */
export function formatAuthMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): {
  message: string
  type: 'success' | 'error' | 'info'
} {
  return {
    message: message.charAt(0).toUpperCase() + message.slice(1),
    type,
  }
}

/**
 * Checks if user needs email verification
 */
export function needsEmailVerification(user: any): boolean {
  return user && !user.email_confirmed_at
}

/**
 * Checks if user session is valid
 */
export function isValidSession(session: any): boolean {
  if (!session) return false
  
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = session.expires_at
  
  return expiresAt > now
}

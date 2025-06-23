/**
 * Utility functions for URL generation
 */

/**
 * Gets the base URL for the application
 * Prioritizes:
 * 1. NEXT_PUBLIC_APP_URL (explicitly set)
 * 2. VERCEL_URL (automatically set by Vercel)
 * 3. Production URL (fallback for Vercel deployments)
 * 4. localhost (development fallback)
 */
export function getBaseUrl(): string {
  // For client-side, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // For server-side, check environment variables
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Production fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://interq.vercel.app'
  }

  // Development fallback
  return 'http://localhost:3000'
}

/**
 * Generates a full URL from a path
 */
export function getFullUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Generates interview link
 */
export function getInterviewLink(sessionId: string): string {
  return getFullUrl(`/interview/${sessionId}`)
}

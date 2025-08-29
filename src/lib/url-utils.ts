/**
 * Utility functions for URL generation
 */

/**
 * Gets the base URL for the application
 * Uses specific domains based on environment:
 * - Development: http://localhost:3000
 * - Production: https://interq.vercel.app
 */
export function getBaseUrl(): string {
  // For client-side, determine based on environment
  if (typeof window !== 'undefined') {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3000'
    }
    // In production, use the specific domain
    return 'https://interq.vercel.app'
  }

  // For server-side, check environment variables first, then fallback to our specific domains
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // In production, always use the specific domain unless explicitly overridden
  if (process.env.NODE_ENV === 'production') {
    return 'https://interq.vercel.app'
  }

  // Only use VERCEL_URL in development/preview environments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
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

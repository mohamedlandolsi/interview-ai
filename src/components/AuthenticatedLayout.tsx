"use client"

import { EmailVerificationBanner } from "@/components/EmailVerificationBanner"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  showEmailBanner?: boolean
}

/**
 * Layout component for authenticated pages that includes:
 * - Email verification banner (if email not verified)
 * - Consistent authenticated page structure
 */
export function AuthenticatedLayout({ 
  children, 
  showEmailBanner = true 
}: AuthenticatedLayoutProps) {
  return (
    <>
      {showEmailBanner && <EmailVerificationBanner />}
      {children}
    </>
  )
}

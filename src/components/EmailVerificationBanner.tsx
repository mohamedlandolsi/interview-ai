"use client"

import { useState } from "react"
import { X, Mail, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

interface EmailVerificationBannerProps {
  show?: boolean
  onDismiss?: () => void
}

export function EmailVerificationBanner({ show = true, onDismiss }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [isDismissed, setIsDismissed] = useState(false)
  const { user, resendVerification } = useAuth()

  // Don't show if dismissed, user doesn't exist, or email is already verified
  if (isDismissed || !show || !user || user.email_confirmed_at) {
    return null
  }

  const handleResend = async () => {
    if (!user.email) return

    setIsResending(true)
    setResendMessage("")

    try {
      const { error } = await resendVerification(user.email)
      
      if (error) {
        if (error.message.includes('rate limit')) {
          setResendMessage("Please wait a few minutes before requesting another email.")
        } else {
          setResendMessage(error.message || "Failed to resend verification email.")
        }
      } else {
        setResendMessage("Verification email sent! Check your inbox and spam folder.")
      }
    } catch (error) {
      setResendMessage("Failed to resend verification email.")
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <div className="border-b bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-medium">Email not verified.</span>{" "}
                  Please check your email and click the verification link to access all features.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="text-yellow-800 border-yellow-300 hover:bg-yellow-100 dark:text-yellow-200 dark:border-yellow-600 dark:hover:bg-yellow-900/30"
              >
                {isResending ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-1" />
                    Resend Email
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {resendMessage && (
            <div className="mt-2">
              <Alert
                variant={resendMessage.includes('sent') ? 'default' : 'destructive'}
                className="py-2"
              >
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {resendMessage}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2, Mail, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

type VerificationStatus = 'loading' | 'success' | 'error' | 'already_verified'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [error, setError] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user, refreshProfile } = useAuth()

  // Handle email verification on component mount
  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')

      // If no verification parameters, show general verification status
      if (!token && !accessToken && !type) {
        if (user?.email_confirmed_at) {
          setStatus('already_verified')
        } else {
          setStatus('error')
          setError("No verification token found. Please check your email for the verification link.")
        }
        return
      }

      try {
        // Handle token-based verification (older method)
        if (token && type === 'signup') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })

          if (verifyError) {
            setStatus('error')
            if (verifyError.message.includes('expired')) {
              setError("The verification link has expired. Please request a new one.")
            } else if (verifyError.message.includes('invalid')) {
              setError("The verification link is invalid. Please request a new one.")
            } else {
              setError(verifyError.message || "Failed to verify email. Please try again.")
            }
          } else {
            setStatus('success')
            await refreshProfile()
          }
        }
        // Handle session-based verification (newer method)
        else if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            setStatus('error')
            setError("Failed to verify email. The link may be invalid or expired.")
          } else if (data.user?.email_confirmed_at) {
            setStatus('success')
            await refreshProfile()
          } else {
            setStatus('error')
            setError("Email verification incomplete. Please try again.")
          }
        }
        else {
          setStatus('error')
          setError("Invalid verification link. Please check your email for the correct link.")
        }
      } catch (error) {
        console.error("Email verification error:", error)
        setStatus('error')
        setError("Something went wrong during verification. Please try again.")
      }
    }

    handleEmailVerification()
  }, [searchParams, supabase.auth, user, refreshProfile])

  const handleResendVerification = async () => {
    if (!user?.email) {
      setResendMessage("Unable to resend verification email. Please sign in again.")
      return
    }

    setIsResending(true)
    setResendMessage("")

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          setResendMessage("Please wait a few minutes before requesting another verification email.")
        } else {
          setResendMessage(error.message || "Failed to resend verification email.")
        }
      } else {
        setResendMessage("Verification email sent! Please check your inbox and spam folder.")
      }
    } catch (error) {
      console.error("Resend verification error:", error)
      setResendMessage("Failed to resend verification email. Please try again later.")
    } finally {
      setIsResending(false)
    }
  }

  const handleContinueToDashboard = () => {
    router.push('/dashboard')
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now access all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleContinueToDashboard} className="w-full">
              Continue to Dashboard
            </Button>
            
            <div className="text-center">
              <Link href="/login">
                <Button variant="ghost" className="text-sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Already verified state
  if (status === 'already_verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Already Verified</CardTitle>
            <CardDescription>
              Your email is already verified. You have full access to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleContinueToDashboard} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
          <CardDescription>
            We couldn&apos;t verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resendMessage && (
            <Alert variant={resendMessage.includes('sent') ? 'default' : 'destructive'}>
              <Mail className="h-4 w-4" />
              <AlertDescription>{resendMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {user?.email && (
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            )}

            <Button onClick={handleBackToLogin} variant="default" className="w-full">
              Back to Sign In
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

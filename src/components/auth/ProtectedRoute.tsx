'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ShieldX, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { ProtectedRouteProps } from '@/types/auth'

/**
 * Loading spinner component for auth checks
 */
function AuthLoadingSpinner({ message = "Checking authentication..." }: { message?: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0
        return prev + 10
      })
    }, 100)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <CardTitle>Authentication Check</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Please wait while we verify your access...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Unauthorized access component
 */
function UnauthorizedAccess({ 
  requiredRole, 
  requiredPermissions, 
  userRole,
  onRetry,
  onGoBack 
}: {
  requiredRole?: string
  requiredPermissions?: string[]
  userRole?: string
  onRetry?: () => void
  onGoBack?: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Access Denied</CardTitle>          <CardDescription>
            You don&apos;t have the required permissions to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show access requirements */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Access Requirements:</h4>
            {requiredRole && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Required Role</Badge>
                <span className="text-sm">{requiredRole}</span>
              </div>
            )}
            {requiredPermissions && requiredPermissions.length > 0 && (
              <div className="space-y-1">
                <Badge variant="outline">Required Permissions</Badge>
                <ul className="text-sm text-muted-foreground ml-4">
                  {requiredPermissions.map(permission => (
                    <li key={permission}>• {permission}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Show current user role */}
          {userRole && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Your Role</Badge>
              <span className="text-sm">{userRole}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            {onGoBack && (
              <Button variant="outline" onClick={onGoBack} className="flex-1">
                Go Back
              </Button>
            )}
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Authentication error component
 */
function AuthError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Authentication Error</CardTitle>
          <CardDescription>
            An error occurred while checking your authentication status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="flex-1"
            >
              Refresh Page
            </Button>
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * ProtectedRoute component for securing pages based on authentication and authorization
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions = [],
  fallback,
  redirectTo = '/login',
  loadingMessage,
  showAccessRequirements = true
}: ProtectedRouteProps & {
  loadingMessage?: string
  showAccessRequirements?: boolean
}) {
  const { user, loading, error } = useAuth()
  const { hasRole, hasPermission, role } = usePermissions()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true)
        setAuthError(null)

        // Wait for loading to complete
        if (loading) return

        // Check if user is authenticated
        if (!user) {
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
          router.push(`${redirectTo}?returnUrl=${returnUrl}`)
          return
        }

        // Check role requirements
        if (requiredRole && !hasRole(requiredRole)) {
          // Don't redirect immediately, show access denied
          setIsChecking(false)
          return
        }

        // Check permission requirements
        if (requiredPermissions.length > 0) {
          const hasAllPermissions = requiredPermissions.every(permission => 
            hasPermission(permission)
          )
          
          if (!hasAllPermissions) {
            // Don't redirect immediately, show access denied
            setIsChecking(false)
            return
          }
        }

        // All checks passed
        setIsChecking(false)
      } catch (err: any) {
        setAuthError(err.message || 'Authentication check failed')
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [user, loading, hasRole, hasPermission, requiredRole, requiredPermissions, router, redirectTo])

  // Show loading state
  if (loading || isChecking) {
    return <AuthLoadingSpinner message={loadingMessage} />
  }

  // Show authentication error
  if (authError) {
    return (
      <AuthError 
        error={authError} 
        onRetry={() => {
          setAuthError(null)
          setIsChecking(true)
        }}
      />
    )
  }

  // Show global auth error
  if (error) {
    return <AuthError error={error.message} />
  }

  // User not authenticated (shouldn't reach here due to redirect, but safety check)
  if (!user) {
    return fallback || <AuthLoadingSpinner message="Redirecting to login..." />
  }

  // Check authorization
  const hasRequiredRole = !requiredRole || hasRole(requiredRole)
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission))

  if (!hasRequiredRole || !hasRequiredPermissions) {    return (
      <UnauthorizedAccess
        requiredRole={requiredRole}
        requiredPermissions={showAccessRequirements ? requiredPermissions : undefined}
        userRole={role || undefined}
        onRetry={() => {
          setIsChecking(true)
          // Refresh user data
          window.location.reload()
        }}
        onGoBack={() => router.back()}
      />
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

/**
 * Higher-order component for protecting pages
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'> & {
    loadingMessage?: string
    showAccessRequirements?: boolean
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Role-based conditional rendering component with enhanced UI
 */
interface RoleGateProps {
  children: React.ReactNode
  allowedRoles?: string[]
  requiredPermissions?: string[]
  fallback?: React.ReactNode
  mode?: 'show' | 'hide'
  showAccessDenied?: boolean
}

export function RoleGate({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
  mode = 'show',
  showAccessDenied = false
}: RoleGateProps) {
  const { hasRole, hasPermission, role } = usePermissions()

  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.some(role => hasRole(role))
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission))
  
  const isAuthorized = hasRequiredRole && hasRequiredPermissions

  if (mode === 'hide') {
    return isAuthorized ? fallback : <>{children}</>
  }

  if (!isAuthorized && showAccessDenied) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldX className="h-4 w-4" />
            <span className="text-sm">Access denied</span>
          </div>
          {allowedRoles.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Required roles: {allowedRoles.join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return isAuthorized ? <>{children}</> : fallback
}

/**
 * Dashboard route wrapper - specifically for dashboard pages
 */
export function DashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredPermissions={['dashboard:access']}
      loadingMessage="Loading dashboard..."
      showAccessRequirements={true}
    >
      {children}
    </ProtectedRoute>
  )
}

/**
 * Admin route wrapper - for admin-only pages
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredRole="admin"
      loadingMessage="Verifying admin access..."
      showAccessRequirements={true}
    >
      {children}
    </ProtectedRoute>
  )
}

/**
 * Interviewer route wrapper - for interviewer and admin access
 */
export function InterviewerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute
      requiredPermissions={['interviews:manage']}
      loadingMessage="Verifying interviewer access..."
      showAccessRequirements={true}
    >
      {children}
    </ProtectedRoute>
  )
}

/**
 * Standalone unauthorized page component
 */
export function UnauthorizedPage() {
  const router = useRouter()

  return (
    <UnauthorizedAccess
      onGoBack={() => router.back()}
      onRetry={() => window.location.reload()}
    />
  )
}

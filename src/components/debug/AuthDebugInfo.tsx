import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AuthDebugInfo() {
  const { user, profile, loading, profileLoading } = useAuth()
  const { hasPermission, role } = usePermissions()

  if (loading || profileLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Loading Auth Debug Info...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Auth Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">User Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>Email Verified:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Profile Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Profile Exists:</strong> {profile ? 'Yes' : 'No'}</p>
            <p><strong>Full Name:</strong> {profile?.full_name || 'Not set'}</p>
            <p><strong>Role:</strong> {profile?.role || 'Not set'}</p>
            <p><strong>Email Verified in Profile:</strong> {profile?.email_verified ? 'Yes' : 'No'}</p>
            <p><strong>Onboarding Completed:</strong> {profile?.onboarding_completed ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Permission Information</h3>
          <div className="text-sm space-y-1">
            <p><strong>Current Role:</strong> <Badge variant="outline">{role || 'None'}</Badge></p>
            <p><strong>Has templates:read:</strong> 
              <Badge variant={hasPermission('templates:read') ? 'default' : 'destructive'}>
                {hasPermission('templates:read') ? 'Yes' : 'No'}
              </Badge>
            </p>
            <p><strong>Has dashboard:access:</strong>
              <Badge variant={hasPermission('dashboard:access') ? 'default' : 'destructive'}>
                {hasPermission('dashboard:access') ? 'Yes' : 'No'}
              </Badge>
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Environment</h3>
          <div className="text-sm space-y-1">
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>VERCEL_ENV:</strong> {process.env.NEXT_PUBLIC_VERCEL_ENV || 'Not set'}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Raw Profile Data</h3>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

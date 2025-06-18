"use client"

import { useAuth } from "@/contexts/AuthContext"
import { usePermissions } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const { user, profile, loading } = useAuth()
  const { hasRole, hasPermission, role } = usePermissions()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Authentication Debug</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Data</CardTitle>
          <CardDescription>Raw user object from Supabase Auth</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
          <CardDescription>Profile data from profiles table</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Checks</CardTitle>
          <CardDescription>Results of permission and role checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>Role from usePermissions: <strong>{role || 'No role'}</strong></div>
          <div>Has 'interviewer' role: <strong>{hasRole('interviewer') ? 'Yes' : 'No'}</strong></div>
          <div>Has 'dashboard:access' permission: <strong>{hasPermission('dashboard:access') ? 'Yes' : 'No'}</strong></div>
          <div>Has 'interviews:manage' permission: <strong>{hasPermission('interviews:manage') ? 'Yes' : 'No'}</strong></div>
        </CardContent>
      </Card>
    </div>
  )
}

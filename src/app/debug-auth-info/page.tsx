"use client"

import { AuthDebugInfo } from '@/components/debug/AuthDebugInfo'
import { DashboardLayout } from '@/components/Layout'

export default function AuthDebugPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
        <p className="text-muted-foreground mb-6">
          This page shows detailed authentication and permission information to help debug access issues.
        </p>
        <AuthDebugInfo />
      </div>
    </DashboardLayout>
  )
}

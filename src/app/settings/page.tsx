'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { CompanySettings } from '@/components/settings/CompanySettings'
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings'
import { NotificationsSettings } from '@/components/settings/NotificationsSettings'
import { BillingSettings } from '@/components/settings/BillingSettings'
import { 
  User, 
  Building2, 
  Plug, 
  Bell, 
  CreditCard 
} from 'lucide-react'
import { DashboardLayout } from '@/components/Layout'
import { DashboardRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { profile } = useAuth()
  
  // Check if user is admin
  const isAdmin = profile?.role === 'admin'

  // Redirect non-admin users away from integrations tab
  useEffect(() => {
    if (!isAdmin && activeTab === 'integrations') {
      setActiveTab('profile')
    }
  }, [isAdmin, activeTab])
  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid w-full gap-2 sm:gap-0 ${isAdmin ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="integrations" className="flex items-center gap-2 text-sm">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <CompanySettings />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="integrations" className="space-y-4">
            <IntegrationsSettings />
          </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsSettings />
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <BillingSettings />
        </TabsContent>
      </Tabs>
        </div>
      </DashboardLayout>
    </DashboardRoute>
  )
}

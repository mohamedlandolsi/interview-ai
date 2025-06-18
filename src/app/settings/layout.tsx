import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute
      requiredPermissions={['dashboard:access']}
      loadingMessage="Loading settings dashboard..."
      showAccessRequirements={true}
    >
      {children}
    </ProtectedRoute>
  )
}

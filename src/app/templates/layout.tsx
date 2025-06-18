import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute
      requiredPermissions={['templates:read']}
      loadingMessage="Loading templates dashboard..."
      showAccessRequirements={true}
    >
      {children}
    </ProtectedRoute>
  )
}

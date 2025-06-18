import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute
      requiredPermissions={['results:read']}
      loadingMessage="Loading results dashboard..."
      showAccessRequirements={true}
    >
      {children}
    </ProtectedRoute>
  )
}

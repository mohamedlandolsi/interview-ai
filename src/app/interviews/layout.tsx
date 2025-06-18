import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function InterviewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute
      requiredPermissions={['interviews:read']}
      loadingMessage="Loading interviews dashboard..."
      showAccessRequirements={true}
    >
      {children}
    </ProtectedRoute>
  )
}

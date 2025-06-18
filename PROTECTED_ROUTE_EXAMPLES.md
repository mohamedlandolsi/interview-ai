# Protected Route Usage Examples

This document demonstrates how to use the enhanced ProtectedRoute system with shadcn/ui components.

## Basic Usage

### 1. Basic Authentication Protection

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### 2. Role-Based Protection

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function AdminPanel() {
  return (
    <ProtectedRoute 
      requiredRole="admin"
      loadingMessage="Verifying admin access..."
    >
      <div>Admin-only content</div>
    </ProtectedRoute>
  )
}
```

### 3. Permission-Based Protection

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function InterviewManager() {
  return (
    <ProtectedRoute 
      requiredPermissions={['interviews:create', 'interviews:update']}
      loadingMessage="Checking interview management permissions..."
      showAccessRequirements={true}
    >
      <div>Interview management interface</div>
    </ProtectedRoute>
  )
}
```

## Specialized Route Wrappers

### Dashboard Route
```tsx
import { DashboardRoute } from '@/components/auth/ProtectedRoute'

function Dashboard() {
  return (
    <DashboardRoute>
      <div>Dashboard content - requires dashboard:access permission</div>
    </DashboardRoute>
  )
}
```

### Admin Route
```tsx
import { AdminRoute } from '@/components/auth/ProtectedRoute'

function AdminSettings() {
  return (
    <AdminRoute>
      <div>Admin settings - requires admin role</div>
    </AdminRoute>
  )
}
```

### Interviewer Route
```tsx
import { InterviewerRoute } from '@/components/auth/ProtectedRoute'

function InterviewCreation() {
  return (
    <InterviewerRoute>
      <div>Interview creation - requires interviews:manage permission</div>
    </InterviewerRoute>
  )
}
```

## Higher-Order Component Pattern

```tsx
import { withProtectedRoute } from '@/components/auth/ProtectedRoute'

const ProtectedDashboard = withProtectedRoute(DashboardComponent, {
  requiredPermissions: ['dashboard:access'],
  loadingMessage: 'Loading dashboard...',
  showAccessRequirements: true
})

export default ProtectedDashboard
```

## Component-Level Protection with RoleGate

### Basic Usage
```tsx
import { RoleGate } from '@/components/auth/ProtectedRoute'

function ConditionalContent() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <RoleGate allowedRoles={['admin', 'interviewer']}>
        <button>Create Interview</button>
      </RoleGate>
      
      <RoleGate requiredPermissions={['results:read']}>
        <div>Results section</div>
      </RoleGate>
      
      <RoleGate 
        allowedRoles={['admin']} 
        fallback={<div>Access restricted</div>}
      >
        <div>Admin tools</div>
      </RoleGate>
    </div>
  )
}
```

### With Access Denied Messages
```tsx
import { RoleGate } from '@/components/auth/ProtectedRoute'

function ConditionalContentWithFeedback() {
  return (
    <div>
      <RoleGate 
        allowedRoles={['admin']}
        showAccessDenied={true}
      >
        <div>Admin-only feature</div>
      </RoleGate>
    </div>
  )
}
```

## Layout Integration

### Dashboard Layout with Protection
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute
      requiredPermissions={['dashboard:access']}
      loadingMessage="Loading dashboard..."
      showAccessRequirements={true}
    >
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

## Custom Fallback Components

### Loading States
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function CustomLoadingFallback() {
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function PageWithCustomLoading() {
  return (
    <ProtectedRoute fallback={<CustomLoadingFallback />}>
      <div>Protected content</div>
    </ProtectedRoute>
  )
}
```

## Error Handling

The ProtectedRoute component automatically handles:

1. **Authentication errors** - Shows user-friendly error messages
2. **Loading states** - Displays animated loading spinners with progress
3. **Access denied** - Shows detailed access requirements and current user role
4. **Retry functionality** - Allows users to retry authentication checks

## Permission System

### Available Permissions

```typescript
// Admin permissions
'*' // All permissions

// Dashboard permissions  
'dashboard:access'

// Interview permissions
'interviews:read'
'interviews:create' 
'interviews:update'
'interviews:manage'

// Results permissions
'results:read'

// Template permissions
'templates:read'
'templates:create'
'templates:update'
```

### Role Hierarchy

```typescript
admin: ['*'] // All permissions
interviewer: [
  'dashboard:access',
  'interviews:read', 
  'interviews:create', 
  'interviews:update', 
  'interviews:manage',
  'results:read',
  'templates:read',
  'templates:create',
  'templates:update'
]
user: [
  'dashboard:access',
  'results:read'
]
```

## Best Practices

### 1. Layout-Level Protection
Protect entire sections at the layout level:

```tsx
// app/admin/layout.tsx
import { AdminRoute } from '@/components/auth/ProtectedRoute'

export default function AdminLayout({ children }) {
  return (
    <AdminRoute>
      <AdminNavigation />
      {children}
    </AdminRoute>
  )
}
```

### 2. Progressive Enhancement
Use RoleGate for feature flags:

```tsx
function FeatureSection() {
  return (
    <div>
      <h2>Available Features</h2>
      
      <RoleGate allowedRoles={['admin', 'interviewer']}>
        <FeatureCard title="Interview Management" />
      </RoleGate>
      
      <RoleGate allowedRoles={['admin']}>
        <FeatureCard title="User Management" />
      </RoleGate>
      
      <FeatureCard title="View Results" /> {/* Available to all */}
    </div>
  )
}
```

### 3. Loading State Management
Always provide meaningful loading messages:

```tsx
<ProtectedRoute
  requiredRole="interviewer"
  loadingMessage="Verifying interviewer credentials..."
  showAccessRequirements={true}
>
  <InterviewInterface />
</ProtectedRoute>
```

### 4. Error Recovery
Handle authentication failures gracefully:

```tsx
// The ProtectedRoute automatically provides retry functionality
// Users can click "Try Again" or "Refresh Page" buttons
```

## Styling

The protected route components use shadcn/ui styling:

- **Loading states**: Uses `Card`, `Progress`, and `Loader2` components
- **Error states**: Uses `Card` with destructive color scheme
- **Access denied**: Shows requirements with `Badge` components
- **Animations**: Smooth loading spinners and progress bars

All components are fully responsive and follow your app's design system.

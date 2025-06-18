# Authentication System Documentation

This document explains how to use the authentication system in your Next.js application with Supabase.

## Overview

The authentication system provides:
- User authentication with email/password and OAuth
- User profile management
- Role-based access control
- Protected routes and components
- Session management
- TypeScript support

## Core Components

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

The main authentication context that manages user state, session, and authentication methods.

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { 
    user, 
    session, 
    profile, 
    loading, 
    signIn, 
    signOut, 
    signUp 
  } = useAuth()
  
  // Use authentication data and methods
}
```

### 2. AuthProvider (`src/components/auth/AuthProvider.tsx`)

Wraps your application to provide authentication context to all components.

```tsx
// Already included in src/app/layout.tsx
<AuthProvider>
  <YourApp />
</AuthProvider>
```

### 3. ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)

Component for protecting routes based on authentication and authorization.

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Protect a route requiring authentication
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>

// Protect a route requiring specific role
<ProtectedRoute requiredRole="admin">
  <AdminOnlyComponent />
</ProtectedRoute>

// Protect a route requiring specific permissions
<ProtectedRoute requiredPermissions={['interviews:create', 'interviews:update']}>
  <InterviewManagementComponent />
</ProtectedRoute>
```

## Authentication Methods

### Sign In
```tsx
const { signIn } = useAuth()

const handleSignIn = async (email: string, password: string) => {
  const { error } = await signIn(email, password)
  if (error) {
    console.error('Sign in failed:', error.message)
  }
}
```

### Sign Up
```tsx
const { signUp } = useAuth()

const handleSignUp = async (email: string, password: string) => {
  const { error } = await signUp(email, password, {
    data: {
      full_name: 'John Doe',
      role: 'user'
    }
  })
  if (error) {
    console.error('Sign up failed:', error.message)
  }
}
```

### OAuth Sign In
```tsx
const { signInWithOAuth } = useAuth()

const handleOAuthSignIn = async () => {
  const { error } = await signInWithOAuth('google')
  if (error) {
    console.error('OAuth sign in failed:', error.message)
  }
}
```

### Sign Out
```tsx
const { signOut } = useAuth()

const handleSignOut = async () => {
  const { error } = await signOut()
  if (error) {
    console.error('Sign out failed:', error.message)
  }
}
```

## Custom Hooks

### useRequireAuth
Protects components that require authentication:

```tsx
import { useRequireAuth } from '@/hooks/useAuth'

function ProtectedComponent() {
  const { user, loading, isAuthorized } = useRequireAuth({
    requiredRole: 'admin',
    redirectTo: '/login'
  })

  if (loading) return <div>Loading...</div>
  if (!isAuthorized) return null

  return <div>Protected content for {user.email}</div>
}
```

### usePermissions
Check user roles and permissions:

```tsx
import { usePermissions } from '@/hooks/useAuth'

function ConditionalComponent() {
  const { hasRole, hasPermission, isAdmin } = usePermissions()

  return (
    <div>
      {hasRole('admin') && <AdminPanel />}
      {hasPermission('interviews:create') && <CreateInterviewButton />}
      {isAdmin() && <SystemSettings />}
    </div>
  )
}
```

### useUserProfile
Manage user profile data:

```tsx
import { useUserProfile } from '@/hooks/useAuth'

function ProfileSettings() {
  const { 
    profile, 
    loading, 
    updateProfile, 
    isUpdating 
  } = useUserProfile()

  const handleUpdate = async (updates) => {
    const { success, error } = await updateProfile(updates)
    if (success) {
      console.log('Profile updated successfully')
    }
  }

  return (
    <div>
      {/* Profile form */}
    </div>
  )
}
```

### useAuthForm
Handle authentication forms with validation:

```tsx
import { useAuthForm } from '@/hooks/useAuth'

function LoginForm() {
  const { 
    isLoading, 
    errors, 
    setError, 
    setLoading, 
    clearErrors 
  } = useAuthForm()

  const handleSubmit = async (email, password) => {
    clearErrors()
    setLoading(true)
    
    // Validate
    if (!email) {
      setError('email', 'Email is required')
      setLoading(false)
      return
    }
    
    // Submit form
    const { error } = await signIn(email, password)
    if (error) {
      setError('general', error.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {errors.email && <span className="error">{errors.email}</span>}
      {errors.general && <span className="error">{errors.general}</span>}
    </form>
  )
}
```

## Role-Based Access Control

### Roles
- **admin**: Full system access
- **interviewer**: Can create and manage interviews
- **user**: Can view results only

### Permissions
- `interviews:read` - View interviews
- `interviews:create` - Create interviews
- `interviews:update` - Update interviews
- `results:read` - View interview results

### Using RoleGate Component
```tsx
import { RoleGate } from '@/components/auth/ProtectedRoute'

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <RoleGate allowedRoles={['admin', 'interviewer']}>
        <CreateInterviewButton />
      </RoleGate>
      
      <RoleGate requiredPermissions={['results:read']}>
        <ResultsSection />
      </RoleGate>
      
      <RoleGate allowedRoles={['admin']} fallback={<div>Access Denied</div>}>
        <SystemSettings />
      </RoleGate>
    </div>
  )
}
```

## Server-Side Authentication

### API Routes
```tsx
// app/api/protected/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Fetch data for authenticated user
  const { data } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', user.id)
  
  return NextResponse.json(data)
}
```

### Server Components
```tsx
// Server Component
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  // Fetch data for authenticated user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return (
    <div>
      <h1>Welcome, {profile?.full_name || user.email}</h1>
    </div>
  )
}
```

## Error Handling

### Authentication Errors
```tsx
const { error } = useAuth()

if (error) {
  return <div className="error">Authentication Error: {error.message}</div>
}
```

### Form Validation
```tsx
const { errors, setError, clearErrors } = useAuthForm()

// Set specific field errors
setError('email', 'Please enter a valid email')
setError('password', 'Password must be at least 8 characters')

// Clear all errors
clearErrors()
```

## Best Practices

1. **Always check loading states** before rendering authenticated content
2. **Use TypeScript interfaces** for better type safety
3. **Implement proper error handling** for all authentication operations
4. **Use server-side authentication** for sensitive operations
5. **Implement proper role-based access control** for different user types
6. **Clear sensitive data** when users sign out
7. **Use protected routes** instead of conditional rendering for security

## Example Usage

### Complete Login Form
```tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthForm } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn } = useAuth()
  const { isLoading, errors, setError, setLoading, clearErrors } = useAuthForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError('general', error.message)
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>
      
      {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  )
}
```

This authentication system provides a robust foundation for managing user authentication and authorization in your Next.js application.

# Supabase Configuration Setup

This project is now configured with Supabase for authentication and database operations. Follow these steps to complete the setup:

## 1. Environment Variables

Update the `.env.local` file with your actual Supabase project values:

```env
# Get these from your Supabase project dashboard (https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 2. Database Schema

Create the following tables in your Supabase database:

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id),
  role TEXT CHECK (role IN ('admin', 'interviewer', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Companies Table
```sql
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
```

### Interview Templates Table
```sql
CREATE TABLE interview_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  company_id UUID REFERENCES companies(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;
```

### Interview Sessions Table
```sql
CREATE TABLE interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  position TEXT NOT NULL,
  template_id UUID REFERENCES interview_templates(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  metrics JSONB DEFAULT '{}',
  transcript TEXT,
  ai_insights TEXT[],
  duration INTEGER, -- in minutes
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
```

## 3. Authentication Setup

### Enable Email Authentication
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Enable "Email" provider
4. Configure your email templates as needed

### Set up OAuth (Optional)
Enable Google, GitHub, or other OAuth providers in the Authentication settings.

## 4. Usage Examples

### Client-side Authentication
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, session, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Server-side Data Fetching
```tsx
import { createClient } from '@/utils/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
  
  return <div>{/* Render profiles */}</div>
}
```

### API Routes
```tsx
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

## 5. Adding Authentication to Your App

Wrap your app with the AuthProvider in your root layout:

```tsx
// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## 6. Protected Routes

The middleware is already configured to protect routes. The following routes require authentication:
- `/dashboard`
- `/interviews`
- `/results`
- `/settings`
- `/templates`

Unauthenticated users will be redirected to `/login`.

## 7. Database Types

Update the types in `src/types/supabase.ts` to match your actual database schema. You can generate these types automatically using the Supabase CLI:

```bash
npx supabase gen types typescript --project-id your-project-ref > src/types/database.ts
```

## Files Created

- `.env.local` - Environment variables
- `src/lib/supabase.ts` - Main Supabase configuration
- `src/utils/supabase/client.ts` - Client-side utilities
- `src/utils/supabase/server.ts` - Server-side utilities
- `src/types/supabase.ts` - TypeScript type definitions
- `src/contexts/AuthContext.tsx` - Authentication context provider
- `middleware.ts` - Route protection middleware

## Next Steps

1. Set up your Supabase project and get the required keys
2. Update the `.env.local` file with your actual values  
3. Create the database tables using the SQL above
4. Test the authentication flow
5. Update the TypeScript types to match your schema
6. Integrate authentication into your existing components

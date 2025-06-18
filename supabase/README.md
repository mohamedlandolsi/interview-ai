# Supabase Database Schema for AI Job Interviewer

This directory contains SQL migrations to set up the complete database schema for user management in the AI Job Interviewer application.

## 📁 Migration Files

### 1. `20250618000001_create_profiles_table.sql`
Creates the main profiles table with:
- **User role enum**: `admin`, `hr_manager`, `interviewer`
- **Comprehensive profile fields**: name, company, department, phone, etc.
- **Interview system fields**: interview_count, average_score
- **Preferences**: timezone, notifications (JSON)
- **Performance indexes** on commonly queried fields
- **Data validation constraints** for data integrity

### 2. `20250618000002_setup_rls_policies.sql`
Implements Row Level Security (RLS) policies:
- **Users**: Can view/update their own profiles
- **Admins**: Can manage all profiles
- **HR Managers**: Can manage profiles within their company
- **Secure role-based access** with proper checks

### 3. `20250618000003_create_profile_functions.sql`
Database functions and triggers:
- **Auto-create profiles** on user signup
- **Auto-update email verification** status
- **Auto-update last login** timestamp
- **Auto-update timestamps** on profile changes

### 4. `20250618000004_create_utility_functions.sql`
Helper functions for application use:
- `get_user_profile()` - Secure profile retrieval
- `update_user_profile()` - Validated profile updates
- `get_company_users()` - Company user management

### 5. `20250618000005_create_views_and_seed.sql`
Views and optional seed data:
- **Profile view** with computed fields
- **Activity status** calculation
- **Seed data template** for admin user

## 🚀 How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

1. **Initialize Supabase in your project:**
   ```bash
   npx supabase init
   ```

2. **Link to your Supabase project:**
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_ID
   ```

3. **Apply migrations:**
   ```bash
   npx supabase db push
   ```

### Option 2: Manual Application via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (001 → 002 → 003 → 004 → 005)

### Option 3: Using Supabase Studio

1. Open **Database** → **SQL Editor**
2. Copy and paste each migration file content
3. Execute them in the correct order

## 🔐 Row Level Security (RLS) Policies

The schema implements comprehensive RLS policies:

### User Permissions
- ✅ Read their own profile
- ✅ Update their own profile
- ✅ Create their own profile (automatic)

### HR Manager Permissions
- ✅ Read all profiles in their company
- ✅ Update profiles in their company
- ❌ Cannot change user roles to admin
- ❌ Cannot access other companies

### Admin Permissions
- ✅ Full access to all profiles
- ✅ Can change user roles
- ✅ Can delete profiles

## 📊 Database Schema Overview

```sql
profiles (
    id UUID PRIMARY KEY,              -- Links to auth.users
    full_name TEXT,
    company_name TEXT,
    department TEXT,
    phone TEXT,
    role user_role DEFAULT 'interviewer',
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    interview_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

## 🔧 Automatic Triggers

1. **Profile Creation**: When a user signs up, a profile is automatically created
2. **Email Verification**: When user verifies email, `email_verified` is set to `true`
3. **Login Tracking**: `last_login` is updated on each sign-in
4. **Timestamp Updates**: `updated_at` is automatically updated on profile changes

## 🎯 Usage Examples

### Get Current User Profile
```javascript
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Update Profile (with RLS)
```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ 
    full_name: 'New Name',
    company_name: 'New Company' 
  })
  .eq('id', user.id)
```

### Get Company Users (HR Manager/Admin)
```javascript
const { data: users } = await supabase
  .rpc('get_company_users', { company: 'Company Name' })
```

## 🛡️ Security Features

- **RLS Enabled**: All tables have Row Level Security enabled
- **Role-based Access**: Different permissions for different user roles
- **Data Validation**: Constraints ensure data integrity
- **Secure Functions**: All functions use `SECURITY DEFINER`
- **Input Validation**: Phone numbers, URLs, and text lengths are validated

## 📈 Performance Optimizations

- **Indexes**: Created on frequently queried columns
- **Composite Indexes**: For complex queries (company + role)
- **Partial Indexes**: For conditional queries (email_verified, last_login)
- **Optimized RLS**: Policies use efficient EXISTS clauses

## 🔄 After Migration Setup

1. **Create your first admin user** via Supabase Auth
2. **Update the seed data** in migration 005 with the admin user's UUID
3. **Run the seed insert** to set the admin role
4. **Test the RLS policies** with different user roles

## 🐛 Troubleshooting

### Common Issues:
- **RLS blocking queries**: Ensure user is authenticated and has proper role
- **Function permissions**: Check if user has `authenticated` role
- **Migration order**: Apply migrations in the correct sequence
- **UUID conflicts**: Ensure UUIDs in seed data match actual users

### Debug RLS:
```sql
-- Check current user and role
SELECT auth.uid(), auth.role();

-- Check user's profile and role
SELECT * FROM profiles WHERE id = auth.uid();
```

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Trigger Documentation](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)

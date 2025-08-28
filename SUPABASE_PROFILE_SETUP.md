# User Profile Settings - Supabase Setup Guide

## Manual Supabase Dashboard Setup

### Step 1: Create Storage Bucket for Avatars

1. **Navigate to Storage Section**
   - Open your Supabase project dashboard
   - Click on "Storage" in the left sidebar
   - Click on "Create a new bucket"

2. **Create the Avatars Bucket**
   - Bucket name: `avatars`
   - Public bucket: **UNCHECKED** (leave this disabled - we'll control access via RLS)
   - File size limit: 50MB (optional, recommended)
   - Allowed MIME types: `image/*` (optional, recommended)
   - Click "Create bucket"

### Step 2: Set Up Row Level Security (RLS) Policies

1. **Navigate to Storage Policies**
   - Go to Storage → Policies
   - You should see your `avatars` bucket listed
   - Click on "New Policy" for the avatars bucket

2. **Create the Following Four Policies:**

#### Policy 1: Allow Users to View Their Own Avatar (SELECT)
```sql
-- Policy Name: "Users can view their own avatar"
-- Operation: SELECT
-- Target roles: authenticated

-- Policy Definition:
(storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 2: Allow Users to Upload Avatar (INSERT)
```sql
-- Policy Name: "Users can upload their own avatar"
-- Operation: INSERT  
-- Target roles: authenticated

-- Policy Definition:
(storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 3: Allow Users to Update Their Own Avatar (UPDATE)
```sql
-- Policy Name: "Users can update their own avatar"
-- Operation: UPDATE
-- Target roles: authenticated

-- Policy Definition:
(storage.foldername(name))[1] = auth.uid()::text
```

#### Policy 4: Allow Users to Delete Their Own Avatar (DELETE)
```sql
-- Policy Name: "Users can delete their own avatar"
-- Operation: DELETE
-- Target roles: authenticated

-- Policy Definition:
(storage.foldername(name))[1] = auth.uid()::text
```

### Step 3: Create Database Function for Account Deletion

1. **Navigate to SQL Editor**
   - Go to "SQL Editor" in your Supabase dashboard
   - Create a new query

2. **Execute the Following SQL Function:**

```sql
-- Create a secure function to delete user accounts
-- This function runs with elevated privileges to delete from auth.users
CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if the user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Delete from auth.users (this will cascade to profiles due to foreign key)
  DELETE FROM auth.users WHERE id = user_id;
  
  -- The cascade should handle deleting from profiles table
  -- But let's also explicitly clean up any remaining profile data
  DELETE FROM public.profiles WHERE id = user_id;
  
  RAISE NOTICE 'User account % successfully deleted', user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(uuid) TO authenticated;
```

### Step 4: Verify Setup

1. **Check Storage Bucket**
   - Ensure the `avatars` bucket exists and is private
   - Verify all four RLS policies are created and enabled

2. **Check Database Function**
   - Run this query to verify the function exists:
   ```sql
   SELECT proname, prosecdef 
   FROM pg_proc 
   WHERE proname = 'delete_user_account';
   ```
   - You should see one result with `prosecdef = true`

3. **Test Upload Path Structure**
   - Avatar files will be stored in paths like: `user-id/avatar.png`
   - Example: `123e4567-e89b-12d3-a456-426614174000/avatar.png`

## Setup Complete ✅

Once you've completed these manual steps, proceed to the backend implementation. The system will use:

- **Storage**: `avatars` bucket with user-specific folders
- **Security**: RLS policies ensuring users can only access their own files
- **Account Deletion**: Secure function with elevated privileges
- **File Organization**: Consistent naming (`avatar.png`) for easy updates

If you encounter any issues during setup, check:
1. RLS is enabled on the storage bucket
2. All policies are active and properly formatted
3. The delete function has SECURITY DEFINER privileges
4. Your environment variables include the necessary Supabase keys

-- supabase/migrations/20250618100009_fix_client_rls_policies.sql

-- The current RLS policies are blocking client-side operations.
-- We need to update them to allow proper client access while maintaining security.

-- First, let's drop the current policies
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Create more permissive but still secure policies for client operations
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    current_setting('request.is_admin', true) = 'true'
  );

-- Allow authenticated users to insert their own profile (needed for client-side profile creation)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id OR 
    current_setting('request.is_admin', true) = 'true'
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = id OR 
    current_setting('request.is_admin', true) = 'true'
  )
  WITH CHECK (
    auth.uid() = id OR 
    current_setting('request.is_admin', true) = 'true'
  );

-- Allow users to delete their own profile (optional, but good for completeness)
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE 
  USING (
    auth.uid() = id OR 
    current_setting('request.is_admin', true) = 'true'
  );

-- Ensure the authenticated role has the necessary table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify that our trigger function is still correctly set up
-- (This should already be in place from the previous migration)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Temporarily bypass RLS by setting a session variable
  PERFORM set_config('request.is_admin', 'true', true);

  INSERT INTO public.profiles (id, email, full_name, company_name, job_title, role, phone, timezone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'company_name', ''),
    COALESCE(new.raw_user_meta_data->>'job_title', 'Not specified'),
    'interviewer',
    COALESCE(new.raw_user_meta_data->>'phone', null),
    'UTC'
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    job_title = EXCLUDED.job_title,
    updated_at = NOW();

  -- Reset the session variable
  PERFORM set_config('request.is_admin', '', true);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

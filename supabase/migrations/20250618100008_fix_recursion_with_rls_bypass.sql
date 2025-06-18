-- supabase/migrations/20250618100008_fix_recursion_with_rls_bypass.sql

-- We will modify the trigger function to temporarily bypass RLS.
-- This is a robust way to prevent the trigger from causing infinite recursion with the RLS policies.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Temporarily bypass RLS by setting a session variable.
  -- The RLS policies will need to be updated to check for this variable.
  set_config('request.is_admin', 'true', true);

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

  -- Reset the session variable.
  set_config('request.is_admin', '', true);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now, we update the RLS policies to use this bypass.
-- Drop existing policies first.
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Recreate policies with the bypass check.
CREATE POLICY "Enable read access for users based on user_id" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR current_setting('request.is_admin', true) = 'true');

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR current_setting('request.is_admin', true) = 'true');

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR current_setting('request.is_admin', true) = 'true');

-- Ensure the trigger is still in place.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

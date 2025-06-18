-- supabase/migrations/20250618100007_fix_recursion_with_invoker.sql

-- Grant necessary table-level permissions to the 'authenticated' role.
-- This allows any logged-in user to attempt operations, which are then checked by RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Change the function to SECURITY INVOKER and keep ON CONFLICT
-- This function now runs with the permissions of the user who triggered it.
-- The user needs INSERT and UPDATE permissions on the profiles table for this to work, which we granted above.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
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
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- The trigger and RLS policies from the previous migration (100006) are assumed to be correct and in place.
-- Trigger: on_auth_user_created on auth.users calling handle_new_user()
-- RLS Policies:
-- SELECT: auth.uid() = id
-- INSERT: auth.uid() = id
-- UPDATE: auth.uid() = id

-- First, let's check if the role column exists and add it if it doesn't
DO $$ 
BEGIN
    -- Check if role column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        -- Add the role column with a default value
        ALTER TABLE public.profiles 
        ADD COLUMN role TEXT DEFAULT 'interviewer';
        
        -- Update all existing profiles to have the interviewer role
        UPDATE public.profiles SET role = 'interviewer' WHERE role IS NULL;
    END IF;
END $$;

-- Update the trigger function to include the role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name, job_title, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name',
    COALESCE(new.raw_user_meta_data->>'job_title', 'Not specified'),
    'interviewer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

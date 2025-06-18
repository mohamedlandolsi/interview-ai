-- Create user role enum
CREATE TYPE user_role AS ENUM ('admin', 'hr_manager', 'interviewer');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    company_name TEXT,
    department TEXT,
    phone TEXT,
    role user_role DEFAULT 'interviewer',
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "push": false, "sms": false}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    interview_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX profiles_company_name_idx ON public.profiles(company_name);
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX profiles_email_verified_idx ON public.profiles(email_verified);
CREATE INDEX profiles_created_at_idx ON public.profiles(created_at);
CREATE INDEX profiles_last_login_idx ON public.profiles(last_login);

-- Create composite index for common queries
CREATE INDEX profiles_company_role_idx ON public.profiles(company_name, role);

-- Add constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_full_name_length CHECK (length(full_name) >= 2 AND length(full_name) <= 100);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_company_name_length CHECK (length(company_name) <= 100);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_format CHECK (phone ~ '^[\+]?[0-9\-\s\(\)]{10,20}$' OR phone IS NULL);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_avatar_url_format CHECK (avatar_url ~ '^https?://' OR avatar_url IS NULL);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with extended information for the AI job interviewer system';
COMMENT ON COLUMN public.profiles.notification_preferences IS 'JSON object containing user notification preferences';
COMMENT ON COLUMN public.profiles.interview_count IS 'Total number of interviews conducted by this user';
COMMENT ON COLUMN public.profiles.average_score IS 'Average score across all interviews (0-100)';

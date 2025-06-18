-- Create seed data for testing and initial setup

-- Insert a default admin user (you'll need to update the UUID after creating the admin user)
-- This is commented out - you should run this manually after creating your admin account
/*
INSERT INTO public.profiles (
    id,
    full_name,
    company_name,
    role,
    email_verified,
    onboarding_completed
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual admin user UUID
    'System Administrator',
    'Your Company Name',
    'admin',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();
*/

-- Create view for easier profile querying (with RLS applied)
CREATE VIEW public.profile_view AS
SELECT 
    p.id,
    p.full_name,
    au.email,
    p.company_name,
    p.department,
    p.phone,
    p.role,
    p.avatar_url,
    p.timezone,
    p.notification_preferences,
    p.onboarding_completed,
    p.email_verified,
    p.interview_count,
    p.average_score,
    p.last_login,
    p.created_at,
    p.updated_at,
    -- Computed fields
    CASE 
        WHEN p.last_login > NOW() - INTERVAL '7 days' THEN 'active'
        WHEN p.last_login > NOW() - INTERVAL '30 days' THEN 'inactive'
        ELSE 'dormant'
    END as activity_status,
    EXTRACT(days FROM NOW() - p.created_at) as days_since_signup
FROM public.profiles p
JOIN auth.users au ON au.id = p.id;

-- Enable RLS on the view
ALTER VIEW public.profile_view SET (security_invoker = true);

-- Grant access to the view
GRANT SELECT ON public.profile_view TO authenticated;

-- Create indexes for the view's common queries
CREATE INDEX IF NOT EXISTS profiles_activity_status_idx ON public.profiles(last_login) 
WHERE last_login IS NOT NULL;

-- Add helpful comments
COMMENT ON VIEW public.profile_view IS 'Enhanced profile view with computed fields and user email';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up';
COMMENT ON FUNCTION public.handle_email_verification() IS 'Updates profile email_verified status when user confirms email';
COMMENT ON FUNCTION public.handle_user_login() IS 'Updates last_login timestamp when user signs in';

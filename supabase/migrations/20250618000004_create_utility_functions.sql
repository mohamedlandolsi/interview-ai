-- Create additional utility functions for profile management

-- Function to get user profile with role-based access
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    company_name TEXT,
    department TEXT,
    phone TEXT,
    role user_role,
    avatar_url TEXT,
    timezone TEXT,
    notification_preferences JSONB,
    onboarding_completed BOOLEAN,
    email_verified BOOLEAN,
    interview_count INTEGER,
    average_score DECIMAL(5,2),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Check if current user can access the requested profile
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = user_id
        AND (
            -- User can access their own profile
            p.id = auth.uid()
            -- Admin can access any profile
            OR EXISTS (
                SELECT 1 FROM public.profiles admin
                WHERE admin.id = auth.uid() AND admin.role = 'admin'
            )
            -- HR Manager can access profiles in their company
            OR EXISTS (
                SELECT 1 FROM public.profiles hr
                WHERE hr.id = auth.uid() 
                AND hr.role = 'hr_manager'
                AND hr.company_name = p.company_name
            )
        )
    ) THEN
        RAISE EXCEPTION 'Access denied to profile';
    END IF;

    RETURN QUERY
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
        p.updated_at
    FROM public.profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile with validation
CREATE OR REPLACE FUNCTION public.update_user_profile(
    profile_id UUID,
    new_full_name TEXT DEFAULT NULL,
    new_company_name TEXT DEFAULT NULL,
    new_department TEXT DEFAULT NULL,
    new_phone TEXT DEFAULT NULL,
    new_avatar_url TEXT DEFAULT NULL,
    new_timezone TEXT DEFAULT NULL,
    new_notification_preferences JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_role user_role;
    target_user_company TEXT;
    current_user_company TEXT;
BEGIN
    -- Get current user's role and company
    SELECT role, company_name INTO current_user_role, current_user_company
    FROM public.profiles 
    WHERE id = auth.uid();

    -- Get target user's company
    SELECT company_name INTO target_user_company
    FROM public.profiles 
    WHERE id = profile_id;

    -- Check permissions
    IF NOT (
        -- User updating their own profile
        profile_id = auth.uid()
        -- Admin can update any profile
        OR current_user_role = 'admin'
        -- HR Manager can update profiles in their company
        OR (current_user_role = 'hr_manager' AND current_user_company = target_user_company)
    ) THEN
        RAISE EXCEPTION 'Access denied to update profile';
    END IF;

    -- Perform the update
    UPDATE public.profiles 
    SET 
        full_name = COALESCE(new_full_name, full_name),
        company_name = COALESCE(new_company_name, company_name),
        department = COALESCE(new_department, department),
        phone = COALESCE(new_phone, phone),
        avatar_url = COALESCE(new_avatar_url, avatar_url),
        timezone = COALESCE(new_timezone, timezone),
        notification_preferences = COALESCE(new_notification_preferences, notification_preferences),
        updated_at = NOW()
    WHERE id = profile_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get company users (for HR managers and admins)
CREATE OR REPLACE FUNCTION public.get_company_users(company TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    department TEXT,
    role user_role,
    interview_count INTEGER,
    average_score DECIMAL(5,2),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    current_user_role user_role;
    current_user_company TEXT;
    target_company TEXT;
BEGIN
    -- Get current user's role and company
    SELECT p.role, p.company_name INTO current_user_role, current_user_company
    FROM public.profiles p
    WHERE p.id = auth.uid();

    -- Determine target company
    target_company := COALESCE(company, current_user_company);

    -- Check permissions
    IF NOT (
        current_user_role = 'admin'
        OR (current_user_role = 'hr_manager' AND current_user_company = target_company)
    ) THEN
        RAISE EXCEPTION 'Access denied to view company users';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        au.email,
        p.department,
        p.role,
        p.interview_count,
        p.average_score,
        p.last_login,
        p.created_at
    FROM public.profiles p
    JOIN auth.users au ON au.id = p.id
    WHERE p.company_name = target_company
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_company_users(TEXT) TO authenticated;

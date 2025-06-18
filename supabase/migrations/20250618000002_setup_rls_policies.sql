-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Users can insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- Policy: HR Managers can view profiles in their company
CREATE POLICY "HR Managers can view company profiles" 
ON public.profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles hr_profile 
        WHERE hr_profile.id = auth.uid() 
        AND hr_profile.role = 'hr_manager'
        AND hr_profile.company_name = company_name
    )
);

-- Policy: HR Managers can update profiles in their company (except role changes)
CREATE POLICY "HR Managers can update company profiles" 
ON public.profiles FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles hr_profile 
        WHERE hr_profile.id = auth.uid() 
        AND hr_profile.role = 'hr_manager'
        AND hr_profile.company_name = company_name
    )
)
WITH CHECK (
    -- Prevent HR managers from changing roles to admin
    (role IS NULL OR role != 'admin') AND
    -- Ensure they can't change company_name to escape their domain
    EXISTS (
        SELECT 1 FROM public.profiles hr_profile 
        WHERE hr_profile.id = auth.uid() 
        AND hr_profile.role = 'hr_manager'
        AND hr_profile.company_name = company_name
    )
);

-- Manual fix to create profile for existing user
-- Replace 'your-user-id-here' with your actual user ID from the debug output

-- First, let's see what users exist without profiles
SELECT u.id, u.email, u.raw_user_meta_data
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create profile for the user (replace the UUID with your actual user ID)
INSERT INTO public.profiles (id, email, full_name, company_name, job_title, role, phone, timezone)
VALUES (
    '5b01e520-6c4c-43b8-9164-23339bf541a7', -- Replace with your user ID
    'mohammed.amahid1@gmail.com', -- Replace with your email
    'Mohammed Amahid', -- Replace with your full name
    'Example Company', -- Replace with your company
    'Not specified',
    'interviewer',
    null,
    'UTC'
);

-- Alternative: If you want to create profiles for all users missing them
-- INSERT INTO public.profiles (id, email, full_name, company_name, job_title, role, phone, timezone)
-- SELECT 
--     u.id, 
--     u.email, 
--     u.raw_user_meta_data->>'full_name',
--     u.raw_user_meta_data->>'company_name',
--     'Not specified',
--     'interviewer',
--     null,
--     'UTC'
-- FROM auth.users u
-- LEFT JOIN public.profiles p ON u.id = p.id
-- WHERE p.id IS NULL;

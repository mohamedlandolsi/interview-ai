# Profile Settings Setup Guide

## Overview
The ProfileSettings component provides comprehensive user profile management including:
- Profile information editing (name, email, phone, company, department)
- Avatar upload with Supabase storage integration
- Password change functionality
- Account deletion with confirmation
- Real-time form updates from user context
- Form validation and success/error states

## Supabase Storage Setup

### 1. Create Avatar Storage Bucket
In your Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Create a new bucket named `avatars`
3. Set the bucket to **Public** (for avatar images)

### 2. Set Up Storage Policies
Add these RLS policies for the `avatars` bucket:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### 3. Database Schema Updates
Ensure your `profiles` table includes these fields:

```sql
-- Add missing fields if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;
```

## Features

### ✅ Avatar Upload
- Drag & drop or click to upload
- File validation (images only, max 2MB)
- Automatic Supabase storage integration
- Real-time avatar updates in header

### ✅ Profile Management
- Edit full name, phone, company, department
- Email display (read-only)
- Real-time form updates from auth context
- Form validation with error messages

### ✅ Password Change
- Current password verification
- New password validation (min 8 characters)
- Password confirmation matching
- Show/hide password toggles

### ✅ Account Deletion
- Confirmation dialog with typed confirmation
- Permanent account deletion warning
- Automatic sign out after deletion

### ✅ User Experience
- Loading states for all operations
- Success/error notifications
- Responsive design
- Form validation feedback

## Usage

The component is already integrated into the settings page at `/settings`. Users can:

1. **Update Profile**: Edit personal information and see changes reflected immediately
2. **Change Avatar**: Upload new profile pictures that sync across the app
3. **Change Password**: Securely update their password with current password verification
4. **Delete Account**: Permanently remove their account with proper confirmation

## Security Features

- Avatar uploads are scoped to user ID folders
- Password changes require current password verification
- Account deletion requires typed confirmation
- All operations use Supabase RLS policies
- File upload validation (type and size limits)

## Error Handling

The component includes comprehensive error handling for:
- Network failures
- File upload errors
- Authentication errors
- Validation errors
- Storage quota limits

All errors are displayed as user-friendly notifications with appropriate retry options.

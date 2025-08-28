# Company Logos Storage Setup Guide

## Supabase Storage Configuration for Company Logos

### Step 1: Create Storage Bucket

1. **Navigate to Storage Section**
   - Open your Supabase project dashboard
   - Click on "Storage" in the left sidebar
   - Click on "Create a new bucket"

2. **Create the Company Logos Bucket**
   - Bucket name: `company-logos`
   - Public bucket: **UNCHECKED** (leave this disabled - we'll control access via RLS)
   - File size limit: 50MB (optional, recommended)
   - Allowed MIME types: `image/*` (optional, recommended)
   - Click "Create bucket"

### Step 2: Set Up Row Level Security (RLS) Policies

Navigate to Storage → Policies and create the following policies for the `company-logos` bucket:

#### Policy 1: Allow Admins to View Company Logo (SELECT)
```sql
-- Policy Name: "Admins can view their company logo"
-- Operation: SELECT
-- Target roles: authenticated

-- Policy Definition:
auth.uid() IN (
  SELECT "Profile".id 
  FROM "Profile" 
  WHERE "Profile".company_id = (storage.foldername(name))[1]::uuid 
  AND "Profile".role IN ('admin', 'hr_manager')
)
```

#### Policy 2: Allow Admins to Upload Company Logo (INSERT)
```sql
-- Policy Name: "Admins can upload their company logo"
-- Operation: INSERT
-- Target roles: authenticated

-- Policy Definition:
auth.uid() IN (
  SELECT "Profile".id 
  FROM "Profile" 
  WHERE "Profile".company_id = (storage.foldername(name))[1]::uuid 
  AND "Profile".role IN ('admin', 'hr_manager')
)
```

#### Policy 3: Allow Admins to Update Company Logo (UPDATE)
```sql
-- Policy Name: "Admins can update their company logo"
-- Operation: UPDATE
-- Target roles: authenticated

-- Policy Definition:
auth.uid() IN (
  SELECT "Profile".id 
  FROM "Profile" 
  WHERE "Profile".company_id = (storage.foldername(name))[1]::uuid 
  AND "Profile".role IN ('admin', 'hr_manager')
)
```

#### Policy 4: Allow Admins to Delete Company Logo (DELETE)
```sql
-- Policy Name: "Admins can delete their company logo"
-- Operation: DELETE
-- Target roles: authenticated

-- Policy Definition:
auth.uid() IN (
  SELECT "Profile".id 
  FROM "Profile" 
  WHERE "Profile".company_id = (storage.foldername(name))[1]::uuid 
  AND "Profile".role IN ('admin', 'hr_manager')
)
```

### Step 3: Verify Setup

1. **Check Storage Bucket**
   - Ensure the `company-logos` bucket exists and is private
   - Verify all four RLS policies are created and enabled

2. **Test File Path Structure**
   - Company logo files will be stored in paths like: `company-id/logo.png`
   - Example: `123e4567-e89b-12d3-a456-426614174000/logo.png`

## File Storage Structure

- **Path Format**: `{companyId}/logo.{extension}`
- **Consistent Naming**: Always use `logo.{ext}` for easy updates
- **Supported Formats**: PNG, JPG, JPEG, GIF, WebP
- **Size Limit**: 5MB recommended for web performance

## Security Notes

- Only users with `admin` or `hr_manager` roles can manage company logos
- Users can only access logos for their own company (based on `companyId`)
- Files are stored in private buckets and require signed URLs for access
- RLS policies ensure proper access control at the database level

## Setup Complete ✅

Once you've completed these manual steps, the backend implementation will handle:
- **File Upload**: Secure upload with role verification
- **File Deletion**: Automatic cleanup when replacing logos
- **URL Generation**: Signed URLs for secure access
- **Database Updates**: Automatic logoUrl field updates

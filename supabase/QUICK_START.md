# 🚀 Quick Setup Guide

## Step 1: Use Supabase CLI

### Option A: Using npx (Recommended - No Installation Required)
```bash
npx supabase --version
```
This will download and run Supabase CLI automatically when needed.

### Option B: Using winget (Windows 10/11)
```powershell
winget install Supabase.CLI
```

### Option C: Using Chocolatey (Windows)
```powershell
choco install supabase
```

### Option D: Using Scoop (Windows)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Option E: Download Binary
Download from: https://github.com/supabase/cli/releases

**Note:** Global npm installation (`npm install -g supabase`) is not supported.

## Step 2: Link Your Project

```bash
# Initialize Supabase in your project (if not done already)
npx supabase init

# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_ID
```

**To find your Project ID:**
1. Go to your Supabase dashboard
2. Go to Settings → General
3. Copy the "Reference ID"

## Step 3: Apply Database Schema

### Windows:
```powershell
.\supabase\setup.ps1
```
or
```cmd
.\supabase\setup.bat
```

### Linux/Mac:
```bash
chmod +x supabase/setup.sh
./supabase/setup.sh
```

### Manual:
```bash
npx supabase db push
```

## Step 4: Create Admin User

1. Register via your app's registration page
2. Note your user UUID from Supabase Auth dashboard
3. Update migration 005 with your UUID
4. Run the seed insert to set admin role

## 🎉 Done!

Your database is now ready for production use with:
- ✅ User profiles with role-based access
- ✅ Automatic profile creation
- ✅ Email verification tracking
- ✅ Security policies (RLS)
- ✅ Performance optimizations

## 🆘 Troubleshooting

**CLI not found?**
- Make sure Node.js is installed
- Restart your terminal after installation
- Check PATH environment variable

**Permission denied?**
- Run as administrator on Windows
- Use `sudo` on Linux/Mac if needed

**Migration errors?**
- Check your .env.local file
- Verify project is linked correctly
- Check Supabase project status

**Need help?**
- Check the full README.md
- Visit Supabase docs: https://supabase.com/docs
- Check GitHub issues: https://github.com/supabase/cli/issues

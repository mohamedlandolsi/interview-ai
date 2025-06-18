# Supabase Database Setup Script for Windows
# This script helps you set up the database schema for the AI Job Interviewer application

Write-Host "Setting up AI Job Interviewer Database Schema" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Supabase CLI is installed or available via npx
try {
    # Try npx supabase first (recommended method)
    $supabaseVersion = & npx supabase --version 2>$null
    Write-Host "Supabase CLI found via npx: $supabaseVersion" -ForegroundColor Green
    $supabaseCmd = "npx supabase"
} catch {
    try {
        # Fallback to global installation
        $supabaseVersion = & supabase --version 2>$null
        Write-Host "Supabase CLI found globally: $supabaseVersion" -ForegroundColor Green
        $supabaseCmd = "supabase"
    } catch {
        Write-Host "Supabase CLI is not available." -ForegroundColor Red
        Write-Host "You can use it via npx (no installation required): npx supabase" -ForegroundColor Yellow
        Write-Host "Or install via package manager: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Yellow
        exit 1
    }
}

# Check if project has environment file
if (-not (Test-Path ".env.local")) {
    Write-Host "No .env.local file found. Make sure you have your Supabase credentials set up." -ForegroundColor Yellow
    Write-Host "You can link your project with: supabase link --project-ref YOUR_PROJECT_ID" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Available setup options:" -ForegroundColor Cyan
Write-Host "1. Apply all migrations (recommended)" -ForegroundColor White
Write-Host "2. Show migration status" -ForegroundColor White
Write-Host "3. Reset database (destructive)" -ForegroundColor Yellow
Write-Host "4. Generate TypeScript types" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {    1 {
        Write-Host "Applying all migrations..." -ForegroundColor Blue
        Invoke-Expression "$supabaseCmd db push"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Migrations applied successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Create your admin user via Supabase Auth" -ForegroundColor White
            Write-Host "2. Update the seed data in migration 005 with your admin UUID" -ForegroundColor White
            Write-Host "3. Run the seed insert to set admin role" -ForegroundColor White
        } else {
            Write-Host "Migration failed. Check the output above for errors." -ForegroundColor Red
        }
    }
    2 {
        Write-Host "Checking migration status..." -ForegroundColor Blue
        Invoke-Expression "$supabaseCmd migration list"
    }
    3 {
        Write-Host "WARNING: This will delete all data in your database!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? Type 'yes' to continue"
        if ($confirm -eq "yes") {
            Write-Host "Resetting database..." -ForegroundColor Blue
            Invoke-Expression "$supabaseCmd db reset"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Database reset complete!" -ForegroundColor Green
            } else {
                Write-Host "Reset failed. Check the output above for errors." -ForegroundColor Red
            }
        } else {
            Write-Host "Reset cancelled" -ForegroundColor Yellow
        }
    }
    4 {
        Write-Host "Generating TypeScript types..." -ForegroundColor Blue
        Invoke-Expression "$supabaseCmd gen types typescript --local" | Out-File -FilePath "src/types/supabase-generated.ts" -Encoding utf8
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Types generated at src/types/supabase-generated.ts" -ForegroundColor Green
        } else {
            Write-Host "Type generation failed. Make sure Supabase is running locally." -ForegroundColor Red
        }
    }
    5 {
        Write-Host "Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Setup complete! Your database schema is ready for the AI Job Interviewer application." -ForegroundColor Green
Write-Host "Check the README.md file for more information about the schema and usage examples." -ForegroundColor Cyan

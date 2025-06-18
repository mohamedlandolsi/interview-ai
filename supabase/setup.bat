@echo off
echo Setting up AI Job Interviewer Database Schema
echo ==============================================
echo.

REM Check if Supabase CLI is installed or available via npx
npx supabase --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Supabase CLI found via npx!
    set SUPABASE_CMD=npx supabase
    goto cli_found
)

supabase --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Supabase CLI found globally!
    set SUPABASE_CMD=supabase
    goto cli_found
)

echo Supabase CLI is not available.
echo You can use it via npx no installation required: npx supabase
echo Or install via package manager: https://supabase.com/docs/guides/cli/getting-started
pause
exit /b 1

:cli_found

REM Check if project has environment file
if not exist ".env.local" (
    echo No .env.local file found. Make sure you have your Supabase credentials set up.
    echo You can link your project with: supabase link --project-ref YOUR_PROJECT_ID
    echo.
)

echo Available setup options:
echo 1. Apply all migrations (recommended)
echo 2. Show migration status
echo 3. Reset database (destructive)
echo 4. Generate TypeScript types
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo Applying all migrations...
    %SUPABASE_CMD% db push
    if %errorlevel% equ 0 (
        echo Migrations applied successfully!
        echo.
        echo Next steps:
        echo 1. Create your admin user via Supabase Auth
        echo 2. Update the seed data in migration 005 with your admin UUID
        echo 3. Run the seed insert to set admin role
    ) else (
        echo Migration failed. Check the output above for errors.
    )
    goto end
)

if "%choice%"=="2" (
    echo Checking migration status...
    %SUPABASE_CMD% migration list
    goto end
)

if "%choice%"=="3" (
    echo WARNING: This will delete all data in your database!
    set /p confirm="Are you sure? Type 'yes' to continue: "
    if "%confirm%"=="yes" (
        echo Resetting database...
        %SUPABASE_CMD% db reset
        if %errorlevel% equ 0 (
            echo Database reset complete!
        ) else (
            echo Reset failed. Check the output above for errors.
        )
    ) else (
        echo Reset cancelled
    )
    goto end
)

if "%choice%"=="4" (
    echo Generating TypeScript types...
    %SUPABASE_CMD% gen types typescript --local > src/types/supabase-generated.ts
    if %errorlevel% equ 0 (
        echo Types generated at src/types/supabase-generated.ts
    ) else (
        echo Type generation failed. Make sure Supabase is running locally.
    )
    goto end
)

if "%choice%"=="5" (
    echo Goodbye!
    exit /b 0
)

echo Invalid choice. Please run the script again.
exit /b 1

:end
echo.
echo Setup complete! Your database schema is ready for the AI Job Interviewer application.
echo Check the README.md file for more information about the schema and usage examples.
pause

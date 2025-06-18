#!/bin/bash

# Supabase Database Setup Script
# This script helps you set up the database schema for the AI Job Interviewer application

echo "🚀 Setting up AI Job Interviewer Database Schema"
echo "=============================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Install it with: npm install -g supabase"
    echo "📚 Or visit: https://supabase.com/docs/reference/cli/installing-the-cli"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if project is linked
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found. Make sure you have your Supabase credentials set up."
    echo "🔗 You can link your project with: supabase link --project-ref YOUR_PROJECT_ID"
fi

echo ""
echo "📋 Available setup options:"
echo "1. Apply all migrations (recommended)"
echo "2. Show migration status"
echo "3. Reset database (⚠️  destructive)"
echo "4. Generate TypeScript types"
echo "5. Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔄 Applying all migrations..."
        supabase db push
        echo "✅ Migrations applied successfully!"
        echo ""
        echo "🔧 Next steps:"
        echo "1. Create your admin user via Supabase Auth"
        echo "2. Update the seed data in migration 005 with your admin UUID"
        echo "3. Run the seed insert to set admin role"
        ;;
    2)
        echo "📊 Checking migration status..."
        supabase migration list
        ;;
    3)
        echo "⚠️  WARNING: This will delete all data in your database!"
        read -p "Are you sure? Type 'yes' to continue: " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️  Resetting database..."
            supabase db reset
            echo "✅ Database reset complete!"
        else
            echo "❌ Reset cancelled"
        fi
        ;;
    4)
        echo "📝 Generating TypeScript types..."
        supabase gen types typescript --local > src/types/supabase-generated.ts
        echo "✅ Types generated at src/types/supabase-generated.ts"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete! Your database schema is ready for the AI Job Interviewer application."
echo "📚 Check the README.md file for more information about the schema and usage examples."

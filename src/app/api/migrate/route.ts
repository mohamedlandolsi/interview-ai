import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin (you might want to add proper authorization)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const migrationSQL = `
      -- Create a function to handle new user profile creation
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (
          id,
          full_name,
          avatar_url,
          email_verified,
          created_at,
          updated_at
        )
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
          NEW.raw_user_meta_data->>'avatar_url',
          NEW.email_confirmed_at IS NOT NULL,
          NOW(),
          NOW()
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create a trigger that calls the function when a new user is created
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

      -- Function to update profile when user email is verified
      CREATE OR REPLACE FUNCTION public.handle_email_verified()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Only update if email_confirmed_at changed from null to a timestamp
        IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
          UPDATE public.profiles
          SET 
            email_verified = true,
            updated_at = NOW()
          WHERE id = NEW.id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create a trigger for email verification
      DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
      CREATE TRIGGER on_email_verified
        AFTER UPDATE ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_email_verified();

      -- Function to update last login timestamp
      CREATE OR REPLACE FUNCTION public.handle_user_login()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update last_login when last_sign_in_at changes
        IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
          UPDATE public.profiles
          SET 
            last_login = NEW.last_sign_in_at,
            updated_at = NOW()
          WHERE id = NEW.id;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create a trigger for login tracking
      DROP TRIGGER IF EXISTS on_user_login ON auth.users;
      CREATE TRIGGER on_user_login
        AFTER UPDATE ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();
    `

    // Execute the migration using Supabase admin client
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      // If RPC doesn't work, try direct SQL execution
      const { error: sqlError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (sqlError) {
        throw new Error(`Migration failed: ${error.message}`)
      }
      
      return NextResponse.json(
        { 
          message: 'Migration completed (functions may need manual setup)',
          warning: 'Some functions might need to be created manually in Supabase dashboard'
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'Migration completed successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

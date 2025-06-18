import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

/**
 * Create a Supabase client for client-side operations
 * This client is used in Client Components and browser-side code
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Get a singleton Supabase client for the browser
 * This ensures we don't create multiple clients unnecessarily
 */
let client: ReturnType<typeof createClient> | undefined

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}

// Export the client for direct use if needed
export const supabase = getSupabaseClient()

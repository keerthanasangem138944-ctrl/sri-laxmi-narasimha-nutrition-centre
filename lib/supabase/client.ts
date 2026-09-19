import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Browser / Client-side Supabase client.
 * Uses public anon key.
 * Strictly adheres to Row Level Security (RLS).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

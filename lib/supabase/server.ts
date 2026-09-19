import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Server-side Supabase client for Server Actions and Route Handlers.
 * In a Next.js environment, pass user cookies / headers or Bearer tokens.
 */
export function createServerSupabaseClient(accessToken?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    },
  });
}

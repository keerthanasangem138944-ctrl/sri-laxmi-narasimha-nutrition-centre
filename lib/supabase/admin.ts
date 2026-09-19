import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Server-only Admin Supabase Client.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security for privileged operations.
 * CRITICAL SECURITY: Never import or execute this in client-side components!
 */
export function getAdminSupabaseClient() {
  if (typeof window !== 'undefined') {
    throw new Error('CRITICAL SECURITY VIOLATION: getAdminSupabaseClient called on client browser!');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL must be configured in server environment');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

import { createServerSupabaseClient } from '../supabase/server';
import type { Database, UserRole } from '../../types/database';

export interface AuthenticatedUser {
  authUserId: string;
  profileId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

/**
 * Server-side User Authentication Guard
 * Resolves session and linked profile from Supabase Auth
 */
export async function requireUser(accessToken?: string): Promise<AuthenticatedUser> {
  const supabase = createServerSupabaseClient(accessToken);
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const authUser = authData.user;

  // Retrieve user's application profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('auth_user_id', authUser.id)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found or linked');
  }

  return {
    authUserId: authUser.id,
    profileId: profile.id,
    email: profile.email || authUser.email || '',
    role: profile.role,
    fullName: profile.full_name,
  };
}

/**
 * Server-side Admin Authorization Guard
 * Accepts either an already resolved AuthenticatedUser or an accessToken string
 */
export async function requireAdmin(userOrToken?: AuthenticatedUser | string): Promise<AuthenticatedUser> {
  const user =
    typeof userOrToken === 'object' && userOrToken !== null && 'role' in userOrToken
      ? (userOrToken as AuthenticatedUser)
      : await requireUser(typeof userOrToken === 'string' ? userOrToken : undefined);

  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Administrative privileges required');
  }

  return user;
}

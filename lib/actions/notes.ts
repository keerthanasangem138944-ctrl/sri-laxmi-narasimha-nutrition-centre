import { ActionResult } from './types';
import { requireUser, requireAdmin } from '../auth/session';
import { healthNoteSchema, HealthNoteInput } from '../validations';
import { getAdminSupabaseClient } from '../supabase/admin';

/**
 * Server Action: Create Health Note (Section 17 & 18)
 * Admin only can add professional or recorded customer-reported notes.
 * Default visibility is ADMIN_ONLY.
 */
export async function createHealthNote(
  input: HealthNoteInput,
  accessToken?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdmin(accessToken);
    const validated = healthNoteSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();
    const noteId = crypto.randomUUID();

    const { error } = await adminSupabase
      .from('health_notes')
      .insert({
        id: noteId,
        customer_id: validated.customerId,
        created_by: admin.profileId,
        note: validated.note,
        visibility: validated.visibility,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Create health note error:', error);
      return {
        success: false,
        error: 'Failed to record health note',
      };
    }

    // Audit log (Section 38: NOTE_CREATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: admin.profileId,
      action: 'NOTE_CREATED',
      entity_type: 'health_notes',
      entity_id: noteId,
      metadata: {
        customer_id: validated.customerId,
        visibility: validated.visibility,
        is_customer_reported: validated.isCustomerReported,
      },
    });

    return {
      success: true,
      data: { id: noteId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error creating health note',
    };
  }
}

/**
 * Server Action: Get Customer Health Notes
 * Customers can ONLY access notes with visibility = 'CUSTOMER_VISIBLE'.
 * Admin can view both ADMIN_ONLY and CUSTOMER_VISIBLE notes.
 */
export async function getCustomerHealthNotes(
  customerId: string,
  accessToken?: string
): Promise<ActionResult<{ notes: Array<{ id: string; note: string; visibility: string; created_at: string; author_name: string }> }>> {
  try {
    const user = await requireUser(accessToken);

    // IDOR check: Non-admin can only request their own notes
    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return {
        success: false,
        error: 'Unauthorized to view these health notes',
      };
    }

    const adminSupabase = getAdminSupabaseClient();
    let query = adminSupabase
      .from('health_notes')
      .select('id, note, visibility, created_at, profiles!health_notes_author_id_fkey(full_name)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    // Section 17 & 40: Customers must NEVER see ADMIN_ONLY notes
    if (user.role !== 'ADMIN') {
      query = query.eq('visibility', 'CUSTOMER_VISIBLE');
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch notes',
      };
    }

    const formatted = (data || []).map((n: any) => ({
      id: n.id,
      note: n.note,
      visibility: n.visibility,
      created_at: n.created_at,
      author_name: n.profiles?.full_name || 'Nutritionist',
    }));

    return {
      success: true,
      data: { notes: formatted },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error fetching notes',
    };
  }
}

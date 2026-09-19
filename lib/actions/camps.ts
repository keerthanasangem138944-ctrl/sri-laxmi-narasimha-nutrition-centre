import { ActionResult } from './types';
import { requireAdmin } from '../auth/session';
import { campSchema, CampInput, campQuickCustomerSchema, CampQuickCustomerInput } from '../validations';
import { getAdminSupabaseClient } from '../supabase/admin';

/**
 * Server Action: Create Camp
 * Admin only
 */
export async function createCamp(
  input: CampInput,
  accessToken?: string
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const admin = await requireAdmin(accessToken);
    const validated = campSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();
    const campId = crypto.randomUUID();

    const { error } = await adminSupabase
      .from('camps')
      .insert({
        id: campId,
        name: validated.name,
        location_name: validated.locationName,
        address: validated.address,
        date: validated.date,
        start_time: validated.startTime,
        end_time: validated.endTime,
        status: validated.status as any,
        description: validated.description || validated.notes || null,
        max_registrations: validated.maxRegistrations || null,
        created_by: admin.profileId,
      });

    if (error) {
      console.error('Camp creation error:', error);
      return {
        success: false,
        error: 'Failed to create camp record',
      };
    }

    // Audit log (Section 38: CAMP_CREATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: admin.profileId,
      action: 'CAMP_CREATED',
      entity_type: 'camps',
      entity_id: campId,
      metadata: { name: validated.name, date: validated.date, location: validated.locationName },
    });

    return {
      success: true,
      data: { id: campId, name: validated.name },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create camp',
    };
  }
}

/**
 * Server Action: Update Camp
 * Admin only
 */
export async function updateCamp(
  campId: string,
  input: Partial<CampInput>,
  accessToken?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name) updatePayload.name = input.name;
    if (input.locationName) updatePayload.location_name = input.locationName;
    if (input.address) updatePayload.address = input.address;
    if (input.date) updatePayload.date = input.date;
    if (input.startTime) updatePayload.start_time = input.startTime;
    if (input.endTime) updatePayload.end_time = input.endTime;
    if (input.status) updatePayload.status = input.status;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.notes !== undefined) updatePayload.notes = input.notes;

    const { error } = await adminSupabase
      .from('camps')
      .update(updatePayload as any)
      .eq('id', campId);

    if (error) {
      return {
        success: false,
        error: 'Failed to update camp details',
      };
    }

    // Audit log (Section 38: CAMP_UPDATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: admin.profileId,
      action: 'CAMP_UPDATED',
      entity_type: 'camps',
      entity_id: campId,
      metadata: { fields_updated: Object.keys(updatePayload) },
    });

    return {
      success: true,
      data: { id: campId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error updating camp',
    };
  }
}

/**
 * Server Action: Add Customer to Camp (Section 26)
 * Creates camp_customers association
 */
export async function addCustomerToCamp(
  campId: string,
  customerId: string,
  accessToken?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    // Check if already registered
    const { data: existing } = await adminSupabase
      .from('camp_customers')
      .select('id')
      .eq('camp_id', campId)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        data: { id: existing.id },
      };
    }

    const associationId = crypto.randomUUID();
    const { error } = await adminSupabase
      .from('camp_customers')
      .insert({
        id: associationId,
        camp_id: campId,
        customer_id: customerId,
        registered_at: new Date().toISOString(),
      });

    if (error) {
      return {
        success: false,
        error: 'Failed to associate customer with camp',
      };
    }

    // Audit log (Section 38: CUSTOMER_ADDED_TO_CAMP)
    await adminSupabase.from('audit_logs').insert({
      actor_id: admin.profileId,
      action: 'CUSTOMER_ADDED_TO_CAMP',
      entity_type: 'camp_customers',
      entity_id: associationId,
      metadata: { camp_id: campId, customer_id: customerId },
    });

    return {
      success: true,
      data: { id: associationId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error adding customer to camp',
    };
  }
}

/**
 * Server Action: Mobile-First Quick Camp Registration (Section 22, 23 & 25)
 * Creates a new camp participant profile and immediately links them to the camp
 */
export async function registerQuickCampCustomer(
  input: CampQuickCustomerInput,
  accessToken?: string
): Promise<ActionResult<{ customerId: string; fullName: string }>> {
  try {
    const admin = await requireAdmin(accessToken);
    const validated = campQuickCustomerSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();

    // 1. Check if phone number already belongs to an existing customer
    const { data: existing } = await adminSupabase
      .from('profiles')
      .select('id, full_name')
      .eq('mobile', validated.mobile)
      .maybeSingle();

    let customerId = existing?.id;

    if (!customerId) {
      // 2. Create customer profile without requiring Supabase Auth account (Section 8)
      const newProfileId = crypto.randomUUID();
      const { data: profile, error: pError } = await adminSupabase
        .from('profiles')
        .insert({
          id: newProfileId,
          auth_user_id: crypto.randomUUID(),
          role: 'CUSTOMER',
          full_name: validated.fullName,
          mobile: validated.mobile,
          email: validated.email ? validated.email.trim().toLowerCase() : null,
        })
        .select('id')
        .single();

      if (pError || !profile) {
        return {
          success: false,
          error: 'Failed to register customer at camp',
        };
      }

      customerId = profile.id;

      // Create demographic record
      await adminSupabase.from('customer_profiles').insert({
        profile_id: customerId,
        gender: validated.gender || null,
      });

      // Audit log
      await adminSupabase.from('audit_logs').insert({
        actor_id: admin.profileId,
        action: 'CUSTOMER_CREATED',
        entity_type: 'profiles',
        entity_id: customerId,
        metadata: { source: 'CAMP_CHECK_IN', camp_id: validated.campId },
      });
    }

    // 3. Link customer to this camp
    await addCustomerToCamp(validated.campId, customerId, accessToken);

    return {
      success: true,
      data: {
        customerId,
        fullName: validated.fullName,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Camp quick registration failed',
    };
  }
}

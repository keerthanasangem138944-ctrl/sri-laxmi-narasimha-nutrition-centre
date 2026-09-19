import { ActionResult } from './types';
import { requireAdmin } from '../auth/session';
import { businessSettingsSchema, BusinessSettingsInput } from '../validations';
import { getAdminSupabaseClient } from '../supabase/admin';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettingsInput = {
  businessName: 'Sri Nutrition & Wellness Centre',
  ownerName: 'Sangem Srivijayalaxmi',
  phone: '7993367929',
  email: 'srivijayalaxmi@srinutrition.com',
  upiId: '7660990052-2@ybl',
  address: 'Main Commercial Road, Warangal, Telangana',
  city: 'Warangal',
  state: 'Telangana',
  postalCode: '506001',
  latitude: 17.9784,
  longitude: 79.5941,
  operatingHours: 'Mon-Sat: 7:00 AM - 1:00 PM & 4:00 PM - 8:00 PM | Sun: Closed (Community Camps)',
  freeShippingThreshold: 1500,
  standardShippingFee: 99,
};

/**
 * Server Action: Get Business Settings
 */
export async function getBusinessSettings(): Promise<ActionResult<BusinessSettingsInput>> {
  try {
    const adminSupabase = getAdminSupabaseClient();
    const { data } = await adminSupabase
      .from('business_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!data) {
      return { success: true, data: DEFAULT_BUSINESS_SETTINGS };
    }

    return {
      success: true,
      data: {
        businessName: data.business_name || DEFAULT_BUSINESS_SETTINGS.businessName,
        ownerName: data.owner_name || DEFAULT_BUSINESS_SETTINGS.ownerName,
        phone: data.owner_mobile || DEFAULT_BUSINESS_SETTINGS.phone,
        email: data.email || DEFAULT_BUSINESS_SETTINGS.email,
        upiId: data.upi_id || DEFAULT_BUSINESS_SETTINGS.upiId,
        address: data.address_line || DEFAULT_BUSINESS_SETTINGS.address,
        city: data.city || DEFAULT_BUSINESS_SETTINGS.city,
        state: data.state || DEFAULT_BUSINESS_SETTINGS.state,
        postalCode: data.postal_code || DEFAULT_BUSINESS_SETTINGS.postalCode,
        latitude: Number(data.latitude) || DEFAULT_BUSINESS_SETTINGS.latitude,
        longitude: Number(data.longitude) || DEFAULT_BUSINESS_SETTINGS.longitude,
        operatingHours: data.operating_hours || DEFAULT_BUSINESS_SETTINGS.operatingHours,
        freeShippingThreshold: DEFAULT_BUSINESS_SETTINGS.freeShippingThreshold,
        standardShippingFee: DEFAULT_BUSINESS_SETTINGS.standardShippingFee,
      },
    };
  } catch (err: unknown) {
    return { success: true, data: DEFAULT_BUSINESS_SETTINGS };
  }
}

/**
 * Server Action: Update Business Settings (Admin Only)
 */
export async function updateBusinessSettings(
  input: BusinessSettingsInput,
  accessToken?: string
): Promise<ActionResult<BusinessSettingsInput>> {
  try {
    const admin = await requireAdmin(accessToken);
    const validated = businessSettingsSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();

    const payload = {
      business_name: validated.businessName,
      owner_name: validated.ownerName,
      owner_mobile: validated.phone,
      email: validated.email,
      upi_id: validated.upiId,
      address_line: validated.address,
      city: validated.city,
      state: validated.state,
      postal_code: validated.postalCode,
      latitude: validated.latitude,
      longitude: validated.longitude,
      operating_hours: validated.operatingHours,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await adminSupabase.from('business_settings').select('id').limit(1).maybeSingle();

    if (existing) {
      await adminSupabase.from('business_settings').update(payload as any).eq('id', existing.id);
    } else {
      await adminSupabase.from('business_settings').insert({ id: crypto.randomUUID(), ...payload } as any);
    }

    // Audit log
    await adminSupabase.from('audit_logs').insert({
      actor_id: admin.profileId,
      action: 'BUSINESS_SETTINGS_UPDATED',
      entity_type: 'business_settings',
      entity_id: existing?.id || 'primary',
      metadata: payload,
    });

    return { success: true, data: validated };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update business settings',
    };
  }
}

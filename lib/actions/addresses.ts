import { ActionResult } from './types';
import { requireUser } from '../auth/session';
import { addressSchema, AddressInput } from '../validations';
import { getAdminSupabaseClient } from '../supabase/admin';

/**
 * Server Action: Get Customer Addresses
 */
export async function getCustomerAddresses(
  customerId: string,
  accessToken?: string
): Promise<ActionResult<any[]>> {
  try {
    const user = await requireUser(accessToken);
    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return { success: false, error: 'Forbidden: Cannot access another customer\'s addresses' };
    }

    const adminSupabase = getAdminSupabaseClient();
    const { data, error } = await adminSupabase
      .from('addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false });

    if (error) {
      return { success: false, error: 'Failed to retrieve addresses' };
    }

    return { success: true, data: data || [] };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve addresses',
    };
  }
}

/**
 * Server Action: Create Customer Address
 */
export async function createAddress(
  customerId: string,
  input: AddressInput,
  accessToken?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser(accessToken);
    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return { success: false, error: 'Forbidden' };
    }

    const validated = addressSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();
    const addressId = crypto.randomUUID();

    // If marked default, unset other defaults for this customer
    if (validated.isDefault) {
      await adminSupabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId);
    }

    const { error } = await adminSupabase.from('addresses').insert({
      id: addressId,
      customer_id: customerId,
      recipient_name: validated.recipientName,
      phone: validated.phone,
      address_line1: validated.addressLine1,
      address_line2: validated.addressLine2 || null,
      city: validated.city,
      state: validated.state,
      postal_code: validated.postalCode,
      country: validated.country,
      is_default: validated.isDefault,
    });

    if (error) {
      return { success: false, error: 'Failed to save address' };
    }

    return { success: true, data: { id: addressId } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save address',
    };
  }
}

/**
 * Server Action: Delete Address
 */
export async function deleteAddress(
  addressId: string,
  accessToken?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    const { data: address } = await adminSupabase
      .from('addresses')
      .select('customer_id')
      .eq('id', addressId)
      .maybeSingle();

    if (!address) {
      return { success: false, error: 'Address not found' };
    }

    if (user.role !== 'ADMIN' && user.profileId !== address.customer_id) {
      return { success: false, error: 'Forbidden' };
    }

    const { error } = await adminSupabase.from('addresses').delete().eq('id', addressId);
    if (error) {
      return { success: false, error: 'Failed to delete address' };
    }

    return { success: true, data: { id: addressId } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete address',
    };
  }
}

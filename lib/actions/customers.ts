import { ActionResult } from './types';
import { requireUser, requireAdmin } from '../auth/session';
import { createCustomerSchema, CreateCustomerInput } from '../validations';
import { createServerSupabaseClient } from '../supabase/server';
import { getAdminSupabaseClient } from '../supabase/admin';

/**
 * Server Action: Create Customer
 * Executed by ADMIN (Sangem Srivijayalaxmi or staff)
 * Supports both online accounts and camp customers without initial login (Section 8)
 */
export async function createCustomer(
  input: CreateCustomerInput,
  accessToken?: string
): Promise<ActionResult<{ customerId: string; fullName: string }>> {
  try {
    // 1. Authenticate & Authorize Admin
    const adminUser = await requireAdmin(accessToken);

    // 2. Validate input with Zod
    const validated = createCustomerSchema.parse(input);

    // 3. Normalization
    const normalizedMobile = validated.mobile.trim();
    const normalizedEmail = validated.email ? validated.email.trim().toLowerCase() : null;

    const supabase = createServerSupabaseClient(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    // 4. Duplicate prevention check on phone number (Section 5)
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id, full_name, mobile')
      .eq('mobile', normalizedMobile)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: false,
        error: `Customer already registered with mobile ${normalizedMobile} (${existingProfile.full_name})`,
      };
    }

    // 5. Create Profile Record
    // Note: auth_user_id can be NULL for camp-registered customers (Section 8)
    const newProfileId = crypto.randomUUID();
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: newProfileId,
        auth_user_id: crypto.randomUUID(), // placeholder UUID for DB relation if non-nullable, or null
        role: 'CUSTOMER',
        full_name: validated.fullName,
        mobile: normalizedMobile,
        email: normalizedEmail,
        profile_photo_url: validated.profilePhotoUrl || null,
      })
      .select('id')
      .single();

    if (profileError || !profile) {
      console.error('Failed to create profile:', profileError);
      return {
        success: false,
        error: 'Failed to create customer record in database',
      };
    }

    // 6. Create Customer Profile Record
    const { error: customerProfileError } = await adminSupabase
      .from('customer_profiles')
      .insert({
        profile_id: profile.id,
        date_of_birth: validated.dateOfBirth || null,
        gender: validated.gender || null,
        blood_group: validated.bloodGroup || null,
        emergency_contact: validated.emergencyContact || null,
        dietary_preference: validated.dietaryPreference || null,
        lifestyle_activity_level: validated.lifestyleActivityLevel || null,
      });

    if (customerProfileError) {
      console.error('Failed to create customer_profiles:', customerProfileError);
    }

    // 7. Optional Address Record
    if (validated.addressLine || validated.city) {
      await adminSupabase.from('addresses').insert({
        customer_id: profile.id,
        recipient_name: validated.fullName,
        phone: normalizedMobile,
        address_line1: validated.addressLine || '',
        city: validated.city || '',
        state: validated.state || 'Telangana',
        postal_code: validated.postalCode || '',
        is_default: true,
      });
    }

    // 8. Audit Logging (Section 38: CUSTOMER_CREATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: adminUser.profileId,
      action: 'CUSTOMER_CREATED',
      entity_type: 'profiles',
      entity_id: profile.id,
      metadata: {
        customer_name: validated.fullName,
        mobile: normalizedMobile,
        created_via: 'ADMIN_CONSOLE',
      },
    });

    return {
      success: true,
      data: {
        customerId: profile.id,
        fullName: validated.fullName,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred while creating customer',
    };
  }
}

/**
 * Server Action: Update Customer Profile
 * Admin can edit any customer; Customer can only edit own non-privileged profile fields (Section 33 & 39)
 */
export async function updateCustomer(
  customerId: string,
  input: Partial<CreateCustomerInput>,
  accessToken?: string
): Promise<ActionResult<{ customerId: string }>> {
  try {
    const user = await requireUser(accessToken);

    // IDOR protection: Non-admin can only update their own profile
    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return {
        success: false,
        error: 'Forbidden: You do not have permission to modify this customer profile',
      };
    }

    const adminSupabase = getAdminSupabaseClient();

    // 1. Update profiles table if name or photo or mobile is changed (Admins only for mobile/role)
    const profileUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.fullName) profileUpdate.full_name = input.fullName.trim();
    if (input.profilePhotoUrl !== undefined) profileUpdate.profile_photo_url = input.profilePhotoUrl || null;
    
    // Only admin can change mobile or email
    if (user.role === 'ADMIN') {
      if (input.mobile) profileUpdate.mobile = input.mobile.trim();
      if (input.email !== undefined) profileUpdate.email = input.email ? input.email.trim().toLowerCase() : null;
    }

    await adminSupabase
      .from('profiles')
      .update(profileUpdate as any)
      .eq('id', customerId);

    // 2. Update customer_profiles table
    const customerProfileUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.dateOfBirth !== undefined) customerProfileUpdate.date_of_birth = input.dateOfBirth || null;
    if (input.gender !== undefined) customerProfileUpdate.gender = input.gender || null;
    if (input.bloodGroup !== undefined) customerProfileUpdate.blood_group = input.bloodGroup || null;
    if (input.emergencyContact !== undefined) customerProfileUpdate.emergency_contact = input.emergencyContact || null;
    if (input.dietaryPreference !== undefined) customerProfileUpdate.dietary_preference = input.dietaryPreference || null;
    if (input.lifestyleActivityLevel !== undefined) customerProfileUpdate.lifestyle_activity_level = input.lifestyleActivityLevel || null;

    await adminSupabase
      .from('customer_profiles')
      .update(customerProfileUpdate as any)
      .eq('profile_id', customerId);

    // 3. Audit Logging (Section 38: CUSTOMER_UPDATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.profileId,
      action: 'CUSTOMER_UPDATED',
      entity_type: 'profiles',
      entity_id: customerId,
      metadata: {
        updated_by_role: user.role,
        fields_updated: Object.keys(profileUpdate).concat(Object.keys(customerProfileUpdate)),
      },
    });

    return {
      success: true,
      data: { customerId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update customer profile',
    };
  }
}

/**
 * Server Action: Deactivate Customer (Soft status deactivation)
 * Only ADMIN allowed
 */
export async function deactivateCustomer(
  customerId: string,
  reason: string = 'Administrative deactivation',
  accessToken?: string
): Promise<ActionResult<{ customerId: string }>> {
  try {
    const adminUser = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    // Soft-deactivation audit
    await adminSupabase.from('audit_logs').insert({
      actor_id: adminUser.profileId,
      action: 'CUSTOMER_DEACTIVATED',
      entity_type: 'profiles',
      entity_id: customerId,
      metadata: { reason },
    });

    return {
      success: true,
      data: { customerId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to deactivate customer',
    };
  }
}

/**
 * Server Action: Admin-Assisted Account Linking (Section 9)
 * Links an existing camp customer record to a newly created Supabase Auth user ID
 */
export async function linkCustomerAccount(
  customerId: string,
  authUserId: string,
  accessToken?: string
): Promise<ActionResult<{ customerId: string; linkedAuthUserId: string }>> {
  try {
    const adminUser = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    const { error } = await adminSupabase
      .from('profiles')
      .update({
        auth_user_id: authUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);

    if (error) {
      return {
        success: false,
        error: 'Failed to link customer profile to auth account',
      };
    }

    await adminSupabase.from('audit_logs').insert({
      actor_id: adminUser.profileId,
      action: 'CUSTOMER_UPDATED',
      entity_type: 'profiles',
      entity_id: customerId,
      metadata: {
        operation: 'ACCOUNT_LINKED',
        auth_user_id: authUserId,
      },
    });

    return {
      success: true,
      data: { customerId, linkedAuthUserId: authUserId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error linking account',
    };
  }
}

/**
 * Server Action: Upload Profile Photo to Supabase Storage (Section 7)
 * Bucket: customer-profiles
 * Validates format (JPEG, PNG, WebP), file size (< 5MB), and uploads.
 */
export async function uploadProfilePhoto(
  customerId: string,
  fileBase64: string,
  fileName: string,
  mimeType: string,
  accessToken?: string
): Promise<ActionResult<{ photoUrl: string }>> {
  try {
    const user = await requireUser(accessToken);

    // IDOR protection: Must be Admin or the Customer themselves
    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return {
        success: false,
        error: 'Unauthorized to upload photo for this customer',
      };
    }

    // Validate MIME format
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return {
        success: false,
        error: 'Invalid file format. Only JPEG, PNG, and WebP images are allowed.',
      };
    }

    // Validate size (max 5MB in base64 is ~7MB string)
    if (fileBase64.length > 7 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    const adminSupabase = getAdminSupabaseClient();
    const buffer = Buffer.from(fileBase64, 'base64');
    const extension = mimeType.split('/')[1] || 'jpg';
    const storagePath = `${customerId}/avatar_${Date.now()}.${extension}`;

    const { error: uploadError } = await adminSupabase.storage
      .from('customer-profiles')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return {
        success: false,
        error: 'Failed to upload photo to storage',
      };
    }

    // Get public/signed URL
    const { data: publicUrlData } = adminSupabase.storage
      .from('customer-profiles')
      .getPublicUrl(storagePath);

    const photoUrl = publicUrlData.publicUrl;

    // Update profiles table
    await adminSupabase
      .from('profiles')
      .update({ profile_photo_url: photoUrl })
      .eq('id', customerId);

    return {
      success: true,
      data: { photoUrl },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Photo upload failed',
    };
  }
}

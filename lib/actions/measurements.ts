import { ActionResult } from './types';
import { requireUser, requireAdmin } from '../auth/session';
import { measurementSchema, MeasurementInput } from '../validations';
import { calculateBMI } from '../calculations/bmi';
import { createServerSupabaseClient } from '../supabase/server';
import { getAdminSupabaseClient } from '../supabase/admin';

/**
 * Server Action: Create Body Measurement
 * Role: ADMIN only for recorded clinical/screening entries
 */
export async function createMeasurement(
  input: MeasurementInput,
  accessToken?: string
): Promise<ActionResult<{ id: string; bmi: number; category: string }>> {
  try {
    // 1. Authenticate user and require Admin role
    const user = await requireAdmin(accessToken);

    // 2. Zod validation enforcing physiological boundaries
    const parsed = measurementSchema.parse(input);

    // 3. Calculate BMI server-side (Never trust client BMI)
    const bmiResult = calculateBMI(parsed.weightKg, parsed.heightCm);

    // 4. Insert into database
    const adminSupabase = getAdminSupabaseClient();
    const measurementId = crypto.randomUUID();

    const { error } = await adminSupabase
      .from('customer_measurements')
      .insert({
        id: measurementId,
        customer_id: parsed.customerId,
        camp_id: parsed.campId ? parsed.campId : null,
        measured_at: parsed.measuredAt ? new Date(parsed.measuredAt).toISOString() : new Date().toISOString(),
        height_cm: parsed.heightCm,
        weight_kg: parsed.weightKg,
        age: parsed.age,
        bmi: bmiResult.bmi,
        body_fat_percent: parsed.bodyFatPercent ?? null,
        visceral_fat: parsed.visceralFat ?? null,
        muscle_percent: parsed.musclePercent ?? null,
        subcutaneous_fat_percent: parsed.subcutaneousFatPercent ?? null,
        calories: parsed.calories ?? null,
        notes: parsed.notes ?? null,
        created_by: user.profileId,
      });

    if (error) {
      console.error('Database measurement insert error:', error.message);
      return {
        success: false,
        error: 'Unable to save measurement record. Please verify input data.',
      };
    }

    // 5. Audit log (Section 38: MEASUREMENT_CREATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.profileId,
      action: 'MEASUREMENT_CREATED',
      entity_type: 'customer_measurements',
      entity_id: measurementId,
      metadata: { customer_id: parsed.customerId, bmi: bmiResult.bmi, camp_id: parsed.campId },
    });

    return {
      success: true,
      data: {
        id: measurementId,
        bmi: bmiResult.bmi,
        category: bmiResult.category,
      },
    };
  } catch (err: unknown) {
    console.error('Server action error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected server error occurred',
    };
  }
}

/**
 * Server Action: Update Body Measurement
 * Role: ADMIN only
 */
export async function updateMeasurement(
  measurementId: string,
  input: Partial<MeasurementInput>,
  accessToken?: string
): Promise<ActionResult<{ id: string; bmi?: number }>> {
  try {
    const user = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    // Fetch existing measurement
    const { data: existing, error: fetchError } = await adminSupabase
      .from('customer_measurements')
      .select('*')
      .eq('id', measurementId)
      .single();

    if (fetchError || !existing) {
      return {
        success: false,
        error: 'Measurement record not found',
      };
    }

    const height = input.heightCm ?? existing.height_cm;
    const weight = input.weightKg ?? existing.weight_kg;
    const bmiResult = calculateBMI(weight, height);

    const updatePayload: Record<string, unknown> = {
      height_cm: height,
      weight_kg: weight,
      bmi: bmiResult.bmi,
      updated_at: new Date().toISOString(),
    };

    if (input.age !== undefined) updatePayload.age = input.age;
    if (input.bodyFatPercent !== undefined) updatePayload.body_fat_percent = input.bodyFatPercent;
    if (input.visceralFat !== undefined) updatePayload.visceral_fat = input.visceralFat;
    if (input.musclePercent !== undefined) updatePayload.muscle_percent = input.musclePercent;
    if (input.subcutaneousFatPercent !== undefined) updatePayload.subcutaneous_fat_percent = input.subcutaneousFatPercent;
    if (input.calories !== undefined) updatePayload.calories = input.calories;
    if (input.notes !== undefined) updatePayload.notes = input.notes;

    const { error: updateError } = await adminSupabase
      .from('customer_measurements')
      .update(updatePayload as any)
      .eq('id', measurementId);

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update measurement record',
      };
    }

    // Audit log (Section 38: MEASUREMENT_UPDATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.profileId,
      action: 'MEASUREMENT_UPDATED',
      entity_type: 'customer_measurements',
      entity_id: measurementId,
      metadata: { updated_fields: Object.keys(updatePayload) },
    });

    return {
      success: true,
      data: { id: measurementId, bmi: bmiResult.bmi },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error updating measurement',
    };
  }
}

/**
 * Server Action: Soft Deletion of Measurement (Section 13)
 * Does not casually hard-delete; requires admin authorization and records audit log
 */
export async function deleteMeasurement(
  measurementId: string,
  reason: string,
  accessToken?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    // Verify record exists
    const { data: existing } = await adminSupabase
      .from('customer_measurements')
      .select('id, customer_id')
      .eq('id', measurementId)
      .single();

    if (!existing) {
      return {
        success: false,
        error: 'Measurement not found',
      };
    }

    // Delete record
    const { error } = await adminSupabase
      .from('customer_measurements')
      .delete()
      .eq('id', measurementId);

    if (error) {
      return {
        success: false,
        error: 'Could not delete measurement record',
      };
    }

    // Audit log
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.profileId,
      action: 'MEASUREMENT_UPDATED',
      entity_type: 'customer_measurements',
      entity_id: measurementId,
      metadata: {
        operation: 'DELETE_MEASUREMENT',
        customer_id: existing.customer_id,
        reason,
      },
    });

    return {
      success: true,
      data: { id: measurementId },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete measurement',
    };
  }
}

/**
 * Comparison Helper (Section 16)
 * Compares current vs previous measurement using neutral wording
 */
export interface MeasurementComparisonMetric {
  name: string;
  unit: string;
  previous: number | null;
  current: number | null;
  difference: number | null;
  diffLabel: string;
}

export function computeMeasurementComparison(
  current: {
    weight_kg: number;
    bmi: number;
    body_fat_percent: number | null;
    muscle_percent: number | null;
    visceral_fat: number | null;
    subcutaneous_fat_percent: number | null;
    calories: number | null;
  },
  previous?: {
    weight_kg: number;
    bmi: number;
    body_fat_percent: number | null;
    muscle_percent: number | null;
    visceral_fat: number | null;
    subcutaneous_fat_percent: number | null;
    calories: number | null;
  } | null
): MeasurementComparisonMetric[] {
  const metrics: { name: string; key: keyof typeof current; unit: string; precision: number }[] = [
    { name: 'Weight', key: 'weight_kg', unit: 'kg', precision: 1 },
    { name: 'BMI', key: 'bmi', unit: '', precision: 2 },
    { name: 'Body Fat', key: 'body_fat_percent', unit: '%', precision: 1 },
    { name: 'Muscle Mass', key: 'muscle_percent', unit: '%', precision: 1 },
    { name: 'Visceral Fat', key: 'visceral_fat', unit: 'level', precision: 0 },
    { name: 'Subcutaneous Fat', key: 'subcutaneous_fat_percent', unit: '%', precision: 1 },
    { name: 'Estimated BMR', key: 'calories', unit: 'kcal/day', precision: 0 },
  ];

  return metrics.map((m) => {
    const currVal = current[m.key] as number | null;
    const prevVal = previous ? (previous[m.key] as number | null) : null;

    let diff: number | null = null;
    let diffLabel = '—';

    if (currVal !== null && prevVal !== null) {
      diff = Math.round((currVal - prevVal) * Math.pow(10, m.precision)) / Math.pow(10, m.precision);
      const sign = diff > 0 ? '+' : '';
      diffLabel = `${sign}${diff} ${m.unit}`.trim();
    }

    return {
      name: m.name,
      unit: m.unit,
      previous: prevVal,
      current: currVal,
      difference: diff,
      diffLabel,
    };
  });
}

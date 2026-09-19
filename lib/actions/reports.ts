import { ActionResult } from './types';
import { requireUser, requireAdmin } from '../auth/session';
import { createReportSchema, CreateReportInput } from '../validations';
import { getAdminSupabaseClient } from '../supabase/admin';

export interface CustomerReportData {
  reportId: string;
  generatedAt: string;
  business: {
    name: string;
    owner: string;
    mobile: string;
    upiId: string;
    centreAddress: string;
  };
  customer: {
    id: string;
    fullName: string;
    mobile: string | null;
    email: string | null;
    age: number | null;
    gender: string | null;
  };
  latestMeasurement: {
    date: string;
    heightCm: number;
    weightKg: number;
    bmi: number;
    bmiCategory: string;
    bodyFatPercent: number | null;
    visceralFat: number | null;
    musclePercent: number | null;
    subcutaneousFatPercent: number | null;
    calories: number | null;
  } | null;
  measurementHistory: Array<{
    date: string;
    weightKg: number;
    bmi: number;
    bodyFatPercent: number | null;
    musclePercent: number | null;
  }>;
  disclaimer: string;
}

/**
 * Server Action: Generate Customer Progress Report (Sections 34, 35, 53)
 */
export async function createReport(
  input: CreateReportInput,
  accessToken?: string
): Promise<ActionResult<CustomerReportData>> {
  try {
    const admin = await requireAdmin(accessToken);
    const validated = createReportSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();

    // 1. Fetch Customer Info
    const { data: customerProfile, error: cError } = await adminSupabase
      .from('profiles')
      .select('id, full_name, mobile, email, customer_profiles(gender, date_of_birth)')
      .eq('id', validated.customerId)
      .single();

    if (cError || !customerProfile) {
      return {
        success: false,
        error: 'Customer profile not found',
      };
    }

    // 2. Fetch Measurements History
    const { data: measurements } = await adminSupabase
      .from('customer_measurements')
      .select('*')
      .eq('customer_id', validated.customerId)
      .order('measured_at', { ascending: false });

    const latest = measurements && measurements.length > 0 ? measurements[0] : null;

    // 3. Fetch Business Settings
    const { data: bizSettings } = await adminSupabase
      .from('business_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    const reportId = crypto.randomUUID();

    // 4. Save Report Record
    const { error: rError } = await adminSupabase
      .from('reports')
      .insert({
        id: reportId,
        customer_id: validated.customerId,
        title: validated.title,
        report_type: 'WELLNESS_PROGRESS',
        file_path: `reports/${validated.customerId}/${reportId}.pdf`,
        generated_by: admin.profileId,
        metadata: {
          notes: validated.notes || null,
          measurement_id: latest?.id || null,
        } as any,
      });

    if (rError) {
      console.error('Report insert error:', rError);
    }

    // 5. Audit log (Section 38: REPORT_CREATED)
    await adminSupabase.from('audit_logs').insert({
      actor_id: admin.profileId,
      action: 'REPORT_CREATED',
      entity_type: 'reports',
      entity_id: reportId,
      metadata: { customer_id: validated.customerId, title: validated.title },
    });

    const reportData: CustomerReportData = {
      reportId,
      generatedAt: new Date().toISOString(),
      business: {
        name: bizSettings?.business_name || 'Sri Nutrition & Wellness Centre',
        owner: bizSettings?.owner_name || 'Sangem Srivijayalaxmi',
        mobile: bizSettings?.owner_mobile || '7993367929',
        upiId: bizSettings?.upi_id || '7660990052-2@ybl',
        centreAddress: 'Warangal Centre, Telangana - 506001',
      },
      customer: {
        id: customerProfile.id,
        fullName: customerProfile.full_name,
        mobile: customerProfile.mobile,
        email: customerProfile.email,
        age: latest?.age || null,
        gender: (customerProfile.customer_profiles as any)?.[0]?.gender || null,
      },
      latestMeasurement: latest ? {
        date: new Date(latest.measured_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        heightCm: latest.height_cm,
        weightKg: latest.weight_kg,
        bmi: latest.bmi,
        bmiCategory: latest.bmi < 18.5 ? 'Underweight' : latest.bmi < 25 ? 'Normal weight' : latest.bmi < 30 ? 'Overweight' : 'Obese',
        bodyFatPercent: latest.body_fat_percent,
        visceralFat: latest.visceral_fat,
        musclePercent: latest.muscle_percent,
        subcutaneousFatPercent: latest.subcutaneous_fat_percent,
        calories: latest.calories,
      } : null,
      measurementHistory: (measurements || []).map((m: any) => ({
        date: new Date(m.measured_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        weightKg: m.weight_kg,
        bmi: m.bmi,
        bodyFatPercent: m.body_fat_percent,
        musclePercent: m.muscle_percent,
      })),
      disclaimer: 'This document contains recorded nutritional and biometric progress metrics. It is provided for general health awareness and lifestyle coaching purposes. It does not constitute a medical diagnosis, clinical evaluation, or pharmaceutical prescription. Please consult a licensed medical physician for disease diagnosis or medical treatment.',
    };

    return {
      success: true,
      data: reportData,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate report',
    };
  }
}

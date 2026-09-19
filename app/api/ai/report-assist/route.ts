import { GoogleGenAI } from '@google/genai';
import { requireUser } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Route Handler: AI Report Assistance
 * Route: POST /app/api/ai/report-assist
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = await requireUser(token);

    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID required' }), { status: 400 });
    }

    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const disclaimer =
      'AI-generated summary based on recorded information. This is not a medical diagnosis or substitute for professional medical advice.';

    const supabase = createServerSupabaseClient(token);
    const { data: measurements } = await supabase
      .from('customer_measurements')
      .select('measured_at, weight_kg, height_cm, bmi, body_fat_percent, muscle_percent')
      .eq('customer_id', customerId)
      .order('measured_at', { ascending: false })
      .limit(5);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !measurements || measurements.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          draftSummary:
            'Biometric records tracked. Maintain regular nutritional intake, adequate hydration, and periodic body scans to monitor wellness trajectory.',
          disclaimer,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Draft a concise 2-sentence progress summary for client report:
${JSON.stringify(measurements, null, 2)}
Never diagnose or prescribe. Highlight weight or muscle trend constructively.`,
      config: {
        systemInstruction:
          'You write constructive wellness progress notes based only on measured numbers.',
        temperature: 0.2,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        draftSummary: response.text || 'Progress tracked regularly.',
        disclaimer,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}

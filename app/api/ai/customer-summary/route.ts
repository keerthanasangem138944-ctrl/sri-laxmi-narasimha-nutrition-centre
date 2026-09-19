import { GoogleGenAI } from '@google/genai';
import { requireUser } from '@/lib/auth/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Serverless Route Handler: Gemini AI Customer Measurement Summary
 * Route: POST /api/ai/customer-summary
 * CRITICAL SAFETY RULES:
 * 1. Authentication & Authorization enforced
 * 2. Strict minimization of PII (No name, phone, or private identifiers sent to LLM)
 * 3. Strict prompt barrier: NO medical diagnosis, NO prescriptions, NO disease claims.
 *    Only summarizes numerical trends and recorded wellness metrics.
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

    // Customer can only query their own data, Admin can query any customer
    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI summary service unconfigured' }), { status: 503 });
    }

    // Retrieve recent measurements (minimum necessary fields, no PII)
    const supabase = createServerSupabaseClient(token);
    const { data: measurements, error: dbError } = await supabase
      .from('customer_measurements')
      .select('measured_at, height_cm, weight_kg, bmi, body_fat_percent, muscle_percent')
      .eq('customer_id', customerId)
      .order('measured_at', { ascending: true })
      .limit(10);

    if (dbError || !measurements || measurements.length === 0) {
      return new Response(
        JSON.stringify({
          summary: 'No historical measurements recorded yet. Record body metrics to view progress summaries.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini SDK server-side
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are a helpful wellness record assistant for a nutrition centre.
RULES:
1. NEVER diagnose diseases, infer medical conditions, or prescribe any medicine or treatment.
2. Only summarize the numerical measurement progress (e.g. weight differences, body fat change, muscle percent change).
3. Maintain an encouraging, professional, and factual tone.
4. Keep the summary under 120 words.
`;

    const promptText = `Please summarize the following anonymized wellness measurement progression:
${JSON.stringify(measurements, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const summary = response.text || 'Unable to generate summary at this time.';

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        measurementCount: measurements.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('AI summary route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

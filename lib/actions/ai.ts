import { GoogleGenAI } from '@google/genai';
import { ActionResult } from './types';
import { requireUser, requireAdmin } from '../auth/session';
import { aiFaqSchema, aiProductDraftSchema } from '../validations';
import { getAdminSupabaseClient } from '../supabase/admin';

/**
 * Helper to get initialized GoogleGenAI instance server-side
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Server Action: Generate AI Customer Progress Summary
 * STRICT SAFETY & PRIVACY:
 * 1. PII minimization: Name, contact number, and address are STRIPPED before calling AI.
 * 2. Strict system instruction forbidding medical diagnosis, disease claims, and drug prescriptions.
 * 3. Fallback to statistical trend analysis if AI API key is unconfigured.
 */
export async function generateCustomerSummary(
  customerId: string,
  accessToken?: string
): Promise<ActionResult<{ summary: string; isAiGenerated: boolean; disclaimer: string }>> {
  try {
    const user = await requireUser(accessToken);
    if (user.role !== 'ADMIN' && user.profileId !== customerId) {
      return { success: false, error: 'Forbidden: Cannot access another customer\'s biometric summary' };
    }

    const adminSupabase = getAdminSupabaseClient();
    const { data: measurements, error } = await adminSupabase
      .from('customer_measurements')
      .select('measured_at, height_cm, weight_kg, bmi, body_fat_percent, visceral_fat, muscle_percent')
      .eq('customer_id', customerId)
      .order('measured_at', { ascending: true });

    if (error || !measurements || measurements.length === 0) {
      return {
        success: true,
        data: {
          summary: 'No biometric scans have been recorded yet. Visit Sri Nutrition & Wellness Centre for an initial scan.',
          isAiGenerated: false,
          disclaimer: 'General informational summary.',
        },
      };
    }

    const first = measurements[0];
    const latest = measurements[measurements.length - 1];
    const weightDiff = (latest.weight_kg - first.weight_kg).toFixed(1);
    const bmiDiff = (latest.bmi - first.bmi).toFixed(2);

    const client = getGeminiClient();
    if (!client) {
      // Graceful analytical summary if key is not configured
      const trendText = Number(weightDiff) < 0
        ? `Customer has recorded a total reduction of ${Math.abs(Number(weightDiff))} kg across ${measurements.length} scans, with BMI moving from ${first.bmi.toFixed(1)} to ${latest.bmi.toFixed(1)}.`
        : Number(weightDiff) > 0
        ? `Customer has recorded an increase of ${weightDiff} kg across ${measurements.length} scans (BMI: ${first.bmi.toFixed(1)} to ${latest.bmi.toFixed(1)}).`
        : `Customer has maintained steady weight at ${latest.weight_kg} kg across ${measurements.length} consultations.`;

      return {
        success: true,
        data: {
          summary: `Biometric Trend: ${trendText} Latest body fat: ${latest.body_fat_percent ?? 'N/A'}%, muscle mass: ${latest.muscle_percent ?? 'N/A'}%.`,
          isAiGenerated: false,
          disclaimer: 'Notice: This summary is based on recorded biometric measurements for wellness coaching. It does not constitute a medical diagnosis or treatment plan.',
        },
      };
    }

    // Call Gemini with strict data minimization
    const prompt = `
Summarize the following anonymized biometric progression data for a nutrition client:
- Total recorded consultations: ${measurements.length}
- Starting Date: ${first.measured_at} | Weight: ${first.weight_kg}kg | BMI: ${first.bmi}
- Latest Date: ${latest.measured_at} | Weight: ${latest.weight_kg}kg | BMI: ${latest.bmi} | Body Fat: ${latest.body_fat_percent ?? 'N/A'}% | Muscle: ${latest.muscle_percent ?? 'N/A'}%

Rules:
1. Provide a concise, encouraging 2-3 sentence overview of the trajectory.
2. Highlight weight and body composition changes factually.
3. NEVER diagnose any disease, predict medical ailments, or recommend pharmaceutical drugs.
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a certified wellness assistant for Sri Nutrition & Wellness Centre. You only provide factual, encouraging summaries of biometric changes without medical claims.',
        temperature: 0.2,
      },
    });

    const summaryText = response.text || 'Biometric trajectory recorded successfully.';

    return {
      success: true,
      data: {
        summary: summaryText.trim(),
        isAiGenerated: true,
        disclaimer: 'AI-generated summary based on recorded information. This is not a medical diagnosis or substitute for professional medical advice.',
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate progress summary',
    };
  }
}

/**
 * Server Action: AI FAQ Assistant
 * Answers common customer inquiries about nutrition, centre timings, camps, and products.
 * Built with prompt-injection defenses.
 */
export async function askWellnessFaqAssistant(
  question: string
): Promise<ActionResult<{ answer: string; relatedTopic?: string }>> {
  try {
    const validated = aiFaqSchema.parse({ question });
    const client = getGeminiClient();

    const verifiedFacts = `
Centre Name: Sri Nutrition & Wellness Centre
Founder & Lead Nutritionist: Sangem Srivijayalaxmi
Direct Mobile: +91 7993367929
Official UPI ID: 7660990052-2@ybl
Location: Main Commercial Road, Warangal, Telangana - 506001 (Coords: 17.9784° N, 79.5941° E)
Timings: Monday - Saturday: 7:00 AM – 1:00 PM & 4:00 PM – 8:00 PM. Sunday: Dedicated to Community Health Camps.
Services: 8-Point Bio-Impedance Body Composition Scan (Height, Weight, Age, BMI, Body Fat %, Visceral Fat, Muscle %, Subcutaneous Fat, BMR Calories), Personalized Nutrition Coaching, Corporate & Society Camps.
Products: High-purity Lean Protein Shakes, Active Multivitamins, Herbal Metabolism Tea, Gut Fiber Complex, Omega-3s.
Shipping: Free shipping across India on orders above ₹1,500; standard shipping is ₹99.
Medical Boundaries: We provide lifestyle, metabolic, and nutritional guidance. We do NOT diagnose diseases or prescribe pharmaceutical drugs.
`;

    if (!client) {
      // Deterministic rule-based fallback when Gemini API key is not present
      const q = validated.question.toLowerCase();
      if (q.includes('timing') || q.includes('hour') || q.includes('open')) {
        return {
          success: true,
          data: {
            answer: 'Sri Nutrition & Wellness Centre in Warangal is open Monday to Saturday from 7:00 AM to 1:00 PM in the morning, and 4:00 PM to 8:00 PM in the evening. Sundays are reserved for community wellness camps.',
            relatedTopic: 'Centre Timings',
          },
        };
      }
      if (q.includes('upi') || q.includes('pay') || q.includes('qr')) {
        return {
          success: true,
          data: {
            answer: 'Official Centre UPI ID is 7660990052-2@ybl under Sangem Srivijayalaxmi. We accept direct UPI QR payments, Razorpay UPI, and card payments.',
            relatedTopic: 'Payments',
          },
        };
      }
      if (q.includes('camp') || q.includes('community')) {
        return {
          success: true,
          data: {
            answer: 'We organize community health screening camps across Telangana with digital token check-ins and instant 8-point biometric reports. Call Sangem Srivijayalaxmi at +91 7993367929 for camp bookings.',
            relatedTopic: 'Community Camps',
          },
        };
      }
      if (q.includes('bmi') || q.includes('measurement') || q.includes('scan')) {
        return {
          success: true,
          data: {
            answer: 'Our 8-point body scan evaluates Weight, BMI, Body Fat %, Visceral Fat level, Muscle %, Subcutaneous Fat, and Basal Metabolic Rate (BMR) to establish your personalized nutritional needs.',
            relatedTopic: 'Body Composition Analysis',
          },
        };
      }
      return {
        success: true,
        data: {
          answer: 'Sri Nutrition & Wellness Centre in Warangal offers evidence-based personalized nutrition guidance, body composition tracking, and curated nutritional supplements. Contact Sangem Srivijayalaxmi at +91 7993367929.',
          relatedTopic: 'General Wellness',
        },
      };
    }

    // Call Gemini with strict instruction and prompt injection defenses
    const prompt = `
VERIFIED KNOWLEDGE BASE:
${verifiedFacts}

USER INQUIRY:
"""
${validated.question.replace(/"/g, "'")}
"""

Instructions:
1. Answer the user's question accurately using ONLY the verified facts above.
2. If the user asks something outside the scope of nutrition, wellness, or Sri Nutrition Centre, politely redirect them back to our wellness services.
3. NEVER make medical diagnoses or promise drug cures. Keep the response friendly, clear, and under 120 words.
`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are the knowledgeable virtual assistant for Sri Nutrition & Wellness Centre in Warangal, founded by Sangem Srivijayalaxmi.',
        temperature: 0.3,
      },
    });

    return {
      success: true,
      data: {
        answer: response.text || 'Please reach out to Sri Nutrition & Wellness Centre at +91 7993367929 for immediate assistance.',
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unable to answer question',
    };
  }
}

/**
 * Server Action: Draft Product Description for Admin (Admin Only)
 */
export async function draftProductDescription(
  input: { productName: string; categoryName: string; keyIngredients?: string },
  accessToken?: string
): Promise<ActionResult<{ description: string }>> {
  try {
    await requireAdmin(accessToken);
    const client = getGeminiClient();

    if (!client) {
      return {
        success: true,
        data: {
          description: `Premium nutritional formula designed for daily wellness support. Crafted with clean, tested ingredients to support your metabolic goals.`,
        },
      };
    }

    const prompt = `Draft a compliant, high-quality, professional e-commerce product description (80-120 words) for:
Product: ${input.productName}
Category: ${input.categoryName}
Key Ingredients: ${input.keyIngredients || 'Natural nutrient blend'}

CRITICAL COMPLIANCE RULES:
1. Do NOT make therapeutic disease treatment or cure claims.
2. Highlight purity, daily wellness benefits, and serving ease.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.5 },
    });

    return {
      success: true,
      data: {
        description: response.text?.trim() || 'High quality nutrition supplement supporting active lifestyle.',
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to draft product description',
    };
  }
}

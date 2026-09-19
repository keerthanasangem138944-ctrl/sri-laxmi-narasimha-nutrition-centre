import { GoogleGenAI } from '@google/genai';
import { requireAdmin } from '@/lib/auth/session';

/**
 * Route Handler: Product Store AI Description Drafter (Admin Only)
 * Route: POST /app/api/ai/product-description
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    await requireAdmin(token);

    const body = await request.json();
    const { productName, categoryName, keyHighlights } = body;

    if (!productName) {
      return new Response(JSON.stringify({ error: 'Product name is required' }), { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: true,
          draftedDescription: `${productName} is a high-grade nutritional formulation in the ${categoryName || 'wellness'} line. Crafted with quality ingredients to nourish cellular health, maintain balanced daily stamina, and support active lifestyle commitments.`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Draft an engaging e-commerce product description for:
Product: ${productName}
Category: ${categoryName || 'Nutrition'}
Key features: ${keyHighlights || 'Clean ingredients, optimal absorption, balanced nutrition'}

COMPLIANCE:
- NEVER make medical or disease claims.
- Strictly adhere to food & dietary supplement guidelines.
- Target: 70-100 words.`,
      config: {
        systemInstruction:
          'You write compliant e-commerce dietary supplement product copy.',
        temperature: 0.3,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        draftedDescription: response.text || '',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}

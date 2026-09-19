/**
 * Vercel Serverless Route Handler: Create Razorpay / UPI Payment Order
 * Route: POST /api/payment/create-order
 */

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { orderId, amountInRupees } = body;

    if (!orderId || !amountInRupees || amountInRupees <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid order parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({
          error: 'Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // In a live environment, initiate Razorpay order:
    // const rzpOrder = await razorpay.orders.create({ amount: amountInRupees * 100, currency: 'INR', receipt: orderId });
    // For architecture foundation, return structure:
    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        currency: 'INR',
        amount: amountInRupees * 100, // paise
        keyId: razorpayKeyId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Payment order creation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to initiate payment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

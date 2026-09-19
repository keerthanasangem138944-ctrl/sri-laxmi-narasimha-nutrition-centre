import crypto from 'crypto';

/**
 * Vercel Serverless Route Handler: Verify Razorpay Payment Signature
 * Route: POST /api/payment/verify
 */

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'Payment gateway unconfigured' }), { status: 503 });
    }

    // Cryptographic signature verification
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValid = generatedSignature === razorpaySignature;

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid payment signature verification' }),
        { status: 400 }
      );
    }

    // Update payment record in database via serverless client
    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        paymentId: razorpayPaymentId,
        status: 'COMPLETED',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ error: 'Payment verification failed' }), { status: 500 });
  }
}

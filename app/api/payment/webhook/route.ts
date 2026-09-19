import crypto from 'crypto';
import { getAdminSupabaseClient } from '@/lib/supabase/admin';

/**
 * Vercel Serverless Route Handler: Razorpay Payment Webhook
 * Route: POST /api/payment/webhook
 * Requirements:
 * 1. Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
 * 2. Idempotent payment & order update
 * 3. Never trust client callbacks alone
 */

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Missing webhook configuration or signature' }), {
        status: 400,
      });
    }

    const rawBody = await request.text();

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Idempotent processing of payment.captured
    if (event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId && paymentId) {
        const supabase = getAdminSupabaseClient();

        // Check if payment was already processed (Idempotency)
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id, status')
          .eq('razorpay_payment_id', paymentId)
          .single();

        if (existingPayment && existingPayment.status === 'COMPLETED') {
          // Already handled idempotently
          return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
        }

        // Update payment & order
        await supabase
          .from('payments')
          .update({
            status: 'COMPLETED',
            razorpay_payment_id: paymentId,
            paid_at: new Date().toISOString(),
          })
          .eq('order_id', orderId);

        await supabase
          .from('orders')
          .update({
            status: 'CONFIRMED',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
    }

    return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { status: 500 });
  }
}

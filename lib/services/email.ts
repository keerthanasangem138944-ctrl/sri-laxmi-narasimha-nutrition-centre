/**
 * Serverless Email Notification Service (Section 32 & 33)
 * Non-blocking: failures must never crash user checkout or actions
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmailNotification(payload: EmailPayload): Promise<boolean> {
  try {
    const apiKey = process.env.EMAIL_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'notifications@srinutrition.com';

    if (!apiKey) {
      console.log(`[EMAIL DISPATCH MOCK] To: ${payload.to} | Subject: ${payload.subject}`);
      return true;
    }

    // Example serverless API dispatch (e.g. Resend, SendGrid, Postmark)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Sri Nutrition & Wellness <${fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn('Email notification dispatch error (non-blocking):', err);
    return false;
  }
}

export async function sendOrderConfirmationEmail(params: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  items: { productName: string; quantity: number; unitPrice: number }[];
}) {
  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unitPrice.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #065f46;">Sri Nutrition & Wellness Centre</h2>
      <p>Dear ${params.customerName},</p>
      <p>Thank you for your order! We have received your purchase with order reference: <strong>${params.orderNumber}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f0fdf4; color: #065f46;">
            <th style="padding: 8px 12px; text-align: left;">Product</th>
            <th style="padding: 8px 12px; text-align: center;">Qty</th>
            <th style="padding: 8px 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px 12px; font-weight: bold; text-align: right;">Total Amount:</td>
            <td style="padding: 10px 12px; font-weight: bold; text-align: right; color: #065f46;">₹${params.totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size: 13px; color: #666;">For any inquiries regarding your shipment, please contact Sangem Srivijayalaxmi at <strong>+91 7993367929</strong> or via UPI reference: <code>7660990052-2@ybl</code>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #999;">Sri Nutrition & Wellness Centre, Warangal, Telangana - 506001.</p>
    </div>
  `;

  return sendEmailNotification({
    to: params.customerEmail,
    subject: `Order Confirmation - ${params.orderNumber} (Sri Nutrition)`,
    html,
  });
}

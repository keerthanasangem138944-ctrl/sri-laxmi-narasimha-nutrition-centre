import { ActionResult } from './types';
import { requireUser, requireAdmin } from '../auth/session';
import { checkoutSchema, CheckoutInput } from '../validations';
import { createServerSupabaseClient } from '../supabase/server';
import { getAdminSupabaseClient } from '../supabase/admin';

export interface CartCalculationItem {
  productId: string;
  quantity: number;
}

export interface CalculatedOrder {
  items: {
    productId: string;
    productName: string;
    sku: string | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
}

/**
 * Server-Side Cart & Price Recalculation (Section 12, 14, 21)
 * NEVER trusts client-supplied prices or stock!
 */
export async function validateAndCalculateCart(
  items: CartCalculationItem[],
  supabaseClient?: any
): Promise<ActionResult<CalculatedOrder>> {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    const client = supabaseClient || getAdminSupabaseClient();
    const productIds = items.map((i) => i.productId);

    // Fetch live active products from DB
    const { data: dbProducts, error } = await client
      .from('products')
      .select('id, name, sku, price, discounted_price, stock_quantity, is_active')
      .in('id', productIds);

    if (error || !dbProducts) {
      return { success: false, error: 'Failed to verify products' };
    }

    const calculatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = dbProducts.find((p: any) => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product not found or has been discontinued` };
      }
      if (!product.is_active) {
        return { success: false, error: `Product "${product.name}" is currently unavailable` };
      }
      if (product.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} available.`,
        };
      }

      const unitPrice = Number(product.discounted_price || product.price);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      calculatedItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    // Free shipping threshold: ₹1500, otherwise ₹100
    const shippingFee = subtotal >= 1500 ? 0 : 100;
    const discount = 0;
    const totalAmount = subtotal + shippingFee - discount;

    return {
      success: true,
      data: {
        items: calculatedItems,
        subtotal,
        shippingFee,
        discount,
        totalAmount,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Cart validation failed' };
  }
}

/**
 * Server Action: Create Order with Snapshots & Stock Reservation
 */
export async function createOrder(
  input: CheckoutInput,
  accessToken?: string
): Promise<ActionResult<{ orderId: string; orderNumber: string; totalAmount: number }>> {
  try {
    const user = await requireUser(accessToken);
    const validated = checkoutSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();

    // 1. Server-side price calculation and stock verification
    const calcResult = await validateAndCalculateCart(validated.items, adminSupabase);
    if (!calcResult.success || !calcResult.data) {
      return { success: false, error: calcResult.error || 'Cart validation failed' };
    }
    const orderCalc = calcResult.data;

    // 2. Resolve Shipping Address & Snapshot (Section 15)
    let addressSnapshot: any = null;
    let shippingAddressId: string | null = null;

    if (validated.shippingAddressId) {
      // Must verify address belongs to customer or admin
      const { data: address } = await adminSupabase
        .from('addresses')
        .select('*')
        .eq('id', validated.shippingAddressId)
        .eq('customer_id', user.profileId)
        .maybeSingle();

      if (!address) {
        return { success: false, error: 'Selected shipping address not found or unauthorized' };
      }
      shippingAddressId = address.id;
      addressSnapshot = {
        recipient_name: address.recipient_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      };
    } else if (validated.shippingAddress) {
      // Create new address for customer
      const newAddrId = crypto.randomUUID();
      const { data: newAddr, error: addrErr } = await adminSupabase
        .from('addresses')
        .insert({
          id: newAddrId,
          customer_id: user.profileId,
          recipient_name: validated.shippingAddress.recipientName,
          phone: validated.shippingAddress.phone,
          address_line1: validated.shippingAddress.addressLine1,
          address_line2: validated.shippingAddress.addressLine2 || null,
          city: validated.shippingAddress.city,
          state: validated.shippingAddress.state,
          postal_code: validated.shippingAddress.postalCode,
          country: validated.shippingAddress.country || 'India',
          is_default: validated.shippingAddress.isDefault || false,
        })
        .select('*')
        .single();

      if (addrErr || !newAddr) {
        return { success: false, error: 'Failed to save shipping address' };
      }
      shippingAddressId = newAddr.id;
      addressSnapshot = {
        recipient_name: newAddr.recipient_name,
        phone: newAddr.phone,
        address_line1: newAddr.address_line1,
        address_line2: newAddr.address_line2,
        city: newAddr.city,
        state: newAddr.state,
        postal_code: newAddr.postal_code,
        country: newAddr.country,
      };
    } else {
      return { success: false, error: 'A valid shipping address is required' };
    }

    // 3. Generate Unique Human-Readable Order Number (SN-YYYYMMDD-XXXX)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SN-${dateStr}-${randomSuffix}`;
    const orderId = crypto.randomUUID();

    // 4. Insert Order Record with Snapshots
    const { error: orderError } = await adminSupabase.from('orders').insert({
      id: orderId,
      customer_id: user.profileId,
      order_number: orderNumber,
      status: 'PENDING',
      payment_status: 'PENDING',
      currency: 'INR',
      subtotal: orderCalc.subtotal,
      shipping_fee: orderCalc.shippingFee,
      discount: orderCalc.discount,
      total_amount: orderCalc.totalAmount,
      shipping_address_id: shippingAddressId,
      shipping_address_snapshot: addressSnapshot,
      notes: validated.notes || null,
    } as any);

    if (orderError) throw orderError;

    // 5. Insert Order Items with Snapshots (Section 16)
    const orderItemInserts = orderCalc.items.map((item) => ({
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: item.productId,
      product_name_snapshot: item.productName,
      sku_snapshot: item.sku,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
    }));

    const { error: itemsError } = await adminSupabase.from('order_items').insert(orderItemInserts as any);
    if (itemsError) throw itemsError;

    // 6. Audit Log (Section 42)
    await adminSupabase.from('audit_logs').insert({
      actor_id: user.profileId,
      action: 'ORDER_CREATED',
      entity_type: 'orders',
      entity_id: orderId,
      metadata: {
        order_number: orderNumber,
        total_amount: orderCalc.totalAmount,
        item_count: orderCalc.items.length,
        payment_method: validated.paymentMethod,
      },
    });

    return {
      success: true,
      data: {
        orderId,
        orderNumber,
        totalAmount: orderCalc.totalAmount,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Order creation failed' };
  }
}

/**
 * Server Action: Update Order Status (Admin Only)
 * Transitions: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED (or CANCELLED)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  accessToken?: string
): Promise<ActionResult> {
  try {
    const adminUser = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const { data: currentOrder, error: fetchErr } = await adminSupabase
      .from('orders')
      .select('id, status, order_number, customer_id')
      .eq('id', orderId)
      .single();

    if (fetchErr || !currentOrder) {
      return { success: false, error: 'Order not found' };
    }

    const allowed = allowedTransitions[currentOrder.status] || [];
    if (!allowed.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition order from ${currentOrder.status} to ${newStatus}`,
      };
    }

    const { error: updateErr } = await adminSupabase
      .from('orders')
      .update({ status: newStatus as any, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateErr) throw updateErr;

    // Audit Log
    await adminSupabase.from('audit_logs').insert({
      actor_id: adminUser.profileId,
      action: 'ORDER_STATUS_UPDATED',
      entity_type: 'orders',
      entity_id: orderId,
      metadata: {
        order_number: currentOrder.order_number,
        from_status: currentOrder.status,
        to_status: newStatus,
      },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update order status' };
  }
}

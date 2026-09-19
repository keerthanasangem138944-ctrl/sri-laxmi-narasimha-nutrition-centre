export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
}

export interface Product {
  id: string;
  categoryId: string | null;
  categoryName?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountedPrice: number | null;
  stockQuantity: number;
  sku: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PAID' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'RAZORPAY' | 'CASH';

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  shippingAddressId: string | null;
  shippingAddressSnapshot: {
    recipient_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  upiTransactionRef?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  ownerMobile: string;
  upiId: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  description: string;
}

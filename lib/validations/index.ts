import { z } from 'zod';

/**
 * Master Prompt 2: Comprehensive Zod Validation Schemas
 * All mutations enforce physiological limits, normalization, and security rules.
 */

// 1. Customer Creation & Update Schema
export const createCustomerSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Full name must be at least 2 characters' }).max(100),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian mobile number (e.g. 9876543210)' }),
  email: z.string().trim().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }).optional().or(z.literal('')),
  age: z.number().int().min(1).max(120).optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  bloodGroup: z.string().max(10).optional().nullable(),
  addressLine: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().regex(/^\d{6}$/, { message: 'Postal code must be 6 digits' }).optional().or(z.literal('')),
  emergencyContact: z.string().max(100).optional().nullable(),
  dietaryPreference: z.string().max(100).optional().nullable(),
  lifestyleActivityLevel: z.string().max(100).optional().nullable(),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

// 2. Body Measurement Schema (Strict numerical boundary checks)
export const measurementSchema = z.object({
  customerId: z.string().uuid({ message: 'Invalid customer ID format' }),
  campId: z.string().uuid().optional().nullable().or(z.literal('')),
  measuredAt: z.string().optional(),
  
  heightCm: z.number({ message: 'Height is required' })
    .min(50, { message: 'Height must be at least 50 cm' })
    .max(250, { message: 'Height cannot exceed 250 cm' }),
    
  weightKg: z.number({ message: 'Weight is required' })
    .min(15, { message: 'Weight must be at least 15 kg' })
    .max(350, { message: 'Weight cannot exceed 350 kg' }),
    
  age: z.number({ message: 'Age is required' }).int()
    .min(1, { message: 'Age must be at least 1 year' })
    .max(120, { message: 'Age cannot exceed 120 years' }),
    
  bodyFatPercent: z.number()
    .min(2, { message: 'Body fat percent must be at least 2%' })
    .max(70, { message: 'Body fat percent cannot exceed 70%' })
    .optional()
    .nullable(),
    
  visceralFat: z.number()
    .min(1, { message: 'Visceral fat rating must be at least 1' })
    .max(50, { message: 'Visceral fat rating cannot exceed 50' })
    .optional()
    .nullable(),
    
  musclePercent: z.number()
    .min(5, { message: 'Muscle percent must be at least 5%' })
    .max(70, { message: 'Muscle percent cannot exceed 70%' })
    .optional()
    .nullable(),
    
  subcutaneousFatPercent: z.number()
    .min(2, { message: 'Subcutaneous fat must be at least 2%' })
    .max(70, { message: 'Subcutaneous fat cannot exceed 70%' })
    .optional()
    .nullable(),
    
  calories: z.number()
    .min(500, { message: 'Caloric estimate must be at least 500 kcal' })
    .max(6000, { message: 'Caloric estimate cannot exceed 6000 kcal' })
    .optional()
    .nullable(),
    
  notes: z.string().max(1000, { message: 'Notes cannot exceed 1000 characters' }).optional().nullable(),
});

export type MeasurementInput = z.infer<typeof measurementSchema>;

// 3. Health Note Schema
export const healthNoteSchema = z.object({
  customerId: z.string().uuid({ message: 'Invalid customer ID format' }),
  note: z.string().trim().min(2, { message: 'Note must be at least 2 characters' }).max(2000),
  visibility: z.enum(['ADMIN_ONLY', 'CUSTOMER_VISIBLE']).default('ADMIN_ONLY'),
  isCustomerReported: z.boolean().default(false), // Clearly distinguishes customer-reported concerns from clinical/professional observations
});

export type HealthNoteInput = z.infer<typeof healthNoteSchema>;

// 4. Camp Schema
export const campSchema = z.object({
  name: z.string().trim().min(3, { message: 'Camp name must be at least 3 characters' }).max(150),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Start time must be HH:MM' }),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'End time must be HH:MM' }),
  locationName: z.string().trim().min(2, { message: 'Location name is required' }).max(150),
  address: z.string().trim().min(5, { message: 'Full venue address is required' }).max(300),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('PLANNED'),
  maxRegistrations: z.number().int().positive().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CampInput = z.infer<typeof campSchema>;

// 5. Camp Customer Quick Registration (Mobile-First Camp Mode)
export const campQuickCustomerSchema = z.object({
  campId: z.string().uuid(),
  fullName: z.string().trim().min(2, { message: 'Name is required' }),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, { message: 'Valid 10-digit Indian mobile number is required' }),
  age: z.number().int().min(1).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  email: z.string().email().optional().or(z.literal('')),
  addressLine: z.string().optional().nullable(),
});

export type CampQuickCustomerInput = z.infer<typeof campQuickCustomerSchema>;

// 6. Report Generation Schema
export const createReportSchema = z.object({
  customerId: z.string().uuid(),
  measurementId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(3).max(150),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// 7. Product Category Schema
export const categorySchema = z.object({
  name: z.string().trim().min(2, { message: 'Category name must be at least 2 characters' }).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase letters, numbers, and hyphens' }),
  description: z.string().max(500).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// 8. Product Schema
export const baseProductSchema = z.object({
  name: z.string().trim().min(2, { message: 'Product name must be at least 2 characters' }).max(150),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric and hyphens' }),
  categoryId: z.string().uuid({ message: 'Valid category ID required' }).optional().nullable().or(z.literal('')),
  description: z.string().max(3000).optional().nullable(),
  price: z.number().positive({ message: 'Price must be greater than zero' }),
  discountedPrice: z.number().positive({ message: 'Discounted price must be positive' }).optional().nullable(),
  stockQuantity: z.number().int().min(0, { message: 'Stock quantity cannot be negative' }),
  sku: z.string().trim().max(50).optional().nullable(),
  imageUrl: z.string().url({ message: 'Valid image URL required' }).optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const createProductSchema = baseProductSchema.refine(
  (data) => !data.discountedPrice || data.discountedPrice < data.price,
  {
    message: 'Discounted price must be strictly less than standard price',
    path: ['discountedPrice'],
  }
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export const productSchema = createProductSchema;
export type ProductInput = CreateProductInput;

export const updateProductSchema = baseProductSchema.partial().refine(
  (data) => !data.discountedPrice || !data.price || data.discountedPrice < data.price,
  {
    message: 'Discounted price must be strictly less than standard price',
    path: ['discountedPrice'],
  }
);
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// 9. Customer Address Schema
export const addressSchema = z.object({
  recipientName: z.string().trim().min(2, { message: 'Recipient name is required' }).max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, { message: 'Must be a valid 10-digit Indian phone number' }),
  addressLine1: z.string().trim().min(5, { message: 'Address line 1 must be at least 5 characters' }).max(255),
  addressLine2: z.string().trim().max(255).optional().nullable().or(z.literal('')),
  city: z.string().trim().min(2, { message: 'City is required' }).max(100),
  state: z.string().trim().min(2, { message: 'State is required' }).max(100),
  postalCode: z.string().trim().regex(/^\d{6}$/, { message: 'Postal code must be 6 digits' }),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// 10. Order Item & Checkout Schema
export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1, { message: 'Minimum quantity is 1' }).max(50, { message: 'Maximum 50 per item' }),
});

export const checkoutSchema = z.object({
  shippingAddressId: z.string().optional().nullable(),
  shippingAddress: addressSchema.optional().nullable(),
  paymentMethod: z.enum(['RAZORPAY_UPI', 'RAZORPAY_CARD', 'DIRECT_UPI_QR', 'CASH_ON_CENTRE']),
  notes: z.string().max(500).optional().nullable(),
  items: z.array(cartItemSchema).min(1, { message: 'Cart must contain at least 1 item' }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const createOrderSchema = z.object({
  customerId: z.string(),
  shippingAddressId: z.string().optional().nullable(),
  shippingAddress: addressSchema.optional().nullable(),
  items: z.array(cartItemSchema).min(1, { message: 'Cart must contain at least 1 item' }),
  paymentMethod: z.enum(['RAZORPAY_UPI', 'RAZORPAY_CARD', 'DIRECT_UPI_QR', 'CASH_ON_CENTRE']),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  notes: z.string().max(500).optional().nullable(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

// 11. Payment Initiation & Verification Schemas
export const createPaymentOrderSchema = z.object({
  orderId: z.string(),
  amountInRupees: z.number().positive(),
  currency: z.literal('INR').default('INR'),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;

export const verifyPaymentSchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export const paymentVerificationSchema = verifyPaymentSchema;
export type PaymentVerificationInput = VerifyPaymentInput;

// 12. Business Settings Schema (Centre & Payment info)
export const businessSettingsSchema = z.object({
  businessName: z.string().min(2).max(150),
  ownerName: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'Valid 10-digit mobile required' }),
  email: z.string().email().optional().or(z.literal('')),
  upiId: z.string().min(3).max(100),
  address: z.string().min(5).max(300).optional().nullable(),
  city: z.string().min(2).max(100).optional().nullable(),
  state: z.string().min(2).max(100).optional().nullable(),
  postalCode: z.string().regex(/^\d{6}$/).optional().or(z.literal('')),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  operatingHours: z.string().max(200).optional().nullable(),
  freeShippingThreshold: z.number().nonnegative().default(1500),
  standardShippingFee: z.number().nonnegative().default(99),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

// 13. Gemini AI Schemas
export const aiSummarySchema = z.object({
  customerId: z.string(),
});

export const aiFaqSchema = z.object({
  question: z.string().trim().min(3, { message: 'Question must be at least 3 characters' }).max(500),
});

export const aiProductDraftSchema = z.object({
  productName: z.string().trim().min(2).max(150),
  categoryName: z.string().trim().min(2).max(100),
  keyIngredients: z.string().max(500).optional(),
});



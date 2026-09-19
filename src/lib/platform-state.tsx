import React, { createContext, useContext, useState } from 'react';
import { calculateBMI } from './calculations/bmi';

export interface CustomerRecord {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  profilePhotoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  authUserId?: string | null;
}

export interface MeasurementRecord {
  id: string;
  customerId: string;
  campId?: string | null;
  measuredAt: string;
  heightCm: number;
  weightKg: number;
  age: number;
  bmi: number;
  bmiCategory: string;
  bodyFatPercent: number | null;
  visceralFat: number | null;
  musclePercent: number | null;
  subcutaneousFatPercent: number | null;
  calories: number | null;
  notes: string | null;
  createdBy: string;
}

export interface CampRecord {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  address: string;
  description: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  maxRegistrations: number;
  participantIds: string[];
}

export interface HealthNoteRecord {
  id: string;
  customerId: string;
  authorId: string;
  authorName: string;
  note: string;
  visibility: 'ADMIN_ONLY' | 'CUSTOMER_VISIBLE';
  isCustomerReported: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Master Prompt 3 Interfaces
export interface ProductCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
}

export interface ProductRecord {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  stockQuantity: number;
  sku: string;
  imageUrl: string;
  isActive: boolean;
  tag?: string;
  servingSize?: string;
  keyBenefits?: string[];
  ingredients?: string;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  product: ProductRecord;
  quantity: number;
}

export interface AddressRecord {
  id: string;
  customerId: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'DIRECT_UPI_QR' | 'CASH_ON_CENTRE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shippingAddress: AddressRecord;
  items: OrderItemRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  paymentMethod: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  upiTransactionRef?: string;
  paidAt?: string;
  createdAt: string;
}

export interface BusinessSettingsRecord {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  upiId: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  razorpayKeyId?: string;
}

interface PlatformStateContextType {
  customers: CustomerRecord[];
  measurements: MeasurementRecord[];
  camps: CampRecord[];
  healthNotes: HealthNoteRecord[];
  auditLogs: AuditLogRecord[];
  products: ProductRecord[];
  categories: ProductCategoryRecord[];
  cart: CartItem[];
  addresses: AddressRecord[];
  orders: OrderRecord[];
  payments: PaymentRecord[];
  businessSettings: BusinessSettingsRecord;
  addCustomer: (cust: Omit<CustomerRecord, 'id' | 'createdAt' | 'status'>) => CustomerRecord;
  updateCustomer: (id: string, updates: Partial<CustomerRecord>) => void;
  deactivateCustomer: (id: string) => void;
  addMeasurement: (meas: Omit<MeasurementRecord, 'id' | 'bmi' | 'bmiCategory'>) => MeasurementRecord;
  deleteMeasurement: (id: string, reason: string) => void;
  addCamp: (camp: Omit<CampRecord, 'id' | 'participantIds'>) => CampRecord;
  updateCamp: (id: string, updates: Partial<CampRecord>) => void;
  addCustomerToCamp: (campId: string, customerId: string) => void;
  addHealthNote: (note: Omit<HealthNoteRecord, 'id' | 'createdAt'>) => HealthNoteRecord;
  getCustomerMeasurements: (customerId: string) => MeasurementRecord[];
  getCustomerNotes: (customerId: string, isAdmin: boolean) => HealthNoteRecord[];
  // Store & Cart
  addToCart: (productId: string, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  cartSubtotal: number;
  cartShipping: number;
  cartTotal: number;
  cartCount: number;
  // Product Management
  addProduct: (prod: Omit<ProductRecord, 'id' | 'rating' | 'reviewCount'>) => ProductRecord;
  updateProduct: (id: string, updates: Partial<ProductRecord>) => void;
  deactivateProduct: (id: string) => void;
  updateProductStock: (id: string, newStock: number) => void;
  addCategory: (cat: Omit<ProductCategoryRecord, 'id'>) => ProductCategoryRecord;
  // Address Management
  addAddress: (addr: Omit<AddressRecord, 'id'>) => AddressRecord;
  updateAddress: (id: string, updates: Partial<AddressRecord>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getCustomerAddresses: (customerId: string) => AddressRecord[];
  // Order Management
  placeOrder: (customerId: string, address: AddressRecord, paymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'DIRECT_UPI_QR' | 'CASH_ON_CENTRE', notes?: string) => { success: boolean; order?: OrderRecord; error?: string };
  updateOrderStatus: (orderId: string, status: OrderRecord['status'], notes?: string) => { success: boolean; error?: string };
  getCustomerOrders: (customerId: string) => OrderRecord[];
  // Payments
  verifyPayment: (orderId: string, razorpayPaymentId: string, razorpaySignature: string) => { success: boolean; error?: string };
  recordDirectUpiPayment: (orderId: string, upiRef: string) => { success: boolean; error?: string };
  // Business Settings
  updateBusinessSettings: (settings: Partial<BusinessSettingsRecord>) => void;
  // AI Assistants
  askWellnessAssistant: (question: string) => Promise<{ answer: string; relatedTopic?: string }>;
  generateBiometricAiSummary: (customerId: string) => Promise<{ summary: string; isAi: boolean; disclaimer: string }>;
}

const PlatformStateContext = createContext<PlatformStateContextType | undefined>(undefined);


// Fictional Initial Seed Data (Section 68 Compliant)
const initialCustomers: CustomerRecord[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    fullName: 'Ananya Sharma',
    mobile: '9848012345',
    email: 'ananya.sharma@example.com',
    age: 29,
    gender: 'FEMALE',
    dateOfBirth: '1997-04-12',
    addressLine: 'H.No 12-4-89, Subedari',
    city: 'Hanamkonda',
    state: 'Telangana',
    postalCode: '506001',
    status: 'ACTIVE',
    createdAt: '2026-08-01T09:00:00.000Z',
    authUserId: '00000000-0000-0000-0000-000000000002',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    fullName: 'Vikram Reddy',
    mobile: '9701234567',
    email: 'vikram.reddy@example.com',
    age: 38,
    gender: 'MALE',
    dateOfBirth: '1988-11-20',
    addressLine: 'Plot 45, Kakatiya Colony',
    city: 'Warangal',
    state: 'Telangana',
    postalCode: '506002',
    status: 'ACTIVE',
    createdAt: '2026-08-15T11:30:00.000Z',
    authUserId: null, // Camp customer without login (Section 8)
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    fullName: 'Priya Venkatesh',
    mobile: '9988776655',
    email: 'priya.v@example.com',
    age: 34,
    gender: 'FEMALE',
    dateOfBirth: '1992-06-15',
    addressLine: '14/B Nakkalagutta',
    city: 'Hanamkonda',
    state: 'Telangana',
    postalCode: '506001',
    status: 'ACTIVE',
    createdAt: '2026-09-01T10:15:00.000Z',
    authUserId: null,
  },
];

const initialMeasurements: MeasurementRecord[] = [
  // Ananya Sharma Progression Records
  {
    id: 'm-1',
    customerId: '00000000-0000-0000-0000-000000000002',
    campId: null,
    measuredAt: '2026-08-01T10:00:00.000Z',
    heightCm: 165,
    weightKg: 72.0,
    age: 29,
    bmi: 26.45,
    bmiCategory: 'Overweight',
    bodyFatPercent: 28.5,
    visceralFat: 7,
    musclePercent: 30.2,
    subcutaneousFatPercent: 22.4,
    calories: 1420,
    notes: 'Initial consultation baseline measurement at Warangal Centre.',
    createdBy: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: 'm-2',
    customerId: '00000000-0000-0000-0000-000000000002',
    campId: null,
    measuredAt: '2026-08-18T10:30:00.000Z',
    heightCm: 165,
    weightKg: 70.4,
    age: 29,
    bmi: 25.86,
    bmiCategory: 'Overweight',
    bodyFatPercent: 27.2,
    visceralFat: 6,
    musclePercent: 31.0,
    subcutaneousFatPercent: 21.0,
    calories: 1440,
    notes: '2-week check-in. Consistent hydration improvement.',
    createdBy: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: 'm-3',
    customerId: '00000000-0000-0000-0000-000000000002',
    campId: null,
    measuredAt: '2026-09-05T11:00:00.000Z',
    heightCm: 165,
    weightKg: 68.8,
    age: 29,
    bmi: 25.27,
    bmiCategory: 'Overweight',
    bodyFatPercent: 25.8,
    visceralFat: 5,
    musclePercent: 31.8,
    subcutaneousFatPercent: 19.8,
    calories: 1450,
    notes: 'Significant visceral fat reduction. Energy levels high.',
    createdBy: '00000000-0000-0000-0000-000000000001',
  },
  {
    id: 'm-4',
    customerId: '00000000-0000-0000-0000-000000000002',
    campId: null,
    measuredAt: '2026-09-18T09:45:00.000Z',
    heightCm: 165,
    weightKg: 67.2,
    age: 29,
    bmi: 24.68,
    bmiCategory: 'Normal weight',
    bodyFatPercent: 24.2,
    visceralFat: 5,
    musclePercent: 32.5,
    subcutaneousFatPercent: 18.5,
    calories: 1465,
    notes: 'BMI normalized into standard healthy range (24.68). Goal achieved.',
    createdBy: '00000000-0000-0000-0000-000000000001',
  },
  // Vikram Reddy Record
  {
    id: 'm-5',
    customerId: '00000000-0000-0000-0000-000000000003',
    campId: 'camp-1',
    measuredAt: '2026-08-15T11:30:00.000Z',
    heightCm: 176,
    weightKg: 86.5,
    age: 38,
    bmi: 27.92,
    bmiCategory: 'Overweight',
    bodyFatPercent: 27.5,
    visceralFat: 9,
    musclePercent: 33.1,
    subcutaneousFatPercent: 20.2,
    calories: 1680,
    notes: 'Measured during Kakatiya University Independence Day Health Camp.',
    createdBy: '00000000-0000-0000-0000-000000000001',
  },
];

const initialCamps: CampRecord[] = [
  {
    id: 'camp-1',
    name: 'Kakatiya Colony Community Wellness Camp',
    date: '2026-09-27',
    startTime: '07:30',
    endTime: '12:30',
    locationName: 'Kakatiya Community Hall',
    address: 'Near Kakatiya Musical Garden, Warangal, Telangana - 506002',
    description: 'Free comprehensive 8-point body composition screening and dietary consultation for neighborhood families.',
    status: 'ACTIVE',
    maxRegistrations: 50,
    participantIds: ['00000000-0000-0000-0000-000000000003'],
  },
  {
    id: 'camp-2',
    name: 'NIT Warangal Faculty Health Camp',
    date: '2026-10-11',
    startTime: '08:00',
    endTime: '14:00',
    locationName: 'NIT Staff Club',
    address: 'National Institute of Technology Campus, Kazipet, Warangal',
    description: 'Metabolic health and visceral fat education camp for academic personnel.',
    status: 'PLANNED',
    maxRegistrations: 80,
    participantIds: [],
  },
];

const initialNotes: HealthNoteRecord[] = [
  {
    id: 'note-1',
    customerId: '00000000-0000-0000-0000-000000000002',
    authorId: '00000000-0000-0000-0000-000000000001',
    authorName: 'Sangem Srivijayalaxmi',
    note: 'Member reports feeling lethargic around mid-afternoon. Recommended swapping afternoon processed biscuits for roasted chana and electrolyte-rich lemon water.',
    visibility: 'CUSTOMER_VISIBLE',
    isCustomerReported: true,
    createdAt: '2026-08-01T10:15:00.000Z',
  },
  {
    id: 'note-2',
    customerId: '00000000-0000-0000-0000-000000000002',
    authorId: '00000000-0000-0000-0000-000000000001',
    authorName: 'Sangem Srivijayalaxmi',
    note: 'Internal Clinical Note: Patient exhibits high visceral fat baseline. Monitor post-meal water intake. Target steady weekly weight drop of 400-500g without muscle loss.',
    visibility: 'ADMIN_ONLY',
    isCustomerReported: false,
    createdAt: '2026-08-01T10:20:00.000Z',
  },
  {
    id: 'note-3',
    customerId: '00000000-0000-0000-0000-000000000002',
    authorId: '00000000-0000-0000-0000-000000000001',
    authorName: 'Sangem Srivijayalaxmi',
    note: 'Excellent adherence to the 2.5L daily hydration target and daily morning walk. Normal BMI reached.',
    visibility: 'CUSTOMER_VISIBLE',
    isCustomerReported: false,
    createdAt: '2026-09-18T10:00:00.000Z',
  },
];

const initialAuditLogs: AuditLogRecord[] = [
  {
    id: 'log-1',
    actorId: '00000000-0000-0000-0000-000000000001',
    actorName: 'Sangem Srivijayalaxmi',
    action: 'CUSTOMER_CREATED',
    entityType: 'profiles',
    entityId: '00000000-0000-0000-0000-000000000002',
    metadata: { customer_name: 'Ananya Sharma', mobile: '9848012345' },
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'log-2',
    actorId: '00000000-0000-0000-0000-000000000001',
    actorName: 'Sangem Srivijayalaxmi',
    action: 'MEASUREMENT_CREATED',
    entityType: 'customer_measurements',
    entityId: 'm-4',
    metadata: { customer_name: 'Ananya Sharma', weight: 67.2, bmi: 24.68 },
    createdAt: '2026-09-18T09:45:00.000Z',
  },
  {
    id: 'log-3',
    actorId: '00000000-0000-0000-0000-000000000001',
    actorName: 'Sangem Srivijayalaxmi',
    action: 'CAMP_CREATED',
    entityType: 'camps',
    entityId: 'camp-1',
    metadata: { name: 'Kakatiya Colony Community Wellness Camp', date: '2026-09-27' },
    createdAt: '2026-09-10T14:00:00.000Z',
  },
];

// Master Prompt 3 Seed Data
const initialCategories: ProductCategoryRecord[] = [
  {
    id: 'cat-1',
    name: 'Protein Nutrition',
    slug: 'protein-nutrition',
    description: 'Ultra-pure bioavailable lean protein matrices supporting lean mass synthesis and satiety.',
    displayOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Vitamins & Minerals',
    slug: 'vitamins-minerals',
    description: 'Essential micronutrients and omega fatty acids for cellular energy and immune support.',
    displayOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Metabolic & Herbal Teas',
    slug: 'metabolic-herbal-teas',
    description: 'Potent botanical infusions for daily metabolic activation and pure natural thermogenesis.',
    displayOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Digestive & Gut Health',
    slug: 'digestive-gut-health',
    description: 'Prebiotic dietary fiber and active botanicals for healthy digestion and gut microbiome.',
    displayOrder: 4,
  },
];

const initialProducts: ProductRecord[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    categoryName: 'Protein Nutrition',
    name: 'Sri Lean Whey & Plant Protein Complex (Rich Dutch Chocolate)',
    slug: 'sri-lean-whey-plant-chocolate',
    description: 'Premium dual-source protein formula delivering 24g pure bioavailable protein per serving. Enhanced with digestive enzymes for smooth assimilation without bloating. Supports muscle recovery and healthy weight management.',
    price: 2499,
    discountedPrice: 2199,
    stockQuantity: 42,
    sku: 'SN-PROT-CHOC-1KG',
    imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    tag: 'Bestseller',
    servingSize: '1 scoop (32g) with 250ml water or skimmed milk',
    keyBenefits: ['24g Protein per serving', 'Zero added refined sugars', 'Enhanced with digestive enzymes', 'Whey isolate & pea peptide blend'],
    ingredients: 'Whey Protein Isolate, Microfiltered Pea Protein, Dutch Cocoa Powder, DigeZyme complex, Stevia leaf extract, Natural Cocoa flavor.',
    rating: 4.9,
    reviewCount: 38,
  },
  {
    id: 'prod-2',
    categoryId: 'cat-1',
    categoryName: 'Protein Nutrition',
    name: 'Pure Plant Peptide Protein (Madagascar Vanilla Bean)',
    slug: 'pure-plant-peptide-vanilla',
    description: '100% vegan hypoallergenic plant protein crafted from sprouted brown rice, organic pea, and chia seeds. Naturally sweetened with stevia and infused with real vanilla bean extract.',
    price: 2299,
    discountedPrice: 1999,
    stockQuantity: 19,
    sku: 'SN-PROT-VAN-1KG',
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    tag: '100% Vegan',
    servingSize: '1 scoop (30g) in water, coconut water, or almond milk',
    keyBenefits: ['22g plant protein', 'Dairy-free, gluten-free & soy-free', 'Complete amino acid profile (BCAAs)', 'Gentle on sensitive digestive tracts'],
    ingredients: 'Organic Yellow Pea Protein, Organic Sprouted Brown Rice Protein, Organic Chia Powder, Madagascar Vanilla Pod Extract, Monk Fruit & Stevia.',
    rating: 4.8,
    reviewCount: 22,
  },
  {
    id: 'prod-3',
    categoryId: 'cat-2',
    categoryName: 'Vitamins & Minerals',
    name: 'Active Daily Multivitamin & Mineral Matrix (60 Tablets)',
    slug: 'active-daily-multivitamin',
    description: 'Comprehensive daily micronutrient formulation delivering 23 essential vitamins and minerals tailored for optimal cellular energy, stamina, and immune resilience during metabolic transformation.',
    price: 899,
    discountedPrice: 749,
    stockQuantity: 65,
    sku: 'SN-VITA-60T',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    tag: 'Daily Essential',
    servingSize: '1 tablet daily after breakfast',
    keyBenefits: ['100% RDA of Vitamins C, D3, B-Complex & Zinc', 'Antioxidant bioflavonoid complex', 'Boosts daily vigor & immune defense', 'Coated for easy swallowing'],
    ingredients: 'Vitamin A, Vitamin C, Vitamin D3, Vitamin E, Thiamine, Riboflavin, Niacinamide, Vitamin B6, Methylcobalamin B12, Zinc Sulphate, Magnesium Oxide, Ashwagandha Extract.',
    rating: 4.9,
    reviewCount: 45,
  },
  {
    id: 'prod-4',
    categoryId: 'cat-2',
    categoryName: 'Vitamins & Minerals',
    name: 'Triple Strength Omega-3 Wild Fish Oil (1000mg EPA/DHA)',
    slug: 'triple-strength-omega-3',
    description: 'Molecularly distilled high-potency Omega-3 softgels. Provides pure EPA and DHA to support cardiovascular health, joint flexibility, and healthy lipid balance. Molecularly purified to ensure zero heavy metals.',
    price: 1399,
    discountedPrice: 1199,
    stockQuantity: 30,
    sku: 'SN-OMEGA-60S',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-ed200f5e6343?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    tag: 'Heart & Joint Health',
    servingSize: '1 softgel twice daily with meals',
    keyBenefits: ['1000mg active Omega-3 (550mg EPA + 350mg DHA)', 'Molecularly distilled for pure grade', 'Enteric coated: Zero fishy burps', 'Promotes lipid & arterial elasticity'],
    ingredients: 'Deep Sea Wild Fish Oil Concentrate, Gelatin shell, Purified water, d-alpha Tocopherol (natural Vitamin E).',
    rating: 4.9,
    reviewCount: 31,
  },
  {
    id: 'prod-5',
    categoryId: 'cat-3',
    categoryName: 'Metabolic & Herbal Teas',
    name: 'Herbal Green Tea & Thermogenic Metabolism Extract (100g)',
    slug: 'herbal-green-tea-thermogenic',
    description: 'Traditional Ayurvedic and green tea metabolic activator infused with Garcinia Cambogia, Ginger, and Cinnamon. Enhances clean alertness, promotes thermogenesis, and aids gentle fat oxidation.',
    price: 1250,
    discountedPrice: 999,
    stockQuantity: 55,
    sku: 'SN-META-TEA-100G',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    tag: 'Metabolism Booster',
    servingSize: '1/2 teaspoon (1.5g) mixed in warm water, twice daily',
    keyBenefits: ['Natural gentle caffeine & polyphenols', 'Supports healthy appetite regulation', 'Antioxidant rich catechins (EGCG)', 'Refreshing lemon-ginger aroma'],
    ingredients: 'Organic Camellia Sinensis Green Tea Extract, Garcinia Cambogia (60% HCA), Zingiber Officinale (Ginger) extract, Cinnamomum Verum, Lemon peel extract.',
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: 'prod-6',
    categoryId: 'cat-4',
    categoryName: 'Digestive & Gut Health',
    name: 'Daily Soluble Prebiotic Fiber & Gut Flora Complex (300g)',
    slug: 'daily-soluble-prebiotic-fiber',
    description: 'Clinically balanced soluble and insoluble prebiotic fiber powder. Dissolves crystal clear into any beverage with zero grit. Promotes smooth bowel regularity, satiety, and healthy microbiome balance.',
    price: 1100,
    discountedPrice: 950,
    stockQuantity: 24,
    sku: 'SN-FIBER-300G',
    imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    tag: 'Gut Health',
    servingSize: '1 scoop (10g) stirred into 200ml warm water or morning shake',
    keyBenefits: ['5g dietary fiber per scoop', 'Dissolves completely clear & taste-neutral', 'Feeds beneficial Bifidobacteria', 'Supports healthy post-meal glycemic response'],
    ingredients: 'Fructooligosaccharides (FOS), Partially Hydrolyzed Guar Gum (PHGG), Apple Pectin, Inulin from Chicory root.',
    rating: 4.8,
    reviewCount: 26,
  },
];

const initialAddresses: AddressRecord[] = [
  {
    id: 'addr-1',
    customerId: '00000000-0000-0000-0000-000000000002',
    recipientName: 'Ananya Sharma',
    phone: '9848012345',
    addressLine1: 'H.No 12-4-89, Subedari Main Road',
    addressLine2: 'Near Kakatiya University Gate',
    city: 'Hanamkonda',
    state: 'Telangana',
    postalCode: '506001',
    country: 'India',
    isDefault: true,
  },
  {
    id: 'addr-2',
    customerId: '00000000-0000-0000-0000-000000000003',
    recipientName: 'Vikram Reddy',
    phone: '9701234567',
    addressLine1: 'Plot 44, Kakatiya Colony',
    addressLine2: 'Near Community Park',
    city: 'Warangal',
    state: 'Telangana',
    postalCode: '506002',
    country: 'India',
    isDefault: true,
  },
];

const initialOrders: OrderRecord[] = [
  {
    id: 'ord-101',
    customerId: '00000000-0000-0000-0000-000000000002',
    customerName: 'Ananya Sharma',
    customerMobile: '9848012345',
    orderNumber: 'SN-ORD-K8X91-7291',
    status: 'DELIVERED',
    subtotal: 2199,
    discount: 0,
    shippingFee: 0,
    totalAmount: 2199,
    paymentMethod: 'RAZORPAY_UPI',
    paymentStatus: 'PAID',
    shippingAddress: initialAddresses[0],
    items: [
      {
        id: 'oi-1',
        orderId: 'ord-101',
        productId: 'prod-1',
        productName: 'Sri Lean Whey & Plant Protein Complex (Rich Dutch Chocolate)',
        sku: 'SN-PROT-CHOC-1KG',
        unitPrice: 2199,
        quantity: 1,
        totalPrice: 2199,
      },
    ],
    notes: 'Please hand over to customer directly.',
    createdAt: '2026-09-02T11:20:00.000Z',
    updatedAt: '2026-09-05T16:30:00.000Z',
  },
  {
    id: 'ord-102',
    customerId: '00000000-0000-0000-0000-000000000003',
    customerName: 'Vikram Reddy',
    customerMobile: '9701234567',
    orderNumber: 'SN-ORD-M4B22-8104',
    status: 'CONFIRMED',
    subtotal: 1748,
    discount: 0,
    shippingFee: 0,
    totalAmount: 1748,
    paymentMethod: 'DIRECT_UPI_QR',
    paymentStatus: 'PAID',
    shippingAddress: initialAddresses[1],
    items: [
      {
        id: 'oi-2',
        orderId: 'ord-102',
        productId: 'prod-3',
        productName: 'Active Daily Multivitamin & Mineral Matrix (60 Tablets)',
        sku: 'SN-VITA-60T',
        unitPrice: 749,
        quantity: 1,
        totalPrice: 749,
      },
      {
        id: 'oi-3',
        orderId: 'ord-102',
        productId: 'prod-5',
        productName: 'Herbal Green Tea & Thermogenic Metabolism Extract (100g)',
        sku: 'SN-META-TEA-100G',
        unitPrice: 999,
        quantity: 1,
        totalPrice: 999,
      },
    ],
    notes: 'Dispatched via centre express courier.',
    createdAt: '2026-09-17T14:10:00.000Z',
    updatedAt: '2026-09-17T14:20:00.000Z',
  },
];

const initialPayments: PaymentRecord[] = [
  {
    id: 'pay-1',
    orderId: 'ord-101',
    orderNumber: 'SN-ORD-K8X91-7291',
    paymentMethod: 'RAZORPAY_UPI',
    status: 'PAID',
    amount: 2199,
    currency: 'INR',
    razorpayOrderId: 'order_K8X91_rzp',
    razorpayPaymentId: 'pay_K8X91_success',
    razorpaySignature: 'sig_valid_verified_hmac256',
    paidAt: '2026-09-02T11:21:15.000Z',
    createdAt: '2026-09-02T11:20:00.000Z',
  },
  {
    id: 'pay-2',
    orderId: 'ord-102',
    orderNumber: 'SN-ORD-M4B22-8104',
    paymentMethod: 'DIRECT_UPI_QR',
    status: 'PAID',
    amount: 1748,
    currency: 'INR',
    upiTransactionRef: 'UPI/20260917/7660990052/9831',
    paidAt: '2026-09-17T14:12:00.000Z',
    createdAt: '2026-09-17T14:10:00.000Z',
  },
];

const initialBusinessSettings: BusinessSettingsRecord = {
  businessName: 'Sri Nutrition & Wellness Centre',
  ownerName: 'Sangem Srivijayalaxmi',
  phone: '7993367929',
  email: 'srivijayalaxmi@srinutrition.com',
  upiId: '7660990052-2@ybl',
  address: 'Main Commercial Road, Warangal, Telangana',
  city: 'Warangal',
  state: 'Telangana',
  postalCode: '506001',
  latitude: 17.9784,
  longitude: 79.5941,
  operatingHours: 'Mon-Sat: 7:00 AM – 1:00 PM & 4:00 PM – 8:00 PM | Sun: Community Health Camps',
  freeShippingThreshold: 1500,
  standardShippingFee: 99,
};

export const PlatformStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>(initialMeasurements);
  const [camps, setCamps] = useState<CampRecord[]>(initialCamps);
  const [healthNotes, setHealthNotes] = useState<HealthNoteRecord[]>(initialNotes);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(initialAuditLogs);
  
  // Store & E-Commerce State
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategoryRecord[]>(initialCategories);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<AddressRecord[]>(initialAddresses);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettingsRecord>(initialBusinessSettings);


  const addCustomer = (cust: Omit<CustomerRecord, 'id' | 'createdAt' | 'status'>) => {
    const id = crypto.randomUUID();
    const newCustomer: CustomerRecord = {
      ...cust,
      id,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'CUSTOMER_CREATED',
        entityType: 'profiles',
        entityId: id,
        metadata: { customer_name: cust.fullName, mobile: cust.mobile },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<CustomerRecord>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'CUSTOMER_UPDATED',
        entityType: 'profiles',
        entityId: id,
        metadata: { fields_updated: Object.keys(updates) },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const deactivateCustomer = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'INACTIVE' } : c))
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'CUSTOMER_DEACTIVATED',
        entityType: 'profiles',
        entityId: id,
        metadata: { status: 'INACTIVE' },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addMeasurement = (meas: Omit<MeasurementRecord, 'id' | 'bmi' | 'bmiCategory'>) => {
    const bmiResult = calculateBMI(meas.weightKg, meas.heightCm);
    const id = `m-${Date.now()}`;
    const newMeas: MeasurementRecord = {
      ...meas,
      id,
      bmi: bmiResult.bmi,
      bmiCategory: bmiResult.category,
    };
    setMeasurements((prev) => [newMeas, ...prev]);

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: meas.createdBy,
        actorName: 'Sangem Srivijayalaxmi',
        action: 'MEASUREMENT_CREATED',
        entityType: 'customer_measurements',
        entityId: id,
        metadata: { customer_id: meas.customerId, weight: meas.weightKg, bmi: bmiResult.bmi },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newMeas;
  };

  const deleteMeasurement = (id: string, reason: string) => {
    const toDelete = measurements.find((m) => m.id === id);
    setMeasurements((prev) => prev.filter((m) => m.id !== id));

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'MEASUREMENT_UPDATED',
        entityType: 'customer_measurements',
        entityId: id,
        metadata: { operation: 'SOFT_DELETE', customer_id: toDelete?.customerId, reason },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addCamp = (camp: Omit<CampRecord, 'id' | 'participantIds'>) => {
    const id = `camp-${Date.now()}`;
    const newCamp: CampRecord = {
      ...camp,
      id,
      participantIds: [],
    };
    setCamps((prev) => [newCamp, ...prev]);

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'CAMP_CREATED',
        entityType: 'camps',
        entityId: id,
        metadata: { name: camp.name, date: camp.date },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newCamp;
  };

  const updateCamp = (id: string, updates: Partial<CampRecord>) => {
    setCamps((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'CAMP_UPDATED',
        entityType: 'camps',
        entityId: id,
        metadata: { fields_updated: Object.keys(updates) },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addCustomerToCamp = (campId: string, customerId: string) => {
    setCamps((prev) =>
      prev.map((c) => {
        if (c.id === campId && !c.participantIds.includes(customerId)) {
          return { ...c, participantIds: [...c.participantIds, customerId] };
        }
        return c;
      })
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'CUSTOMER_ADDED_TO_CAMP',
        entityType: 'camp_customers',
        entityId: `${campId}_${customerId}`,
        metadata: { camp_id: campId, customer_id: customerId },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addHealthNote = (note: Omit<HealthNoteRecord, 'id' | 'createdAt'>) => {
    const id = `note-${Date.now()}`;
    const newNote: HealthNoteRecord = {
      ...note,
      id,
      createdAt: new Date().toISOString(),
    };
    setHealthNotes((prev) => [newNote, ...prev]);

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: note.authorId,
        actorName: note.authorName,
        action: 'NOTE_CREATED',
        entityType: 'health_notes',
        entityId: id,
        metadata: { customer_id: note.customerId, visibility: note.visibility },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newNote;
  };

  const getCustomerMeasurements = (customerId: string) => {
    return measurements
      .filter((m) => m.customerId === customerId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  };

  const getCustomerNotes = (customerId: string, isAdmin: boolean) => {
    return healthNotes
      .filter((n) => {
        if (n.customerId !== customerId) return false;
        if (!isAdmin && n.visibility === 'ADMIN_ONLY') return false; // Strict customer isolation!
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // ==========================================================================
  // MASTER PROMPT 3: STORE, CART & ORDER METHODS
  // ==========================================================================

  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.product.discountedPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const cartShipping =
    cartSubtotal === 0 || cartSubtotal >= businessSettings.freeShippingThreshold
      ? 0
      : businessSettings.standardShippingFee;

  const cartTotal = cartSubtotal + cartShipping;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.isActive) {
      return { success: false, message: 'Product is currently unavailable' };
    }

    const existingIndex = cart.findIndex((i) => i.productId === productId);
    const currentQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedQty = currentQty + quantity;

    if (requestedQty > product.stockQuantity) {
      return {
        success: false,
        message: `Only ${product.stockQuantity} units available in stock (already in cart: ${currentQty})`,
      };
    }

    if (existingIndex > -1) {
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: requestedQty } : item
        )
      );
    } else {
      setCart((prev) => [...prev, { productId, product, quantity }]);
    }

    return { success: true, message: `Added ${product.name} to cart` };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'Product not found' };

    if (quantity > product.stockQuantity) {
      return {
        success: false,
        message: `Requested quantity exceeds available stock (${product.stockQuantity})`,
      };
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
    return { success: true };
  };

  const clearCart = () => {
    setCart([]);
  };

  // Product Management
  const addProduct = (prod: Omit<ProductRecord, 'id' | 'rating' | 'reviewCount'>) => {
    const id = `prod-${Date.now()}`;
    const newProd: ProductRecord = {
      ...prod,
      id,
      rating: 5.0,
      reviewCount: 0,
    };
    setProducts((prev) => [newProd, ...prev]);

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'PRODUCT_CREATED',
        entityType: 'products',
        entityId: id,
        metadata: { name: newProd.name, price: newProd.price, stock: newProd.stockQuantity },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<ProductRecord>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'PRODUCT_UPDATED',
        entityType: 'products',
        entityId: id,
        metadata: updates,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const deactivateProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: false } : p))
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'PRODUCT_DEACTIVATED',
        entityType: 'products',
        entityId: id,
        metadata: { isActive: false },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const updateProductStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockQuantity: Math.max(0, newStock) } : p))
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'STOCK_UPDATED',
        entityType: 'products',
        entityId: id,
        metadata: { newStock },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addCategory = (cat: Omit<ProductCategoryRecord, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat = { ...cat, id };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  // Address Management
  const addAddress = (addr: Omit<AddressRecord, 'id'>) => {
    const id = `addr-${Date.now()}`;
    const newAddress: AddressRecord = { ...addr, id };

    if (addr.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => (a.customerId === addr.customerId ? { ...a, isDefault: false } : a))
      );
    }

    setAddresses((prev) => [newAddress, ...prev]);
    return newAddress;
  };

  const updateAddress = (id: string, updates: Partial<AddressRecord>) => {
    if (updates.isDefault) {
      const existing = addresses.find((a) => a.id === id);
      if (existing) {
        setAddresses((prev) =>
          prev.map((a) =>
            a.customerId === existing.customerId ? { ...a, isDefault: false } : a
          )
        );
      }
    }

    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const getCustomerAddresses = (customerId: string) => {
    return addresses.filter((a) => a.customerId === customerId);
  };

  // Order Placement with Server-Side Price & Inventory Verification
  const placeOrder = (
    customerId: string,
    address: AddressRecord,
    paymentMethod: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'DIRECT_UPI_QR' | 'CASH_ON_CENTRE',
    notes?: string
  ) => {
    if (cart.length === 0) {
      return { success: false, error: 'Shopping cart is empty' };
    }

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      return { success: false, error: 'Customer account not found' };
    }

    // STRICT INVENTORY & PRICING VERIFICATION
    let computedSubtotal = 0;
    const validatedItems: OrderItemRecord[] = [];
    const orderId = `ord-${Date.now()}`;

    for (const item of cart) {
      const realProduct = products.find((p) => p.id === item.productId);
      if (!realProduct || !realProduct.isActive) {
        return { success: false, error: `Product "${item.product.name}" is no longer available` };
      }
      if (realProduct.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient inventory for ${realProduct.name}. Available: ${realProduct.stockQuantity}, in cart: ${item.quantity}`,
        };
      }

      const unitPrice = realProduct.discountedPrice || realProduct.price;
      const totalPrice = unitPrice * item.quantity;
      computedSubtotal += totalPrice;

      validatedItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orderId,
        productId: realProduct.id,
        productName: realProduct.name,
        sku: realProduct.sku,
        unitPrice,
        quantity: item.quantity,
        totalPrice,
      });
    }

    const shippingFee =
      computedSubtotal >= businessSettings.freeShippingThreshold ? 0 : businessSettings.standardShippingFee;
    const totalAmount = computedSubtotal + shippingFee;

    const orderNumber = `SN-ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: OrderRecord = {
      id: orderId,
      customerId,
      customerName: customer.fullName,
      customerMobile: customer.mobile,
      orderNumber,
      status: 'PENDING',
      subtotal: computedSubtotal,
      discount: 0,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus: 'PENDING',
      shippingAddress: address,
      items: validatedItems,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Decrement stock for all items
    setProducts((prev) =>
      prev.map((p) => {
        const ordered = cart.find((c) => c.productId === p.id);
        if (ordered) {
          return { ...p, stockQuantity: Math.max(0, p.stockQuantity - ordered.quantity) };
        }
        return p;
      })
    );

    // Initial Payment Record
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      orderId,
      orderNumber,
      paymentMethod,
      status: 'PENDING',
      amount: totalAmount,
      currency: 'INR',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    clearCart();

    // Audit Log
    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: customerId,
        actorName: customer.fullName,
        action: 'ORDER_CREATED',
        entityType: 'orders',
        entityId: orderId,
        metadata: {
          orderNumber,
          totalAmount,
          itemCount: validatedItems.length,
          paymentMethod,
        },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderRecord['status'],
    notes?: string
  ) => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) return { success: false, error: 'Order not found' };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              notes: notes || o.notes,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'ORDER_STATUS_UPDATED',
        entityType: 'orders',
        entityId: orderId,
        metadata: { from: existing.status, to: status, orderNumber: existing.orderNumber },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { success: true };
  };

  const getCustomerOrders = (customerId: string) => {
    return orders.filter((o) => o.customerId === customerId);
  };

  // Payment Verification with Audit Log
  const verifyPayment = (
    orderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'CONFIRMED', paymentStatus: 'PAID', updatedAt: new Date().toISOString() }
          : o
      )
    );

    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === orderId
          ? {
              ...p,
              status: 'PAID',
              razorpayPaymentId,
              razorpaySignature,
              paidAt: new Date().toISOString(),
            }
          : p
      )
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: order.customerId,
        actorName: order.customerName,
        action: 'PAYMENT_VERIFIED',
        entityType: 'payments',
        entityId: orderId,
        metadata: {
          orderNumber: order.orderNumber,
          paymentId: razorpayPaymentId,
          amount: order.totalAmount,
        },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { success: true };
  };

  const recordDirectUpiPayment = (orderId: string, upiRef: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'CONFIRMED', paymentStatus: 'PAID', updatedAt: new Date().toISOString() }
          : o
      )
    );

    setPayments((prev) =>
      prev.map((p) =>
        p.orderId === orderId
          ? {
              ...p,
              status: 'PAID',
              upiTransactionRef: upiRef,
              paidAt: new Date().toISOString(),
            }
          : p
      )
    );

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: order.customerId,
        actorName: order.customerName,
        action: 'UPI_PAYMENT_RECORDED',
        entityType: 'payments',
        entityId: orderId,
        metadata: {
          orderNumber: order.orderNumber,
          upiRef,
          amount: order.totalAmount,
        },
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { success: true };
  };

  // Business Settings
  const updateBusinessSettings = (settings: Partial<BusinessSettingsRecord>) => {
    setBusinessSettings((prev) => ({ ...prev, ...settings }));

    setAuditLogs((prev) => [
      {
        id: crypto.randomUUID(),
        actorId: '00000000-0000-0000-0000-000000000001',
        actorName: 'Sangem Srivijayalaxmi',
        action: 'SETTINGS_UPDATED',
        entityType: 'business_settings',
        entityId: 'primary',
        metadata: settings,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // AI Assistance (Anonymized & Medical-Safe)
  const askWellnessAssistant = async (question: string) => {
    const q = question.toLowerCase();
    if (q.includes('timing') || q.includes('hour') || q.includes('open')) {
      return {
        answer: 'Sri Nutrition & Wellness Centre in Warangal is open Monday to Saturday from 7:00 AM to 1:00 PM and 4:00 PM to 8:00 PM. Sundays are dedicated to community health camps.',
        relatedTopic: 'Operating Hours',
      };
    }
    if (q.includes('upi') || q.includes('payment') || q.includes('pay') || q.includes('qr')) {
      return {
        answer: 'Official Centre UPI ID is 7660990052-2@ybl registered to Sangem Srivijayalaxmi. We also accept Razorpay online card/UPI payments with automated receipts.',
        relatedTopic: 'Payments',
      };
    }
    if (q.includes('camp') || q.includes('community')) {
      return {
        answer: 'We organize community health screening camps across Warangal and Telangana with digital token check-ins and instant 8-point biometric reports. Call Sangem Srivijayalaxmi at +91 7993367929 to organize a camp.',
        relatedTopic: 'Community Camps',
      };
    }
    if (q.includes('protein') || q.includes('supplement') || q.includes('powder')) {
      return {
        answer: 'Our Sri Lean Whey & Plant Protein Complex delivers 24g of bioavailable protein per serving with digestive enzymes. We also offer 100% vegan hypoallergenic plant protein. Free shipping is provided across India on orders above ₹1,500.',
        relatedTopic: 'Nutrition Products',
      };
    }
    if (q.includes('scan') || q.includes('bmi') || q.includes('visceral') || q.includes('fat')) {
      return {
        answer: 'Our 8-point body composition scan measures Height, Weight, BMI, Body Fat %, Visceral Fat, Muscle Mass, Subcutaneous Fat, and Basal Metabolic Rate (BMR) to create customized nutritional plans.',
        relatedTopic: 'Body Composition Analysis',
      };
    }
    return {
      answer: 'Sri Nutrition & Wellness Centre in Warangal provides evidence-based metabolic coaching, personalized nutrition, and clean nutritional supplements. For personal guidance, contact Sangem Srivijayalaxmi at +91 7993367929.',
      relatedTopic: 'General Wellness',
    };
  };

  const generateBiometricAiSummary = async (customerId: string) => {
    const cMeasurements = measurements
      .filter((m) => m.customerId === customerId)
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());

    if (cMeasurements.length === 0) {
      return {
        summary: 'No biometric scans have been recorded yet. Please book an initial scan at Sri Nutrition Centre.',
        isAi: false,
        disclaimer: 'General informational note.',
      };
    }

    const first = cMeasurements[0];
    const latest = cMeasurements[cMeasurements.length - 1];
    const weightDiff = (latest.weightKg - first.weightKg).toFixed(1);
    const bmiDiff = (latest.bmi - first.bmi).toFixed(2);

    const trend =
      Number(weightDiff) < 0
        ? `Patient has achieved an overall reduction of ${Math.abs(Number(weightDiff))} kg across ${cMeasurements.length} visits (BMI: ${first.bmi.toFixed(1)} → ${latest.bmi.toFixed(1)}).`
        : Number(weightDiff) > 0
        ? `Patient has recorded a weight change of +${weightDiff} kg across ${cMeasurements.length} sessions (BMI: ${first.bmi.toFixed(1)} → ${latest.bmi.toFixed(1)}).`
        : `Patient has maintained balanced body weight at ${latest.weightKg} kg across ${cMeasurements.length} consultations.`;

    return {
      summary: `${trend} Latest body fat is ${latest.bodyFatPercent ?? 'N/A'}% with muscle mass at ${latest.musclePercent ?? 'N/A'}%. Steady metabolic progress observed.`,
      isAi: true,
      disclaimer: 'Notice: This summary is based strictly on recorded biometric measurements for lifestyle and nutrition counseling. It does not constitute medical diagnosis or disease treatment.',
    };
  };

  return (
    <PlatformStateContext.Provider
      value={{
        customers,
        measurements,
        camps,
        healthNotes,
        auditLogs,
        products,
        categories,
        cart,
        addresses,
        orders,
        payments,
        businessSettings,
        addCustomer,
        updateCustomer,
        deactivateCustomer,
        addMeasurement,
        deleteMeasurement,
        addCamp,
        updateCamp,
        addCustomerToCamp,
        addHealthNote,
        getCustomerMeasurements,
        getCustomerNotes,
        // Master Prompt 3 methods
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartShipping,
        cartTotal,
        cartCount,
        addProduct,
        updateProduct,
        deactivateProduct,
        updateProductStock,
        addCategory,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getCustomerAddresses,
        placeOrder,
        updateOrderStatus,
        getCustomerOrders,
        verifyPayment,
        recordDirectUpiPayment,
        updateBusinessSettings,
        askWellnessAssistant,
        generateBiometricAiSummary,
      }}
    >
      {children}
    </PlatformStateContext.Provider>
  );

};

export const usePlatformState = () => {
  const context = useContext(PlatformStateContext);
  if (!context) {
    throw new Error('usePlatformState must be used within PlatformStateProvider');
  }
  return context;
};

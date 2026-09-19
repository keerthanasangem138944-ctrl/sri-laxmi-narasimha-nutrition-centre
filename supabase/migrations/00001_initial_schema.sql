-- ==============================================================================
-- NUTRITION & WELLNESS PLATFORM - MIGRATION 00001
-- Architecture: Supabase PostgreSQL + Row Level Security (RLS) + Storage
-- Business Owner: Sangem Srivijayalaxmi | Mobile: 7993367929 | UPI: 7660990052-2@ybl
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('ADMIN', 'CUSTOMER');
CREATE TYPE health_note_visibility AS ENUM ('CUSTOMER_VISIBLE', 'ADMIN_ONLY');
CREATE TYPE camp_status AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('UPI', 'RAZORPAY', 'CASH');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    full_name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    profile_photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. BUSINESS SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL DEFAULT 'Sri Nutrition & Wellness Centre',
    owner_name TEXT NOT NULL DEFAULT 'Sangem Srivijayalaxmi',
    owner_mobile TEXT NOT NULL DEFAULT '7993367929',
    upi_id TEXT NOT NULL DEFAULT '7660990052-2@ybl',
    email TEXT DEFAULT 'contact@srinutrition.com',
    address_line TEXT DEFAULT 'Nutrition & Wellness Centre, Main Road',
    city TEXT DEFAULT 'Warangal',
    state TEXT DEFAULT 'Telangana',
    postal_code TEXT DEFAULT '506001',
    latitude NUMERIC(10, 7) DEFAULT 17.9784,
    longitude NUMERIC(10, 7) DEFAULT 79.5941,
    operating_hours TEXT DEFAULT 'Mon - Sat: 7:00 AM - 1:00 PM, 4:00 PM - 8:00 PM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-seed default business settings if empty
INSERT INTO public.business_settings (business_name, owner_name, owner_mobile, upi_id)
SELECT 'Sri Nutrition & Wellness Centre', 'Sangem Srivijayalaxmi', '7993367929', '7660990052-2@ybl'
WHERE NOT EXISTS (SELECT 1 FROM public.business_settings);

-- ------------------------------------------------------------------------------
-- 4. CUSTOMER PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    blood_group TEXT,
    emergency_contact TEXT,
    occupation TEXT,
    dietary_preference TEXT,
    lifestyle_activity_level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. CAMPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.camps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    address TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status camp_status NOT NULL DEFAULT 'UPCOMING',
    description TEXT,
    max_registrations INTEGER,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. CAMP CUSTOMERS (REGISTRATIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.camp_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camp_id UUID NOT NULL REFERENCES public.camps(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_number INTEGER,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ATTENDED', 'MISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(camp_id, customer_id)
);

-- ------------------------------------------------------------------------------
-- 7. CUSTOMER MEASUREMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    camp_id UUID REFERENCES public.camps(id) ON DELETE SET NULL,
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    height_cm NUMERIC(5, 2) NOT NULL CHECK (height_cm >= 50 AND height_cm <= 250),
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg >= 15 AND weight_kg <= 350),
    age INTEGER NOT NULL CHECK (age >= 1 AND age <= 120),
    
    bmi NUMERIC(4, 2) NOT NULL CHECK (bmi >= 5 AND bmi <= 100),
    body_fat_percent NUMERIC(4, 1) CHECK (body_fat_percent >= 2 AND body_fat_percent <= 70),
    visceral_fat NUMERIC(4, 1) CHECK (visceral_fat >= 1 AND visceral_fat <= 50),
    muscle_percent NUMERIC(4, 1) CHECK (muscle_percent >= 5 AND muscle_percent <= 70),
    subcutaneous_fat_percent NUMERIC(4, 1) CHECK (subcutaneous_fat_percent >= 2 AND subcutaneous_fat_percent <= 70),
    calories NUMERIC(6, 1) CHECK (calories >= 500 AND calories <= 6000),
    
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. HEALTH NOTES TABLE (Customer-reported or nutritionist notes - NO diagnosis)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    visibility health_note_visibility NOT NULL DEFAULT 'CUSTOMER_VISIBLE',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. PRODUCT CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discounted_price NUMERIC(10, 2) CHECK (discounted_price >= 0 AND discounted_price <= price),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku TEXT UNIQUE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. ADDRESSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    order_number TEXT NOT NULL UNIQUE,
    status order_status NOT NULL DEFAULT 'PENDING',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. PAYMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL DEFAULT 'UPI',
    status payment_status NOT NULL DEFAULT 'PENDING',
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    upi_transaction_ref TEXT,
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. REPORTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    report_type TEXT NOT NULL DEFAULT 'PROGRESS_SUMMARY',
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT DEFAULT 'application/pdf',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 17. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_mobile ON public.profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_measurements_customer_id ON public.customer_measurements(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_measurements_measured_at ON public.customer_measurements(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_camps_date ON public.camps(date);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 18. HELPER SECURITY FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid()
    AND role = 'ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- ------------------------------------------------------------------------------
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- BUSINESS SETTINGS (Public read, admin write)
CREATE POLICY "Anyone can view business settings"
    ON public.business_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify business settings"
    ON public.business_settings FOR ALL
    USING (public.is_admin());

-- CUSTOMER PROFILES
CREATE POLICY "Customers view own detailed profile"
    ON public.customer_profiles FOR SELECT
    USING (profile_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Customers update own detailed profile"
    ON public.customer_profiles FOR UPDATE
    USING (profile_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Admins full access to customer profiles"
    ON public.customer_profiles FOR ALL
    USING (public.is_admin());

-- CUSTOMER MEASUREMENTS
CREATE POLICY "Customers view own measurements"
    ON public.customer_measurements FOR SELECT
    USING (customer_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Admins manage all customer measurements"
    ON public.customer_measurements FOR ALL
    USING (public.is_admin());

-- HEALTH NOTES
CREATE POLICY "Customers view visible health notes"
    ON public.health_notes FOR SELECT
    USING (
        (customer_id = public.get_current_profile_id() AND visibility = 'CUSTOMER_VISIBLE')
        OR public.is_admin()
    );

CREATE POLICY "Admins manage all health notes"
    ON public.health_notes FOR ALL
    USING (public.is_admin());

-- CAMPS (Public/Customer read, Admin write)
CREATE POLICY "Anyone can view camps"
    ON public.camps FOR SELECT
    USING (true);

CREATE POLICY "Admins manage camps"
    ON public.camps FOR ALL
    USING (public.is_admin());

-- CAMP CUSTOMERS
CREATE POLICY "Customers view own camp registrations"
    ON public.camp_customers FOR SELECT
    USING (customer_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Customers can register for camps"
    ON public.camp_customers FOR INSERT
    WITH CHECK (customer_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Admins manage camp customers"
    ON public.camp_customers FOR ALL
    USING (public.is_admin());

-- PRODUCTS & CATEGORIES (Public read active, Admin write)
CREATE POLICY "Anyone can view active product categories"
    ON public.product_categories FOR SELECT
    USING (true);

CREATE POLICY "Admins manage product categories"
    ON public.product_categories FOR ALL
    USING (public.is_admin());

CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage products"
    ON public.products FOR ALL
    USING (public.is_admin());

-- ADDRESSES
CREATE POLICY "Customers view own addresses"
    ON public.addresses FOR SELECT
    USING (customer_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Customers manage own addresses"
    ON public.addresses FOR ALL
    USING (customer_id = public.get_current_profile_id() OR public.is_admin());

-- ORDERS
CREATE POLICY "Customers view own orders"
    ON public.orders FOR SELECT
    USING (customer_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Customers can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (customer_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Admins manage all orders"
    ON public.orders FOR ALL
    USING (public.is_admin());

-- ORDER ITEMS
CREATE POLICY "Customers view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.customer_id = public.get_current_profile_id() OR public.is_admin())
        )
    );

CREATE POLICY "Admins manage all order items"
    ON public.order_items FOR ALL
    USING (public.is_admin());

-- PAYMENTS
CREATE POLICY "Customers view own payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payments.order_id
            AND (orders.customer_id = public.get_current_profile_id() OR public.is_admin())
        )
    );

CREATE POLICY "Admins manage all payments"
    ON public.payments FOR ALL
    USING (public.is_admin());

-- REPORTS
CREATE POLICY "Customers view own reports"
    ON public.reports FOR SELECT
    USING (customer_id = public.get_current_profile_id() OR public.is_admin());

CREATE POLICY "Admins manage all reports"
    ON public.reports FOR ALL
    USING (public.is_admin());

-- AUDIT LOGS (Admin ONLY)
CREATE POLICY "Only admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Authenticated users or system can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 20. STORAGE BUCKETS CONFIGURATION (Supabase Storage)
-- ------------------------------------------------------------------------------
-- Buckets:
-- 1. customer-profiles (Private: only respective customer or admin)
-- 2. product-images (Public read, admin write)
-- 3. reports (Private: only customer or admin)

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('customer-profiles', 'customer-profiles', false),
    ('product-images', 'product-images', true),
    ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Customer Profiles
CREATE POLICY "Customers can access own profile photo"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'customer-profiles' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

CREATE POLICY "Customers can upload own profile photo"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'customer-profiles' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

-- Storage Policy: Product Images (Public read, Admin upload)
CREATE POLICY "Public read product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Storage Policy: Reports (Private customer & Admin)
CREATE POLICY "Customers can read own reports"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'reports' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

CREATE POLICY "Admins manage reports storage"
    ON storage.objects FOR ALL
    USING (bucket_id = 'reports' AND public.is_admin());

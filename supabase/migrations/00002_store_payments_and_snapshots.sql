-- ==============================================================================
-- NUTRITION & WELLNESS PLATFORM - MIGRATION 00002
-- Store, Payments, Snapshots, Inventory, and Extended Audit Logs
-- Business Owner: Sangem Srivijayalaxmi | 7993367929 | UPI: 7660990052-2@ybl
-- ==============================================================================

-- 1. ADD SNAPSHOTS AND PAYMENT STATUS TO ORDERS
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_address_snapshot JSONB,
ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

-- 2. ADD SNAPSHOTS TO ORDER ITEMS
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_name_snapshot TEXT,
ADD COLUMN IF NOT EXISTS sku_snapshot TEXT;

-- 3. PRODUCT IMAGES STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for product-images
CREATE POLICY "Public read for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND public.is_admin());

-- 4. CONCURRENCY-SAFE INVENTORY DECREMENT FUNCTION
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  -- Lock row for update
  SELECT stock_quantity INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id AND is_active = true
  FOR UPDATE;

  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE public.products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$;

-- 5. INITIAL PRODUCT CATEGORIES
INSERT INTO public.product_categories (name, slug, description, display_order)
VALUES 
  ('Nutrition Shakes & Meal Replacements', 'nutrition-shakes', 'Nutrient-dense herbal shakes and low-GI meal support', 1),
  ('Supplements & Vitamins', 'supplements', 'Essential vitamins, minerals, and metabolism boosters', 2),
  ('Energy & Fitness', 'energy-fitness', 'Pre-workout, electrolytes, and sustained cellular energy', 3),
  ('Personal Wellness & Care', 'personal-wellness', 'Digestive support, herbal teas, and gentle cleanse', 4)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 6. PRE-SEED SAMPLE STORE PRODUCTS WITH INVENTORY (Strictly no false medical claims)
INSERT INTO public.products (category_id, name, slug, description, price, discounted_price, stock_quantity, sku, is_active)
SELECT 
  id, 
  'Formula 1 Nutritional Protein Shake (500g)', 
  'formula-1-nutritional-shake', 
  'Balanced nutritional meal replacement shake powder with essential vitamins, minerals, and soy protein isolate to support healthy weight management and lean muscle.', 
  2150.00, 
  1899.00, 
  35, 
  'SN-F1-VANILLA', 
  true
FROM public.product_categories WHERE slug = 'nutrition-shakes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, discounted_price, stock_quantity, sku, is_active)
SELECT 
  id, 
  'Personalized Protein Powder (400g)', 
  'personalized-protein-powder', 
  'High-quality proprietary blend of soy and whey protein to help satisfy hunger and support maintenance of lean muscle mass.', 
  1650.00, 
  1480.00, 
  22, 
  'SN-PPP-400', 
  true
FROM public.product_categories WHERE slug = 'nutrition-shakes'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, discounted_price, stock_quantity, sku, is_active)
SELECT 
  id, 
  'Afresh Energy Drink Mix (50g - Lemon)', 
  'afresh-energy-drink-mix-lemon', 
  'Refreshing tea extract blend with natural caffeine and orange pekoe extract to help boost metabolism and provide mental alertness.', 
  850.00, 
  760.00, 
  48, 
  'SN-AFRESH-LEMON', 
  true
FROM public.product_categories WHERE slug = 'energy-fitness'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, discounted_price, stock_quantity, sku, is_active)
SELECT 
  id, 
  'Herbal Aloe Concentrate (500ml)', 
  'herbal-aloe-concentrate', 
  'Premium purified organic aloe vera concentrate to soothe the stomach and support daily gastrointestinal absorption and nutrient assimilation.', 
  1420.00, 
  1280.00, 
  15, 
  'SN-ALOE-500', 
  true
FROM public.product_categories WHERE slug = 'personal-wellness'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, discounted_price, stock_quantity, sku, is_active)
SELECT 
  id, 
  'Cell-U-Loss Herbal Tablet Complex (90 tabs)', 
  'cell-u-loss-tablet-complex', 
  'Corn silk extract, parsley herb, and mineral electrolyte tablet formulated to support healthy fluid balance and renal micro-elimination.', 
  1520.00, 
  1380.00, 
  4, -- Low stock example (<= 5)
  'SN-CELL-90', 
  true
FROM public.product_categories WHERE slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (category_id, name, slug, description, price, discounted_price, stock_quantity, sku, is_active)
SELECT 
  id, 
  'Multivitamin Mineral & Herbal Tablets (90 tabs)', 
  'multivitamin-mineral-herbal-90', 
  'Comprehensive daily micronutrient formulation delivering 23 essential vitamins and trace minerals for overall vitality and cellular support.', 
  1350.00, 
  1200.00, 
  0, -- Out of stock example
  'SN-MULTI-90', 
  true
FROM public.product_categories WHERE slug = 'supplements'
ON CONFLICT (slug) DO NOTHING;

import { ActionResult } from './types';
import { requireAdmin } from '../auth/session';
import { productSchema, categorySchema, ProductInput, CategoryInput } from '../validations';
import { createServerSupabaseClient } from '../supabase/server';
import { getAdminSupabaseClient } from '../supabase/admin';

export interface ProductFilter {
  categoryId?: string;
  search?: string;
  isActiveOnly?: boolean;
}

/**
 * Server Action: Get Products
 * Public or authenticated
 */
export async function getProducts(
  filter?: ProductFilter,
  accessToken?: string
): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerSupabaseClient(accessToken);
    let query = supabase
      .from('products')
      .select('*, product_categories(id, name, slug)')
      .order('created_at', { ascending: false });

    if (filter?.isActiveOnly !== false) {
      query = query.eq('is_active', true);
    }
    if (filter?.categoryId) {
      query = query.eq('category_id', filter.categoryId);
    }
    if (filter?.search && filter.search.trim() !== '') {
      query = query.ilike('name', `%${filter.search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch products' };
  }
}

/**
 * Server Action: Get Product Categories
 */
export async function getProductCategories(
  accessToken?: string
): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerSupabaseClient(accessToken);
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch categories' };
  }
}

/**
 * Server Action: Create Product (Admin Only)
 */
export async function createProduct(
  input: ProductInput,
  accessToken?: string
): Promise<ActionResult<{ productId: string }>> {
  try {
    const adminUser = await requireAdmin(accessToken);
    const validated = productSchema.parse(input);
    const adminSupabase = getAdminSupabaseClient();

    const newId = crypto.randomUUID();
    const { data, error } = await adminSupabase
      .from('products')
      .insert({
        id: newId,
        category_id: validated.categoryId || null,
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        price: validated.price,
        discounted_price: validated.discountedPrice ?? null,
        stock_quantity: validated.stockQuantity,
        sku: validated.sku || null,
        image_url: validated.imageUrl || null,
        is_active: validated.isActive,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Audit Log (Section 42 & 43)
    await adminSupabase.from('audit_logs').insert({
      actor_id: adminUser.profileId,
      action: 'PRODUCT_CREATED',
      entity_type: 'products',
      entity_id: newId,
      metadata: { name: validated.name, sku: validated.sku, price: validated.price, stock: validated.stockQuantity },
    });

    return { success: true, data: { productId: newId } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

/**
 * Server Action: Update Product (Admin Only)
 */
export async function updateProduct(
  productId: string,
  input: Partial<ProductInput>,
  accessToken?: string
): Promise<ActionResult> {
  try {
    const adminUser = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    const { error } = await adminSupabase
      .from('products')
      .update({
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.discountedPrice !== undefined ? { discounted_price: input.discountedPrice } : {}),
        ...(input.stockQuantity !== undefined ? { stock_quantity: input.stockQuantity } : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.categoryId !== undefined ? { category_id: input.categoryId || null } : {}),
        ...(input.imageUrl !== undefined ? { image_url: input.imageUrl } : {}),
        ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) throw error;

    await adminSupabase.from('audit_logs').insert({
      actor_id: adminUser.profileId,
      action: 'PRODUCT_UPDATED',
      entity_type: 'products',
      entity_id: productId,
      metadata: { updated_fields: Object.keys(input) },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

/**
 * Server Action: Deactivate Product (Soft-delete / Toggle active)
 */
export async function toggleProductActive(
  productId: string,
  isActive: boolean,
  accessToken?: string
): Promise<ActionResult> {
  try {
    const adminUser = await requireAdmin(accessToken);
    const adminSupabase = getAdminSupabaseClient();

    const { error } = await adminSupabase
      .from('products')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) throw error;

    await adminSupabase.from('audit_logs').insert({
      actor_id: adminUser.profileId,
      action: isActive ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED',
      entity_type: 'products',
      entity_id: productId,
      metadata: { is_active: isActive },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle product status' };
  }
}

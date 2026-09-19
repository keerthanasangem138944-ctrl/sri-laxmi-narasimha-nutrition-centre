import React, { useState } from 'react';
import { usePlatformState, ProductRecord } from '../../lib/platform-state';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Package, 
  Star, 
  AlertTriangle, 
  DollarSign, 
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const ProductManagement: React.FC = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deactivateProduct, 
    updateProductStock 
  } = usePlatformState();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('2499');
  const [discountedPrice, setDiscountedPrice] = useState('2199');
  const [stockQuantity, setStockQuantity] = useState('40');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tag, setTag] = useState('Bestseller');
  const [servingSize, setServingSize] = useState('1 scoop (32g) with 250ml water');
  const [keyBenefitsText, setKeyBenefitsText] = useState('24g Protein\nZero added sugar\nDigestive enzymes');
  const [ingredients, setIngredients] = useState('Whey Protein Isolate, Microfiltered Pea Protein, DigeZyme');

  // Stock edit modal
  const [stockEditProductId, setStockEditProductId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState('');

  const filteredProducts = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleOpenAdd = () => {
    setEditingProductId(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setDiscountedPrice('');
    setStockQuantity('20');
    setSku(`SN-${Date.now().toString().slice(-6)}`);
    setImageUrl('https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80');
    setTag('New Formulation');
    setServingSize('1 scoop daily with water');
    setKeyBenefitsText('Clinical purity\nEssential amino acids\nEasily digestible');
    setIngredients('Pure active botanical and protein matrix');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductRecord) => {
    setEditingProductId(p.id);
    setName(p.name);
    setSlug(p.slug);
    setCategoryId(p.categoryId);
    setDescription(p.description);
    setPrice(p.price.toString());
    setDiscountedPrice(p.discountedPrice ? p.discountedPrice.toString() : '');
    setStockQuantity(p.stockQuantity.toString());
    setSku(p.sku);
    setImageUrl(p.imageUrl || '');
    setTag(p.tag || '');
    setServingSize(p.servingSize || '');
    setKeyBenefitsText(p.keyBenefits ? p.keyBenefits.join('\n') : '');
    setIngredients(p.ingredients || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedDiscount: number | null = discountedPrice ? parseFloat(discountedPrice) : null;
    const parsedStock = parseInt(stockQuantity, 10);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid positive price');
      return;
    }

    if (parsedDiscount && parsedDiscount >= parsedPrice) {
      alert('Discounted price must be strictly lower than regular price');
      return;
    }

    const catObj = categories.find((c) => c.id === categoryId);
    const keyBenefits = keyBenefitsText.split('\n').map((b) => b.trim()).filter(Boolean);

    if (editingProductId) {
      updateProduct(editingProductId, {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId,
        categoryName: catObj?.name || 'Nutrition',
        description,
        price: parsedPrice,
        discountedPrice: parsedDiscount,
        stockQuantity: isNaN(parsedStock) ? 0 : parsedStock,
        sku,
        imageUrl,
        tag,
        servingSize,
        keyBenefits,
        ingredients,
      });
    } else {
      addProduct({
        categoryId,
        categoryName: catObj?.name || 'Nutrition',
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        price: parsedPrice,
        discountedPrice: parsedDiscount,
        stockQuantity: isNaN(parsedStock) ? 0 : parsedStock,
        sku: sku || `SN-${Date.now().toString().slice(-6)}`,
        imageUrl,
        isActive: true,
        tag,
        servingSize,
        keyBenefits,
        ingredients,
      });
    }

    setIsModalOpen(false);
  };

  const handleStockUpdateSave = (id: string) => {
    const val = parseInt(stockInput, 10);
    if (!isNaN(val) && val >= 0) {
      updateProductStock(id, val);
      setStockEditProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Products & Dispensary Inventory
          </h2>
          <p className="text-xs text-stone-500">
            Manage genuine nutritional supplements, stock levels, pricing, and active status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or SKU..."
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
            />
          </div>

          <Button onClick={handleOpenAdd} size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Formulation
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Formulation</th>
                <th className="py-3 px-4">Category & SKU</th>
                <th className="py-3 px-4">Price (INR)</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const isLow = p.stockQuantity <= 5 && p.stockQuantity > 0;
                const isOut = p.stockQuantity <= 0;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-stone-900 block truncate max-w-xs">
                            {p.name}
                          </span>
                          {p.tag && (
                            <span className="inline-block text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.2 rounded mt-0.5">
                              {p.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-stone-600">
                      <span className="block font-medium">{p.categoryName}</span>
                      <span className="block font-mono text-[10px] text-stone-400">SKU: {p.sku}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono">
                        <span className="font-bold text-stone-900">
                          ₹{(p.discountedPrice || p.price).toLocaleString()}
                        </span>
                        {p.discountedPrice && (
                          <span className="text-[10px] text-stone-400 line-through block">
                            ₹{p.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {stockEditProductId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={stockInput}
                            onChange={(e) => setStockInput(e.target.value)}
                            className="w-16 px-1.5 py-0.5 border border-stone-300 rounded text-xs font-mono"
                          />
                          <button
                            onClick={() => handleStockUpdateSave(p.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setStockEditProductId(null)}
                            className="p-1 text-stone-400 hover:bg-stone-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {p.stockQuantity} units
                          </span>
                          <button
                            onClick={() => {
                              setStockEditProductId(p.id);
                              setStockInput(p.stockQuantity.toString());
                            }}
                            className="text-[10px] text-stone-400 hover:text-stone-700 underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                          title="Edit product"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {p.isActive && (
                          <button
                            onClick={() => {
                              if (confirm(`Deactivate ${p.name}?`)) {
                                deactivateProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                            title="Deactivate product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingProductId ? 'Edit Product Formulation' : 'Add New Nutritional Formulation'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Product Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sri Lean Whey Complex"
                  required
                />
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Regular Price (₹)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Input
                  label="Discounted Price (₹)"
                  type="number"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  placeholder="Optional"
                />
                <Input
                  label="Stock Inventory"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="SKU Identifier"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SN-PROT-01"
                  required
                />
                <Input
                  label="Tag / Badge"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Bestseller, 100% Vegan..."
                />
              </div>

              <Input
                label="Product Image URL (Unsplash or CDN)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Product Clinical Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="Detail bio-availability, targets, and purpose..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Recommended Serving Protocol"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  placeholder="1 scoop (30g) in 250ml water"
                />
                <Input
                  label="Active Ingredients Summary"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Whey Isolate, DigeZyme, Stevia..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Key Formulation Benefits (1 per line)
                </label>
                <textarea
                  value={keyBenefitsText}
                  onChange={(e) => setKeyBenefitsText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="24g Protein per serving&#10;Zero added sugar&#10;Digestive enzymes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingProductId ? 'Update Product' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

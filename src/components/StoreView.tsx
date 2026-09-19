import React, { useState, useMemo } from 'react';
import { usePlatformState, ProductRecord } from '../lib/platform-state';
import { useAuth } from '../lib/auth-context';
import { 
  ShoppingBag, 
  Search, 
  Check, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  Truck, 
  Layers, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface StoreViewProps {
  onOpenCart: () => void;
  onSelectProduct?: (product: ProductRecord) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({ onOpenCart }) => {
  const { products, categories, addToCart, cart, cartCount, cartSubtotal, businessSettings } = usePlatformState();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductModal, setActiveProductModal] = useState<ProductRecord | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.keyBenefits && p.keyBenefits.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleQuickAdd = (product: ProductRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = addToCart(product.id, 1);
    if (res.success) {
      setAddedToast(`Added ${product.name.split('(')[0]} to cart`);
      setTimeout(() => setAddedToast(null), 3000);
    } else {
      alert(res.message);
    }
  };

  const handleModalAdd = () => {
    if (!activeProductModal) return;
    const res = addToCart(activeProductModal.id, modalQuantity);
    if (res.success) {
      setAddedToast(`Added ${modalQuantity}x ${activeProductModal.name.split('(')[0]} to cart`);
      setTimeout(() => setAddedToast(null), 3000);
      setActiveProductModal(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Toast notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{addedToast}</span>
          <button
            onClick={onOpenCart}
            className="ml-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-semibold"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Official Centre Dispensary & Online Store</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-serif">
            Authentic Clinical Nutrition & Dietary Formulations
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Curated by <strong>Sangem Srivijayalaxmi</strong> at Warangal Centre. Lab-tested lean protein blends, microfiltered plant peptides, essential multivitamins, and metabolic herbal teas supporting sustainable metabolic health.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-300" />
              <span>Free Shipping across India on orders &gt; ₹{businessSettings.freeShippingThreshold}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>100% Genuine Certified Supplements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplements, proteins, vitamins, teas..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={onOpenCart}
          className="relative inline-flex items-center justify-center gap-2.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Shopping Cart</span>
          {cartCount > 0 && (
            <span className="bg-white text-emerald-900 font-mono text-xs px-2 py-0.5 rounded-full font-bold">
              {cartCount} • ₹{cartSubtotal.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Formulations ({products.filter((p) => p.isActive).length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.isActive && p.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-900">No matching products found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or select "All Formulations" to browse our full catalog.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            variant="outline"
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
            const finalPrice = hasDiscount ? product.discountedPrice! : product.price;
            const savings = hasDiscount ? product.price - product.discountedPrice! : 0;
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
            const isOutOfStock = product.stockQuantity <= 0;

            return (
              <div
                key={product.id}
                onClick={() => {
                  setActiveProductModal(product);
                  setModalQuantity(1);
                }}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer"
              >
                {/* Product Image Box */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-xs">
                      {product.tag}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
                      Save ₹{savings}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {product.categoryName || 'Nutrition'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-stone-800 text-[11px]">{product.rating}</span>
                        <span className="text-[10px] text-stone-400">({product.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-stone-900 text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Key Benefits Pills */}
                    {product.keyBenefits && product.keyBenefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {product.keyBenefits.slice(0, 2).map((benefit, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            ✓ {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-stone-900 font-mono">
                          ₹{finalPrice.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-stone-400 line-through font-mono">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-stone-500">
                        {isOutOfStock ? (
                          <span className="text-rose-600 font-semibold">Out of Stock</span>
                        ) : isLowStock ? (
                          <span className="text-amber-600 font-semibold">Only {product.stockQuantity} left</span>
                        ) : (
                          <span className="text-emerald-700">In Stock ({product.stockQuantity} available)</span>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      disabled={isOutOfStock}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isOutOfStock
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-95'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details Modal */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="relative">
              <button
                onClick={() => setActiveProductModal(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Image side */}
                <div className="aspect-square sm:aspect-auto bg-stone-100 relative">
                  <img
                    src={activeProductModal.imageUrl || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80'}
                    alt={activeProductModal.name}
                    className="w-full h-full object-cover"
                  />
                  {activeProductModal.tag && (
                    <span className="absolute bottom-3 left-3 bg-emerald-800 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      {activeProductModal.tag}
                    </span>
                  )}
                </div>

                {/* Details side */}
                <div className="p-6 flex flex-col justify-between space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {activeProductModal.categoryName}
                    </span>

                    <h2 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                      {activeProductModal.name}
                    </h2>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="font-bold text-stone-800">{activeProductModal.rating}</span>
                      </div>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500">{activeProductModal.reviewCount} verified client reviews</span>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-2xl font-bold font-mono text-stone-900">
                        ₹{(activeProductModal.discountedPrice || activeProductModal.price).toLocaleString()}
                      </span>
                      {activeProductModal.discountedPrice && (
                        <span className="text-sm text-stone-400 line-through font-mono">
                          ₹{activeProductModal.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-emerald-700 font-semibold">
                        (Incl. all taxes)
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {activeProductModal.description}
                    </p>

                    {/* Serving size */}
                    {activeProductModal.servingSize && (
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs">
                        <strong className="block text-stone-900 font-medium mb-0.5">Recommended Usage:</strong>
                        <span className="text-stone-600">{activeProductModal.servingSize}</span>
                      </div>
                    )}

                    {/* Key benefits */}
                    {activeProductModal.keyBenefits && (
                      <div className="space-y-1 pt-1">
                        <strong className="block text-xs text-stone-900">Key Formulation Benefits:</strong>
                        <ul className="space-y-1 text-xs text-stone-600">
                          {activeProductModal.keyBenefits.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ingredients */}
                    {activeProductModal.ingredients && (
                      <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-100">
                        <strong>Active Ingredients:</strong> {activeProductModal.ingredients}
                      </div>
                    )}

                    {/* Medical Disclaimer */}
                    <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-[10px] text-amber-900">
                      <strong>Nutritional Supplement Notice:</strong> This formulation is a dietary supplement supporting healthy nutrition and metabolic lifestyle goals. Not intended for disease diagnosis, medical treatment, or prescription medicine replacement.
                    </div>
                  </div>

                  {/* Quantity and Add Button */}
                  <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                    <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                      <button
                        onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-stone-900">
                        {modalQuantity}
                      </span>
                      <button
                        onClick={() => setModalQuantity((q) => Math.min(activeProductModal.stockQuantity, q + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={handleModalAdd}
                      disabled={activeProductModal.stockQuantity <= 0}
                      className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        Add to Cart • ₹
                        {((activeProductModal.discountedPrice || activeProductModal.price) * modalQuantity).toLocaleString()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

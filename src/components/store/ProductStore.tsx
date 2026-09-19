import React, { useState, useMemo } from 'react';
import { usePlatformState, ProductRecord, ProductCategoryRecord } from '../../lib/platform-state';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ShoppingBag,
  Search,
  Filter,
  Check,
  AlertTriangle,
  XCircle,
  Eye,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
} from 'lucide-react';

interface ProductStoreProps {
  onNavigateToCart: () => void;
}

export const ProductStore: React.FC<ProductStoreProps> = ({ onNavigateToCart }) => {
  const {
    products,
    categories,
    addToCart,
    cart,
    cartCount,
    cartSubtotal,
    businessSettings,
  } = usePlatformState();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter products by category, search, and active status
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddToCart = (product: ProductRecord) => {
    const result = addToCart(product.id, 1);
    if (result.success) {
      setToastMessage(`Added "${product.name}" to cart!`);
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage(result.message || 'Unable to add to cart.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const getProductCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8 py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-stone-700 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Store Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-8 md:p-10 overflow-hidden shadow-md">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Sri Nutrition Verified Store</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
            Dietary Supplements & Nutritional Formulations
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            High-potency macro and micronutrients formulated for metabolic cellular health. Every item is verified for purity and authorized by Sangem Srivijayalaxmi.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              Free shipping on orders above ₹{businessSettings.freeShippingThreshold}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Direct UPI / Razorpay Secure Checkout
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search protein powders, teas, aloe vera..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
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

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Products ({products.filter((p) => p.isActive).length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.isActive && p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Indicator Bar if items in cart */}
      {cartCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              {cartCount}
            </span>
            <div>
              <span className="font-bold text-emerald-900">
                You have {cartCount} item{cartCount > 1 ? 's' : ''} in your cart
              </span>
              <span className="text-emerald-700 ml-2">
                Subtotal: <strong>₹{cartSubtotal.toFixed(2)}</strong>
              </span>
            </div>
          </div>
          <Button
            onClick={onNavigateToCart}
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5"
          >
            View Cart & Checkout
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 text-lg">No products found</h3>
          <p className="text-stone-500 text-xs mt-1">
            Try adjusting your search keywords or switching category filters.
          </p>
          <Button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            variant="outline"
            size="sm"
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const inCartQty = getProductCartQuantity(product.id);
            const isOutOfStock = product.stockQuantity <= 0;
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
            const effectivePrice = product.discountedPrice || product.price;
            const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;

            return (
              <Card
                key={product.id}
                className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow border-stone-200 bg-white"
              >
                <div>
                  {/* Product Image Box */}
                  <div className="relative h-48 bg-stone-100 overflow-hidden group">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <ShoppingBag className="w-12 h-12" />
                      </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        SAVE ₹{(product.price - product.discountedPrice!).toFixed(0)}
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isOutOfStock ? (
                        <span className="bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Only {product.stockQuantity} left
                        </span>
                      ) : (
                        <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          In Stock ({product.stockQuantity})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                      <span>{product.categoryName}</span>
                      <span>SKU: {product.sku}</span>
                    </div>

                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-bold text-stone-900 text-sm leading-snug cursor-pointer hover:text-emerald-700 transition-colors line-clamp-2"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price Block */}
                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-stone-900">
                        ₹{effectivePrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center gap-2">
                  <Button
                    onClick={() => setSelectedProduct(product)}
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1 text-stone-600"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Button>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    size="sm"
                    className={`flex-1 text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      isOutOfStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : inCartQty > 0
                        ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isOutOfStock ? 'Sold Out' : inCartQty > 0 ? `In Cart (${inCartQty})` : 'Add to Cart'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-lg"
            >
              &times;
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 rounded-xl overflow-hidden bg-stone-100">
                <img
                  src={selectedProduct.imageUrl || ''}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-3">
                <Badge variant="neutral">{selectedProduct.categoryName}</Badge>
                <h2 className="text-xl font-bold text-stone-900 leading-snug">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900">
                    ₹{(selectedProduct.discountedPrice || selectedProduct.price).toFixed(2)}
                  </span>
                  {selectedProduct.discountedPrice && (
                    <span className="text-sm text-stone-400 line-through">
                      ₹{selectedProduct.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-500 font-mono">
                  SKU: {selectedProduct.sku} • Stock: {selectedProduct.stockQuantity} available
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stockQuantity <= 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    Add to Cart • ₹
                    {(selectedProduct.discountedPrice || selectedProduct.price).toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4 space-y-2 text-xs text-stone-500">
              <p className="font-semibold text-stone-800">Quality Assurance & Compliance:</p>
              <p>
                Products are packaged according to strict dietary supplement food safety standards. No therapeutic or medicinal disease cure claims are made. For personal health regimens, consult with certified nutritionist Sangem Srivijayalaxmi (+91 7993367929).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

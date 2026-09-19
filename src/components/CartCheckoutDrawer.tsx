import React, { useState } from 'react';
import { 
  usePlatformState, 
  AddressRecord, 
  OrderRecord, 
  CartItem 
} from '../lib/platform-state';
import { useAuth } from '../lib/auth-context';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Store, 
  Copy, 
  Check, 
  MapPin, 
  Truck, 
  AlertCircle,
  FileText,
  Printer
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrders?: () => void;
}

type CheckoutStep = 'cart' | 'address' | 'payment' | 'confirmation';

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToOrders,
}) => {
  const { 
    cart, 
    cartCount, 
    cartSubtotal, 
    cartShipping, 
    cartTotal, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    addresses,
    addAddress,
    placeOrder,
    verifyPayment,
    recordDirectUpiPayment,
    businessSettings
  } = usePlatformState();

  const { user } = useAuth();

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const defaultAddr = addresses.find((a) => a.customerId === user?.id && a.isDefault);
    return defaultAddr ? defaultAddr.id : addresses[0]?.id || '';
  });

  // New address form toggle & state
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newRecipient, setNewRecipient] = useState(user?.fullName || '');
  const [newPhone, setNewPhone] = useState(user?.mobile || '');
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newCity, setNewCity] = useState('Warangal');
  const [newState, setNewState] = useState('Telangana');
  const [newPostalCode, setNewPostalCode] = useState('506001');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY_UPI' | 'DIRECT_UPI_QR' | 'CASH_ON_CENTRE'>('RAZORPAY_UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [upiRefInput, setUpiRefInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Confirmed Order result
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!isOpen) return null;

  // Selected address object
  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newPhone || !newLine1 || !newPostalCode) {
      alert('Please fill out all required address fields');
      return;
    }
    const created = addAddress({
      customerId: user?.id || '00000000-0000-0000-0000-000000000002',
      recipientName: newRecipient,
      phone: newPhone,
      addressLine1: newLine1,
      addressLine2: newLine2,
      city: newCity,
      state: newState,
      postalCode: newPostalCode,
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(businessSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleProceedToPayment = () => {
    if (!activeAddress && !isAddingNewAddress) {
      alert('Please select or add a delivery address');
      return;
    }
    setStep('payment');
  };

  // Place and verify order
  const handleExecutePayment = async () => {
    if (!activeAddress) {
      alert('Valid shipping address required');
      return;
    }

    setIsProcessingPayment(true);

    // Place order server-side with stock decrement
    const orderRes = placeOrder(
      user?.id || '00000000-0000-0000-0000-000000000002',
      activeAddress,
      paymentMethod,
      orderNotes
    );

    if (!orderRes.success || !orderRes.order) {
      setIsProcessingPayment(false);
      alert(`Order placement failed: ${orderRes.error}`);
      return;
    }

    const createdOrder = orderRes.order;

    // Simulate Payment Gateway or Direct UPI handling
    if (paymentMethod === 'RAZORPAY_UPI') {
      setTimeout(() => {
        const fakePaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
        const fakeSig = `sig_${Math.random().toString(36).substring(2, 16)}`;
        verifyPayment(createdOrder.id, fakePaymentId, fakeSig);
        setConfirmedOrder(createdOrder);
        setIsProcessingPayment(false);
        setStep('confirmation');
      }, 1400);
    } else if (paymentMethod === 'DIRECT_UPI_QR') {
      setTimeout(() => {
        const ref = upiRefInput || `UPI/${Date.now()}/${Math.floor(1000 + Math.random() * 9000)}`;
        recordDirectUpiPayment(createdOrder.id, ref);
        setConfirmedOrder(createdOrder);
        setIsProcessingPayment(false);
        setStep('confirmation');
      }, 800);
    } else {
      // CASH_ON_CENTRE
      setConfirmedOrder(createdOrder);
      setIsProcessingPayment(false);
      setStep('confirmation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base leading-none">
                {step === 'cart' && 'Your Shopping Bag'}
                {step === 'address' && 'Delivery Address'}
                {step === 'payment' && 'Secure Payment'}
                {step === 'confirmation' && 'Order Confirmed'}
              </h2>
              <span className="text-[11px] text-stone-500">
                {step === 'cart' && `${cartCount} items in cart`}
                {step === 'address' && 'Step 2 of 3 • Shipping details'}
                {step === 'payment' && 'Step 3 of 3 • UPI & Cards'}
                {step === 'confirmation' && 'Receipt & Invoice'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 space-y-6">
          {/* ------------------------------------------------------------- */}
          {/* STEP 1: CART LIST */}
          {/* ------------------------------------------------------------- */}
          {step === 'cart' && (
            <div className="space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                  <h3 className="text-base font-semibold text-stone-800">Your bag is empty</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Explore our authentic proteins, vitamins, and herbal formulations to start.
                  </p>
                  <Button onClick={onClose} className="mt-2 text-xs">
                    Browse Store
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const price = item.product.discountedPrice || item.product.price;
                    const itemTotal = price * item.quantity;

                    return (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50/50"
                      >
                        <img
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80'}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover bg-white border border-stone-200 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-stone-500 font-mono block">
                            SKU: {item.product.sku}
                          </span>
                          <span className="text-xs font-mono font-semibold text-stone-800">
                            ₹{price.toLocaleString()} each
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-stone-900 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-stone-900 block">
                            ₹{itemTotal.toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Free shipping banner */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-900">
                    <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                    {cartSubtotal >= businessSettings.freeShippingThreshold ? (
                      <span>
                        🎉 Congratulations! You qualify for <strong>Free Shipping</strong> anywhere in India!
                      </span>
                    ) : (
                      <span>
                        Add ₹{(businessSettings.freeShippingThreshold - cartSubtotal).toLocaleString()} more to qualify for <strong>Free Shipping</strong> (Standard fee: ₹{businessSettings.standardShippingFee})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: ADDRESS SELECTION */}
          {/* ------------------------------------------------------------- */}
          {step === 'address' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Select Delivery Address
                </h3>
                <button
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {isAddingNewAddress ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {isAddingNewAddress ? (
                <form onSubmit={handleSaveNewAddress} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
                  <h4 className="font-semibold text-stone-900">New Address Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Recipient Full Name"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      required
                    />
                    <Input
                      label="10-Digit Mobile Number"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Flat, House No., Building, Street"
                    value={newLine1}
                    onChange={(e) => setNewLine1(e.target.value)}
                    required
                  />
                  <Input
                    label="Landmark / Area (Optional)"
                    value={newLine2}
                    onChange={(e) => setNewLine2(e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="City"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      required
                    />
                    <Input
                      label="State"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      required
                    />
                    <Input
                      label="PIN Code"
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full mt-2">
                    Save and Select Address
                  </Button>
                </form>
              ) : (
                <div className="space-y-2.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{addr.recipientName}</span>
                          <span className="text-stone-500 font-mono">({addr.phone})</span>
                          {addr.isDefault && (
                            <span className="bg-stone-200 text-stone-700 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </p>
                        <p className="text-stone-500">
                          {addr.city}, {addr.state} - <span className="font-mono font-semibold">{addr.postalCode}</span>
                        </p>
                      </div>

                      <div className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                        {selectedAddressId === addr.id && (
                          <div className="w-3 h-3 rounded-full bg-emerald-700" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery notes */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Leave with security, call upon arrival..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: PAYMENT METHOD */}
          {/* ------------------------------------------------------------- */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Select Payment Method
                </h3>

                {/* Option 1: Razorpay Online (Instant UPI & Cards) */}
                <div
                  onClick={() => setPaymentMethod('RAZORPAY_UPI')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'RAZORPAY_UPI'
                      ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <strong className="block text-stone-900">Razorpay Gateway (Instant UPI / Cards)</strong>
                    <span className="text-stone-500">
                      GPay, PhonePe, Paytm, RuPay, Credit/Debit Cards, NetBanking with automated digital receipt.
                    </span>
                  </div>
                </div>

                {/* Option 2: Direct Centre UPI QR */}
                <div
                  onClick={() => setPaymentMethod('DIRECT_UPI_QR')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'DIRECT_UPI_QR'
                      ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <strong className="block text-stone-900">Scan Official Centre UPI QR</strong>
                    <span className="text-stone-500">
                      Transfer directly to <strong>{businessSettings.ownerName}</strong> ({businessSettings.upiId}).
                    </span>
                  </div>
                </div>

                {/* Option 3: Pay at Centre */}
                <div
                  onClick={() => setPaymentMethod('CASH_ON_CENTRE')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'CASH_ON_CENTRE'
                      ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <Store className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <strong className="block text-stone-900">Pay on Centre Pickup</strong>
                    <span className="text-stone-500">
                      Pay via cash or UPI directly at Sri Nutrition Centre in Warangal upon receiving your package.
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct UPI Box if chosen */}
              {paymentMethod === 'DIRECT_UPI_QR' && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-stone-500 block">Official Business VPA:</span>
                      <strong className="font-mono text-emerald-800 text-sm">
                        {businessSettings.upiId}
                      </strong>
                    </div>
                    <button
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-stone-300 rounded-lg hover:bg-stone-100 flex items-center gap-1"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Dynamic QR Code */}
                  <div className="bg-white p-3 rounded-lg border border-stone-200 text-center max-w-[200px] mx-auto">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${encodeURIComponent(
                        businessSettings.upiId
                      )}%26pn=${encodeURIComponent(businessSettings.ownerName)}%26am=${cartTotal}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-36 h-36 mx-auto"
                    />
                    <span className="block text-[11px] font-mono font-bold text-stone-700 mt-2">
                      Scan to Pay ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Enter UPI Ref / UTR Number (Optional for instant match)
                    </label>
                    <input
                      type="text"
                      value={upiRefInput}
                      onChange={(e) => setUpiRefInput(e.target.value)}
                      placeholder="e.g. 428190382910"
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Security guarantee */}
              <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>All transactions encrypted via 256-bit SSL & HMAC verification.</span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 4: ORDER CONFIRMATION & RECEIPT */}
          {/* ------------------------------------------------------------- */}
          {step === 'confirmation' && confirmedOrder && (
            <div className="space-y-6 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Thank you for ordering with Sri Nutrition & Wellness Centre. We have dispatched a confirmation to your profile.
                </p>
              </div>

              {/* Order Card */}
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <span className="text-stone-500 block">Order Reference:</span>
                    <strong className="font-mono text-emerald-900 text-sm">
                      {confirmedOrder.orderNumber}
                    </strong>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg">
                    {confirmedOrder.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-900 block">Ordered Formulations:</span>
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-stone-700">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-mono font-semibold">
                        ₹{item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Address */}
                <div className="pt-3 border-t border-stone-200">
                  <span className="font-bold text-stone-900 block">Delivery Address:</span>
                  <p className="text-stone-600 mt-0.5">
                    {confirmedOrder.shippingAddress.recipientName} ({confirmedOrder.shippingAddress.phone})<br />
                    {confirmedOrder.shippingAddress.addressLine1}, {confirmedOrder.shippingAddress.city},{' '}
                    {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.postalCode}
                  </p>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-900">Total Paid:</span>
                  <span className="font-mono font-bold text-emerald-900 text-base">
                    ₹{confirmedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Print Receipt Button */}
              <div className="flex gap-3">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex-1 text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </Button>
                {onNavigateToOrders && (
                  <Button
                    onClick={() => {
                      onClose();
                      onNavigateToOrders();
                    }}
                    className="flex-1 text-xs"
                  >
                    View in Customer Portal
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Subtotals & Progress CTAs */}
        {step !== 'confirmation' && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/80 space-y-3 sticky bottom-0">
            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cartCount} items):</span>
                <span className="font-mono">₹{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Standard Delivery:</span>
                <span className="font-mono">
                  {cartShipping === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    `₹${cartShipping}`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-200">
                <span>Order Total:</span>
                <span className="font-mono text-emerald-900 text-base">
                  ₹{cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 pt-1">
              {step !== 'cart' && (
                <Button
                  onClick={() => setStep(step === 'payment' ? 'address' : 'cart')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Back
                </Button>
              )}

              {step === 'cart' && (
                <Button
                  onClick={() => setStep('address')}
                  className="flex-1 text-xs py-2.5"
                >
                  <span>Proceed to Delivery</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}

              {step === 'address' && (
                <Button
                  onClick={handleProceedToPayment}
                  className="flex-1 text-xs py-2.5"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}

              {step === 'payment' && (
                <Button
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="flex-1 text-xs py-2.5 bg-emerald-700 hover:bg-emerald-800 font-semibold"
                >
                  {isProcessingPayment ? (
                    <span>Processing Secure Payment...</span>
                  ) : (
                    <span>Confirm & Pay ₹{cartTotal.toLocaleString()}</span>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

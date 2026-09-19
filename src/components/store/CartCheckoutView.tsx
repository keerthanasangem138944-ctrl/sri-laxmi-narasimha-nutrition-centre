import React, { useState } from 'react';
import { usePlatformState, CartItem, AddressRecord, OrderRecord } from '../../lib/platform-state';
import { useAuth } from '../../lib/auth-context';
import { Card, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  Truck,
  Phone,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface CartCheckoutViewProps {
  onBackToStore: () => void;
  onViewOrder: (orderId: string) => void;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  onBackToStore,
  onViewOrder,
}) => {
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartShipping,
    cartTotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addresses,
    addAddress,
    placeOrder,
    verifyPayment,
    recordDirectUpiPayment,
    businessSettings,
  } = usePlatformState();

  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses[0]?.id || 'new'
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(addresses.length === 0);

  // New Address Form
  const [newAddress, setNewAddress] = useState({
    recipientName: user?.fullName || '',
    phone: user?.role === 'CUSTOMER' ? '9848012345' : '7993367929',
    addressLine1: '',
    addressLine2: '',
    city: 'Warangal',
    state: 'Telangana',
    postalCode: '506001',
  });

  // Payment Options: 'DIRECT_UPI_QR' | 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'CASH_ON_CENTRE'
  const [paymentMethod, setPaymentMethod] = useState<
    'DIRECT_UPI_QR' | 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'CASH_ON_CENTRE'
  >('DIRECT_UPI_QR');
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed Order Info
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Free shipping threshold progress
  const freeShippingThreshold = businessSettings.freeShippingThreshold || 1500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(businessSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setStep('checkout');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Resolve Address
    let targetAddress: AddressRecord | undefined;
    if (isAddingNewAddress) {
      if (!newAddress.recipientName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.postalCode) {
        setErrorMessage('Please fill in all required shipping address fields.');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(newAddress.phone.trim())) {
        setErrorMessage('Please provide a valid 10-digit Indian phone number.');
        return;
      }
      if (!/^\d{6}$/.test(newAddress.postalCode.trim())) {
        setErrorMessage('Postal code must be a 6-digit Indian PIN.');
        return;
      }
      targetAddress = addAddress({
        customerId: user?.id || '00000000-0000-0000-0000-000000000002',
        recipientName: newAddress.recipientName.trim(),
        phone: newAddress.phone.trim(),
        addressLine1: newAddress.addressLine1.trim(),
        addressLine2: newAddress.addressLine2?.trim() || '',
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        postalCode: newAddress.postalCode.trim(),
        country: 'India',
        isDefault: true,
      });
    } else {
      targetAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
      if (!targetAddress) {
        setErrorMessage('Please select or enter a shipping address.');
        return;
      }
    }

    if (paymentMethod === 'DIRECT_UPI_QR' && !upiRefNumber.trim()) {
      setErrorMessage('Please provide the 12-digit UPI transaction reference number / UTR from your payment app.');
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Execute Order Placement
      const customerId = user?.id || '00000000-0000-0000-0000-000000000002';
      const orderRes = placeOrder(customerId, targetAddress, paymentMethod, orderNotes);

      if (!orderRes.success || !orderRes.order) {
        setErrorMessage(orderRes.error || 'Failed to place order.');
        setIsProcessing(false);
        return;
      }

      const order = orderRes.order;

      // 3. Process Payment
      if (paymentMethod === 'DIRECT_UPI_QR') {
        recordDirectUpiPayment(order.id, upiRefNumber.trim());
      } else if (paymentMethod === 'RAZORPAY_UPI' || paymentMethod === 'RAZORPAY_CARD') {
        // Razorpay Gateway Simulation / Verification Flow
        const simulatedPaymentId = `pay_rzp_${Date.now().toString(36)}`;
        const simulatedSignature = `sig_valid_hash_${Date.now().toString(36)}`;
        verifyPayment(order.id, simulatedPaymentId, simulatedSignature);
      }

      // Success
      setCompletedOrder(order);
      setStep('confirmation');
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected checkout error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 3: ORDER CONFIRMATION
  // --------------------------------------------------------------------------
  if (step === 'confirmation' && completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Order Confirmed & Payment Received
            </span>
            <h1 className="text-2xl font-serif font-bold text-stone-900 mt-1">
              Thank You for Your Order!
            </h1>
            <p className="text-stone-600 text-xs mt-1">
              Order reference: <strong className="font-mono text-emerald-800 text-sm">{completedOrder.orderNumber}</strong>
            </p>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-left space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Order Date:</span>
              <span className="font-medium text-stone-900">
                {new Date(completedOrder.createdAt).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Payment Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                PAID ({completedOrder.paymentMethod})
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Delivery Address:</span>
              <span className="font-medium text-stone-900 text-right max-w-xs">
                {completedOrder.shippingAddress.recipientName}, {completedOrder.shippingAddress.addressLine1}, {completedOrder.shippingAddress.city} - {completedOrder.shippingAddress.postalCode}
              </span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-sm text-stone-900">
              <span>Total Paid:</span>
              <span className="text-emerald-800">₹{completedOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Email dispatch notice */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 text-left flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              An automated receipt notification and shipping tracking update has been scheduled for dispatch. Your parcel will be packaged securely from the Warangal Centre.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              onClick={onBackToStore}
              variant="outline"
              className="w-full sm:w-auto text-xs"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => onViewOrder(completedOrder.id)}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
            >
              View Order in Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 2: CHECKOUT & PAYMENT SELECTION
  // --------------------------------------------------------------------------
  if (step === 'checkout') {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        <button
          onClick={() => setStep('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cart
        </button>

        <div className="border-b border-stone-200 pb-4">
          <h1 className="text-2xl font-serif font-bold text-stone-900">Secure Checkout</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Deliveries dispatched directly from Sri Nutrition & Wellness Centre, Warangal
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Address & Payment */}
          <div className="md:col-span-7 space-y-6">
            {/* 1. Shipping Address Card */}
            <Card className="p-5 space-y-4">
              <CardHeader
                title="1. Delivery Address"
                subtitle="All parcels are dispatched with tracked courier delivery"
              />

              {addresses.length > 0 && !isAddingNewAddress && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-600 bg-emerald-50/50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-stone-900 block">{addr.recipientName}</span>
                          <span className="text-stone-600 block">{addr.addressLine1}</span>
                          {addr.addressLine2 && <span className="text-stone-500 block">{addr.addressLine2}</span>}
                          <span className="text-stone-600 block">
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </span>
                          <span className="text-stone-500 font-mono text-[11px] block mt-1">
                            Phone: {addr.phone}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Deliver to a different address
                  </button>
                </div>
              )}

              {isAddingNewAddress && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Recipient Full Name *"
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      placeholder="e.g. Ananya Sharma"
                      required
                    />
                    <Input
                      label="Mobile Phone (10-digits) *"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <Input
                    label="Address Line 1 (Flat, House No, Street) *"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    placeholder="e.g. H.No 12-4-89, Subedari"
                    required
                  />

                  <Input
                    label="Address Line 2 (Landmark, Colony) [Optional]"
                    value={newAddress.addressLine2}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    placeholder="Near Kakatiya University Gate"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="City *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                    <Input
                      label="State *"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                    <Input
                      label="PIN Code (6 digits) *"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      placeholder="506001"
                      required
                    />
                  </div>

                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline block pt-1"
                    >
                      Use existing saved address
                    </button>
                  )}
                </div>
              )}
            </Card>

            {/* 2. Payment Method Card */}
            <Card className="p-5 space-y-4">
              <CardHeader
                title="2. Payment Method"
                subtitle="Direct UPI (Instant zero fees) or Razorpay Online Payment"
              />

              <div className="space-y-3 text-xs">
                {/* Option A: Direct UPI */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'DIRECT_UPI_QR'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'DIRECT_UPI_QR'}
                    onChange={() => setPaymentMethod('DIRECT_UPI_QR')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        Direct UPI Payment (GPay, PhonePe, Paytm)
                      </span>
                      <Badge variant="success">Recommended • Zero Fees</Badge>
                    </div>
                    <p className="text-stone-600 leading-relaxed">
                      Scan the QR code or pay directly to the verified centre account of{' '}
                      <strong>{businessSettings.ownerName}</strong>.
                    </p>

                    {paymentMethod === 'DIRECT_UPI_QR' && (
                      <div className="mt-3 p-4 bg-white rounded-xl border border-emerald-200 space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {/* Dynamic QR Code Canvas/Image */}
                          <div className="w-28 h-28 bg-stone-50 p-2 rounded-lg border border-stone-200 flex flex-col items-center justify-center shrink-0">
                            {/* QR placeholder representation with real UPI URI */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                `upi://pay?pa=${businessSettings.upiId}&pn=${encodeURIComponent(
                                  businessSettings.ownerName
                                )}&am=${cartTotal}&cu=INR`
                              )}`}
                              alt="UPI QR Code"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="space-y-1.5 text-xs text-center sm:text-left flex-1">
                            <span className="text-stone-500 text-[11px] block">Verified Centre UPI ID:</span>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <span className="font-mono font-bold text-sm text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {businessSettings.upiId}
                              </span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="p-1 text-stone-400 hover:text-emerald-700 rounded"
                                title="Copy UPI ID"
                              >
                                {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            <span className="text-[11px] text-stone-500 block">
                              Account Holder: <strong>{businessSettings.ownerName}</strong>
                            </span>
                            <span className="text-[11px] text-emerald-700 block font-semibold">
                              Pay exact amount: ₹{cartTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Input
                            label="Enter 12-Digit UPI Transaction Reference / UTR Number *"
                            value={upiRefNumber}
                            onChange={(e) => setUpiRefNumber(e.target.value)}
                            placeholder="e.g. 428901239812 or UPI Ref"
                            required={paymentMethod === 'DIRECT_UPI_QR'}
                          />
                          <span className="text-[10px] text-stone-400 block mt-1">
                            Located on your Google Pay, PhonePe, or Paytm receipt after successful transfer.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Option B: Razorpay */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY_UPI'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'RAZORPAY_UPI'}
                    onChange={() => setPaymentMethod('RAZORPAY_UPI')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      Razorpay Secure Gateway (Cards, NetBanking, UPI)
                    </span>
                    <p className="text-stone-600">
                      Standard encrypted online checkout with instant automated server verification.
                    </p>
                  </div>
                </label>

                {/* Option C: Pay on Centre Pickup */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'CASH_ON_CENTRE'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'CASH_ON_CENTRE'}
                    onChange={() => setPaymentMethod('CASH_ON_CENTRE')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      Pay at Warangal Centre (Store Pickup)
                    </span>
                    <p className="text-stone-600">
                      Reserve items online and pay in-person upon collecting at Warangal Centre.
                    </p>
                  </div>
                </label>
              </div>

              {/* Order Notes */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Delivery Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Leave package with neighbor if unavailable, delivery between 4-7 PM"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                ></textarea>
              </div>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-5 space-y-6">
            <Card className="p-5 space-y-4 sticky top-24">
              <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">
                Order Summary ({cartCount} item{cartCount > 1 ? 's' : ''})
              </h3>

              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between pt-2 text-xs">
                    <div className="max-w-[180px]">
                      <span className="font-semibold text-stone-800 block truncate">
                        {item.product.name}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        Qty: {item.quantity} &times; ₹
                        {(item.product.discountedPrice || item.product.price).toFixed(2)}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900">
                      ₹
                      {(
                        (item.product.discountedPrice || item.product.price) *
                        item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-stone-200">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping Fee</span>
                  <span>{cartShipping === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${cartShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total Amount</span>
                  <span className="text-emerald-800">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isProcessing
                  ? 'Confirming Order...'
                  : `Pay & Place Order • ₹${cartTotal.toFixed(2)}`}
              </Button>

              <div className="text-[11px] text-stone-500 text-center space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  SSL Encrypted & Serverless Verified
                </p>
                <p>Sri Nutrition Warangal • Contact: +91 7993367929</p>
              </div>
            </Card>
          </div>
        </form>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 1: SHOPPING CART OVERVIEW
  // --------------------------------------------------------------------------
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our doctor & nutritionist authorized nutritional shakes, protein formulations, and wellness teas.
        </p>
        <Button onClick={onBackToStore} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs mt-2">
          Browse Nutritional Store
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Shopping Cart</h1>
          <p className="text-xs text-stone-500">
            Review your selected nutritional supplements before checkout
          </p>
        </div>
        <Button onClick={onBackToStore} variant="outline" size="sm" className="text-xs">
          Continue Shopping
        </Button>
      </div>

      {/* Free Shipping Progress Alert */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center justify-between text-emerald-900">
          <span className="font-semibold flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-700" />
            {remainingForFreeShipping === 0 ? (
              <strong>Congratulations! You unlocked FREE Courier Shipping!</strong>
            ) : (
              <span>
                Add <strong>₹{remainingForFreeShipping.toFixed(2)}</strong> more to get{' '}
                <strong>FREE Shipping</strong> (Order value ≥ ₹{freeShippingThreshold})
              </span>
            )}
          </span>
          <span className="font-mono text-[11px] font-bold text-emerald-800">
            {freeShippingProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
            {cart.map((item) => {
              const price = item.product.discountedPrice || item.product.price;
              const itemTotal = price * item.quantity;

              return (
                <div key={item.productId} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                    <img
                      src={item.product.imageUrl || ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-stone-900 truncate">
                      {item.product.name}
                    </h3>
                    <span className="text-[11px] text-stone-500 font-mono block">
                      SKU: {item.product.sku}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 block mt-0.5">
                      ₹{price.toFixed(2)} each
                    </span>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="p-1 text-stone-500 hover:text-stone-800 hover:bg-white rounded transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 text-xs font-bold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="p-1 text-stone-500 hover:text-stone-800 hover:bg-white rounded transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-bold text-stone-900 block">
                      ₹{itemTotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-0.5 ml-auto mt-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-stone-500 px-1">
            <button
              onClick={clearCart}
              className="text-stone-500 hover:text-rose-600 underline text-xs"
            >
              Clear shopping cart
            </button>
            <span>All prices are inclusive of applicable GST</span>
          </div>
        </div>

        {/* Cart Summary Card */}
        <div className="md:col-span-4">
          <Card className="p-5 space-y-4 sticky top-24">
            <h3 className="font-bold text-stone-900 text-sm pb-2 border-b border-stone-100">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Courier Shipping</span>
                <span>
                  {cartShipping === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    `₹${cartShipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total</span>
                <span className="text-emerald-800 text-base">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleProceedToCheckout}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-2.5"
            >
              Proceed to Checkout
            </Button>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 space-y-1">
              <span className="font-semibold text-stone-800 block">Accepted Payment Modes:</span>
              <p>• Verified Direct UPI QR (7660990052-2@ybl)</p>
              <p>• Razorpay Online Debit/Credit Cards</p>
              <p>• Cash Pickup at Warangal Centre</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

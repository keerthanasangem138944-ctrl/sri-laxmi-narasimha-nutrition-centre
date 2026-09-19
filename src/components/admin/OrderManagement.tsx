import React, { useState } from 'react';
import { usePlatformState, OrderRecord } from '../../lib/platform-state';
import { 
  Search, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Printer, 
  CreditCard, 
  QrCode, 
  MapPin, 
  Phone,
  FileText
} from 'lucide-react';
import { Button } from '../ui/button';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, payments } = usePlatformState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeOrderModal, setActiveOrderModal] = useState<OrderRecord | null>(null);
  const [statusUpdateVal, setStatusUpdateVal] = useState<OrderRecord['status']>('CONFIRMED');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerMobile.includes(searchQuery);
    const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderRecord['status']) => {
    updateOrderStatus(orderId, newStatus);
    if (activeOrderModal && activeOrderModal.id === orderId) {
      setActiveOrderModal((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">Pending</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">Confirmed</span>;
      case 'PROCESSING':
        return <span className="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">Processing</span>;
      case 'SHIPPED':
        return <span className="bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">Shipped</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Customer Orders & Shipments
          </h2>
          <p className="text-xs text-stone-500">
            Monitor client dispensary orders, verified UPI transactions, and dispatch statuses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order # or customer..."
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No orders matching query
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const paymentObj = payments.find((p) => p.orderId === o.id);
                  return (
                    <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {o.orderNumber}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-900 block">{o.customerName}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{o.customerMobile}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        ₹{o.totalAmount.toLocaleString()}
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {o.items.length} item(s)
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-stone-700 block text-[11px]">
                            {o.paymentMethod.replace('_', ' ')}
                          </span>
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-semibold ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(o.status)}
                      </td>

                      <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          onClick={() => {
                            setActiveOrderModal(o);
                            setStatusUpdateVal(o.status);
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Order Details: <span className="font-mono text-emerald-900">{activeOrderModal.orderNumber}</span>
                </h3>
                <span className="text-[11px] text-stone-500 font-mono">
                  Placed on {new Date(activeOrderModal.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer & Shipping Details */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <strong className="block text-stone-900 uppercase font-semibold text-[10px] tracking-wider">
                  Shipping Address
                </strong>
                <p className="font-bold text-stone-900">
                  {activeOrderModal.shippingAddress.recipientName}
                </p>
                <p className="text-stone-600 font-mono">
                  Phone: {activeOrderModal.shippingAddress.phone}
                </p>
                <p className="text-stone-600">
                  {activeOrderModal.shippingAddress.addressLine1}
                  {activeOrderModal.shippingAddress.addressLine2 ? `, ${activeOrderModal.shippingAddress.addressLine2}` : ''}
                </p>
                <p className="text-stone-600">
                  {activeOrderModal.shippingAddress.city}, {activeOrderModal.shippingAddress.state} -{' '}
                  <span className="font-mono font-bold">{activeOrderModal.shippingAddress.postalCode}</span>
                </p>
                {activeOrderModal.notes && (
                  <p className="pt-2 border-t border-stone-200 text-stone-500 italic">
                    Note: "{activeOrderModal.notes}"
                  </p>
                )}
              </div>

              {/* Payment Details */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <strong className="block text-stone-900 uppercase font-semibold text-[10px] tracking-wider">
                  Payment Verification
                </strong>
                <div className="flex justify-between">
                  <span className="text-stone-500">Method:</span>
                  <span className="font-semibold text-stone-900">{activeOrderModal.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status:</span>
                  <span className="font-mono font-bold text-emerald-800">{activeOrderModal.paymentStatus}</span>
                </div>
                {payments
                  .filter((p) => p.orderId === activeOrderModal.id)
                  .map((p, idx) => (
                    <div key={idx} className="pt-2 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
                      {p.razorpayPaymentId && <div>Razorpay ID: {p.razorpayPaymentId}</div>}
                      {p.upiTransactionRef && <div>UPI Ref / UTR: {p.upiTransactionRef}</div>}
                    </div>
                  ))}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <strong className="block text-stone-900 text-xs font-semibold">
                Ordered Items Breakdown
              </strong>
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Unit Price</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {activeOrderModal.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-stone-900">{item.productName}</td>
                        <td className="py-2 px-3 font-mono text-[10px] text-stone-400">{item.sku}</td>
                        <td className="py-2 px-3 font-mono">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono font-bold">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          ₹{item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end pt-2 text-xs space-y-1">
              <div className="w-48 space-y-1 text-right">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{activeOrderModal.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping:</span>
                  <span className="font-mono">
                    {activeOrderModal.shippingFee === 0 ? 'FREE' : `₹${activeOrderModal.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-sm border-t border-stone-200 pt-1">
                  <span>Total:</span>
                  <span className="font-mono text-emerald-900">
                    ₹{activeOrderModal.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Controls */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-700">Update Order Status:</span>
                <select
                  value={statusUpdateVal}
                  onChange={(e) => setStatusUpdateVal(e.target.value as OrderRecord['status'])}
                  className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-semibold"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <Button
                  onClick={() => handleStatusChange(activeOrderModal.id, statusUpdateVal)}
                  size="sm"
                  className="h-8 text-xs"
                >
                  Update
                </Button>
              </div>

              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                className="h-8 text-xs flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

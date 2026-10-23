import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Eye,
  Printer,
  Calendar,
  Search,
  Percent,
  IndianRupee,
  Package
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { Order } from '../../types/pos.ts';

interface BillingManagerProps {
  onOpenReceipt: (order: Order) => void;
  preSelectedOrder?: Order | null;
}

export const BillingManager: React.FC<BillingManagerProps> = ({ onOpenReceipt, preSelectedOrder }) => {
  const { db, settleBill, updateOrderStatus } = usePos();
  const [activeTab, setActiveTab] = useState<'pending' | 'settled'>('pending');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preSelectedOrder?.id || '');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [discountReason, setDiscountReason] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const orders = db?.orders || [];
  const pendingOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const settledOrders = orders.filter((o) => o.status === 'completed');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || pendingOrders[0];

  // Calculate discount and grand total live
  const calculateDiscountAmount = (order: Order) => {
    const val = Number(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percentage') {
      return Math.round((order.subtotal * Math.min(100, val)) / 100);
    }
    return Math.min(order.subtotal, val);
  };

  const discountAmount = selectedOrder ? calculateDiscountAmount(selectedOrder) : 0;
  const finalGrandTotal = selectedOrder
    ? Math.max(0, selectedOrder.subtotal + selectedOrder.parcelTotal + selectedOrder.taxAmount - discountAmount)
    : 0;

  const handleSettleOrder = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    await settleBill(selectedOrder.id, paymentMethod, discountAmount, discountReason);
    setIsProcessing(false);
    onOpenReceipt(selectedOrder);
    setDiscountValue('');
    setDiscountReason('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-500" />
            <span>Billing, Discounts & Settlements</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Process payments with Cash, UPI, or Card, apply promotions, and generate GST receipts
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Tables ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('settled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'settled'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settled History ({settledOrders.length})
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Order Queue */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Table to Settle
            </h3>

            {pendingOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <div className="font-bold text-white text-sm">All Bills Cleared</div>
                <div className="text-xs mt-1">No active dining orders awaiting settlement right now.</div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {pendingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setDiscountValue('');
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                      (selectedOrder?.id === ord.id)
                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">Table {ord.tableNumber}</span>
                        {ord.billRequested && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded-full font-bold uppercase animate-pulse">
                            Bill Requested
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Order #{ord.orderNumber} • Waiter: {ord.waiterName} • {ord.items.length} items
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-white font-mono">₹{ord.grandTotal}</div>
                      <span className="text-[10px] text-slate-500 capitalize">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Settlement & Discount Checkout Panel */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Settlement: Table {selectedOrder.tableNumber} (Order #{selectedOrder.orderNumber})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Placed by {selectedOrder.waiterName} at{' '}
                      {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenReceipt(selectedOrder)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Bill</span>
                  </button>
                </div>

                {/* Items Summary Table */}
                <div className="py-4 border-b border-slate-800 max-h-48 overflow-y-auto pr-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 text-left pb-1 border-b border-slate-800/80">
                        <th className="pb-1.5 font-semibold">Item</th>
                        <th className="pb-1.5 text-center font-semibold">Qty</th>
                        <th className="pb-1.5 text-right font-semibold">Rate</th>
                        <th className="pb-1.5 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i} className="py-1">
                          <td className="py-1.5 font-medium text-slate-200">
                            {item.name}
                            {item.isParcel && (
                              <span className="ml-1 text-[10px] text-amber-400 font-bold">(Parcel)</span>
                            )}
                          </td>
                          <td className="py-1.5 text-center font-bold text-white">{item.quantity}</td>
                          <td className="py-1.5 text-right text-slate-400 font-mono">₹{item.unitPrice}</td>
                          <td className="py-1.5 text-right font-bold text-white font-mono">₹{item.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Discount Applicator */}
                <div className="py-4 border-b border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Apply Discount or Courtesy Waiver</span>
                    </label>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setDiscountType('flat')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          discountType === 'flat' ? 'bg-amber-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        ₹ Flat
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('percentage')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          discountType === 'percentage' ? 'bg-amber-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        % Percent
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder={discountType === 'flat' ? 'Discount Amount (₹)' : 'Discount (%)'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g. VIP, Staff, Courtesy)"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="py-4 border-b border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition ${
                        paymentMethod === 'cash'
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-400" />
                      <span>Cash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition ${
                        paymentMethod === 'upi'
                          ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-cyan-400" />
                      <span>UPI (GPay/PhonePe)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold text-xs transition ${
                        paymentMethod === 'card'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      <span>Card / POS</span>
                    </button>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="py-4 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.parcelTotal > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Parcel Packaging:</span>
                      <span>₹{selectedOrder.parcelTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>GST (5%):</span>
                    <span>₹{selectedOrder.taxAmount}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Discount ({discountReason || 'Discount'}):</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-slate-800">
                    <span>FINAL PAYABLE:</span>
                    <span className="text-amber-400">₹{finalGrandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Settle Action Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSettleOrder}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {isProcessing
                    ? 'Processing Payment...'
                    : `Settle ₹${finalGrandTotal} & Close Table ${selectedOrder.tableNumber}`}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Settled Orders History */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-extrabold text-white text-sm">Settled Bills History</h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bill # or table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-left">
                  <th className="py-2.5 font-bold">Bill #</th>
                  <th className="py-2.5 font-bold">Table</th>
                  <th className="py-2.5 font-bold">Waiter</th>
                  <th className="py-2.5 font-bold">Items</th>
                  <th className="py-2.5 font-bold">Subtotal</th>
                  <th className="py-2.5 font-bold">Discount</th>
                  <th className="py-2.5 font-bold">Net Total</th>
                  <th className="py-2.5 font-bold">Method</th>
                  <th className="py-2.5 font-bold">Time</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {settledOrders
                  .filter((o) => {
                    if (!searchQuery) return true;
                    return (
                      String(o.orderNumber).includes(searchQuery) ||
                      String(o.tableNumber).includes(searchQuery) ||
                      o.waiterName.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  })
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-amber-400">#{order.orderNumber}</td>
                      <td className="py-3 font-bold text-white">Table {order.tableNumber}</td>
                      <td className="py-3 text-slate-300">{order.waiterName}</td>
                      <td className="py-3 text-slate-400">{order.items.length} items</td>
                      <td className="py-3 font-mono text-slate-400">₹{order.subtotal}</td>
                      <td className="py-3 font-mono text-emerald-400">
                        {order.discountAmount > 0 ? `-₹${order.discountAmount}` : '—'}
                      </td>
                      <td className="py-3 font-mono font-bold text-white">₹{order.grandTotal}</td>
                      <td className="py-3">
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {order.paymentMethod || 'cash'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(order.completedAt || order.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onOpenReceipt(order)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

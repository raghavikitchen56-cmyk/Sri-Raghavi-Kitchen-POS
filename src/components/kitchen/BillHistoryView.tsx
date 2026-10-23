import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Calendar,
  Clock,
  User,
  CheckCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  Filter
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { Order } from '../../types/pos.ts';

interface BillHistoryViewProps {
  onOpenReceipt: (order: Order) => void;
  onOpenBillingForOrder: (order: Order) => void;
}

export const BillHistoryView: React.FC<BillHistoryViewProps> = ({ onOpenReceipt, onOpenBillingForOrder }) => {
  const { db } = usePos();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const orders = db?.orders || [];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'paid' && order.paymentStatus !== 'paid') return false;
    if (statusFilter === 'unpaid' && order.paymentStatus === 'paid') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const orderMatch = `order #${order.orderNumber}`.includes(q) || `bill #${order.orderNumber}`.includes(q) || `${order.orderNumber}` === q;
    const tableMatch = `table ${order.tableNumber}`.includes(q) || `${order.tableNumber}` === q;
    const waiterMatch = order.waiterName.toLowerCase().includes(q);
    const itemMatch = order.items.some((i) => i.name.toLowerCase().includes(q));

    return orderMatch || tableMatch || waiterMatch || itemMatch;
  });

  const totalCollected = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.grandTotal, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-400" />
            <span>Bill & Invoice History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit itemized bills, payment methods, GST breakdowns, and print receipts in 80mm or A4 formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Total Settled: </span>
            <strong className="text-emerald-400 font-bold">₹{totalCollected}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Bill #, Table #, Waiter, or Dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bills ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paid ({orders.filter((o) => o.paymentStatus === 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'unpaid'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active / Unpaid ({orders.filter((o) => o.paymentStatus !== 'paid').length})
          </button>
        </div>
      </div>

      {/* Bills Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Bills Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try clearing your search query.' : 'New orders and settled tables will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 font-bold">Bill #</th>
                  <th className="py-3 px-4 font-bold">Table</th>
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                  <th className="py-3 px-4 font-bold">Waiter</th>
                  <th className="py-3 px-4 font-bold">Items</th>
                  <th className="py-3 px-4 font-bold text-right">Subtotal</th>
                  <th className="py-3 px-4 font-bold text-right">GST</th>
                  <th className="py-3 px-4 font-bold text-right">Grand Total</th>
                  <th className="py-3 px-4 font-bold text-center">Payment</th>
                  <th className="py-3 px-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.map((order) => {
                  const timeStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short'
                  });

                  return (
                    <tr key={order.id} className="hover:bg-slate-850/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">Table {order.tableNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <div>{dateStr}</div>
                        <div className="text-[10px] text-slate-500">{timeStr}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {order.waiterName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        <span title={order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}>
                          {order.items.length} dishes ({order.items.reduce((acc, i) => acc + i.quantity, 0)} units)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        ₹{order.subtotal}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        ₹{order.taxAmount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-white text-sm">
                        ₹{order.grandTotal}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {order.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                            <CheckCircle className="w-2.5 h-2.5" />
                            {order.paymentMethod || 'Paid'}
                          </span>
                        ) : (
                          <span className="inline-block bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                            {order.billRequested ? 'Bill Req' : 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenReceipt(order)}
                            className="py-1 px-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                            title="Preview and Print 80mm / A4 Bill"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Bill</span>
                          </button>
                          {order.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => onOpenBillingForOrder(order)}
                              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition"
                              title="Settle Bill Now"
                            >
                              Settle
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
      )}
    </div>
  );
};

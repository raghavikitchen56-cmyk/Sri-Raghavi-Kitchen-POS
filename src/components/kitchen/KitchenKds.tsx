import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowRightLeft,
  Package,
  XCircle,
  Flame,
  Check,
  User,
  ShoppingBag,
  Bell,
  Printer
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { Order, KitchenRequest, KitchenOrderTicket } from '../../types/pos.ts';

interface KitchenKdsProps {
  onOpenReceipt: (order: Order) => void;
  onOpenBillingForOrder: (order: Order) => void;
  onOpenKot?: (kot: KitchenOrderTicket) => void;
  initialFilterTab?: 'all' | 'new' | 'preparing' | 'ready' | 'bill_requests' | 'transfer_requests' | 'cancel_requests' | 'parcel_requests';
}

export const KitchenKds: React.FC<KitchenKdsProps> = ({
  onOpenReceipt,
  onOpenBillingForOrder,
  onOpenKot,
  initialFilterTab = 'all'
}) => {
  const { db, updateOrderStatus, updateRequestStatus } = usePos();
  const [filterTab, setFilterTab] = useState<
    'all' | 'new' | 'preparing' | 'ready' | 'bill_requests' | 'transfer_requests' | 'cancel_requests' | 'parcel_requests'
  >(initialFilterTab);

  useEffect(() => {
    if (initialFilterTab) {
      setFilterTab(initialFilterTab);
    }
  }, [initialFilterTab]);

  const orders = db?.orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled') || [];
  const requests = db?.requests.filter((r) => r.status === 'pending') || [];

  // Counts for tabs
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const billReqCount = requests.filter((r) => r.type === 'bill_request').length;
  const transferReqCount = requests.filter((r) => r.type === 'transfer_request').length;
  const cancelReqCount = requests.filter((r) => r.type === 'cancel_request').length;
  const parcelReqCount =
    requests.filter((r) => r.type === 'parcel_request').length +
    orders.filter((o) => o.isEntireOrderParcel || o.items.some((i) => i.isParcel)).length;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'new') return order.status === 'new';
    if (filterTab === 'preparing') return order.status === 'preparing';
    if (filterTab === 'ready') return order.status === 'ready';
    if (filterTab === 'parcel_requests') {
      return order.isEntireOrderParcel || order.items.some((i) => i.isParcel);
    }
    return false;
  });

  // Calculate elapsed minutes
  const getElapsedMinutes = (dateStr: string) => {
    const start = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 60000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Category Tab Filters */}
      <div
        style={{ borderStyle: 'dashed' }}
        className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-dashed border-slate-700/80"
      >
        <button
          onClick={() => setFilterTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'all'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>All Orders</span>
          <span className="bg-slate-950/60 px-2 py-0.5 rounded-full text-xs font-mono">{orders.length}</span>
        </button>

        <button
          onClick={() => setFilterTab('new')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'new'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 text-rose-400" />
          <span>New Orders</span>
          {newOrdersCount > 0 && (
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs font-mono font-black">
              {newOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('preparing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'preparing'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ChefHat className="w-4 h-4 text-blue-400" />
          <span>Preparing</span>
          <span className="bg-slate-950/60 px-2 py-0.5 rounded-full text-xs font-mono">{preparingCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('ready')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'ready'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Ready Orders</span>
          <span className="bg-slate-950/60 px-2 py-0.5 rounded-full text-xs font-mono">{readyCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('bill_requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'bill_requests'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4 text-purple-400" />
          <span>Bill Requests</span>
          {billReqCount > 0 && (
            <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-mono">{billReqCount}</span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('transfer_requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'transfer_requests'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
          <span>Table Transfers</span>
          {transferReqCount > 0 && (
            <span className="bg-cyan-500 text-white px-2 py-0.5 rounded-full text-xs font-mono">{transferReqCount}</span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('cancel_requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'cancel_requests'
              ? 'bg-rose-700 text-white shadow-lg shadow-rose-700/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Cancellations</span>
          {cancelReqCount > 0 && (
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs font-mono">{cancelReqCount}</span>
          )}
        </button>

        <button
          onClick={() => setFilterTab('parcel_requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
            filterTab === 'parcel_requests'
              ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-amber-400" />
          <span>Parcel Orders</span>
          {parcelReqCount > 0 && (
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-mono">{parcelReqCount}</span>
          )}
        </button>
      </div>

      {/* Special Requests Section (Transfers, Bills, Cancellations) if relevant */}
      {(filterTab === 'bill_requests' ||
        filterTab === 'transfer_requests' ||
        filterTab === 'cancel_requests' ||
        filterTab === 'all') &&
        requests.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Pending Waiter Requests ({requests.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests
                .filter((r) => {
                  if (filterTab === 'bill_requests') return r.type === 'bill_request';
                  if (filterTab === 'transfer_requests') return r.type === 'transfer_request';
                  if (filterTab === 'cancel_requests') return r.type === 'cancel_request';
                  return true;
                })
                .map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-amber-500/20 text-amber-300 font-extrabold text-sm px-2.5 py-1 rounded-lg uppercase">
                          {req.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-lg font-black text-white mb-1">
                        Table {req.tableNumber}
                        {req.targetTableNumber && (
                          <span className="text-cyan-400 ml-2">➜ Table {req.targetTableNumber}</span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 flex items-center gap-1.5 mb-3 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Requested by Waiter: <strong className="text-white">{req.waiterName}</strong></span>
                      </div>

                      {req.details && (
                        <p className="text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 mb-4">
                          "{req.details}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      {req.type === 'bill_request' ? (
                        <button
                          onClick={() => {
                            updateRequestStatus(req.id, 'resolved');
                            const order = orders.find((o) => o.tableId === req.tableId || o.id === req.orderId);
                            if (order) onOpenBillingForOrder(order);
                          }}
                          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>Generate & Settle Bill</span>
                        </button>
                      ) : req.type === 'transfer_request' ? (
                        <>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'approved')}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Transfer</span>
                          </button>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'rejected')}
                            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : req.type === 'cancel_request' ? (
                        <>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'approved')}
                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Approve Cancellation</span>
                          </button>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'rejected')}
                            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'resolved')}
                          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Main KDS Order Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-500" />
            <span>Active Kitchen Orders ({filteredOrders.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Real-time sync enabled</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Orders in this View</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All dishes are currently prepped or served. New orders placed by waiters will instantly ring here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isUrgent = elapsed >= 15;

              return (
                <div
                  key={order.id}
                  className={`bg-slate-900 rounded-2xl border-2 flex flex-col justify-between overflow-hidden shadow-2xl transition duration-200 ${
                    order.status === 'new'
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : order.status === 'preparing'
                      ? 'border-blue-600'
                      : 'border-emerald-600'
                  }`}
                >
                  {/* Card Header with Table & Timer */}
                  <div
                    className={`p-3.5 flex items-center justify-between border-b ${
                      order.status === 'new'
                        ? 'bg-amber-950/70 border-amber-900/60'
                        : order.status === 'preparing'
                        ? 'bg-blue-950/70 border-blue-900/60'
                        : 'bg-emerald-950/70 border-emerald-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">Table {order.tableNumber}</span>
                        {order.isEntireOrderParcel && (
                          <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                            <Package className="w-3 h-3" /> Parcel
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5 font-medium">
                        <span>#{order.orderNumber}</span>
                        <span>•</span>
                        <span>Waiter: {order.waiterName}</span>
                      </div>
                    </div>

                    {/* Timer */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-bold border ${
                        isUrgent
                          ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                          : 'bg-slate-900/90 text-slate-200 border-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsed}m</span>
                    </div>
                  </div>

                  {/* KOT Tickets Bar */}
                  {order.kots && order.kots.length > 0 && (
                    <div className="px-3.5 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="text-slate-400 font-mono text-[10px]">Tickets:</span>
                      {order.kots.map((kot, kIdx) => (
                        <button
                          key={kot.id || kIdx}
                          onClick={() => onOpenKot && onOpenKot(kot)}
                          className={`px-2 py-0.5 rounded font-mono font-bold transition flex items-center gap-1 ${
                            kot.isAddition
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/80 hover:bg-rose-900'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/80 hover:bg-amber-900'
                          }`}
                          title={`Click to preview & print KOT #${kot.kotNumber}`}
                        >
                          <Printer className="w-2.5 h-2.5" />
                          <span>KOT #{kot.kotNumber}</span>
                          {kot.isAddition && <span className="text-[9px] uppercase font-black">(+Add)</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bill Requested Highlight Banner */}
                  {order.billRequested && (
                    <div className="px-3.5 py-1.5 bg-purple-950 border-b border-purple-800 text-purple-200 text-xs font-bold flex items-center justify-between animate-pulse">
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-purple-400" />
                        <span>Waiter Requested Bill!</span>
                      </span>
                      <button
                        onClick={() => onOpenBillingForOrder(order)}
                        className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-[10px]"
                      >
                        Settle Now
                      </button>
                    </div>
                  )}

                  {/* Item List */}
                  <div className="p-4 flex-1 space-y-3 divide-y divide-slate-800/80">
                    {order.items.map((item) => (
                      <div key={item.id} className="pt-2.5 first:pt-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="w-7 h-7 bg-amber-500/20 text-amber-400 font-extrabold rounded-lg flex items-center justify-center text-sm border border-amber-500/40 shrink-0">
                              {item.quantity}x
                            </span>
                            <div>
                              <div className="font-bold text-white text-sm leading-snug">{item.name}</div>
                              {item.tamilName && (
                                <div className="text-xs text-amber-300/80 font-medium">{item.tamilName}</div>
                              )}
                            </div>
                          </div>

                          {/* Parcel / Veg tag */}
                          {item.isParcel && (
                            <span className="text-[10px] bg-amber-900/70 text-amber-300 border border-amber-700/60 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                              Parcel
                            </span>
                          )}
                        </div>

                        {/* Spice & Add-ons */}
                        {(item.spiceLevel || item.selectedAddOns?.length > 0 || item.notes) && (
                          <div className="ml-9 mt-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              {item.spiceLevel && (
                                <span className="bg-red-950/80 text-red-300 border border-red-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5 text-red-400" /> {item.spiceLevel}
                                </span>
                              )}
                              {item.selectedAddOns?.map((a, i) => (
                                <span
                                  key={i}
                                  className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-medium border border-slate-700"
                                >
                                  +{a.name}
                                </span>
                              ))}
                            </div>
                            {item.notes && (
                              <div className="text-[11px] text-amber-200/90 italic">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Card Bottom Controls (Large touch buttons for kitchen cooks) */}
                  <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <span>Total: <strong className="text-white font-mono">₹{order.grandTotal}</strong></span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const latestKot = order.kots && order.kots.length > 0
                              ? order.kots[order.kots.length - 1]
                              : {
                                  id: `kot-${order.id}`,
                                  kotNumber: order.orderNumber + 100,
                                  orderId: order.id,
                                  orderNumber: order.orderNumber,
                                  tableId: order.tableId,
                                  tableNumber: order.tableNumber,
                                  waiterId: order.waiterId,
                                  waiterName: order.waiterName,
                                  items: order.items,
                                  isAddition: false,
                                  createdAt: order.createdAt
                                };
                            if (onOpenKot) onOpenKot(latestKot);
                            else onOpenReceipt(order);
                          }}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold text-[11px] bg-amber-950/40 hover:bg-amber-900/60 px-2 py-1 rounded-lg border border-amber-800/50 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print KOT</span>
                        </button>
                        <button
                          onClick={() => onOpenReceipt(order)}
                          className="text-purple-300 hover:text-purple-200 flex items-center gap-1 font-semibold text-[11px] bg-purple-950/40 hover:bg-purple-900/60 px-2 py-1 rounded-lg border border-purple-800/50 transition"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Bill</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {order.status === 'new' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95"
                        >
                          <ChefHat className="w-5 h-5" />
                          <span>Accept & Start Preparing</span>
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 animate-pulse"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Mark as Ready to Serve 🔔</span>
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Mark Served</span>
                          </button>
                          <button
                            onClick={() => onOpenBillingForOrder(order)}
                            className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>Settle Bill</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

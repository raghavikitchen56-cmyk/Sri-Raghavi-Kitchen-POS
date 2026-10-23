import React, { useState } from 'react';
import {
  Users,
  LayoutGrid,
  Plus,
  Receipt,
  ArrowRightLeft,
  Package,
  XCircle,
  HelpCircle,
  Bell,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  ShoppingBag
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { Table, Order, KitchenOrderTicket } from '../../types/pos.ts';
import { WaiterOrderPad } from './WaiterOrderPad.tsx';
import { TableTransferModal } from './TableTransferModal.tsx';
import { Printer } from 'lucide-react';

interface WaiterDashboardProps {
  onOpenReceipt: (order: Order) => void;
  onOpenKot?: (kot: KitchenOrderTicket) => void;
}

export const WaiterDashboard: React.FC<WaiterDashboardProps> = ({ onOpenReceipt, onOpenKot }) => {
  const { db, currentUser, createRequest, updateOrderStatus } = usePos();
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<Table | null>(null);
  const [isAddingToExisting, setIsAddingToExisting] = useState<boolean>(false);
  const [activeTableAction, setActiveTableAction] = useState<Table | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState<string | null>(null);

  const tables = db?.tables || [];
  const orders = db?.orders || [];

  // Filter ready orders for waiter notification banner
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const showSuccessBanner = (msg: string) => {
    setRequestSuccessMessage(msg);
    setTimeout(() => setRequestSuccessMessage(null), 4000);
  };

  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      // Start fresh order
      setSelectedTableForOrder(table);
      setIsAddingToExisting(false);
    } else {
      // Open action sheet for this running table
      setActiveTableAction(table);
    }
  };

  const activeOrder = activeTableAction?.currentOrderId
    ? orders.find((o) => o.id === activeTableAction.currentOrderId)
    : null;

  const handleRequestBill = async (table: Table) => {
    await createRequest({
      type: 'bill_request',
      tableId: table.id,
      waiterId: currentUser?.id || 'w-1',
      details: 'Customer requested final bill'
    });
    setActiveTableAction(null);
    showSuccessBanner(`Bill requested for Table ${table.tableNumber}. Kitchen alerted!`);
  };

  const handleRequestParcel = async (table: Table) => {
    await createRequest({
      type: 'parcel_request',
      tableId: table.id,
      waiterId: currentUser?.id || 'w-1',
      details: 'Customer requested food parcel container & bag'
    });
    setActiveTableAction(null);
    showSuccessBanner(`Parcel packing requested for Table ${table.tableNumber}.`);
  };

  const [cancelModalTable, setCancelModalTable] = useState<Table | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState<string>('Customer changed mind');

  const handleConfirmCancellation = async () => {
    if (!cancelModalTable) return;
    await createRequest({
      type: 'cancel_request',
      tableId: cancelModalTable.id,
      waiterId: currentUser?.id || 'w-1',
      details: cancelReasonText || 'Customer cancellation'
    });
    const tblNum = cancelModalTable.tableNumber;
    setCancelModalTable(null);
    setActiveTableAction(null);
    showSuccessBanner(`Cancellation request sent to Kitchen for Table ${tblNum}.`);
  };

  const handleCallAssistance = async (table: Table) => {
    await createRequest({
      type: 'assistance',
      tableId: table.id,
      waiterId: currentUser?.id || 'w-1',
      details: 'Waiter calls for kitchen counter assistance'
    });
    setActiveTableAction(null);
    showSuccessBanner(`Kitchen assistance alert sent for Table ${table.tableNumber}.`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Ready Orders Live Banner */}
      {readyOrders.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  🔔 Kitchen Counter Alert: {readyOrders.length} Order{readyOrders.length > 1 ? 's' : ''} READY to Serve!
                </h3>
                <div className="text-xs text-emerald-300 font-medium mt-0.5">
                  Pick up dishes from kitchen counter for: {readyOrders.map((o) => `Table ${o.tableNumber} (#${o.orderNumber})`).join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {readyOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => updateOrderStatus(o.id, 'served')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Mark Table {o.tableNumber} Served ✓
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success banner */}
      {requestSuccessMessage && (
        <div className="bg-cyan-950 border border-cyan-800 text-cyan-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{requestSuccessMessage}</span>
        </div>
      )}

      {/* Waiter Greeting & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-amber-500" />
            <span>Waiter Ordering Station — 15 Dining Tables</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as <strong className="text-amber-400">{currentUser?.name}</strong>. Tap an Available table to create an order, or tap a running table to add items and request bills.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
          </span>
          <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Preparing
          </span>
          <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Ready
          </span>
          <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Bill Requested
          </span>
        </div>
      </div>

      {/* 15 Table Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => {
          const tableOrder = table.currentOrderId ? orders.find((o) => o.id === table.currentOrderId) : null;

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`p-4 rounded-2xl border-2 transition duration-150 cursor-pointer flex flex-col justify-between shadow-xl select-none active:scale-[0.98] ${
                table.status === 'available'
                  ? 'bg-slate-900 border-slate-800 hover:border-emerald-500'
                  : table.status === 'preparing'
                  ? 'bg-amber-950/40 border-amber-500 shadow-amber-950/20'
                  : table.status === 'ready'
                  ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-purple-950/30'
                  : table.status === 'bill_requested'
                  ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/40 animate-pulse'
                  : 'bg-blue-950/40 border-blue-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-white">{table.tableNumber}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      table.status === 'available'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : table.status === 'preparing'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : table.status === 'ready'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : table.status === 'bill_requested'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {table.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-300">{table.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {table.section} • {table.capacity} Seats
                </div>

                {tableOrder && (
                  <div className="mt-3 p-2 bg-slate-950/80 rounded-xl border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-bold">#{tableOrder.orderNumber}</span>
                      <span className="text-white font-mono font-bold">₹{tableOrder.grandTotal}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Waiter: <strong className="text-slate-200">{tableOrder.waiterName}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-center">
                {table.status === 'available' ? (
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Start Order
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> View & Actions
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Running Order Action Modal */}
      {activeTableAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">Table {activeTableAction.tableNumber}</h3>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    {activeTableAction.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {activeTableAction.section} • Capacity: {activeTableAction.capacity} Seats
                </p>
              </div>

              <button
                onClick={() => setActiveTableAction(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Order Summary */}
            {activeOrder ? (
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-400">Order #{activeOrder.orderNumber}</span>
                  <span className="text-slate-400">Waiter: {activeOrder.waiterName}</span>
                  <span className="font-mono font-bold text-white text-sm">₹{activeOrder.grandTotal}</span>
                </div>

                {/* KOT Tickets Bar for Waiter */}
                {activeOrder.kots && activeOrder.kots.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] pb-1 border-b border-slate-850">
                    <span className="text-slate-400 font-mono text-[10px]">KOT Tickets:</span>
                    {activeOrder.kots.map((kot, kIdx) => (
                      <button
                        key={kot.id || kIdx}
                        onClick={() => onOpenKot && onOpenKot(kot)}
                        className={`px-2 py-0.5 rounded font-mono font-bold transition flex items-center gap-1 ${
                          kot.isAddition
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                            : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                        }`}
                      >
                        <Printer className="w-2.5 h-2.5" />
                        <span>KOT #{kot.kotNumber}</span>
                        {kot.isAddition && <span className="text-[9px] uppercase font-black">(+Add)</span>}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bill requested banner */}
                {activeOrder.billRequested && (
                  <div className="bg-purple-950/80 border border-purple-800 text-purple-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between font-bold">
                    <span>🔔 Bill Requested to Kitchen!</span>
                    <button
                      onClick={() => onOpenReceipt(activeOrder)}
                      className="text-amber-400 hover:underline text-[11px]"
                    >
                      Preview Bill
                    </button>
                  </div>
                )}

                <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 text-xs divide-y divide-slate-850">
                  {activeOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center pt-1 first:pt-0">
                      <span className="text-slate-200">
                        {item.quantity}x {item.name}
                        {item.isParcel && <span className="ml-1 text-[10px] text-amber-400 font-bold">(Parcel)</span>}
                      </span>
                      <span className="font-mono text-slate-400">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No order details found.</div>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  setSelectedTableForOrder(activeTableAction);
                  setIsAddingToExisting(true);
                  setActiveTableAction(null);
                }}
                className="py-3 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Items to Order</span>
              </button>

              <button
                onClick={() => handleRequestBill(activeTableAction)}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md ${
                  activeOrder?.billRequested
                    ? 'bg-purple-900 text-purple-200 border border-purple-700'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{activeOrder?.billRequested ? 'Bill Requested ✓' : 'Request Bill'}</span>
              </button>

              {activeOrder && (
                <button
                  onClick={() => onOpenReceipt(activeOrder)}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-purple-400" />
                  <span>Preview / Print Bill</span>
                </button>
              )}

              {activeOrder && (
                <button
                  onClick={() => {
                    const latestKot = activeOrder.kots && activeOrder.kots.length > 0
                      ? activeOrder.kots[activeOrder.kots.length - 1]
                      : {
                          id: `kot-${activeOrder.id}`,
                          kotNumber: activeOrder.orderNumber + 100,
                          orderId: activeOrder.id,
                          orderNumber: activeOrder.orderNumber,
                          tableId: activeOrder.tableId,
                          tableNumber: activeOrder.tableNumber,
                          waiterId: activeOrder.waiterId,
                          waiterName: activeOrder.waiterName,
                          items: activeOrder.items,
                          isAddition: false,
                          createdAt: activeOrder.createdAt
                        };
                    if (onOpenKot) onOpenKot(latestKot);
                    else onOpenReceipt(activeOrder);
                  }}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-amber-900/40"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>View / Print KOT</span>
                </button>
              )}

              <button
                onClick={() => handleRequestParcel(activeTableAction)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-amber-900/40"
              >
                <Package className="w-4 h-4" />
                <span>Request Parcel</span>
              </button>

              <button
                onClick={() => {
                  setIsTransferModalOpen(true);
                }}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-cyan-900/40"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transfer Table</span>
              </button>

              <button
                onClick={() => setCancelModalTable(activeTableAction)}
                className="py-2.5 px-3 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-rose-800/60"
              >
                <XCircle className="w-4 h-4" />
                <span>Request Cancel</span>
              </button>

              <button
                onClick={() => handleCallAssistance(activeTableAction)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Call Kitchen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Request Modal */}
      {cancelModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-black text-white">
              Cancel Order: Table {cancelModalTable.tableNumber}
            </h3>
            <p className="text-xs text-slate-400">
              Provide reason for kitchen approval (e.g. customer walked out, duplicate):
            </p>
            <input
              type="text"
              value={cancelReasonText}
              onChange={(e) => setCancelReasonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              placeholder="Cancellation reason..."
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalTable(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={handleConfirmCancellation}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Send to Kitchen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Entry Pad */}
      {selectedTableForOrder && (
        <WaiterOrderPad
          table={selectedTableForOrder}
          existingOrder={
            isAddingToExisting && selectedTableForOrder.currentOrderId
              ? orders.find((o) => o.id === selectedTableForOrder.currentOrderId)
              : null
          }
          onClose={() => {
            setSelectedTableForOrder(null);
            setIsAddingToExisting(false);
          }}
          onOrderSubmitted={() => {
            setSelectedTableForOrder(null);
            setIsAddingToExisting(false);
            showSuccessBanner(`Order successfully transmitted to Kitchen Display!`);
          }}
        />
      )}

      {/* Table Transfer Modal */}
      {isTransferModalOpen && activeTableAction && (
        <TableTransferModal
          currentTable={activeTableAction}
          onClose={() => {
            setIsTransferModalOpen(false);
            setActiveTableAction(null);
          }}
          onSuccess={() => {
            setIsTransferModalOpen(false);
            setActiveTableAction(null);
            showSuccessBanner(`Table transfer completed successfully.`);
          }}
        />
      )}
    </div>
  );
};

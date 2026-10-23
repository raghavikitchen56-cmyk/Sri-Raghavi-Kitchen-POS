import React, { useState } from 'react';
import { Printer, X, Receipt, ChefHat, Check } from 'lucide-react';
import { usePos } from '../context/PosContext.tsx';
import { Order, KitchenOrderTicket } from '../types/pos.ts';

interface QuickPrintModalProps {
  onOpenReceipt: (order: Order) => void;
  onOpenKot: (kot: KitchenOrderTicket) => void;
  onClose: () => void;
}

export const QuickPrintModal: React.FC<QuickPrintModalProps> = ({
  onOpenReceipt,
  onOpenKot,
  onClose
}) => {
  const { db } = usePos();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const orders = db?.orders || [];
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/80 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Print KOT / Print Bill</h3>
              <p className="text-xs text-slate-400">Select an order or table to launch print dialog</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Select Dining Table / Active Order:
          </label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">-- Choose Order to Print --</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                Table {o.tableNumber} • Order #{o.orderNumber} (₹{o.grandTotal} • {o.items.length} items • Waiter: {o.waiterName} • {o.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Order Details Preview */}
        {selectedOrder ? (
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-amber-400 pb-1 border-b border-slate-850">
              <span>Table {selectedOrder.tableNumber} (Order #{selectedOrder.orderNumber})</span>
              <span>₹{selectedOrder.grandTotal}</span>
            </div>
            <div className="text-slate-300 max-h-24 overflow-y-auto space-y-1 pr-1">
              {selectedOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-mono text-slate-400">₹{it.totalPrice}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const latestKot = selectedOrder.kots && selectedOrder.kots.length > 0
                    ? selectedOrder.kots[selectedOrder.kots.length - 1]
                    : {
                        id: `kot-${selectedOrder.id}`,
                        kotNumber: selectedOrder.orderNumber + 100,
                        orderId: selectedOrder.id,
                        orderNumber: selectedOrder.orderNumber,
                        tableId: selectedOrder.tableId,
                        tableNumber: selectedOrder.tableNumber,
                        waiterId: selectedOrder.waiterId,
                        waiterName: selectedOrder.waiterName,
                        items: selectedOrder.items,
                        isAddition: false,
                        createdAt: selectedOrder.createdAt
                      };
                  onClose();
                  onOpenKot(latestKot);
                }}
                className="py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30"
              >
                <ChefHat className="w-4 h-4" />
                <span>Print KOT Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReceipt(selectedOrder);
                }}
                className="py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <Receipt className="w-4 h-4" />
                <span>Print Itemized Bill</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
            Please select an order above to preview and trigger printing for 80mm thermal receipts or A4 sheets.
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

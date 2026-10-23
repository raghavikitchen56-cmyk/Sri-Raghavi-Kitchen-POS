import React, { useState } from 'react';
import { X, Printer, ChefHat, Clock, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { KitchenOrderTicket, PosDatabase } from '../types/pos.ts';

interface KotModalProps {
  kot: KitchenOrderTicket;
  restaurantName?: string;
  onClose: () => void;
}

export const KotModal: React.FC<KotModalProps> = ({ kot, restaurantName = 'Sri Raghavi Kitchen', onClose }) => {
  const [printFormat, setPrintFormat] = useState<'80mm' | 'a4'>('80mm');

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(kot.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date(kot.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      {/* Container - adapts width based on format in preview, but on print uses print styling */}
      <div
        className={`bg-white text-slate-900 rounded-2xl shadow-2xl relative my-8 font-mono transition-all duration-200 print:shadow-none print:w-full print:m-0 print:p-0 ${
          printFormat === '80mm' ? 'w-full max-w-sm p-6' : 'w-full max-w-2xl p-8'
        }`}
      >
        {/* Top Controls: Close button and Format Switcher (Hidden on Print) */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-sans">
            <button
              onClick={() => setPrintFormat('80mm')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                printFormat === '80mm'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              80mm Thermal KOT
            </button>
            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                printFormat === 'a4'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 Sheet Ticket
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable KOT Content */}
        <div className={printFormat === '80mm' ? 'max-w-[320px] mx-auto text-xs' : 'text-sm'}>
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-400">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
              {restaurantName}
            </h2>
            <div className="inline-block mt-1 px-3 py-0.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded">
              KITCHEN ORDER TICKET (KOT)
            </div>
            {kot.isAddition ? (
              <div className="mt-1.5 inline-block text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded uppercase">
                ⚡ ADDITIONAL ITEMS TO RUNNING ORDER
              </div>
            ) : (
              <div className="mt-1 text-[10px] font-bold text-slate-600 uppercase">
                FIRST ORDER TICKET
              </div>
            )}
          </div>

          {/* Ticket Meta Info */}
          <div className="py-2.5 border-b-2 border-dashed border-slate-400 space-y-1">
            <div className="flex justify-between items-center text-sm font-black">
              <span className="text-amber-900">KOT #{kot.kotNumber}</span>
              <span className="text-base px-2 py-0.5 bg-slate-900 text-white rounded font-black">
                TABLE {kot.tableNumber}
              </span>
            </div>

            <div className="flex justify-between text-[11px] text-slate-700">
              <span>Order Ref: #{kot.orderNumber}</span>
              <span>Waiter: <strong className="text-slate-900">{kot.waiterName}</strong></span>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Date: {formattedDate}</span>
              <span>Time: {formattedTime}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b-2 border-dashed border-slate-400">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 text-[11px]">
                  <th className="text-left pb-1 font-black">ITEM DESCRIPTION</th>
                  <th className="text-right pb-1 font-black">QTY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {kot.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-1.5 text-left pr-2 align-top">
                      <div className="font-black text-slate-900 text-xs sm:text-sm leading-tight">
                        {item.name}
                      </div>
                      {item.tamilName && (
                        <div className="text-[11px] text-slate-600 font-sans font-medium">
                          {item.tamilName}
                        </div>
                      )}

                      {/* Spice / Add-ons / Parcel Note */}
                      <div className="mt-0.5 space-y-0.5">
                        {item.spiceLevel && (
                          <span className="inline-block mr-1 text-[9px] bg-slate-200 text-slate-800 font-bold px-1 rounded uppercase">
                            Spice: {item.spiceLevel}
                          </span>
                        )}
                        {item.isParcel && (
                          <span className="inline-block mr-1 text-[9px] bg-amber-200 text-amber-900 font-black px-1 rounded uppercase">
                            [PARCEL PACKAGING]
                          </span>
                        )}
                        {item.selectedAddOns?.length > 0 && (
                          <div className="text-[10px] text-slate-700 font-sans">
                            Add-ons: {item.selectedAddOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] font-sans font-semibold text-rose-700 italic">
                            Special: {item.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 text-right font-black text-base text-slate-950 align-top">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Special Instructions Footer */}
          {kot.specialInstructions && (
            <div className="py-2 border-b-2 border-dashed border-slate-400 text-xs">
              <span className="font-bold text-slate-700">Kitchen Instructions: </span>
              <span className="font-semibold text-rose-900">{kot.specialInstructions}</span>
            </div>
          )}

          {/* Total Items Count */}
          <div className="py-2 text-center text-xs text-slate-700 font-bold flex justify-between">
            <span>Total Dishes: {kot.items.length}</span>
            <span>
              Total Units: {kot.items.reduce((acc, i) => acc + i.quantity, 0)} Pcs
            </span>
          </div>

          <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-200">
            *** Send to Kitchen Display / Chef Counter ***
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3 font-sans print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print KOT ({printFormat === '80mm' ? '80mm' : 'A4'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

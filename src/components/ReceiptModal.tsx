import React, { useState } from 'react';
import { X, Printer, Package, CheckCircle, Store, Calendar, Clock, User, Phone, MapPin, ReceiptText } from 'lucide-react';
import { Order, PosDatabase } from '../types/pos.ts';

interface ReceiptModalProps {
  order: Order;
  db: PosDatabase;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, db, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'80mm' | 'a4'>('80mm');

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div
        className={`bg-white text-slate-900 rounded-2xl shadow-2xl relative my-8 font-mono transition-all duration-200 print:shadow-none print:w-full print:m-0 print:p-0 ${
          printFormat === '80mm' ? 'w-full max-w-sm p-6' : 'w-full max-w-3xl p-8'
        }`}
      >
        {/* Top Controls: Close button and Format Switcher (Hidden on Print) */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 print:hidden font-sans">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setPrintFormat('80mm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                printFormat === '80mm'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              80mm Thermal Receipt
            </button>
            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                printFormat === 'a4'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 Full Invoice
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Thermal Receipt Layout */}
        {printFormat === '80mm' ? (
          <div className="max-w-[320px] mx-auto text-xs space-y-3">
            {/* Header */}
            <div className="text-center pb-2.5 border-b-2 border-dashed border-slate-300">
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                {db.restaurant.name}
              </h2>
              <p className="text-[11px] font-semibold text-slate-600">{db.restaurant.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{db.restaurant.address}</p>
              <p className="text-[10px] text-slate-500">Ph: {db.restaurant.phone}</p>
              <p className="text-[10px] font-mono text-slate-700 font-bold mt-0.5">
                GSTIN: {db.restaurant.gstNumber}
              </p>
              <div className="mt-1 inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase text-slate-800">
                TAX INVOICE / CASH BILL
              </div>
            </div>

            {/* Order Details */}
            <div className="py-1.5 border-b-2 border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between font-black text-sm">
                <span>BILL #{order.orderNumber}</span>
                <span className="text-amber-900">TABLE {order.tableNumber}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Date: {formattedDate}</span>
                <span>Time: {formattedTime}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Served by: <span className="font-bold text-slate-800">{order.waiterName}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-2 border-b-2 border-dashed border-slate-300">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                    <th className="text-left pb-1 font-bold">ITEM</th>
                    <th className="text-center pb-1 font-bold">QTY</th>
                    <th className="text-right pb-1 font-bold">RATE</th>
                    <th className="text-right pb-1 font-bold">AMT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1 text-left pr-1">
                        <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                        {item.tamilName && (
                          <div className="text-[10px] text-slate-500 font-sans">{item.tamilName}</div>
                        )}
                        {item.isParcel && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded uppercase font-bold">
                            Parcel (+₹{item.parcelCharge})
                          </span>
                        )}
                        {item.selectedAddOns?.length > 0 && (
                          <div className="text-[9px] text-slate-500">
                            {item.selectedAddOns.map((a) => `+${a.name}`).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-1 text-center font-bold text-slate-800 align-top">{item.quantity}</td>
                      <td className="py-1 text-right text-slate-600 align-top">₹{item.unitPrice}</td>
                      <td className="py-1 text-right font-black text-slate-900 align-top">₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Calculations */}
            <div className="py-2 border-b-2 border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>

              {order.parcelTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-amber-600" /> Parcel Packaging:
                  </span>
                  <span>₹{order.parcelTotal}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>CGST (2.5%):</span>
                <span>₹{(order.taxAmount / 2).toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (2.5%):</span>
                <span>₹{(order.taxAmount / 2).toFixed(1)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount ({order.discountReason || 'Courtesy'}):</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-400">
                <span>GRAND TOTAL:</span>
                <span>₹{order.grandTotal}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 text-center text-slate-500 text-[10px] space-y-1">
              <div className="font-bold text-slate-700 text-xs">
                Status: {order.paymentStatus === 'paid' ? `PAID VIA ${(order.paymentMethod || 'cash').toUpperCase()}` : 'PAYMENT DUE / BILL REQUESTED'}
              </div>
              <p className="font-semibold text-slate-700">Thank You! Visit Again</p>
              <p className="font-bold text-slate-900 font-sans">நன்றி! மீண்டும் வருக!</p>
            </div>
          </div>
        ) : (
          /* A4 Sheet Format Layout */
          <div className="text-sm space-y-6">
            {/* A4 Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {db.restaurant.name}
                </h1>
                <p className="text-xs font-semibold text-slate-600">{db.restaurant.tagline}</p>
                <div className="text-xs text-slate-500 mt-2 space-y-0.5 font-sans">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{db.restaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Phone: {db.restaurant.phone}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-700">
                    GSTIN: {db.restaurant.gstNumber}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded">
                  TAX INVOICE
                </div>
                <div className="mt-3 text-xs space-y-1 font-mono">
                  <div>
                    <span className="text-slate-500">Invoice No: </span>
                    <strong className="text-slate-900">INV-{order.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Table: </span>
                    <strong className="text-amber-800 text-sm">TABLE {order.tableNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Date: </span>
                    <strong>{formattedDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Time: </span>
                    <strong>{formattedTime}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Staff: </span>
                    <strong>{order.waiterName}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* A4 Items Table */}
            <div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-y border-slate-300">
                    <th className="py-2.5 px-3 text-left font-black">#</th>
                    <th className="py-2.5 px-3 text-left font-black">Item Description</th>
                    <th className="py-2.5 px-3 text-center font-black">Qty</th>
                    <th className="py-2.5 px-3 text-right font-black">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right font-black">Packaging (₹)</th>
                    <th className="py-2.5 px-3 text-right font-black">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.tamilName && (
                          <div className="text-[11px] text-slate-500 font-sans">{item.tamilName}</div>
                        )}
                        {item.selectedAddOns?.length > 0 && (
                          <div className="text-[10px] text-slate-500">
                            Add-ons: {item.selectedAddOns.map((a) => a.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₹{item.unitPrice}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {item.isParcel ? `₹${item.parcelCharge * item.quantity}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-950">₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* A4 Summary */}
            <div className="flex justify-between items-start pt-4 border-t-2 border-slate-300">
              <div className="text-xs text-slate-600 max-w-sm space-y-1">
                <p className="font-bold text-slate-800">Terms & Notes:</p>
                <p>1. Goods once sold will not be taken back or refunded.</p>
                <p>2. Applicable GST rate: 5% (CGST 2.5% + SGST 2.5%).</p>
                <p>3. This is a computer-generated tax invoice.</p>
                <p className="pt-2 font-bold text-slate-800 font-sans">
                  நன்றி! மீண்டும் வருக! • Thank You! Visit Again
                </p>
              </div>

              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{order.subtotal}</span>
                </div>
                {order.parcelTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Parcel / Packaging Total:</span>
                    <span className="font-bold text-slate-900">₹{order.parcelTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>CGST (2.5%):</span>
                  <span>₹{(order.taxAmount / 2).toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (2.5%):</span>
                  <span>₹{(order.taxAmount / 2).toFixed(1)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({order.discountReason || 'Discount'}):</span>
                    <span>-₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-800">
                  <span>NET TOTAL:</span>
                  <span>₹{order.grandTotal}</span>
                </div>
                <div className="text-right text-[11px] text-slate-500 pt-1 font-bold">
                  Status: {order.paymentStatus === 'paid' ? `PAID (${(order.paymentMethod || 'cash').toUpperCase()})` : 'UNPAID'}
                </div>
              </div>
            </div>
          </div>
        )}

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
            <span>Print Bill ({printFormat === '80mm' ? '80mm Thermal' : 'A4 Sheet'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

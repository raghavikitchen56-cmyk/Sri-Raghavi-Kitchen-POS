import React, { useState } from 'react';
import {
  Printer,
  Search,
  Clock,
  User,
  ChefHat,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { KitchenOrderTicket } from '../../types/pos.ts';

interface KotListViewProps {
  onOpenKot: (kot: KitchenOrderTicket) => void;
}

export const KotListView: React.FC<KotListViewProps> = ({ onOpenKot }) => {
  const { db } = usePos();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'first' | 'addition'>('all');

  // Collect all KOTs from all orders
  const allKots: KitchenOrderTicket[] = [];
  (db?.orders || []).forEach((order) => {
    if (order.kots && order.kots.length > 0) {
      allKots.push(...order.kots);
    } else {
      // Fallback virtual KOT if an order has no KOT array
      allKots.push({
        id: `kot-fallback-${order.id}`,
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
      });
    }
  });

  // Sort descending by creation date or kotNumber
  allKots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter
  const filteredKots = allKots.filter((kot) => {
    if (filterType === 'first' && kot.isAddition) return false;
    if (filterType === 'addition' && !kot.isAddition) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const tableMatch = `table ${kot.tableNumber}`.includes(q) || `${kot.tableNumber}` === q;
    const waiterMatch = kot.waiterName.toLowerCase().includes(q);
    const kotNumMatch = `kot #${kot.kotNumber}`.includes(q) || `${kot.kotNumber}`.includes(q);
    const itemMatch = kot.items.some((i) => i.name.toLowerCase().includes(q) || (i.tamilName && i.tamilName.includes(q)));

    return tableMatch || waiterMatch || kotNumMatch || itemMatch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-500" />
            <span>Kitchen Order Tickets (KOT Repository)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View, search, reprint, and verify tickets dispatched from waiter terminals to the kitchen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 px-3 py-1.5 rounded-xl">
            Total Tickets: <strong className="text-amber-400">{allKots.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by KOT #, Table #, Waiter, or Dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterType === 'all'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All KOTs
          </button>
          <button
            onClick={() => setFilterType('first')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterType === 'first'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Initial Orders
          </button>
          <button
            onClick={() => setFilterType('addition')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterType === 'addition'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Additions (+Add)
          </button>
        </div>
      </div>

      {/* KOT Cards Grid */}
      {filteredKots.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No KOT Tickets Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try clearing your search terms.' : 'New orders placed by waiters will generate printable tickets here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKots.map((kot) => {
            const timeStr = new Date(kot.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            });
            const dateStr = new Date(kot.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short'
            });

            return (
              <div
                key={kot.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-amber-400">
                        KOT #{kot.kotNumber}
                      </span>
                      {kot.isAddition ? (
                        <span className="text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded uppercase">
                          +Addition
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                          Initial
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-semibold mt-0.5">
                      Table {kot.tableNumber} • Order #{kot.orderNumber}
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <div>{timeStr}</div>
                    <div className="text-[10px] text-slate-500">{dateStr}</div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 flex-1 max-h-40 overflow-y-auto pr-1">
                  {kot.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-200">
                        <strong className="text-amber-400 font-bold mr-1.5">{item.quantity}x</strong>
                        {item.name}
                        {item.isParcel && (
                          <span className="ml-1 text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1 rounded uppercase font-bold">
                            Parcel
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  {kot.specialInstructions && (
                    <div className="text-[11px] text-amber-300/90 italic pt-1 border-t border-slate-800">
                      Note: {kot.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Footer and Print Button */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{kot.waiterName}</span>
                  </div>

                  <button
                    onClick={() => onOpenKot(kot)}
                    className="py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print KOT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

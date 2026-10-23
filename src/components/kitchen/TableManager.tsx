import React, { useState } from 'react';
import {
  LayoutGrid,
  Plus,
  Users,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  Receipt,
  Edit2,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { Table, TableSection, TableStatus, Order } from '../../types/pos.ts';

interface TableManagerProps {
  onOpenReceipt: (order: Order) => void;
  onOpenBillingForOrder: (order: Order) => void;
}

export const TableManager: React.FC<TableManagerProps> = ({ onOpenReceipt, onOpenBillingForOrder }) => {
  const { db, saveTable, transferTable } = usePos();
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [editingTable, setEditingTable] = useState<Partial<Table> | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState<string>('');
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [transferError, setTransferError] = useState<string | null>(null);

  const tables = db?.tables || [];
  const orders = db?.orders || [];

  const sections: (TableSection | 'All')[] = [
    'All',
    'AC Dining',
    'Main Dining',
    'Family Section',
    'Outdoor Garden'
  ];

  const filteredTables = tables.filter((t) => {
    if (selectedSection === 'All') return true;
    return t.section === selectedSection;
  });

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">Available</span>;
      case 'preparing':
        return <span className="bg-amber-950/80 text-amber-300 border border-amber-800 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">Preparing</span>;
      case 'ready':
        return <span className="bg-purple-950/80 text-purple-300 border border-purple-800 text-xs px-2 py-0.5 rounded-full font-bold">Ready</span>;
      case 'running':
        return <span className="bg-blue-950/80 text-blue-300 border border-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">Running</span>;
      case 'bill_requested':
        return <span className="bg-rose-950/80 text-rose-300 border border-rose-800 text-xs px-2 py-0.5 rounded-full font-bold animate-bounce">Bill Requested</span>;
      default:
        return null;
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    await saveTable(editingTable);
    setEditingTable(null);
  };

  const handleExecuteTransfer = async () => {
    setTransferError(null);
    if (!transferSourceId || !transferTargetId) {
      setTransferError('Please select both source and destination tables.');
      return;
    }
    if (transferSourceId === transferTargetId) {
      setTransferError('Source and destination tables cannot be the same.');
      return;
    }
    const res = await transferTable(transferSourceId, transferTargetId);
    if (res.success) {
      setIsTransferModalOpen(false);
      setTransferSourceId('');
      setTransferTargetId('');
    } else {
      setTransferError(res.error || 'Transfer failed.');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-amber-500" />
            <span>Table Management ({tables.length} Tables)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor dining floor status, shift orders between tables, and configure floor zones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTransferError(null);
              setIsTransferModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Order</span>
          </button>

          <button
            onClick={() => {
              setEditingTable({
                tableNumber: tables.length + 1,
                name: `Table ${tables.length + 1}`,
                capacity: 4,
                section: 'Main Dining',
                status: 'available',
                active: true
              });
            }}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Floor Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedSection === sec
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTables.map((table) => {
          const currentOrder = table.currentOrderId ? orders.find((o) => o.id === table.currentOrderId) : null;

          return (
            <div
              key={table.id}
              className={`rounded-2xl p-4 border-2 transition duration-200 flex flex-col justify-between ${
                table.status === 'available'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-700/60'
                  : table.status === 'preparing'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/30'
                  : table.status === 'ready'
                  ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/30'
                  : table.status === 'bill_requested'
                  ? 'bg-rose-950/50 border-rose-500 shadow-xl shadow-rose-950/40 ring-2 ring-rose-500/30'
                  : 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/30'
              } ${!table.active ? 'opacity-50 grayscale' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-white">{table.tableNumber}</span>
                  {getStatusBadge(table.status)}
                </div>

                <div className="text-xs font-semibold text-slate-300">{table.name}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} Seats • {table.section}</span>
                </div>

                {/* Active Order Details */}
                {currentOrder && (
                  <div className="mt-3 p-2 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-bold">#{currentOrder.orderNumber}</span>
                      <span className="text-white font-mono font-bold">₹{currentOrder.grandTotal}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Waiter: <strong className="text-slate-200">{currentOrder.waiterName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {currentOrder.items.length} items ordered
                    </div>
                  </div>
                )}
              </div>

              {/* Table Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                {currentOrder ? (
                  <div className="flex items-center gap-1 w-full">
                    <button
                      onClick={() => onOpenReceipt(currentOrder)}
                      title="View KOT / Bill"
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Order</span>
                    </button>
                    <button
                      onClick={() => onOpenBillingForOrder(currentOrder)}
                      title="Settle Bill"
                      className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Bill</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingTable(table)}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Config</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Table */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingTable.id ? `Edit Table ${editingTable.tableNumber}` : 'Add New Restaurant Table'}
            </h3>

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Number</label>
                <input
                  type="number"
                  required
                  value={editingTable.tableNumber || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, tableNumber: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editingTable.name || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                  placeholder="e.g. Table 1 or Corner Booth"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={editingTable.capacity || 4}
                    onChange={(e) => setEditingTable({ ...editingTable, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dining Section</label>
                  <select
                    value={editingTable.section || 'Main Dining'}
                    onChange={(e) => setEditingTable({ ...editingTable, section: e.target.value as TableSection })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="AC Dining">AC Dining</option>
                    <option value="Main Dining">Main Dining</option>
                    <option value="Family Section">Family Section</option>
                    <option value="Outdoor Garden">Outdoor Garden</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeTableCheck"
                  checked={editingTable.active !== false}
                  onChange={(e) => setEditingTable({ ...editingTable, active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="activeTableCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Active (Table available for customer seating)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/30"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Table Transfer */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-cyan-400 mb-3">
              <ArrowRightLeft className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Transfer Running Table Order</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select the active table and the destination table to immediately move the order and bill.
            </p>

            {transferError && (
              <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Source Table (Currently Occupied)
                </label>
                <select
                  value={transferSourceId}
                  onChange={(e) => setTransferSourceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="">Select occupied table...</option>
                  {tables
                    .filter((t) => t.status !== 'available' && t.currentOrderId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} ({t.name}) - Status: {t.status}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Table (Destination)
                </label>
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                >
                  <option value="">Select available destination table...</option>
                  {tables
                    .filter((t) => t.status === 'available' && t.active)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} ({t.section} • {t.capacity} seats)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-6 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Execute Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

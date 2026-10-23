import React, { useState } from 'react';
import { ArrowRightLeft, X, AlertCircle } from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { Table } from '../../types/pos.ts';

interface TableTransferModalProps {
  currentTable: Table;
  onClose: () => void;
  onSuccess: () => void;
}

export const TableTransferModal: React.FC<TableTransferModalProps> = ({
  currentTable,
  onClose,
  onSuccess
}) => {
  const { db, currentUser, createRequest, transferTable } = usePos();
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [transferMode, setTransferMode] = useState<'direct' | 'request'>('direct');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const availableTables = db?.tables.filter((t) => t.status === 'available' && t.active) || [];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetTableId) {
      setError('Please select a destination table.');
      return;
    }

    setIsSubmitting(true);

    if (transferMode === 'direct') {
      const res = await transferTable(currentTable.id, targetTableId);
      setIsSubmitting(false);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Transfer failed.');
      }
    } else {
      const res = await createRequest({
        type: 'transfer_request',
        tableId: currentTable.id,
        waiterId: currentUser?.id || 'w-1',
        details: reason || 'Customer requested table change',
        targetTableId
      });
      setIsSubmitting(false);
      if (res.success) {
        onSuccess();
      } else {
        setError('Failed to send transfer request to kitchen.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <ArrowRightLeft className="w-5 h-5" />
            <h3 className="text-base font-black text-white">Transfer Table {currentTable.tableNumber}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Destination Table
            </label>
            {availableTables.length === 0 ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-400">
                No tables are currently available. All tables are occupied.
              </div>
            ) : (
              <select
                required
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
              >
                <option value="">Choose available table...</option>
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.tableNumber} ({t.section} • {t.capacity} Seats)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Transfer Action</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTransferMode('direct')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  transferMode === 'direct'
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Direct Move
              </button>
              <button
                type="button"
                onClick={() => setTransferMode('request')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  transferMode === 'request'
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Notify Kitchen First
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Transfer (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Customer requested AC dining"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableTables.length === 0}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isSubmitting ? 'Transferring...' : 'Complete Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

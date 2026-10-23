import React, { useState } from 'react';
import { ArrowRightLeft, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePos } from '../context/PosContext.tsx';

interface TableTransferQuickModalProps {
  onClose: () => void;
}

export const TableTransferQuickModal: React.FC<TableTransferQuickModalProps> = ({ onClose }) => {
  const { db, transferTable } = usePos();
  const [sourceTableId, setSourceTableId] = useState<string>('');
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const tables = db?.tables || [];
  const runningTables = tables.filter((t) => t.status !== 'available' && t.currentOrderId);
  const availableTables = tables.filter((t) => t.status === 'available');

  const handleTransfer = async () => {
    if (!sourceTableId || !targetTableId) {
      setErrorMsg('Please select both a source running table and a target available table.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await transferTable(sourceTableId, targetTableId);
      if (res.success) {
        const src = tables.find((t) => t.id === sourceTableId)?.tableNumber;
        const tgt = tables.find((t) => t.id === targetTableId)?.tableNumber;
        setSuccessMsg(`Order successfully transferred from Table ${src} to Table ${tgt}!`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.error || 'Failed to transfer table');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Transfer Table Order</h3>
              <p className="text-xs text-slate-400">Move running food order and KOT to a different table</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="bg-emerald-950 border border-emerald-800 text-emerald-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="bg-rose-950 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Source Table */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Source Table (Currently Running / Preparing):
          </label>
          <select
            value={sourceTableId}
            onChange={(e) => setSourceTableId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">-- Choose Running Table --</option>
            {runningTables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.tableNumber} ({t.name} • {t.section} • Status: {t.status})
              </option>
            ))}
          </select>
          {runningTables.length === 0 && (
            <p className="text-[11px] text-amber-400">No active dining tables running right now.</p>
          )}
        </div>

        {/* Target Table */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Destination Table (Available Vacant Table):
          </label>
          <select
            value={targetTableId}
            onChange={(e) => setTargetTableId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">-- Choose Vacant Table --</option>
            {availableTables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.tableNumber} ({t.name} • {t.section} • {t.capacity} Seats)
              </option>
            ))}
          </select>
          {availableTables.length === 0 && (
            <p className="text-[11px] text-rose-400">All tables are currently occupied.</p>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!sourceTableId || !targetTableId || isSubmitting}
            onClick={handleTransfer}
            className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isSubmitting ? 'Transferring...' : 'Execute Transfer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

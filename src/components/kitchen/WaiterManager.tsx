import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  Phone,
  CheckCircle2,
  XCircle,
  Edit2,
  Award,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';
import { WaiterAccount } from '../../types/pos.ts';

export const WaiterManager: React.FC = () => {
  const { db, saveWaiter } = usePos();
  const [editingWaiter, setEditingWaiter] = useState<Partial<WaiterAccount> | null>(null);

  const waiters = db?.waiters || [];
  const activeCount = waiters.filter((w) => w.active).length;

  const handleSaveWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWaiter) return;
    await saveWaiter(editingWaiter);
    setEditingWaiter(null);
  };

  const handleToggleActive = async (waiter: WaiterAccount) => {
    await saveWaiter({
      id: waiter.id,
      active: !waiter.active
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Waiter Accounts Management ({waiters.length} Staff Members)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage individual login credentials, 4-digit PINs, and service performance for 10–15 dining staff
          </p>
        </div>

        <button
          onClick={() => {
            const nextNum = waiters.length + 1;
            setEditingWaiter({
              name: '',
              pin: `10${nextNum < 10 ? '0' + nextNum : nextNum}`,
              phone: '',
              active: true
            });
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-600/30 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Waiter Account</span>
        </button>
      </div>

      {/* Staff Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Staff Registered</div>
            <div className="text-xl font-black text-white">{waiters.length} Waiters</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Active & On Shift</div>
            <div className="text-xl font-black text-emerald-400">{activeCount} Staff</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Orders Served</div>
            <div className="text-xl font-black text-purple-400 font-mono">
              {waiters.reduce((acc, w) => acc + (w.totalOrdersServed || 0), 0)} Orders
            </div>
          </div>
        </div>
      </div>

      {/* Waiters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {waiters.map((waiter) => (
          <div
            key={waiter.id}
            className={`bg-slate-900 border rounded-2xl p-4 transition flex flex-col justify-between shadow-xl ${
              waiter.active ? 'border-slate-800' : 'border-slate-800/60 opacity-60 bg-slate-950/40'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-white text-base">
                    {waiter.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">{waiter.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">ID: {waiter.id}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    waiter.active
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {waiter.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* PIN & Phone info */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Waiter PIN:
                  </span>
                  <span className="font-mono font-bold text-amber-300 tracking-wider bg-amber-950/60 border border-amber-900 px-2 py-0.5 rounded">
                    {waiter.pin}
                  </span>
                </div>

                {waiter.phone && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:
                    </span>
                    <span className="text-slate-300 font-mono">{waiter.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-purple-400" /> Served:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {waiter.totalOrdersServed || 0} orders
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleToggleActive(waiter)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                  waiter.active
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                }`}
              >
                {waiter.active ? 'Deactivate' : 'Activate'}
              </button>

              <button
                onClick={() => setEditingWaiter(waiter)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add or Edit Waiter Account */}
      {editingWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">
              {editingWaiter.id ? `Edit Waiter Account (${editingWaiter.name})` : 'Create Waiter Staff Account'}
            </h3>

            <form onSubmit={handleSaveWaiter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={editingWaiter.name || ''}
                  onChange={(e) => setEditingWaiter({ ...editingWaiter, name: e.target.value })}
                  placeholder="e.g. Raju, Priya, Karthik..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Individual 4-Digit Login PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={editingWaiter.pin || ''}
                  onChange={(e) => setEditingWaiter({ ...editingWaiter, pin: e.target.value })}
                  placeholder="e.g. 1001"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Used by the waiter to log into their tablet or mobile ordering station.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  value={editingWaiter.phone || ''}
                  onChange={(e) => setEditingWaiter({ ...editingWaiter, phone: e.target.value })}
                  placeholder="+91 98401 23456"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeWaiterCheck"
                  checked={editingWaiter.active !== false}
                  onChange={(e) => setEditingWaiter({ ...editingWaiter, active: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500"
                />
                <label htmlFor="activeWaiterCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Active (Staff can log in and take table orders)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingWaiter(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/30"
                >
                  Save Waiter Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

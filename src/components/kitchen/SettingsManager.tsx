import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Bell,
  HardDrive,
  Download,
  Upload,
  RefreshCcw,
  Check,
  AlertTriangle,
  KeyRound,
  Store,
  FileJson,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { usePos } from '../../context/PosContext.tsx';

export const SettingsManager: React.FC = () => {
  const { db, saveSettings, testSound, unlockAudio, restoreBackup, resetDatabase } = usePos();

  const [soundSettings, setSoundSettings] = useState(
    db?.soundSettings || {
      enabled: true,
      volume: 0.85,
      newOrderSound: true,
      readyOrderSound: true,
      requestAlertSound: true,
      soundType: 'loud_bell' as const
    }
  );

  const [restaurant, setRestaurant] = useState(
    db?.restaurant || {
      name: 'Sri Raghavi Kitchen',
      tagline: 'Authentic South Indian & Tiffin Kitchen',
      address: 'No. 42, Annai Gandhi Street, Junction Main Road, Salem - 636004',
      phone: '+91 94432 10987',
      gstNumber: '33AABCS1429B1Z8',
      gstPercentage: 5,
      defaultParcelCharge: 10,
      kitchenPin: '9999'
    }
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({ restaurant, soundSettings });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    if (!db) return;
    const jsonStr = JSON.stringify(db, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sri_raghavi_pos_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = await restoreBackup(parsed);
        if (res.success) {
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus(res.error || 'Failed to restore');
        }
      } catch (err) {
        setImportStatus('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = async () => {
    await resetDatabase();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            <span>Sound System & Restaurant Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage audible kitchen alarms, billing information, master kitchen PIN, and database backups
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Sound System Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Audio & Alert Sounds System</h3>
                <p className="text-xs text-slate-400">Configure audible chimes for orders and waiter requests</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={soundSettings.enabled}
                onChange={(e) => setSoundSettings({ ...soundSettings, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-white">Sound Enabled</span>
            </label>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Master Alarm Volume</span>
              <span className="font-mono text-amber-400">{Math.round(soundSettings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundSettings.volume}
              onChange={(e) => setSoundSettings({ ...soundSettings, volume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />
          </div>

          {/* Event Sound Toggles & Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">New Order Chime</label>
                <input
                  type="checkbox"
                  checked={soundSettings.newOrderSound}
                  onChange={(e) => setSoundSettings({ ...soundSettings, newOrderSound: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Plays loud resonant double-bell when waiter sends order to kitchen.
              </p>
              <button
                type="button"
                onClick={() => {
                  unlockAudio().then(() => testSound('order'));
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" /> Test Bell
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Order Ready Chime</label>
                <input
                  type="checkbox"
                  checked={soundSettings.readyOrderSound}
                  onChange={(e) => setSoundSettings({ ...soundSettings, readyOrderSound: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Plays ascending melodic tone when kitchen marks food ready to serve.
              </p>
              <button
                type="button"
                onClick={() => {
                  unlockAudio().then(() => testSound('ready'));
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" /> Test Chime
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Urgent Request Alarm</label>
                <input
                  type="checkbox"
                  checked={soundSettings.requestAlertSound}
                  onChange={(e) => setSoundSettings({ ...soundSettings, requestAlertSound: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-500 bg-slate-900 border-slate-700"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Triple urgent buzzer for Bill, Cancellation, or Assistance calls.
              </p>
              <button
                type="button"
                onClick={() => {
                  unlockAudio().then(() => testSound('urgent'));
                }}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" /> Test Alarm
              </button>
            </div>
          </div>
        </div>

        {/* Restaurant Profile & Master Kitchen PIN */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Restaurant Details & Master Kitchen Access</h3>
              <p className="text-xs text-slate-400">Printed on customer receipts and used for kitchen login</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Restaurant Name</label>
              <input
                type="text"
                required
                value={restaurant.name}
                onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={restaurant.tagline}
                onChange={(e) => setRestaurant({ ...restaurant, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Restaurant Address</label>
              <input
                type="text"
                required
                value={restaurant.address}
                onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={restaurant.phone}
                onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN Number</label>
              <input
                type="text"
                required
                value={restaurant.gstNumber}
                onChange={(e) => setRestaurant({ ...restaurant, gstNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">GST Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="28"
                required
                value={restaurant.gstPercentage}
                onChange={(e) => setRestaurant({ ...restaurant, gstPercentage: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Parcel Packing Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                value={restaurant.defaultParcelCharge}
                onChange={(e) => setRestaurant({ ...restaurant, defaultParcelCharge: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Kitchen Master Passcode PIN
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={restaurant.kitchenPin}
                onChange={(e) => setRestaurant({ ...restaurant, kitchenPin: e.target.value })}
                className="w-full bg-slate-950 border border-amber-600/50 rounded-xl px-3 py-2 text-amber-300 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </form>

      {/* Database Persistence & Backups */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Database Persistence & Backups</h3>
            <p className="text-xs text-slate-400">
              Data remains safe across browser refreshes and device restarts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5 mb-1">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export JSON Backup</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Download a complete, offline JSON copy of all tables, menu items, orders, and waiters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup File</span>
            </button>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5 mb-1">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Restore from File</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Upload a previous POS JSON backup to restore tables, menu, or orders.
              </p>
            </div>
            <label className="py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-800/60">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Backup JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            {importStatus && <div className="text-[11px] text-emerald-400 font-bold">{importStatus}</div>}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5 mb-1">
                <RefreshCcw className="w-4 h-4 text-rose-400" />
                <span>Factory Reset</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Reset system to clean initial state with 15 tables and default South Indian menu.
              </p>
            </div>
            {showResetConfirm ? (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-rose-300 font-bold">Confirm factory reset?</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExecuteReset}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            )}
            {resetSuccess && (
              <div className="text-[11px] text-emerald-400 font-bold">Reset completed!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


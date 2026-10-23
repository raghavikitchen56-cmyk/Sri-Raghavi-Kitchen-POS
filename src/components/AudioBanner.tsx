import React from 'react';
import { Volume2, VolumeX, Bell, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { usePos } from '../context/PosContext.tsx';

export const AudioBanner: React.FC = () => {
  const { audioUnlocked, unlockAudio, testSound, activeNotification, clearNotification } = usePos();

  return (
    <>
      {/* Audio authorization banner if audio not yet unlocked */}
      {!audioUnlocked && (
        <div className="bg-amber-600/95 text-white px-4 py-2.5 shadow-md flex items-center justify-between flex-wrap gap-2 text-sm z-50 border-b border-amber-500">
          <div className="flex items-center gap-2 font-medium">
            <VolumeX className="w-5 h-5 animate-pulse text-amber-200" />
            <span>Audio alerts are muted by browser. Enable to hear kitchen bells & urgent waiter chimes.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={unlockAudio}
              className="bg-white text-amber-900 hover:bg-amber-100 px-3 py-1 rounded-md font-semibold text-xs transition shadow-sm"
            >
              Enable Sound Now
            </button>
            <button
              onClick={() => {
                unlockAudio().then(() => testSound('order'));
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" /> Test Bell
            </button>
          </div>
        </div>
      )}

      {/* Floating Active Real-time Alert Toast */}
      {activeNotification && (
        <div className="fixed top-16 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div
            className={`rounded-xl p-4 shadow-2xl border backdrop-blur-md flex items-start gap-3 ${
              activeNotification.type === 'alert'
                ? 'bg-rose-950/90 border-rose-600 text-rose-100 shadow-rose-950/50'
                : activeNotification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-100 shadow-emerald-950/50'
                : 'bg-amber-950/90 border-amber-600 text-amber-100 shadow-amber-950/50'
            }`}
          >
            {activeNotification.type === 'alert' && <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />}
            {activeNotification.type === 'success' && <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />}
            {activeNotification.type === 'info' && <Bell className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-bounce" />}

            <div className="flex-1">
              <h4 className="font-bold text-sm tracking-wide">{activeNotification.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 font-medium">{activeNotification.message}</p>
            </div>

            <button
              onClick={clearNotification}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

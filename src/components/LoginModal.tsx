import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, UserCheck, KeyRound, UtensilsCrossed, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { usePos } from '../context/PosContext.tsx';

interface LoginModalProps {
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess }) => {
  const { db, loginAsKitchen, loginAsWaiter } = usePos();
  const [role, setRole] = useState<'kitchen' | 'waiter'>('kitchen');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Filter active waiters
  const activeWaiters = db?.waiters.filter((w) => w.active) || [];

  // Focus input on mount or role change
  useEffect(() => {
    inputRef.current?.focus();
  }, [role]);

  const handleKeypadPress = (val: string) => {
    setError(null);
    if (pin.length < 6) {
      setPin((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setPin('');
  };

  const handleAutofillDefaultKitchen = () => {
    setError(null);
    setPin('9999');
    inputRef.current?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (role === 'kitchen') {
      const cleanPin = pin.trim();
      if (!cleanPin) {
        setError('Please enter the Kitchen PIN.');
        inputRef.current?.focus();
        return;
      }
      setIsSubmitting(true);
      const res = await loginAsKitchen(cleanPin);
      setIsSubmitting(false);
      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || 'Incorrect Kitchen PIN. Default is 9999.');
        setPin('');
        inputRef.current?.focus();
      }
    } else {
      if (!selectedWaiterId) {
        setError('Please select your Waiter profile from the list.');
        return;
      }
      const cleanPin = pin.trim();
      if (!cleanPin) {
        setError('Please enter your 4-digit Waiter PIN.');
        inputRef.current?.focus();
        return;
      }
      setIsSubmitting(true);
      const res = await loginAsWaiter(selectedWaiterId, cleanPin);
      setIsSubmitting(false);
      if (res.success) {
        onSuccess?.();
      } else {
        setError(res.error || 'Incorrect Waiter PIN.');
        setPin('');
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 sm:p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg mb-2 sm:mb-3 border border-white/30">
              <UtensilsCrossed className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Sri Raghavi Kitchen</h1>
            <p className="text-amber-100 text-xs font-medium mt-0.5">Restaurant POS & Kitchen Display System</p>
          </div>
        </div>

        {/* Role Toggle (Strictly Kitchen vs Waiter - No Admin) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 m-3 sm:m-4 rounded-xl border border-slate-800 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setRole('kitchen');
              setPin('');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
              role === 'kitchen'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Display</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('waiter');
              setPin('');
              setError(null);
              if (activeWaiters.length > 0 && !selectedWaiterId) {
                setSelectedWaiterId(activeWaiters[0].id);
              }
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
              role === 'waiter'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Waiter Login</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 pt-1 flex-1 flex flex-col">
          {/* Error Message Alert (Displayed ONLY when error occurs) */}
          {error && (
            <div className="mb-4 p-3 bg-rose-950/90 border border-rose-700 rounded-xl text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {role === 'kitchen' ? (
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Kitchen Passcode PIN</label>
                <button
                  type="button"
                  onClick={handleAutofillDefaultKitchen}
                  className="text-[11px] text-amber-300 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-700/80 px-2 py-0.5 rounded-full font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Click to auto-fill default PIN 9999"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Default PIN: 9999</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-3 space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Waiter Staff Profile</label>
                <select
                  value={selectedWaiterId}
                  onChange={(e) => {
                    setSelectedWaiterId(e.target.value);
                    setPin('');
                    setError(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="" disabled>Select your name...</option>
                  {activeWaiters.map((waiter) => (
                    <option key={waiter.id} value={waiter.id}>
                      {waiter.name} (PIN: {waiter.pin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Enter 4-Digit Waiter PIN</label>
                {selectedWaiterId && (
                  <span className="text-[11px] text-amber-400 font-mono">
                    PIN hint: {activeWaiters.find((w) => w.id === selectedWaiterId)?.pin}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Desktop & Mobile Input Box: Accepts keyboard typing + shows on-screen keypad clicks */}
          <div className="relative mb-3">
            <div className="absolute left-3.5 top-3 text-slate-500">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>

            <input
              ref={inputRef}
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="off"
              value={pin}
              onChange={(e) => {
                setError(null);
                setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              placeholder={role === 'kitchen' ? 'Enter 9999 or type with keyboard' : 'Enter 4-digit PIN'}
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-11 pr-11 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />

            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-3 text-slate-400 hover:text-white p-0.5 rounded transition"
              title={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick On-Screen Touch Keypad (Ideal for tablets & mobile phones, compatible with desktop click) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(String(digit))}
                className="h-11 sm:h-12 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-lg rounded-xl border border-slate-700/60 active:scale-95 transition flex items-center justify-center select-none"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-11 sm:h-12 bg-slate-800/40 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800 active:scale-95 transition flex items-center justify-center uppercase select-none"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-11 sm:h-12 bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-lg rounded-xl border border-slate-700/60 active:scale-95 transition flex items-center justify-center select-none"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 sm:h-12 bg-slate-800/40 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800 active:scale-95 transition flex items-center justify-center uppercase select-none"
            >
              ⌫
            </button>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || !pin}
            className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {role === 'kitchen' ? 'Open Kitchen Dashboard' : 'Open Waiter Terminal'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

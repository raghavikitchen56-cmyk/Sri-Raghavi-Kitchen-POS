import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  ChefHat,
  UserCheck,
  Volume2,
  VolumeX,
  Bell,
  LogOut,
  RefreshCw,
  LayoutGrid,
  ClipboardList,
  BookOpen,
  Users,
  Receipt,
  BarChart3,
  Settings,
  Sparkles,
  Menu,
  Smartphone
} from 'lucide-react';
import { usePos } from '../context/PosContext.tsx';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenLogin: () => void;
  onToggleMobileDrawer?: () => void;
  onOpenPwaGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenLogin,
  onToggleMobileDrawer,
  onOpenPwaGuide
}) => {
  const { db, currentUser, logout, testSound, unlockAudio } = usePos();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrdersCount = db?.orders.filter((o) => o.status === 'new' || o.status === 'preparing').length || 0;
  const pendingRequestsCount = db?.requests.filter((r) => r.status === 'pending').length || 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none shadow-xl">
      {/* Upper Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4 border-b border-slate-800/80">
        {/* Brand identity & mobile hamburger */}
        <div className="flex items-center gap-3">
          {onToggleMobileDrawer && (
            <button
              onClick={onToggleMobileDrawer}
              className="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">Sri Raghavi Kitchen</h1>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                POS
              </span>
            </div>
            <p className="text-slate-400 text-xs hidden sm:block">Salem South Indian Kitchen & Tiffin</p>
          </div>
        </div>

        {/* Center: Live Time & Status */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-mono font-medium">{time}</span>
          </div>

          {activeOrdersCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-950/70 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded-lg font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{activeOrdersCount} Active Order{activeOrdersCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {pendingRequestsCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-950/70 text-rose-300 border border-rose-800/60 px-2.5 py-1 rounded-lg font-semibold animate-bounce">
              <Bell className="w-3.5 h-3.5" />
              <span>{pendingRequestsCount} Pending Request{pendingRequestsCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Right: Audio control, PWA guide & User info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA / Mobile Install button */}
          {onOpenPwaGuide && (
            <button
              onClick={onOpenPwaGuide}
              title="Add to Android Home Screen / Install PWA"
              className="p-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] font-semibold">Install App</span>
            </button>
          )}

          {/* Sound Quick Trigger */}
          <button
            onClick={() => {
              unlockAudio().then(() => testSound('ready'));
            }}
            title="Test Audio Chimes"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs flex items-center gap-1 transition border border-slate-700"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-medium">Test Sound</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
                {currentUser.role === 'kitchen' ? (
                  <ChefHat className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                )}
                <div className="text-left">
                  <div className="font-bold text-white capitalize leading-tight">
                    {currentUser.role === 'kitchen' ? 'Kitchen Station' : currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {currentUser.role === 'kitchen' ? 'Full Operations' : 'Waiter Terminal'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Switch User / Logout"
                className="p-2 bg-slate-800/80 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg transition border border-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Lower Bar: Navigation for Kitchen Display */}
      {currentUser?.role === 'kitchen' && (
        <div className="px-4 py-1.5 bg-slate-950/70 flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
          <button
            onClick={() => onTabChange('kds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              currentTab === 'kds'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Kitchen Orders (KDS)</span>
            {activeOrdersCount > 0 && (
              <span className="bg-amber-900/90 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              currentTab === 'tables'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Table Management (15)</span>
          </button>

          <button
            onClick={() => onTabChange('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              currentTab === 'menu'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Menu & Pricing</span>
          </button>

          <button
            onClick={() => onTabChange('waiters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              currentTab === 'waiters'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Waiter Accounts (12)</span>
          </button>

          <button
            onClick={() => onTabChange('billing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              currentTab === 'billing'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Billing & Settlement</span>
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              currentTab === 'reports'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              currentTab === 'settings'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Sound & System</span>
          </button>
        </div>
      )}
    </header>
  );
};

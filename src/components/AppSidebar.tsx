import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bell,
  ChefHat,
  CheckCircle2,
  FileText,
  LayoutGrid,
  ArrowRightLeft,
  BookOpen,
  Users,
  Receipt,
  History,
  Printer,
  Volume2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  UtensilsCrossed,
  Smartphone,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { usePos } from '../context/PosContext.tsx';

interface AppSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTableTransfer: () => void;
  onOpenQuickPrint: () => void;
  onOpenPwaGuide: () => void;
  onOpenLogin: () => void;
  isMobileDrawerOpen: boolean;
  onToggleMobileDrawer: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenTableTransfer,
  onOpenQuickPrint,
  onOpenPwaGuide,
  onOpenLogin,
  isMobileDrawerOpen,
  onToggleMobileDrawer
}) => {
  const { db, currentUser, logout, testSound, unlockAudio } = usePos();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Live Counts for Badges
  const orders = db?.orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled') || [];
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparing').length;
  const readyOrdersCount = orders.filter((o) => o.status === 'ready').length;
  const pendingRequests = db?.requests.filter((r) => r.status === 'pending') || [];
  const billRequestsCount = pendingRequests.filter((r) => r.type === 'bill_request').length +
    orders.filter((o) => o.billRequested).length;

  const isKitchen = currentUser?.role === 'kitchen';

  // Navigation Items for Kitchen Role
  const kitchenNavItems = [
    {
      id: 'kds',
      label: 'Kitchen Dashboard',
      icon: LayoutDashboard,
      badge: orders.length > 0 ? orders.length : null,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'kds_new',
      label: 'New Orders',
      icon: Bell,
      badge: newOrdersCount > 0 ? newOrdersCount : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    {
      id: 'kds_preparing',
      label: 'Preparing Orders',
      icon: ChefHat,
      badge: preparingOrdersCount > 0 ? preparingOrdersCount : null,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'kds_ready',
      label: 'Ready Orders',
      icon: CheckCircle2,
      badge: readyOrdersCount > 0 ? readyOrdersCount : null,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'kot_list',
      label: 'KOT (Kitchen Order Tickets)',
      icon: FileText
    },
    {
      id: 'tables',
      label: 'Tables (15 Tables)',
      icon: LayoutGrid
    },
    {
      id: 'action_transfer',
      label: 'Table Transfer',
      icon: ArrowRightLeft,
      isAction: true,
      action: onOpenTableTransfer
    },
    {
      id: 'menu',
      label: 'Menu & Item Editing',
      icon: BookOpen
    },
    {
      id: 'waiters',
      label: 'Waiter Management',
      icon: Users
    },
    {
      id: 'kds_bill_requests',
      label: 'Bill Requests',
      icon: Receipt,
      badge: billRequestsCount > 0 ? billRequestsCount : null,
      badgeColor: 'bg-purple-600 text-white animate-bounce'
    },
    {
      id: 'bill_history',
      label: 'Bill History',
      icon: History
    },
    {
      id: 'action_print',
      label: 'Print KOT / Print Bill',
      icon: Printer,
      isAction: true,
      action: onOpenQuickPrint
    },
    {
      id: 'sound_settings',
      label: 'Sound & Notification Settings',
      icon: Volume2
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3
    },
    {
      id: 'settings',
      label: 'Settings & Backups',
      icon: Settings
    }
  ];

  // Navigation Items for Waiter Role
  const waiterNavItems = [
    {
      id: 'waiter_dashboard',
      label: 'Dining Tables (15)',
      icon: LayoutGrid
    },
    {
      id: 'waiter_active',
      label: 'Active Running Orders',
      icon: ShoppingBag,
      badge: orders.length > 0 ? orders.length : null,
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 'action_transfer',
      label: 'Table Transfer',
      icon: ArrowRightLeft,
      isAction: true,
      action: onOpenTableTransfer
    },
    {
      id: 'waiter_ready',
      label: 'Ready Orders Alert',
      icon: Bell,
      badge: readyOrdersCount > 0 ? readyOrdersCount : null,
      badgeColor: 'bg-emerald-500 text-white animate-pulse'
    },
    {
      id: 'kot_list',
      label: 'My KOT Tickets',
      icon: FileText
    },
    {
      id: 'action_print',
      label: 'Print KOT / Bill',
      icon: Printer,
      isAction: true,
      action: onOpenQuickPrint
    },
    {
      id: 'action_pwa',
      label: 'Install App (Android PWA)',
      icon: Smartphone,
      isAction: true,
      action: onOpenPwaGuide
    }
  ];

  const currentNavItems = isKitchen ? kitchenNavItems : waiterNavItems;

  const handleItemClick = (item: any) => {
    if (item.isAction && item.action) {
      item.action();
    } else {
      onSelectTab(item.id);
    }
    if (isMobileDrawerOpen) {
      onToggleMobileDrawer();
    }
  };

  return (
    <>
      {/* DESKTOP FIXED COLLAPSIBLE LEFT SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 z-30 select-none shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand & Collapse Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20 shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="truncate">
                <h1 className="font-black text-white text-sm tracking-tight truncate leading-tight">
                  Sri Raghavi Kitchen
                </h1>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  {isKitchen ? 'Kitchen Station' : 'Waiter Terminal'}
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white mx-auto">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
            title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Options List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-xs transition duration-150 group relative text-left active:scale-[0.98] ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-black'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                />

                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User Profile & Sign Out Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          {currentUser ? (
            <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="font-bold text-white text-xs truncate">
                    {isKitchen ? 'Kitchen Station' : currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isKitchen ? 'PIN: 9999' : `Waiter ID: ${currentUser.id}`}
                  </div>
                </div>
              )}

              <button
                onClick={logout}
                title="Switch Staff / Sign Out"
                className="p-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg transition shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE DRAWER (Hamburger Menu Slide-Over) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onToggleMobileDrawer}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Sri Raghavi Kitchen</h3>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">
                    {isKitchen ? 'Kitchen Display' : `${currentUser?.name} (Waiter)`}
                  </span>
                </div>
              </div>

              <button
                onClick={onToggleMobileDrawer}
                className="p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Menu Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-bold text-xs transition text-left active:scale-[0.98] ${
                      isActive
                        ? 'bg-amber-600 text-white font-black shadow-md'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">{currentUser?.name || 'Staff'}</div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser?.role || 'Guest'}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  onToggleMobileDrawer();
                }}
                className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around select-none">
        {isKitchen ? (
          <>
            <button
              onClick={() => onSelectTab('kds')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'kds' || currentTab === 'kds_new' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => onSelectTab('tables')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'tables' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>Tables</span>
            </button>

            <button
              onClick={() => onSelectTab('kot_list')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'kot_list' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>KOT</span>
            </button>

            <button
              onClick={() => onSelectTab('billing')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'billing' || currentTab === 'bill_history' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <Receipt className="w-5 h-5" />
              <span>Billing</span>
            </button>

            <button
              onClick={onToggleMobileDrawer}
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                <span className="w-4 h-0.5 bg-current rounded-full"></span>
                <span className="w-4 h-0.5 bg-current rounded-full"></span>
                <span className="w-4 h-0.5 bg-current rounded-full"></span>
              </div>
              <span>More</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectTab('waiter_dashboard')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'waiter_dashboard' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span>Tables (15)</span>
            </button>

            <button
              onClick={onOpenTableTransfer}
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-slate-400"
            >
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              <span>Transfer</span>
            </button>

            <button
              onClick={() => onSelectTab('kot_list')}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'kot_list' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <FileText className="w-5 h-5 text-amber-400" />
              <span>My KOTs</span>
            </button>

            <button
              onClick={onOpenQuickPrint}
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-slate-400"
            >
              <Printer className="w-5 h-5 text-purple-400" />
              <span>Print Bill</span>
            </button>

            <button
              onClick={onToggleMobileDrawer}
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                <span className="w-4 h-0.5 bg-current rounded-full"></span>
                <span className="w-4 h-0.5 bg-current rounded-full"></span>
                <span className="w-4 h-0.5 bg-current rounded-full"></span>
              </div>
              <span>Menu</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
};

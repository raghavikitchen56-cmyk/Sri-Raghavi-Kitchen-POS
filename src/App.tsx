/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PosProvider, usePos } from './context/PosContext.tsx';
import { AudioBanner } from './components/AudioBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AppSidebar } from './components/AppSidebar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { KotModal } from './components/KotModal.tsx';
import { TableTransferQuickModal } from './components/TableTransferQuickModal.tsx';
import { QuickPrintModal } from './components/QuickPrintModal.tsx';
import { PwaInstallModal } from './components/PwaInstallModal.tsx';
import { KitchenKds } from './components/kitchen/KitchenKds.tsx';
import { KotListView } from './components/kitchen/KotListView.tsx';
import { TableManager } from './components/kitchen/TableManager.tsx';
import { MenuManager } from './components/kitchen/MenuManager.tsx';
import { WaiterManager } from './components/kitchen/WaiterManager.tsx';
import { BillingManager } from './components/kitchen/BillingManager.tsx';
import { BillHistoryView } from './components/kitchen/BillHistoryView.tsx';
import { ReportsView } from './components/kitchen/ReportsView.tsx';
import { SettingsManager } from './components/kitchen/SettingsManager.tsx';
import { WaiterDashboard } from './components/waiter/WaiterDashboard.tsx';
import { Order, KitchenOrderTicket } from './types/pos.ts';

const PosMain: React.FC = () => {
  const { db, loading, currentUser } = usePos();
  const [currentTab, setCurrentTab] = useState<string>('kds');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isTableTransferOpen, setIsTableTransferOpen] = useState<boolean>(false);
  const [isQuickPrintOpen, setIsQuickPrintOpen] = useState<boolean>(false);
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState<boolean>(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [activeKot, setActiveKot] = useState<KitchenOrderTicket | null>(null);
  const [preSelectedBillingOrder, setPreSelectedBillingOrder] = useState<Order | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-black tracking-tight">Sri Raghavi Kitchen POS</h2>
        <p className="text-xs text-slate-400 mt-1">Starting live database & real-time sync...</p>
      </div>
    );
  }

  const handleOpenBillingForOrder = (order: Order) => {
    setPreSelectedBillingOrder(order);
    setCurrentTab('billing');
  };

  const handleSelectTab = (tab: string) => {
    setPreSelectedBillingOrder(null);
    setCurrentTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Audio authorization & real-time alerts banner */}
      <AudioBanner />

      {/* Main Top Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleSelectTab}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        onOpenPwaGuide={() => setIsPwaGuideOpen(true)}
      />

      {/* Main Application Container with Left Sidebar */}
      {!currentUser ? (
        <main className="flex-1 flex items-center justify-center p-4">
          <LoginModal onSuccess={() => setIsLoginModalOpen(false)} />
        </main>
      ) : (
        <div className="flex-1 flex overflow-hidden relative">
          {/* Fixed Collapsible Left Sidebar & Mobile Drawer */}
          <AppSidebar
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            onOpenTableTransfer={() => setIsTableTransferOpen(true)}
            onOpenQuickPrint={() => setIsQuickPrintOpen(true)}
            onOpenPwaGuide={() => setIsPwaGuideOpen(true)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onToggleMobileDrawer={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pb-24 lg:pb-12 bg-slate-950">
            {currentUser.role === 'kitchen' ? (
              <>
                {currentTab === 'kds' && (
                  <KitchenKds
                    initialFilterTab="all"
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    onOpenBillingForOrder={handleOpenBillingForOrder}
                    onOpenKot={(kot) => setActiveKot(kot)}
                  />
                )}
                {currentTab === 'kds_new' && (
                  <KitchenKds
                    initialFilterTab="new"
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    onOpenBillingForOrder={handleOpenBillingForOrder}
                    onOpenKot={(kot) => setActiveKot(kot)}
                  />
                )}
                {currentTab === 'kds_preparing' && (
                  <KitchenKds
                    initialFilterTab="preparing"
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    onOpenBillingForOrder={handleOpenBillingForOrder}
                    onOpenKot={(kot) => setActiveKot(kot)}
                  />
                )}
                {currentTab === 'kds_ready' && (
                  <KitchenKds
                    initialFilterTab="ready"
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    onOpenBillingForOrder={handleOpenBillingForOrder}
                    onOpenKot={(kot) => setActiveKot(kot)}
                  />
                )}
                {currentTab === 'kds_bill_requests' && (
                  <KitchenKds
                    initialFilterTab="bill_requests"
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    onOpenBillingForOrder={handleOpenBillingForOrder}
                    onOpenKot={(kot) => setActiveKot(kot)}
                  />
                )}
                {currentTab === 'kot_list' && (
                  <KotListView onOpenKot={(kot) => setActiveKot(kot)} />
                )}
                {currentTab === 'tables' && (
                  <TableManager
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    onOpenBillingForOrder={handleOpenBillingForOrder}
                  />
                )}
                {currentTab === 'menu' && <MenuManager />}
                {currentTab === 'waiters' && <WaiterManager />}
                {currentTab === 'billing' && (
                  <BillingManager
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    preSelectedOrder={preSelectedBillingOrder}
                  />
                )}
                {currentTab === 'bill_history' && (
                  <BillHistoryView
                    onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                    onOpenBillingForOrder={handleOpenBillingForOrder}
                  />
                )}
                {currentTab === 'reports' && (
                  <ReportsView onOpenReceipt={(order) => setActiveReceiptOrder(order)} />
                )}
                {(currentTab === 'settings' || currentTab === 'sound_settings') && (
                  <SettingsManager />
                )}
              </>
            ) : (
              <WaiterDashboard
                onOpenReceipt={(order) => setActiveReceiptOrder(order)}
                onOpenKot={(kot) => setActiveKot(kot)}
              />
            )}
          </main>
        </div>
      )}

      {/* Printable KOT Modal (Thermal 80mm & A4) */}
      {activeKot && (
        <KotModal
          kot={activeKot}
          restaurantName={db?.restaurant.name}
          onClose={() => setActiveKot(null)}
        />
      )}

      {/* Printable Receipt / Bill Modal (Thermal 80mm & A4) */}
      {activeReceiptOrder && db && (
        <ReceiptModal
          order={activeReceiptOrder}
          db={db}
          onClose={() => setActiveReceiptOrder(null)}
        />
      )}

      {/* Quick Table Transfer Modal */}
      {isTableTransferOpen && (
        <TableTransferQuickModal onClose={() => setIsTableTransferOpen(false)} />
      )}

      {/* Quick Print KOT / Print Bill Modal */}
      {isQuickPrintOpen && (
        <QuickPrintModal
          onOpenReceipt={(order) => {
            setIsQuickPrintOpen(false);
            setActiveReceiptOrder(order);
          }}
          onOpenKot={(kot) => {
            setIsQuickPrintOpen(false);
            setActiveKot(kot);
          }}
          onClose={() => setIsQuickPrintOpen(false)}
        />
      )}

      {/* PWA Installation & Export Guide Modal */}
      {isPwaGuideOpen && (
        <PwaInstallModal onClose={() => setIsPwaGuideOpen(false)} />
      )}

      {/* Login modal trigger if clicked from navbar */}
      {isLoginModalOpen && (
        <LoginModal onSuccess={() => setIsLoginModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <PosProvider>
      <PosMain />
    </PosProvider>
  );
}

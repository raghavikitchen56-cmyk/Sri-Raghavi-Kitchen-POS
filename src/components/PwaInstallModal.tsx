import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Globe,
  Share2,
  CheckCircle2,
  X,
  Server,
  Cloud,
  HardDrive,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface PwaInstallModalProps {
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'export' | 'hosting' | 'database'>('android');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalledSuccess(true);
    }
    setDeferredPrompt(null);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative my-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Mobile Access, PWA & Hosting Guide</h3>
              <p className="text-xs text-slate-400">Install Sri Raghavi Kitchen POS on waiter phones and deploy online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
          <button
            onClick={() => setActiveTab('android')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Phone Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Source Code</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'hosting'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Free Hosting Options</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Database & Sync</span>
          </button>
        </div>

        {/* Tab 1: Android PWA */}
        {activeTab === 'android' && (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-950/40 border border-amber-800/50 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>How to Install on Android Phone (Chrome / Edge / Firefox)</span>
              </h4>
              <p className="text-slate-300">
                Waiters can open the POS website URL on their mobile phones and add it directly to their home screen as a standalone app with no browser address bar!
              </p>
            </div>

            {deferredPrompt && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-300">Quick Install Available!</div>
                  <div className="text-[11px] text-slate-400">Click button to install Sri Raghavi Kitchen POS directly.</div>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition"
                >
                  Install App Now
                </button>
              </div>
            )}

            <div className="space-y-3 font-sans">
              <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <div>
                  <strong className="text-white block">Open the website URL in Google Chrome</strong>
                  <span className="text-slate-400">Open the restaurant link on your Android phone browser.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <div>
                  <strong className="text-white block">Tap the 3-dots Menu (⋮)</strong>
                  <span className="text-slate-400">Located at the top-right corner of Google Chrome.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <div>
                  <strong className="text-white block">Tap "Add to Home screen" or "Install app"</strong>
                  <span className="text-slate-400">Confirm the app name "Sri Raghavi Kitchen POS". A launch icon will appear on your home screen.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <div>
                  <strong className="text-white block">Launch Standalone & Sign In</strong>
                  <span className="text-slate-400">Tap the icon to launch. Waiters enter their individual name and PIN (e.g. Raju: 1001) to begin table ordering.</span>
                </div>
              </div>
            </div>

            {/* Quick Share Link */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: iOS / Safari */}
        {activeTab === 'ios' && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-500" />
                <span>Installation on iPhone / iPad (Safari)</span>
              </h4>
              <p className="text-slate-400">
                Follow these 3 simple steps to add Sri Raghavi Kitchen POS to iOS devices:
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <div>
                  <strong className="text-white block">Open in Safari</strong>
                  <span className="text-slate-400">PWA installation on iOS requires Apple Safari browser.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <div>
                  <strong className="text-white block">Tap the "Share" Button (⎋ with arrow)</strong>
                  <span className="text-slate-400">Located in the bottom navigation bar in Safari.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <div>
                  <strong className="text-white block">Scroll down & tap "Add to Home Screen"</strong>
                  <span className="text-slate-400">Tap "Add" in the top-right corner. The app will launch in fullscreen mode without Safari tabs.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Download Source Code */}
        {activeTab === 'export' && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-500" />
                <span>How to Download & Export Project Source Code</span>
              </h4>
              <p className="text-slate-400">
                You own 100% of your codebase. You can run, edit, or deploy this project locally or anywhere on the cloud.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-amber-400 block font-mono">Method 1: Google AI Studio Export (One-Click)</strong>
                <p className="text-slate-300 leading-relaxed">
                  In Google AI Studio Build header, click the <strong>Options / Download Project</strong> icon to export the complete repository as a standard <code>.zip</code> file containing all source files (<code>src/</code>, <code>index.html</code>, <code>package.json</code>, etc.).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-amber-400 block font-mono">Method 2: Run Locally with Node.js</strong>
                <p className="text-slate-300">
                  After extracting the zip file on your computer, run:
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 space-y-1">
                  <div>npm install</div>
                  <div>npm run dev</div>
                </div>
                <p className="text-slate-400 text-[11px]">
                  The POS web app will start instantly on <code>http://localhost:3000</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Free Hosting Options */}
        {activeTab === 'hosting' && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <span>Free Hosting Platforms to Publish Online</span>
              </h4>
              <p className="text-slate-400">
                You can host this React POS web app online for free using any of these modern hosting platforms:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white">1. Vercel (Recommended)</strong>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">100% Free Tier</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Deploy directly from GitHub. Automatically builds with <code>npm run build</code> and delivers via global CDN with free SSL/HTTPS.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white">2. Render</strong>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">Free Static Site</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Free static site hosting with custom domain support and automatic builds. Set build command: <code>npm run build</code> and publish dir: <code>dist</code>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white">3. Firebase Hosting</strong>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">Free Spark Plan</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Google's native hosting for Firebase projects. Run <code>firebase deploy --only hosting</code> to serve worldwide from Google's edge network.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-white">4. Cloud Run / Docker</strong>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-bold">Free Monthly Tier</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  AI Studio's native container hosting. Runs full-stack containers with 2M free requests/month.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-200">
              <strong>Transparent Hosting Policy:</strong> Free tier web hosting providers do not charge for static hosting or HTTPS domains. For custom domain names (e.g. <code>sriraghavikitchen.com</code>), domains typically cost ~$10/year from domain registrars.
            </div>
          </div>
        )}

        {/* Tab 5: Database & Sync Status */}
        {activeTab === 'database' && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-500" />
                <span>Shared Database & Real-Time Sync Status</span>
              </h4>
              <p className="text-slate-400">
                Accurate status of persistent storage and cross-device synchronization:
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Local BroadcastChannel & Multi-Tab Real-Time Sync</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    <strong>Active and Tested:</strong> Orders, table status changes, KOTs, and sounds synchronize in sub-millisecond real time across multiple tabs, windows, and kitchen terminals on this origin.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Structured Persistent Storage & Automated Backups</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    <strong>Active:</strong> All 15 tables, 12 waiter profiles, menus, active orders, and sales history are preserved across refreshes with exportable JSON database backups.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Cloud Firestore External API Configuration</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Firebase project <code>gen-lang-client-0804941074</code> is pre-configured in the applet. For multi-device cloud synchronization over public cell networks (outside local browser instances), ensure the <em>Cloud Firestore API</em> is activated in Google Cloud Console for project <code>gen-lang-client-0804941074</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

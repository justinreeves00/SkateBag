"use client";

import { useEffect, useState } from "react";

export function PWASetup() {
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log("ServiceWorker registration successful");
          },
          function (err) {
            console.log("ServiceWorker registration failed: ", err);
          }
        );
      });
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Show iOS banner if on iOS and not already installed
    if (isIOS && !standalone) {
      const hasDismissed = localStorage.getItem("pwa-banner-dismissed");
      if (!hasDismissed) {
        setShowIOSBanner(true);
      }
    }

    // Check if app is already installed
    window.addEventListener("appinstalled", () => {
      setShowIOSBanner(false);
      console.log("PWA was installed");
    });
  }, []);

  const dismissBanner = () => {
    setShowIOSBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!showIOSBanner) return null;

  return (
    <>
      {/* Top App Banner (iOS Style) */}
      <div className="fixed top-0 left-0 right-0 z-[10000] animate-in slide-in-from-top-full duration-500">
        <div className="bg-[#1c1c1e] border-b border-white/5 px-4 py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <button 
              onClick={dismissBanner}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/10 shrink-0 overflow-hidden shadow-lg">
              <img src="/app-icon.png" alt="SkateBag" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs font-black text-white tracking-tight leading-none">SkateBag</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">Skateboard Tracker</span>
            </div>
          </div>

          <button 
            onClick={() => setShowInstructions(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Get
          </button>
        </div>
      </div>

      {/* iOS Instruction Overlay */}
      {showInstructions && (
        <div 
          className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-end justify-center pb-12 px-6 animate-in fade-in duration-300"
          onClick={() => setShowInstructions(false)}
        >
          <div 
            className="bg-[#1c1c1e] w-full max-w-sm rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-in slide-in-from-bottom-10 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#1c1c1e] rotate-45 border-t border-l border-white/10 hidden" />
            
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-black mx-auto flex items-center justify-center border border-white/10 shadow-2xl">
                <img src="/app-icon.png" alt="SkateBag" className="w-12 h-12 object-contain" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Install SkateBag</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Install this web app on your home screen for full-screen mode and offline access.
                </p>
              </div>

              <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </div>
                  <p className="text-[11px] font-bold text-white">1. Tap the Share button in Safari</p>
                </div>
                
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-xs font-black text-white">
                    +
                  </div>
                  <p className="text-[11px] font-bold text-white">2. Select &quot;Add to Home Screen&quot;</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInstructions(false)}
                className="w-full py-4 text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] hover:text-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust body padding to avoid content being hidden under the banner */}
      <style jsx global>{`
        body {
          padding-top: ${showIOSBanner ? '64px' : '0'};
          transition: padding-top 0.5s ease;
        }
      `}</style>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

export function PWASetup() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
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

    // Handle Android/Chrome Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Custom event to notify app components (like TrickList)
      window.dispatchEvent(new CustomEvent("pwa-install-available", { detail: e }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Show iOS prompt if on iOS and not already installed
    if (isIOS && !standalone) {
      // Check if we've already shown it recently
      const hasSeenPrompt = localStorage.getItem("pwa-ios-prompt-seen");
      if (!hasSeenPrompt) {
        // Show after a short delay
        setTimeout(() => setShowIOSPrompt(true), 3000);
      }
    }

    // Check if app is already installed
    window.addEventListener("appinstalled", () => {
      window.dispatchEvent(new CustomEvent("pwa-installed"));
      console.log("PWA was installed");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const closePrompt = () => {
    setShowIOSPrompt(false);
    localStorage.setItem("pwa-ios-prompt-seen", "true");
  };

  if (!showIOSPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[9999] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-[var(--surface)] border-2 border-[var(--board-accent)] rounded-3xl p-6 shadow-2xl shadow-black relative overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--board-accent)] to-transparent animate-pulse" />
        
        <button 
          onClick={closePrompt}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center border border-white/10 shrink-0">
            <img src="/app-icon.png" alt="SkateBag" className="w-10 h-10 object-contain" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Add to Home Screen</h4>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[200px]">
              Tap the <span className="inline-flex items-center px-1.5 py-0.5 bg-white/5 rounded border border-white/10 mx-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-400"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></span> share button and select &quot;Add to Home Screen&quot; for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

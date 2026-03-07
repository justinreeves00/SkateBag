"use client";

import { useEffect, useState } from "react";

export function PWASetup() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log("ServiceWorker registration successful with scope: ", registration.scope);
          },
          function (err) {
            console.log("ServiceWorker registration failed: ", err);
          }
        );
      });
    }

    // Handle PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Custom event to notify app components
      window.dispatchEvent(new CustomEvent("pwa-install-available", { detail: e }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Try to lock orientation if API is supported
    if (typeof screen !== "undefined" && (screen as any).orientation?.lock) {
      (screen as any).orientation.lock("portrait-primary").catch(() => {
        // Silently fail as browsers usually require fullscreen for this
      });
    }

    // Check if app is already installed
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      window.dispatchEvent(new CustomEvent("pwa-installed"));
      console.log("PWA was installed");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type InstallPromptWindow = Window & {
  __skatebagInstallPrompt?: BeforeInstallPromptEvent;
};

export function PWASetup() {
  useEffect(() => {
    const browserWindow = window as InstallPromptWindow;

    const registerServiceWorker = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      browserWindow.__skatebagInstallPrompt = installEvent;
      window.dispatchEvent(new CustomEvent("pwa-install-available", { detail: installEvent }));
    };

    const handleInstalled = () => {
      browserWindow.__skatebagInstallPrompt = undefined;
      window.dispatchEvent(new Event("pwa-installed"));
    };

    if ("serviceWorker" in navigator) {
      if (document.readyState === "complete") {
        registerServiceWorker();
      } else {
        window.addEventListener("load", registerServiceWorker, { once: true });
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrickCard } from "./TrickCard";
import { CompactFilterBar } from "./CompactFilterBar";
import { DiceButton } from "./DiceButton";
import { SkateBagLogo } from "./Logo";
import { signOut } from "@/lib/auth-actions";
import { updateProfile } from "@/lib/profile-actions";
import { submitNewTrickSuggestion } from "@/lib/trick-actions";
import type { TrickWithStatus, TrickCategory, Profile, TrickStatus } from "@/lib/types";

interface TrickListProps {
  tricks: TrickWithStatus[];
  isAuthenticated: boolean;
  userEmail: string | null;
  userProfile: Profile | null;
}

const CATEGORIES: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill"
];

const CATEGORY_LABELS: Record<TrickCategory | "all", string> = {
  all: "All Spots",
  flatground: "Flatground",
  street: "Street",
  "ledge/rail": "Ledge / Rail",
  transition: "Transition",
  gaps: "Gaps",
  freestyle: "Freestyle",
  downhill: "Downhill",
};

const INSTALL_DISMISS_KEY = "skatebag-install-banner-dismissed-v2";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type InstallPromptWindow = Window & {
  __skatebagInstallPrompt?: BeforeInstallPromptEvent;
};

function matchesStatusFilter(
  statusFilter: "all" | "landed" | "locked" | "learning",
  userStatus: TrickStatus | null
) {
  return (
    (statusFilter === "all" && userStatus === null) ||
    (statusFilter === "landed" && (userStatus === "landed" || userStatus === "locked")) ||
    (statusFilter === "locked" && userStatus === "locked") ||
    (statusFilter === "learning" && userStatus === "learning")
  );
}

export function TrickList({ tricks, isAuthenticated, userEmail, userProfile }: TrickListProps) {
  const router = useRouter();
  const [category, setCategory] = useState<TrickCategory | "all">("flatground");
  const [levelFilter, setLevelFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "landed" | "locked" | "learning">("all");
  
  const [forceCloseSetup, setForceCloseSetup] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Local state for tricks
  const [localTricks, setLocalTricks] = useState<TrickWithStatus[]>([]);
  const [stickyVisibleTrickId, setStickyVisibleTrickId] = useState<string | null>(null);

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [isMobileInstallSurface, setIsMobileInstallSurface] = useState(false);
  const [dismissedInstallPrompt, setDismissedInstallPrompt] = useState(false);
  const [installMethod, setInstallMethod] = useState<"native" | "ios" | "browser">("browser");
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const browserWindow = window as InstallPromptWindow;

    // Check if running as PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const mobileMedia = window.matchMedia("(max-width: 767px)");
    setIsPWA(isStandalone);
    setIsMobileInstallSurface(mobileMedia.matches);
    setDismissedInstallPrompt(localStorage.getItem(INSTALL_DISMISS_KEY) === "true");
    setInstallMethod(isIOS ? "ios" : "browser");

    if (browserWindow.__skatebagInstallPrompt) {
      setInstallPrompt(browserWindow.__skatebagInstallPrompt);
      setInstallMethod("native");
    }

    const handleInstallAvailable = (e: Event) => {
      if (localStorage.getItem(INSTALL_DISMISS_KEY) === "true") {
        return;
      }

      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      setInstallPrompt(customEvent.detail);
      setInstallMethod("native");
    };

    const handleInstalled = () => {
      localStorage.removeItem(INSTALL_DISMISS_KEY);
      setInstallPrompt(null);
      setIsPWA(true);
      setDismissedInstallPrompt(false);
      setShowInstallGuide(false);
      setShowInstallBanner(false);
    };

    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileInstallSurface(event.matches);
    };

    window.addEventListener("pwa-install-available", handleInstallAvailable);
    window.addEventListener("pwa-installed", handleInstalled);
    mobileMedia.addEventListener("change", handleViewportChange);

    // Auto-show banner after 500ms if not PWA and not dismissed
    if (!isStandalone && localStorage.getItem(INSTALL_DISMISS_KEY) !== "true") {
      setTimeout(() => {
        setShowInstallBanner(true);
      }, 500);
    }

    return () => {
      window.removeEventListener("pwa-install-available", handleInstallAvailable);
      window.removeEventListener("pwa-installed", handleInstalled);
      mobileMedia.removeEventListener("change", handleViewportChange);
    };
  }, []);

  // Initialize and sync localTricks when prop changes
  useEffect(() => {
    setLocalTricks(tricks);
  }, [tricks]);

  
  const handleStatusChange = (id: string, status: TrickStatus | null, consistency: number | null) => {
    setStickyVisibleTrickId((currentSticky) => {
      if (!matchesStatusFilter(statusFilter, status)) {
        return id;
      }

      return currentSticky === id ? null : currentSticky;
    });

    setLocalTricks((prev) => 
      prev.map((t) => 
        t.id === id ? { ...t, userStatus: status, userConsistency: consistency } : t
      )
    );
  };

  async function handleInstallClick() {
    if (!installPrompt || installMethod !== "native") {
      setShowInstallGuide(true);
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  }

  function dismissInstallPrompt() {
    localStorage.setItem(INSTALL_DISMISS_KEY, "true");
    setDismissedInstallPrompt(true);
    setInstallPrompt(null);
    setShowInstallGuide(false);
  }

  function handleCardInteract(id: string) {
    setStickyVisibleTrickId((currentSticky) => (currentSticky && currentSticky !== id ? null : currentSticky));
  }

  function promptLogin() {
    setShowAuthPrompt(true);
  }

  function handleStatusFilterSelect(nextFilter: "all" | "landed" | "locked" | "learning") {
    if (!isAuthenticated && nextFilter !== "all") {
      promptLogin();
      return;
    }

    setStatusFilter(nextFilter);
  }

  // Suggest Trick State
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    name: "",
    category: "flatground" as TrickCategory,
    difficulty: 1,
    description: "",
  });
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  // Sync displayName and setup visibility with prop
  useEffect(() => {
    if (userProfile?.display_name) {
      setDisplayName(userProfile.display_name);
      setForceCloseSetup(true);
    } else if (isAuthenticated) {
      setForceCloseSetup(false);
    }
  }, [userProfile?.display_name, isAuthenticated]);

  const showProfileSetup = isAuthenticated && !userProfile?.display_name && !forceCloseSetup;

  // Compute filtered list from localTricks
  // Search is universal - it searches ALL tricks regardless of category filter
  const searchFiltered = useMemo(() => {
    if (!search) return localTricks;
    return localTricks.filter((t) => 
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [localTricks, search]);

  const baseFiltered = useMemo(() => {
    return searchFiltered.filter((t) => {
      const matchesCategory = category === "all" || t.category === category;
      const matchesLevel = levelFilter === "all" || t.difficulty === levelFilter;
      return matchesCategory && matchesLevel;
    });
  }, [searchFiltered, category, levelFilter]);

  const filtered = useMemo(() => {
    return baseFiltered
      .filter((t) => {
        return matchesStatusFilter(statusFilter, t.userStatus) || t.id === stickyVisibleTrickId;
      })
      .sort((a, b) => {
        // Difficulty sorting (Ascending: 1, 2, 3...)
        if (a.difficulty !== b.difficulty) return (a.difficulty ?? 0) - (b.difficulty ?? 0);
        
        // Manual sort order within difficulty if it exists
        const orderA = a.sortOrder ?? 999999;
        const orderB = b.sortOrder ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        
        // Fallback to name
        return a.name.localeCompare(b.name);
      });
  }, [baseFiltered, statusFilter, stickyVisibleTrickId]);

  useEffect(() => {
    setStickyVisibleTrickId(null);
  }, [category, levelFilter, search, statusFilter]);

  const landed = baseFiltered.filter((t) => t.userStatus === "landed" || t.userStatus === "locked").length;
  const locked = baseFiltered.filter((t) => t.userStatus === "locked").length;
  const learning = baseFiltered.filter((t) => t.userStatus === "learning").length;
  const unlearned = baseFiltered.filter((t) => t.userStatus === null).length;

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsUpdatingProfile(true);
    setProfileError(null);
    
    const res = await updateProfile(displayName.trim());
    if (res.success) {
      setForceCloseSetup(true);
      setShowSettingsModal(false);
      router.refresh();
    } else {
      setProfileError(res.error || "Update failed");
    }
    setIsUpdatingProfile(false);
  }

  async function handleSuggest(e: React.FormEvent) {
    e.preventDefault();
    if (!suggestForm.name.trim()) return;
    setIsSuggesting(true);
    const description = [
      `Suggested difficulty: ${suggestForm.difficulty}`,
      "Applies to all skaters if approved.",
      suggestForm.description.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");
    const res = await submitNewTrickSuggestion(suggestForm.name, suggestForm.category, description);
    if (res.success) {
      setSuggestSuccess(true);
      setTimeout(() => {
        setShowSuggestModal(false);
        setSuggestSuccess(false);
        setSuggestForm({ name: "", category: "flatground", difficulty: 1, description: "" });
      }, 2000);
    }
    setIsSuggesting(false);
  }

  const statusTabs = [
    { value: "all" as const, label: "On Deck", count: unlearned, guestCount: `${tricks.length}` },
    { value: "learning" as const, label: "In Progress", count: learning, guestCount: "Track" },
    { value: "landed" as const, label: "Landed", count: landed, guestCount: "Track" },
    { value: "locked" as const, label: "Locked", count: locked, guestCount: "Track" },
  ];

  return (
    <div className="min-h-screen text-white selection:bg-[var(--board-accent)]/30 pb-32" style={{ paddingBottom: 'calc(8rem + max(0.5rem, env(safe-area-inset-bottom)))' }}>
      {showInstallGuide && !isPWA && (
        <div className="fixed inset-0 z-[1150] flex items-end justify-center bg-black/90 p-4 sm:items-center sm:p-6" onClick={() => setShowInstallGuide(false)}>
          <div
            className="w-full max-w-md rounded-[32px] border border-white/10 bg-[var(--surface)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">Add to Home Screen</p>
              <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Install SkateBag</h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {installMethod === "ios"
                  ? "In Safari, tap Share, then tap Add to Home Screen. SkateBag will open full-screen like an app."
                  : "Open your browser menu and choose Install App or Add to Home Screen to launch SkateBag like a native app."}
              </p>
            </div>

            <div className="mt-8 space-y-3 rounded-[24px] border border-white/10 bg-black/25 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xs font-black text-white">1</div>
                <p className="pt-2 text-sm font-medium text-white">
                  {installMethod === "ios" ? "Tap the Share button in Safari." : "Open the browser menu for this page."}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xs font-black text-white">2</div>
                <p className="pt-2 text-sm font-medium text-white">
                  {installMethod === "ios" ? "Choose Add to Home Screen." : "Choose Install App or Add to Home Screen."}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-xs font-black text-white">3</div>
                <p className="pt-2 text-sm font-medium text-white">Launch SkateBag from your home screen for the app-style experience.</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] transition-all hover:text-white"
              >
                Close
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="flex-1 rounded-2xl bg-[var(--board-accent)] px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:brightness-110"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthPrompt && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-6" onClick={() => setShowAuthPrompt(false)}>
          <div className="w-full max-w-sm rounded-[32px] border border-white/10 bg-[var(--surface)] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">Track In Progress</p>
              <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Log in to save tricks</h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Your bag and on lock progress only sync once you&apos;re signed in.
              </p>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] transition-all hover:text-white"
              >
                Maybe Later
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex-1 rounded-2xl bg-[var(--board-accent)] px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:brightness-110"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6">
          <div className="w-full max-w-md cyber-card p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Welcome to SkateBag</h2>
              <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em]">Setup your profile</p>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ENTER NAME..."
                  required
                  autoFocus
                  className="w-full bg-black border border-white/10 rounded-lg px-6 py-5 text-sm font-black text-white placeholder-slate-800 focus:outline-none focus:border-[var(--board-accent)] transition-all uppercase tracking-widest"
                />
                {profileError && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1">{profileError}</p>}
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-[var(--board-accent)] text-white font-black py-5 px-8 rounded-lg hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/40"
              >
                {isUpdatingProfile ? "Saving..." : "Start Skating"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isAuthenticated && showSettingsModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-6" onClick={() => setShowSettingsModal(false)}>
          <div className="w-full max-w-md cyber-card p-10 space-y-8 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ENTER NAME..."
                  required
                  className="w-full bg-black border border-white/10 rounded-lg px-6 py-5 text-sm font-black text-white placeholder-slate-800 focus:outline-none focus:border-[var(--board-accent)] transition-all uppercase tracking-widest"
                />
                {profileError && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1">{profileError}</p>}
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-[var(--board-accent)] text-white font-black py-5 px-8 rounded-lg hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/40"
              >
                {isUpdatingProfile ? "Saving..." : "Update Profile"}
              </button>
            </form>
            <div className="h-px bg-white/5 w-full" />
            <div className="space-y-3">
              <a 
                href="/admin" 
                className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--board-accent)]/20 text-[var(--board-accent)] border border-[var(--board-accent)]/30 font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-[var(--board-accent)] hover:text-black transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M12 14v7"/><path d="M8 21h8"/></svg>
                Admin Panel
              </a>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  if (!isAuthenticated) {
                    promptLogin();
                    return;
                  }
                  setShowSuggestModal(true);
                }}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 text-slate-400 border border-white/10 font-black uppercase tracking-widest text-[10px] rounded-lg hover:text-white hover:bg-white/10 transition-all"
              >
                Suggest Missing Trick
              </button>
              <a 
                href="/leaderboard" 
                className="flex items-center justify-center gap-2 w-full py-4 bg-black/40 text-slate-400 border border-white/10 font-black uppercase tracking-widest text-[10px] rounded-lg hover:text-white hover:bg-black/60 transition-all"
              >
                View Ranks
              </a>
              
              {!isPWA && (
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    handleInstallClick();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--board-accent)]/10 text-[var(--board-accent)] border border-[var(--board-accent)]/30 font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-[var(--board-accent)] hover:text-black transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  Install App
                </button>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSuggestModal && isAuthenticated && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/90 p-4" onClick={() => setShowSuggestModal(false)}>
          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[var(--surface)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)]">Community Review</p>
                <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Add Missing Trick</h3>
              </div>
              <button
                onClick={() => setShowSuggestModal(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-[var(--text-muted)] transition-all hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Approved tricks become part of the shared list for everyone, so set the category and difficulty you think fits all skaters best.
              </p>
            </div>

            <form onSubmit={handleSuggest} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Trick Name</label>
                <input
                  type="text"
                  value={suggestForm.name}
                  onChange={(e) => setSuggestForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white outline-none transition-all focus:border-[var(--board-accent)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Category</label>
                  <select
                    value={suggestForm.category}
                    onChange={(e) => setSuggestForm((prev) => ({ ...prev, category: e.target.value as TrickCategory }))}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white outline-none transition-all focus:border-[var(--board-accent)]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Difficulty</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSuggestForm((prev) => ({ ...prev, difficulty: lvl }))}
                        className={`h-12 rounded-2xl border text-sm font-black transition-all ${
                          suggestForm.difficulty === lvl
                            ? "border-[var(--board-accent)] bg-[var(--board-accent)] text-black"
                            : "border-white/10 bg-black/30 text-[var(--text-muted)] hover:text-white"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Notes</label>
                <textarea
                  value={suggestForm.description}
                  onChange={(e) => setSuggestForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm font-medium text-white outline-none transition-all focus:border-[var(--board-accent)]"
                />
              </div>

              {suggestSuccess ? (
                <div className="rounded-2xl border border-[var(--board-accent)]/30 bg-[var(--board-accent)]/10 px-5 py-4 text-center text-[11px] font-black uppercase tracking-[0.22em] text-[var(--board-accent)]">
                  Suggestion sent for review
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSuggesting}
                  className="w-full rounded-2xl bg-[var(--board-accent)] px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-black transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {isSuggesting ? "Sending..." : "Submit Trick"}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* iOS Smart App Banner - Native style with slide-down animation */}
      {!isPWA && !dismissedInstallPrompt && showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 z-[150] animate-in slide-in-from-top duration-300">
          <div className="bg-[#f2f2f2]/98 dark:bg-[#000000]/98 backdrop-blur-xl border-b border-gray-300 dark:border-white/10 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-2">
              <div className="flex items-center gap-3">
                {/* App Icon - with dark background to hide borders */}
                <div className="w-11 h-11 rounded-xl bg-[#1c1c1e] flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                  <img src="/app-icon.png" alt="SkateBag" className="w-[120%] h-[120%] object-cover" />
                </div>
                
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1c1c1e] dark:text-white leading-tight">SkateBag</p>
                  <p className="text-[11px] text-[#8e8e93] dark:text-[#98989d] leading-tight mt-0.5">
                    {installMethod === 'ios' ? 'Install App' : 'Add to Home Screen'}
                  </p>
                </div>
                
                {/* Action Button - iOS GET / Android Add */}
                <button
                  onClick={handleInstallClick}
                  className="px-5 py-1.5 bg-[#007aff] dark:bg-[#0a84ff] text-white text-[14px] font-semibold rounded-full hover:brightness-95 active:scale-95 transition-all shadow-sm flex-shrink-0"
                >
                  {installMethod === 'ios' ? 'GET' : 'Add'}
                </button>
                
                {/* Close X */}
                <button
                  onClick={dismissInstallPrompt}
                  className="w-7 h-7 flex items-center justify-center text-[#8e8e93] dark:text-[#98989d] hover:text-[#1c1c1e] dark:hover:text-white transition-all flex-shrink-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={`fixed left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/5 bg-[#1c1c1e] ${!isPWA && !dismissedInstallPrompt ? 'top-[56px]' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {/* Top Row: Logo + Actions */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-white/5">
            {/* Logo - Always visible */}
            <div className="flex items-center gap-2 shrink-0">
              <SkateBagLogo size={40} />
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">SkateBag</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">What's in your bag?</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button 
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className={`w-10 h-10 flex items-center justify-center transition-all rounded-xl border ${isSearchExpanded ? 'bg-[var(--board-accent)] text-black border-[var(--board-accent)]' : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </button>

              {/* Settings */}
              <button 
                onClick={() => {
                  if (isAuthenticated) {
                    setShowSettingsModal(true);
                    return;
                  }
                  promptLogin();
                }}
                className="w-10 h-10 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          {/* Search Dropdown */}
          {isSearchExpanded && (
            <div className="mb-3 animate-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--board-accent)]">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  placeholder="SEARCH TRICKS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm font-black text-white placeholder-slate-700 focus:outline-none focus:border-[var(--board-accent)]/40 transition-all uppercase tracking-widest"
                />
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-[var(--text-muted)] hover:text-white transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Compact Filter Bar */}
          {!isSearchExpanded && (
            <CompactFilterBar 
              category={category} 
              onCategoryChange={setCategory}
              statusFilter={statusFilter}
              onStatusChange={handleStatusFilterSelect}
              levelFilter={levelFilter}
              onLevelChange={setLevelFilter}
              trickCounts={{ unlearned, landed, locked, learning }}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="max-w-6xl mx-auto px-6 pb-32" style={{ paddingTop: !isPWA && !dismissedInstallPrompt ? '186px' : '130px' }}>

        <div className="mb-8 flex items-center gap-2 px-3">
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.35em] whitespace-nowrap italic bg-black px-2 py-1 border border-white/5 flex-shrink-0">
            {statusFilter === "all" ? "On Deck" : 
             statusFilter === "landed" ? "Landed" : 
             statusFilter === "locked" ? "Locked" : "In Progress"}
          </h2>
          <div className="h-px flex-1 bg-white/5"></div>
          <span className="text-[9px] font-black text-[var(--text-muted)] tabular-nums uppercase tracking-widest whitespace-nowrap flex-shrink-0">{filtered.length} Tricks</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center cyber-card rounded-[32px] border-dashed border-white/10">
            <p className="text-[var(--text-muted)] text-sm font-black uppercase tracking-widest mb-8">No matching tricks</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); setLevelFilter("all"); setStatusFilter("all"); }}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[var(--board-accent)]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            {filtered.map((trick) => (
              <TrickCard
                key={trick.id}
                trick={trick}
                isAuthenticated={isAuthenticated}
                onStatusChange={handleStatusChange}
                onInteract={handleCardInteract}
                reporterName={userProfile?.display_name ?? null}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Dice */}
      <div className="fixed bottom-28 right-6 z-[90]">
        <DiceButton tricks={localTricks} isAuthenticated={isAuthenticated} onStatusChange={handleStatusChange} />
      </div>

      {/* Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/5 bg-[#1c1c1e]/95 px-3 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            const displayValue = isAuthenticated ? `${tab.count}` : tab.guestCount;
            const accentClass =
              tab.value === "learning"
                ? "text-blue-400"
                : tab.value === "locked"
                  ? "text-[var(--warn-accent)]"
                  : tab.value === "landed"
                    ? "text-[var(--board-accent)]"
                    : "text-white";

            return (
              <button
                key={tab.value}
                onClick={() => handleStatusFilterSelect(tab.value)}
                className={`flex min-h-[62px] flex-col items-center justify-center rounded-2xl border px-1 py-2 transition-all ${
                  isActive
                    ? "border-white/10 bg-white/[0.08]"
                    : "border-transparent bg-transparent"
                }`}
              >
                <div className={`text-[17px] font-black leading-none tabular-nums ${isActive ? accentClass : "text-slate-500"}`}>
                  {displayValue}
                </div>
                <span className={`mt-1 text-[8px] font-black uppercase tracking-[0.18em] ${isActive ? "text-white" : "text-slate-500"}`}>
                  {tab.label}
                </span>
                <div className={`mt-1 h-1 w-5 rounded-full ${isActive ? "bg-[var(--board-accent)]" : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

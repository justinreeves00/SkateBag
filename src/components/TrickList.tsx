"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrickCard } from "./TrickCard";
import { CategoryFilter } from "./CategoryFilter";
import { DiceButton } from "./DiceButton";
import { SkateBagLogo } from "./Logo";
import { signOut } from "@/lib/auth-actions";
import { updateProfile } from "@/lib/profile-actions";
import { submitNewTrickSuggestion, updateTrickOrder } from "@/lib/trick-actions";
import type { TrickWithStatus, TrickCategory, Profile } from "@/lib/types";

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TrickListProps {
  tricks: TrickWithStatus[];
  isAuthenticated: boolean;
  userEmail: string | null;
  userProfile: Profile | null;
}

const CATEGORIES: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill"
];

// Sortable Wrapper Component
function SortableTrickCard({ 
  trick, 
  isAuthenticated, 
  isDraggable 
}: { 
  trick: TrickWithStatus; 
  isAuthenticated: boolean;
  isDraggable: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: trick.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {isDraggable && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-12 flex items-center justify-center cursor-grab active:cursor-grabbing z-30 opacity-0 group-hover/sortable:opacity-100 transition-opacity bg-[var(--surface-elevated)] rounded-l-lg border border-white/5 border-r-0"
        >
          <svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="2" cy="3" r="1" fill="currentColor"/><circle cx="2" cy="9" r="1" fill="currentColor"/><circle cx="2" cy="15" r="1" fill="currentColor"/>
            <circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="9" r="1" fill="currentColor"/><circle cx="8" cy="15" r="1" fill="currentColor"/>
          </svg>
        </div>
      )}
      <TrickCard trick={trick} isAuthenticated={isAuthenticated} />
    </div>
  );
}

export function TrickList({ tricks, isAuthenticated, userEmail, userProfile }: TrickListProps) {
  const router = useRouter();
  const [category, setCategory] = useState<TrickCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "landed" | "locked">("all");
  
  const [forceCloseSetup, setForceCloseSetup] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Local state for sorted tricks
  const [localTricks, setLocalTricks] = useState<TrickWithStatus[]>([]);

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);

    const handleInstallAvailable = (e: any) => {
      setInstallPrompt(e.detail);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsPWA(true);
    };

    window.addEventListener("pwa-install-available", handleInstallAvailable);
    window.addEventListener("pwa-installed", handleInstalled);

    return () => {
      window.removeEventListener("pwa-install-available", handleInstallAvailable);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  // Initialize and sync localTricks when prop changes
  useEffect(() => {
    setLocalTricks(tricks);
  }, [tricks]);

  async function handleInstallClick() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  }

  // Suggest Trick State
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ name: "", category: "flatground" as TrickCategory, description: "" });
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

  // Compute filtered list from localTricks to allow smooth DnD
  const filtered = useMemo(() => {
    return localTricks
      .filter((t) => {
        const matchesCategory = category === "all" || t.category === category;
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = 
          statusFilter === "all" || 
          (statusFilter === "landed" ? (t.userStatus === "landed" || t.userStatus === "locked") : t.userStatus === statusFilter);
        return matchesCategory && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // If status filter is active, use manual sort order if it exists
        if (statusFilter !== "all") {
          const orderA = a.sortOrder ?? 999999;
          const orderB = b.sortOrder ?? 999999;
          if (orderA !== orderB) return orderA - orderB;
        }
        // Fallback to name for base list
        return a.name.localeCompare(b.name);
      });
  }, [localTricks, category, search, statusFilter]);

  const landed = localTricks.filter((t) => t.userStatus === "landed" || t.userStatus === "locked").length;
  const locked = localTricks.filter((t) => t.userStatus === "locked").length;
  const progress = localTricks.length > 0 ? (landed / localTricks.length) * 100 : 0;

  // DnD Handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filtered.findIndex((t) => t.id === active.id);
      const newIndex = filtered.findIndex((t) => t.id === over.id);

      const newFiltered = arrayMove(filtered, oldIndex, newIndex);
      
      // Update local state immediately for snappy UI
      const updatedLocalTricks = localTricks.map(t => {
        const foundIndex = newFiltered.findIndex(nf => nf.id === t.id);
        if (foundIndex !== -1) {
          return { ...t, sortOrder: foundIndex + 1, isManuallySorted: true };
        }
        return t;
      });
      setLocalTricks(updatedLocalTricks);

      // Save to database
      // We update the sort_order of the moved item
      await updateTrickOrder(active.id as string, newIndex + 1);
      
      // Optimization: We could update others too, but for simplicity we'll let the DB handle it or re-fetch
      router.refresh();
    }
  }

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
    const res = await submitNewTrickSuggestion(suggestForm.name, suggestForm.category, suggestForm.description);
    if (res.success) {
      setSuggestSuccess(true);
      setTimeout(() => {
        setShowSuggestModal(false);
        setSuggestSuccess(false);
        setSuggestForm({ name: "", category: "flatground", description: "" });
      }, 2000);
    }
    setIsSuggesting(false);
  }

  // Sorting is enabled only for the admin user when viewing Landed or Locked lists (Issue #6)
  const isSortingEnabled = isAuthenticated && 
                           userEmail === "justinreeves00@gmail.com" && 
                           statusFilter !== "all" && 
                           search === "" && 
                           category === "all";

  return (
    <div className="min-h-screen text-white selection:bg-[var(--board-accent)]/30">
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

      {/* Suggest Trick Modal */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6" onClick={() => setShowSuggestModal(false)}>
          <div className="w-full max-w-md cyber-card p-10 space-y-8 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Suggest Trick</h2>
              <button onClick={() => setShowSuggestModal(false)} className="text-slate-500 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            {suggestSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17L4 12"/></svg>
                </div>
                <p className="text-[var(--board-accent)] font-black uppercase italic tracking-widest">Submission Received</p>
              </div>
            ) : (
              <form onSubmit={handleSuggest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Trick Name</label>
                  <input
                    type="text"
                    value={suggestForm.name}
                    onChange={(e) => setSuggestForm({...suggestForm, name: e.target.value})}
                    placeholder="E.G. HARDFLIP..."
                    required
                    autoFocus
                    className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-sm font-black text-white focus:border-[var(--board-accent)] outline-none uppercase tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Category</label>
                  <select
                    value={suggestForm.category}
                    onChange={(e) => setSuggestForm({...suggestForm, category: e.target.value as any})}
                    className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-sm font-black text-white focus:border-[var(--board-accent)] outline-none uppercase tracking-widest"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSuggesting}
                  className="w-full bg-[var(--board-accent)] text-white font-black py-5 px-8 rounded-lg hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase"
                >
                  {isSuggesting ? "Submitting..." : "Send Suggestion"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-6" onClick={() => setShowSettingsModal(false)}>
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
              <button
                onClick={() => { setShowSettingsModal(false); setShowSuggestModal(true); }}
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 text-slate-400 border border-white/10 font-black uppercase tracking-widest text-[10px] rounded-lg hover:text-white hover:bg-white/10 transition-all"
              >
                Suggest Missing Trick
              </button>
              <a 
                href="https://github.com/justinreeves00/SkateBag/issues/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-black/40 text-slate-400 border border-white/10 font-black uppercase tracking-widest text-[10px] rounded-lg hover:text-white hover:bg-black/60 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z"/></svg>
                Report Bug / Help
              </a>
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

      {/* Main Header */}
      <header className="sticky top-0 z-40 cyber-glass">
        {/* Nav Row */}
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Guest Mode
              </span>
            ) : (
              <>
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[var(--board-accent)]/40 transition-all group"
                >
                  <div className="w-1.5 h-1.5 bg-[var(--board-accent)] rotate-45 animate-pulse" />
                  <span className="text-[10px] text-white font-black leading-none truncate max-w-[120px] md:max-w-none uppercase tracking-tighter group-hover:text-[var(--board-accent)]">
                    {userProfile?.display_name || userEmail}
                  </span>
                </button>
                <a 
                  href="/leaderboard" 
                  className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-[var(--board-accent)] transition-colors bg-black/40 px-3 py-1.5 rounded-lg border border-white/10"
                >
                  Ranks
                </a>
                {userEmail === "justinreeves00@gmail.com" && (
                  <a 
                    href="/admin" 
                    className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-white transition-colors bg-[var(--board-accent)]/10 px-3 py-1.5 rounded-lg border border-[var(--board-accent)]/20"
                  >
                    Admin
                  </a>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isPWA && installPrompt && (
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 rounded-lg bg-[var(--board-accent)]/10 text-[var(--board-accent)] border border-[var(--board-accent)]/20 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--board-accent)] hover:text-white transition-all shadow-lg animate-pulse"
              >
                Install App
              </button>
            )}
            {!isAuthenticated ? (
              <a
                href="/login"
                className="inline-block px-5 py-2 rounded bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[var(--board-accent)] hover:text-white transition-all shadow-lg"
              >
                Sign in
              </a>
            ) : (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-5 py-2 rounded-lg bg-black/40 border border-white/10 text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-white hover:bg-black/60 transition-all"
              >
                Profile
              </button>
            )}
          </div>
        </div>

        {/* Brand & Stats Row */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <SkateBagLogo size={64} className="shadow-lg shadow-black/30 transform -rotate-2" />
                  <div className="space-y-0">
                    <h1 className="text-5xl font-black tracking-tighter text-white leading-none uppercase italic drop-shadow-lg">
                      SkateBag
                    </h1>
                    <p className="text-[10px] font-black text-[var(--board-accent)] uppercase tracking-[0.4em] ml-1 bg-black px-2 py-0.5 w-fit">
                      What&apos;s in your bag?
                    </p>
                  </div>
                </div>
                
                {/* Status Toggles */}
                <div className="flex items-center p-1 rounded-xl bg-black border border-white/10 w-fit">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "all" ? "bg-white text-black" : "text-slate-500 hover:text-white"}`}
                  >
                    All Tricks
                  </button>
                  <button 
                    onClick={() => setStatusFilter("landed")}
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "landed" ? "bg-[var(--board-accent)] text-white" : "text-slate-500 hover:text-white"}`}
                  >
                    Landed
                  </button>
                  <button 
                    onClick={() => setStatusFilter("locked")}
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "locked" ? "bg-[var(--warn-accent)] text-black" : "text-slate-500 hover:text-white"}`}
                  >
                    On Lock
                  </button>
                </div>
              </div>

              {/* Header Stats */}
              <div className="flex-1 max-w-2xl w-full flex flex-col sm:flex-row items-end gap-10">
                {isAuthenticated && (
                  <div className="flex gap-12 mb-1 px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">My Bag</span>
                      <div className="flex items-end gap-3 h-10">
                        <span className="text-4xl font-black tracking-tighter leading-none">{landed}</span>
                        <div className="w-20 h-2 bg-black border border-white/10 rounded-sm overflow-hidden mb-1.5">
                          <div className="h-full bg-[var(--board-accent)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">On Lock</span>
                      <div className="flex items-end h-10">
                        <span className="text-4xl font-black tracking-tighter leading-none text-[var(--warn-accent)] drop-shadow-md">{locked}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full space-y-4">
                  <div className="relative group flex items-center gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="SEARCH TRICKS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl pl-14 pr-6 py-5 text-sm font-black text-white placeholder-slate-800 focus:outline-none focus:border-[var(--board-accent)]/40 transition-all uppercase tracking-widest"
                      />
                    </div>
                    <div className="shrink-0">
                      <DiceButton tricks={localTricks} isAuthenticated={isAuthenticated} />
                    </div>
                  </div>
                  <CategoryFilter active={category} onChange={setCategory} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-32">
        <div className="mb-12 flex items-center gap-6">
          <h2 className="text-[11px] font-black text-white uppercase tracking-[0.4em] whitespace-nowrap italic bg-black px-3 py-1 border border-white/5">
            {statusFilter === "all" ? "Trick Vault" : statusFilter === "landed" ? "In The Bag" : "Practice List"}
          </h2>
          <div className="h-px w-full bg-white/5 shadow-[0_1px_0_rgba(255,255,255,0.02)]"></div>
          <span className="text-[10px] font-black text-slate-500 tabular-nums">{filtered.length} UNITS</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center cyber-card rounded-2xl border-dashed">
            <p className="text-slate-500 text-lg font-black uppercase tracking-widest mb-8">No results found</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); setStatusFilter("all"); }}
              className="px-8 py-4 bg-white text-black hover:bg-[var(--board-accent)] hover:text-white rounded text-xs font-black uppercase tracking-widest transition-all shadow-xl"
            >
              Reset Database
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-start">
              <SortableContext
                items={filtered.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {filtered.map((trick) => (
                  <SortableTrickCard
                    key={trick.id}
                    trick={trick}
                    isAuthenticated={isAuthenticated}
                    isDraggable={isSortingEnabled}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </main>
    </div>
  );
}

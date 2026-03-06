"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrickCard } from "./TrickCard";
import { CategoryFilter } from "./CategoryFilter";
import { DiceButton } from "./DiceButton";
import { SkateBagLogo } from "./Logo";
import { signOut } from "@/lib/auth-actions";
import { updateProfile } from "@/lib/profile-actions";
import type { TrickWithStatus, TrickCategory, Profile } from "@/lib/types";

interface TrickListProps {
  tricks: TrickWithStatus[];
  isAuthenticated: boolean;
  userEmail: string | null;
  userProfile: Profile | null;
}

export function TrickList({ tricks, isAuthenticated, userEmail, userProfile }: TrickListProps) {
  const router = useRouter();
  const [category, setCategory] = useState<TrickCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "landed" | "locked">("all");
  
  // Track if we are currently forcing the setup modal closed (e.g. after successful save)
  const [forceCloseSetup, setForceCloseSetup] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Sync displayName and setup visibility with prop
  useEffect(() => {
    if (userProfile?.display_name) {
      setDisplayName(userProfile.display_name);
      setForceCloseSetup(true); // Close setup if name exists
    } else if (isAuthenticated) {
      setForceCloseSetup(false); // Show setup if name is missing
    }
  }, [userProfile?.display_name, isAuthenticated]);

  const showProfileSetup = isAuthenticated && !userProfile?.display_name && !forceCloseSetup;

  const filtered = tricks.filter((t) => {
    const matchesCategory = category === "all" || t.category === category;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "landed" ? (t.userStatus === "landed" || t.userStatus === "locked") : t.userStatus === statusFilter);
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const landed = tricks.filter((t) => t.userStatus === "landed" || t.userStatus === "locked").length;
  const locked = tricks.filter((t) => t.userStatus === "locked").length;
  const progress = tricks.length > 0 ? (landed / tricks.length) * 100 : 0;

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

  return (
    <div className="min-h-screen text-white selection:bg-[var(--board-accent)]/30">
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div className="w-full max-w-md cyber-card p-10 rounded-3xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Welcome to SkateBag</h2>
              <p className="text-[var(--board-accent)] text-[10px] font-black uppercase tracking-[0.4em]">Setup your profile</p>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ENTER NAME..."
                  required
                  autoFocus
                  className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-3xl px-6 py-5 text-sm font-black text-white placeholder-slate-800 focus:outline-none focus:ring-4 focus:ring-[var(--board-accent)]/10 focus:border-[var(--board-accent)]/40 transition-all uppercase tracking-widest"
                />
                {profileError && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1">{profileError}</p>}
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-[var(--board-accent)] text-[#041316] font-black py-5 px-8 rounded-3xl hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/30"
              >
                {isUpdatingProfile ? "Saving..." : "Start Skating"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setShowSettingsModal(false)}>
          <div className="w-full max-w-md cyber-card p-10 rounded-3xl space-y-8 animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Settings</h2>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="w-10 h-10 rounded-3xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ENTER NAME..."
                  required
                  className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-3xl px-6 py-5 text-sm font-black text-white placeholder-slate-800 focus:outline-none focus:ring-4 focus:ring-[var(--board-accent)]/10 focus:border-[var(--board-accent)]/40 transition-all uppercase tracking-widest"
                />
                {profileError && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-1">{profileError}</p>}
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-[var(--board-accent)] text-[#041316] font-black py-5 px-8 rounded-3xl hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/30"
              >
                {isUpdatingProfile ? "Saving..." : "Update Profile"}
              </button>
            </form>
            <div className="h-px bg-[var(--surface-muted)] w-full" />
            <div className="space-y-3">
              <a 
                href="https://github.com/justinreeves00/SkateBag/issues/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)] font-black uppercase tracking-widest text-[10px] rounded-3xl hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z"/></svg>
                Report Bug / Feature
              </a>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[10px] rounded-3xl hover:bg-red-500 hover:text-[var(--foreground)] transition-all"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Header */}
      <header className="sticky top-0 z-40 cyber-glass border-b border-[var(--border)]">
        {/* User Nav Row */}
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none py-1">
                Sign in to log tricks 🛹
              </span>
            ) : (
              <>
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2 bg-[var(--surface-muted)] px-3 py-1.5 rounded-3xl border border-[var(--border)] hover:border-[var(--board-accent)]/40 transition-all group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--board-accent)] shadow-lg shadow-black/30 animate-pulse" />
                  <span className="text-[10px] text-white font-black leading-none truncate max-w-[120px] md:max-w-none uppercase tracking-tighter group-hover:text-[var(--board-accent)]">
                    {userProfile?.display_name || userEmail}
                  </span>
                </button>
                <a 
                  href="/leaderboard" 
                  className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--board-accent)] transition-colors bg-[var(--surface-muted)] px-3 py-1.5 rounded-3xl border border-[var(--border)]"
                >
                  Leaderboard
                </a>
                {userEmail === "justinreeves00@gmail.com" && (
                  <a 
                    href="/admin" 
                    className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors bg-[var(--board-accent)]/10 px-3 py-1.5 rounded-3xl border border-[var(--board-accent)]/20"
                  >
                    Admin
                  </a>
                )}
              </>
            )}
          </div>

          <div>
            {!isAuthenticated ? (
              <a
                href="/login"
                className="inline-block px-5 py-2 rounded-xl bg-[var(--board-accent)] text-[#041316] text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/30"
              >
                Sign in
              </a>
            ) : (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all"
              >
                Profile
              </button>
            )}
          </div>
        </div>

        {/* Brand & Controls Row */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <SkateBagLogo size={64} className="shadow-lg shadow-black/30 transform -rotate-3 shrink-0" />
                  <div className="space-y-1">
                    <h1 className="text-5xl font-black tracking-tighter text-white leading-none uppercase italic">
                      SkateBag
                    </h1>
                    <p className="text-[10px] font-black text-[var(--board-accent)]/80 uppercase tracking-[0.4em] ml-1">
                      What&apos;s in your bag?
                    </p>
                  </div>
                </div>
                
                {/* Bag Toggle Control */}
                <div className="flex items-center p-1 rounded-3xl bg-[var(--surface-muted)] border border-[var(--border)] w-fit">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2.5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "all" ? "bg-white text-[#041316] shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}
                  >
                    All Tricks
                  </button>
                  <button 
                    onClick={() => setStatusFilter("landed")}
                    className={`px-4 py-2.5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "landed" ? "bg-[var(--board-accent)] text-[#041316] shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}
                  >
                    Landed
                  </button>
                  <button 
                    onClick={() => setStatusFilter("locked")}
                    className={`px-4 py-2.5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "locked" ? "bg-[#f59e0b] text-white shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}
                  >
                    On Lock
                  </button>
                </div>
              </div>

              {/* Stats & Search Area */}
              <div className="flex-1 max-w-2xl w-full flex flex-col sm:flex-row items-end gap-6">
                {isAuthenticated && (
                  <div className="flex gap-10 mb-1 px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mb-2">My Bag</span>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-black tracking-tighter leading-none">{landed}</span>
                        <div className="w-20 h-1 bg-[var(--surface-elevated)] rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-[var(--board-accent)] shadow-lg shadow-black/30 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-[0.2em] mb-2">On Lock</span>
                      <span className="text-3xl font-black tracking-tighter leading-none text-[#f59e0b]">{locked}</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full space-y-4">
                  <div className="relative group flex items-center gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--board-accent)] text-[var(--text-muted)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="SEARCH TRICKS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-3xl pl-14 pr-6 py-5 text-sm font-black text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-[var(--board-accent)]/10 focus:border-[var(--board-accent)]/40 transition-all uppercase tracking-widest"
                      />
                    </div>
                    <div className="shrink-0">
                      <DiceButton tricks={filtered} />
                    </div>
                  </div>
                  <CategoryFilter active={category} onChange={setCategory} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-32">
        <div className="mb-12 flex items-center gap-6">
          <h2 className="text-[11px] font-black text-[var(--board-accent)] uppercase tracking-[0.4em] whitespace-nowrap italic">
            {statusFilter === "all" ? "Trick Vault" : statusFilter === "landed" ? "In The Bag" : "Practice List"}
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-[var(--board-accent)]/30 to-transparent"></div>
          <span className="text-[10px] font-black text-[var(--text-muted)] tabular-nums bg-[var(--surface-muted)] px-3 py-1 rounded-3xl border border-[var(--border)]">{filtered.length} TRICKS</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center cyber-card rounded-3xl border-dashed border-[var(--border)]">
            <div className="w-20 h-20 rounded-full bg-[var(--board-accent)]/5 flex items-center justify-center mb-8 border border-[var(--board-accent)]/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--board-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <p className="text-[var(--text-muted)] text-lg font-black uppercase tracking-widest mb-8">No bangers found here</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); setStatusFilter("all"); }}
              className="px-8 py-4 bg-[var(--board-accent)] text-[#041316] hover:brightness-110 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-black/30"
            >
              Reset Vault
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-start">
            {filtered.map((trick) => (
              <TrickCard
                key={trick.id}
                trick={trick}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

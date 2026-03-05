"use client";

import { useState } from "react";
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
  const [category, setCategory] = useState<TrickCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "landed" | "locked">("all");
  const [showProfileSetup, setShowProfileSetup] = useState(isAuthenticated && !userProfile?.display_name);
  const [displayName, setDisplayName] = useState(userProfile?.display_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const filtered = tricks.filter((t) => {
    const matchesCategory = category === "all" || t.category === category;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.userStatus === statusFilter;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const landed = tricks.filter((t) => t.userStatus === "landed").length;
  const locked = tricks.filter((t) => t.userStatus === "locked").length;
  const progress = tricks.length > 0 ? (landed / tricks.length) * 100 : 0;

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsUpdatingProfile(true);
    const res = await updateProfile(displayName.trim());
    if (res.success) {
      setShowProfileSetup(false);
      setShowSettingsModal(false);
    }
    setIsUpdatingProfile(false);
  }

  return (
    <div className="min-h-screen text-white selection:bg-[var(--neon-cyan)]/30">
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div className="w-full max-w-md cyber-card p-10 rounded-3xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Identity Check</h2>
              <p className="text-[var(--neon-cyan)] text-[10px] font-black uppercase tracking-[0.4em]">Register your operator name</p>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-5 text-sm font-black text-white placeholder-slate-800 focus:outline-none focus:ring-4 focus:ring-[var(--neon-cyan)]/10 focus:border-[var(--neon-cyan)]/40 transition-all uppercase tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-[var(--neon-cyan)] text-black font-black py-5 px-8 rounded-xl hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                {isUpdatingProfile ? "Syncing..." : "Initialize Profile"}
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
                <p className="text-[var(--neon-cyan)] text-[9px] font-black uppercase tracking-[0.3em]">Configure Interface</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all">
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-5 text-sm font-black text-white placeholder-slate-800 focus:outline-none focus:ring-4 focus:ring-[var(--neon-cyan)]/10 focus:border-[var(--neon-cyan)]/40 transition-all uppercase tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-[var(--neon-cyan)] text-black font-black py-5 px-8 rounded-xl hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                {isUpdatingProfile ? "Saving..." : "Update Profile"}
              </button>
            </form>
            <div className="h-px bg-white/5 w-full" />
            <div className="space-y-3">
              <a 
                href="https://github.com/justinreeves00/SkateBag/issues/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 text-slate-400 border border-white/10 font-black uppercase tracking-widest text-[10px] rounded-xl hover:text-white hover:bg-white/10 transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z"/></svg>
                Report Bug / Feature
              </a>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  Disconnect Session
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Header */}
      <header className="sticky top-0 z-40 cyber-glass border-b border-white/10">
        {/* User Nav Row */}
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none py-1">
                Awaiting authentication...
              </span>
            ) : (
              <>
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[var(--neon-cyan)]/40 transition-all group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_5px_var(--neon-cyan)] animate-pulse" />
                  <span className="text-[10px] text-white font-black leading-none truncate max-w-[120px] md:max-w-none uppercase tracking-tighter group-hover:text-[var(--neon-cyan)]">
                    {userProfile?.display_name || userEmail}
                  </span>
                </button>
                <a 
                  href="/leaderboard" 
                  className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-[var(--neon-cyan)] transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                >
                  Ranks
                </a>
                {userEmail === "justinreeves00@gmail.com" && (
                  <a 
                    href="/admin" 
                    className="text-[9px] font-black text-[var(--neon-cyan)] uppercase tracking-widest hover:text-white transition-colors bg-[var(--neon-cyan)]/10 px-3 py-1.5 rounded-lg border border-[var(--neon-cyan)]/20"
                  >
                    Control
                  </a>
                )}
              </>
            )}
          </div>

          <div>
            {!isAuthenticated ? (
              <a
                href="/login"
                className="inline-block px-5 py-2 rounded-sm bg-[var(--neon-cyan)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
              >
                Access
              </a>
            ) : (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-5 py-2 rounded-sm bg-white/5 border border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
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
                  <SkateBagLogo size={64} className="shadow-[0_0_30px_rgba(0,243,255,0.2)] transform -rotate-3 shrink-0" />
                  <div className="space-y-1">
                    <h1 className="text-5xl font-black tracking-tighter text-white leading-none uppercase italic">
                      SkateBag
                    </h1>
                    <p className="text-[10px] font-black text-[var(--neon-cyan)]/80 uppercase tracking-[0.4em] ml-1">
                      Visualizing your arsenal
                    </p>
                  </div>
                </div>
                
                {/* Bag Toggle Control */}
                <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "all" ? "bg-white text-black shadow-lg" : "text-slate-500 hover:text-white"}`}
                  >
                    All Units
                  </button>
                  <button 
                    onClick={() => setStatusFilter("landed")}
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "landed" ? "bg-[var(--neon-cyan)] text-black shadow-lg" : "text-slate-500 hover:text-white"}`}
                  >
                    Landed
                  </button>
                  <button 
                    onClick={() => setStatusFilter("locked")}
                    className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "locked" ? "bg-[var(--neon-magenta)] text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
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
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Stored</span>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-black tracking-tighter leading-none">{landed}</span>
                        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Targeted</span>
                      <span className="text-3xl font-black tracking-tighter leading-none text-[var(--neon-magenta)]">{locked}</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full space-y-4">
                  <div className="relative group flex items-center gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--neon-cyan)] text-slate-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="ENTER QUERY..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-6 py-5 text-sm font-black text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-[var(--neon-cyan)]/10 focus:border-[var(--neon-cyan)]/40 transition-all uppercase tracking-widest"
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
          <h2 className="text-[11px] font-black text-[var(--neon-cyan)] uppercase tracking-[0.4em] whitespace-nowrap italic">
            {statusFilter === "all" ? "Core Database" : statusFilter === "landed" ? "Active Inventory" : "Primary Targets"}
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-[var(--neon-cyan)]/30 to-transparent"></div>
          <span className="text-[10px] font-black text-slate-400 tabular-nums bg-white/5 px-3 py-1 rounded-lg border border-white/10">{filtered.length} UNITS</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center cyber-card rounded-3xl border-dashed border-white/10">
            <div className="w-20 h-20 rounded-full bg-[var(--neon-cyan)]/5 flex items-center justify-center mb-8 border border-[var(--neon-cyan)]/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <p className="text-slate-500 text-lg font-black uppercase tracking-widest mb-8">No matching data</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); setStatusFilter("all"); }}
              className="px-8 py-4 bg-[var(--neon-cyan)] text-black hover:brightness-110 rounded-sm text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_var(--neon-cyan)]"
            >
              Reboot Search
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

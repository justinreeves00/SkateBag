"use client";

import { useState } from "react";
import { TrickCard } from "./TrickCard";
import { CategoryFilter } from "./CategoryFilter";
import { DiceButton } from "./DiceButton";
import { SkateBagLogo } from "./Logo";
import { signOut } from "@/lib/auth-actions";
import type { TrickWithStatus, TrickCategory } from "@/lib/types";

interface TrickListProps {
  tricks: TrickWithStatus[];
  isAuthenticated: boolean;
  userEmail: string | null;
}

export function TrickList({ tricks, isAuthenticated, userEmail }: TrickListProps) {
  const [category, setCategory] = useState<TrickCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "landed" | "locked">("all");

  const filtered = tricks.filter((t) => {
    const matchesCategory = category === "all" || t.category === category;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.userStatus === statusFilter;
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const landed = tricks.filter((t) => t.userStatus === "landed").length;
  const locked = tricks.filter((t) => t.userStatus === "locked").length;
  const progress = tricks.length > 0 ? (landed / tricks.length) * 100 : 0;

  return (
    <div className="min-h-screen text-white selection:bg-emerald-500/30">
      {/* Aurora Header */}
      <header className="sticky top-0 z-40 aurora-glass border-b border-white/5">
        {/* User Nav Row */}
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none py-1">
                Sign in to log tricks 🛹
              </span>
            ) : (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-100 font-bold leading-none truncate max-w-[120px] md:max-w-none uppercase tracking-tighter">{userEmail}</span>
              </div>
            )}
          </div>

          <div>
            {!isAuthenticated ? (
              <a
                href="/login"
                className="inline-block px-5 py-2 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg"
              >
                Sign in
              </a>
            ) : (
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                >
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Brand & Controls Row */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-black shadow-2xl shadow-emerald-500/20 transform -rotate-3">
                    <SkateBagLogo size={36} />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent leading-none uppercase">
                      SkateBag
                    </h1>
                    <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.4em] ml-1">
                      What&apos;s in your bag?
                    </p>
                  </div>
                </div>
                
                {/* Bag Toggle Control */}
                <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/5 w-fit">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === "all" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
                  >
                    Global
                  </button>
                  <button 
                    onClick={() => setStatusFilter("landed")}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === "landed" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                  >
                    Landed
                  </button>
                  <button 
                    onClick={() => setStatusFilter("locked")}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === "locked" ? "bg-emerald-800 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                  >
                    Locked
                  </button>
                </div>
              </div>

              {/* Stats & Search Area */}
              <div className="flex-1 max-w-2xl w-full flex flex-col sm:flex-row items-end gap-6">
                {isAuthenticated && (
                  <div className="flex gap-10 mb-1 px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">Mastery</span>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-black tracking-tighter leading-none">{landed}</span>
                        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-200 transition-all duration-1000" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2">Ready</span>
                      <span className="text-3xl font-black tracking-tighter leading-none">{locked}</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full space-y-4">
                  <div className="relative group flex items-center gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-400 text-slate-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="SCAN DATABASE..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-14 pr-6 py-5 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all"
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
          <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] whitespace-nowrap">
            {statusFilter === "all" ? "System Core" : statusFilter === "landed" ? "Verified Assets" : "Pending Deployment"}
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
          <span className="text-[10px] font-bold text-slate-500 tabular-nums bg-white/5 px-3 py-1 rounded-full border border-white/5">{filtered.length} TRICKS</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center aurora-card rounded-[3rem] border-dashed border-white/10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/5 flex items-center justify-center mb-8 border border-emerald-500/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <p className="text-slate-400 text-lg font-medium mb-8">No results found in current matrix</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); setStatusFilter("all"); }}
              className="px-8 py-4 bg-white text-black hover:bg-emerald-400 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl"
            >
              Reset Matrix
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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

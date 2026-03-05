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
    <div className="min-h-screen text-white selection:bg-[var(--safety-orange)]/30 pb-32">
      {/* Industrial Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)] border-b-8 border-black">
        {/* User Nav Row */}
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center border-b-4 border-black">
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none py-1">
                Awaiting clearance...
              </span>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-black px-3 py-1.5 border-2 border-white/10">
                  <div className="w-2 h-2 bg-[var(--safety-orange)] shadow-[0_0_5px_var(--safety-orange)]" />
                  <span className="text-[10px] text-white font-black leading-none truncate max-w-[120px] md:max-w-none uppercase tracking-widest">{userEmail}</span>
                </div>
                {userEmail === "justinreeves00@gmail.com" && (
                  <a 
                    href="/admin" 
                    className="text-[9px] font-black text-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors bg-[var(--caution-yellow)] px-3 py-1.5 border-2 border-black"
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
                className="inline-block px-5 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Enter
              </a>
            ) : (
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest border-2 border-white/20 hover:bg-white hover:text-black transition-all"
                >
                  Exit
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Brand & Controls Row */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="p-2 bg-white border-4 border-black shadow-[6px_6px_0px_#000] rotate-[-2deg]">
                    <SkateBagLogo size={64} />
                  </div>
                  <div className="space-y-0">
                    <h1 className="text-6xl font-black tracking-tighter text-white leading-none uppercase italic drop-shadow-[4px_4px_0px_#000]">
                      SkateBag
                    </h1>
                    <p className="text-[10px] font-black text-[var(--safety-orange)] uppercase tracking-[0.4em] ml-1 bg-black px-2 py-0.5 w-fit">
                      What&apos;s in your bag?
                    </p>
                  </div>
                </div>
                
                {/* Bag Toggle Control */}
                <div className="flex items-center p-1 bg-black border-4 border-black w-fit">
                  <button 
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "all" ? "bg-white text-black" : "text-slate-500 hover:text-white"}`}
                  >
                    Vault
                  </button>
                  <button 
                    onClick={() => setStatusFilter("landed")}
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "landed" ? "bg-[var(--safety-orange)] text-white" : "text-slate-500 hover:text-white"}`}
                  >
                    Landed
                  </button>
                  <button 
                    onClick={() => setStatusFilter("locked")}
                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === "locked" ? "bg-[var(--caution-yellow)] text-black" : "text-slate-500 hover:text-white"}`}
                  >
                    Locked
                  </button>
                </div>
              </div>

              {/* Stats & Search Area */}
              <div className="flex-1 max-w-2xl w-full flex flex-col sm:flex-row items-end gap-6">
                {isAuthenticated && (
                  <div className="flex gap-8 mb-1 px-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">In Bag</span>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-black tracking-tighter leading-none text-white">{landed}</span>
                        <div className="w-16 h-3 bg-black border-2 border-white/10 mb-1">
                          <div className="h-full bg-[var(--safety-orange)]" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Practice</span>
                      <span className="text-4xl font-black tracking-tighter leading-none text-[var(--caution-yellow)]">{locked}</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full space-y-4">
                  <div className="relative group flex items-center gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-black z-10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="ENTER QUERY..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border-4 border-black px-14 py-5 text-sm font-black text-black placeholder-slate-400 focus:outline-none focus:bg-[var(--caution-yellow)] transition-all uppercase tracking-widest shadow-[4px_4px_0px_#000]"
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
      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="mb-10 flex items-center gap-4">
          <h2 className="text-[14px] font-black text-white uppercase tracking-widest bg-black px-4 py-1 italic rotate-[-1deg]">
            {statusFilter === "all" ? "Core Database" : statusFilter === "landed" ? "Active Inventory" : "Primary Targets"}
          </h2>
          <div className="h-1 flex-1 bg-black"></div>
          <span className="text-[10px] font-black text-white bg-[var(--safety-orange)] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">{filtered.length} UNITS</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-black/20 border-8 border-black border-dashed">
            <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mb-8 rotate-45 shadow-[8px_8px_0px_#000]">
              <svg className="rotate-[-45deg]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <p className="text-white text-xl font-black uppercase tracking-widest mb-8 bg-black px-4 py-1">Zero Results</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); setStatusFilter("all"); }}
              className="px-10 py-5 bg-[var(--safety-orange)] text-white border-4 border-black text-sm font-black uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[6px_6px_0px_#000] transition-all"
            >
              Reset System
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 items-start">
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

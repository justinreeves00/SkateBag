"use client";

import { useState } from "react";
import { TrickCard } from "./TrickCard";
import { CategoryFilter } from "./CategoryFilter";
import { DiceButton } from "./DiceButton";
import type { TrickWithStatus, TrickCategory } from "@/lib/types";

interface TrickListProps {
  tricks: TrickWithStatus[];
  isAuthenticated: boolean;
}

export function TrickList({ tricks, isAuthenticated }: TrickListProps) {
  const [category, setCategory] = useState<TrickCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = tricks.filter((t) => {
    const matchesCategory = category === "all" || t.category === category;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const landed = tricks.filter((t) => t.userStatus === "landed").length;
  const locked = tricks.filter((t) => t.userStatus === "locked").length;
  const completion = tricks.length > 0 ? Math.round((landed / tricks.length) * 100) : 0;

  return (
    <div className="min-h-screen">
      {/* Tactical Header */}
      <header className="sticky top-0 z-40 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-[#1e232d]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  SKATEBAG <span className="text-[#00f2ff]">v1.0</span>
                </h1>
                <p className="text-[10px] font-mono text-[#475569] uppercase tracking-[0.3em]">
                  What&apos;s in your bag? 🛹
                </p>
              </div>
              
              <div className="hidden sm:flex h-10 w-px bg-[#1e232d]" />
              
              {isAuthenticated && (
                <div className="hidden sm:grid grid-cols-3 gap-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-[#475569] uppercase tracking-widest mb-1">Status: Landed</span>
                    <span className="text-sm font-bold text-[#00f2ff]">{landed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-[#475569] uppercase tracking-widest mb-1">Status: Locked</span>
                    <span className="text-sm font-bold text-white">{locked}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-[#475569] uppercase tracking-widest mb-1">Completion</span>
                    <span className="text-sm font-bold text-white">{completion}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 max-w-md w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="SCAN TRICK DATABASE..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#11141b] border border-[#1e232d] rounded-lg pl-11 pr-4 py-3 text-xs font-mono text-white placeholder-[#334155] focus:outline-none focus:border-[#00f2ff]/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <CategoryFilter active={category} onChange={setCategory} />
          </div>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-32">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-[#475569] uppercase tracking-[0.2em]">
              Showing {filtered.length} entries
            </span>
            <div className="w-12 h-px bg-[#1e232d]" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00f2ff] uppercase tracking-widest">System Online</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-[#1e232d] border-dashed rounded-3xl">
            <p className="text-[#475569] font-mono text-sm tracking-widest uppercase mb-4">No Matches Found</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="text-[#00f2ff] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              [ RESET_FILTERS ]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <DiceButton tricks={filtered} />
    </div>
  );
}

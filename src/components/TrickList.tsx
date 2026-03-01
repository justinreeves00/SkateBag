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
    <div className="min-h-screen text-white">
      {/* Sleek Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-8">
            {/* Top row: Brand and Stats */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent leading-none">
                  SkateBag 🛹
                </h1>
                
                {/* Stats / Bag Toggle Button */}
                <button 
                  onClick={() => setStatusFilter(prev => {
                    if (prev === "all") return "landed";
                    if (prev === "landed") return "locked";
                    return "all";
                  })}
                  className="group flex items-center gap-6 p-1 pr-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all text-left"
                >
                  <div className={`px-4 py-3 rounded-xl transition-all ${
                    statusFilter === "all" ? "bg-blue-600 text-white" : 
                    statusFilter === "landed" ? "bg-green-500 text-black" : "bg-indigo-500 text-white"
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] block leading-none mb-1 opacity-70">Bag Mode</span>
                    <span className="text-xs font-bold uppercase tracking-widest leading-none">
                      {statusFilter === "all" ? "Full Database" : statusFilter === "landed" ? "My Landed" : "My Locked"}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Progress</span>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xl font-bold tabular-nums">{landed}</span>
                        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">On Lock</span>
                      <span className="text-xl font-bold tabular-nums mt-0.5">{locked}</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Search moved to right side */}
              <div className="w-full md:max-w-xs space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-500">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search database..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <CategoryFilter active={category} onChange={setCategory} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-32">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              {statusFilter === "all" ? "System Results" : statusFilter === "landed" ? "Mastered Tricks" : "Active Missions"}
            </h2>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-blue-400">{filtered.length}</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6"></div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-6">No matching tricks found in this view</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); setStatusFilter("all"); }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-600/20"
            >
              Reset Selection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

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
  const progress = tricks.length > 0 ? (landed / tricks.length) * 100 : 0;

  return (
    <div className="min-h-screen text-white">
      {/* Sleek Header */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent leading-none">
                SkateBag 🛹
              </h1>
              <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">
                What&apos;s in your bag?
              </p>
              
              {isAuthenticated && (
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Progress</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold tabular-nums">{landed}</span>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">On Lock</span>
                    <span className="text-2xl font-bold tabular-nums tracking-tight">{locked}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 max-w-md w-full space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search your database..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                />
              </div>
              <CategoryFilter active={category} onChange={setCategory} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-32">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
            Database Results // {filtered.length}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6"></div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center glass rounded-[2.5rem] border-dashed border-white/10">
            <p className="text-slate-400 font-medium mb-6">No matching tricks found</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

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

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-xl border-b border-[#111]">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
          {/* Title row */}
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-white uppercase leading-none">
                SkateBag 🛹
              </h1>
              <p className="text-[#444] text-[10px] font-bold uppercase tracking-[0.2em]">
                Trick Progression Tracker
              </p>
            </div>
            {isAuthenticated && (
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-[#333]">
                <div className="flex flex-col items-end">
                  <span className="text-[#e8ff00] text-lg leading-none">{landed}</span>
                  <span>Landed</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white text-lg leading-none">{locked}</span>
                  <span>Locked</span>
                </div>
              </div>
            )}
          </div>

          {/* Search & Category */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Find a trick..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111] border border-[#1a1a1a] rounded-2xl px-5 py-4 text-sm text-white placeholder-[#333] focus:outline-none focus:ring-2 focus:ring-[#e8ff00]/20 focus:border-[#e8ff00]/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#444] hover:text-white transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
            </div>
            <CategoryFilter active={category} onChange={setCategory} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-32">
        {/* Trick Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[10px] text-[#333] font-black uppercase tracking-[0.2em]">
            {filtered.length} trick{filtered.length !== 1 ? "s" : ""}
            {category !== "all" ? ` in ${category}` : ""}
          </p>
          <div className="h-px flex-1 bg-[#111] ml-4"></div>
        </div>

        {/* Trick List */}
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-[#333] text-sm font-bold uppercase tracking-widest">No tricks found</p>
              <button 
                onClick={() => { setSearch(""); setCategory("all"); }}
                className="mt-4 text-[#e8ff00] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filtered.map((trick) => (
              <TrickCard
                key={trick.id}
                trick={trick}
                isAuthenticated={isAuthenticated}
              />
            ))
          )}
        </div>
      </div>

      {/* Dice Button */}
      <DiceButton tricks={filtered} />
    </div>
  );
}

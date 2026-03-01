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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Skatebag</h1>
            {isAuthenticated && (
              <div className="flex gap-3 text-xs text-[#555]">
                <span>
                  <span className="text-[#e8ff00] font-bold">{landed}</span> landed
                </span>
                <span>
                  <span className="text-white font-bold">{locked}</span> on lock
                </span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tricks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-[#1f1f1f] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#333] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <CategoryFilter active={category} onChange={setCategory} />
        </div>
      </header>

      {/* Trick Count */}
      <div className="max-w-2xl mx-auto px-4 py-3">
        <p className="text-xs text-[#444] uppercase tracking-widest">
          {filtered.length} trick{filtered.length !== 1 ? "s" : ""}
          {category !== "all" ? ` · ${category}` : ""}
        </p>
      </div>

      {/* Trick List */}
      <div className="max-w-2xl mx-auto pb-28">
        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center text-[#444] text-sm">
            No tricks found
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

      {/* Dice Button */}
      <DiceButton tricks={filtered} />
    </div>
  );
}

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
    <div className="min-h-screen bg-white text-black">
      {/* Aggressive Header */}
      <header className="border-b-[6px] border-black bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="rotate-[-2deg] bg-black text-white p-4 zine-border inline-block">
                <h1 className="text-5xl md:text-7xl font-black leading-[0.8] tracking-tighter">
                  SKATEBAG
                </h1>
                <p className="text-xs font-bold tracking-[0.3em] mt-2 italic text-[#ff4d00]">
                  WHAT&apos;S IN YOUR BAG? 🛹
                </p>
              </div>

              {isAuthenticated && (
                <div className="flex flex-col items-end font-black uppercase text-sm leading-none pt-2">
                  <div className="flex gap-4">
                    <div className="text-right border-r-2 border-black pr-4">
                      <span className="block text-3xl text-[#ff4d00]">{landed}</span>
                      <span className="text-[10px]">LANDED</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-3xl">{locked}</span>
                      <span className="text-[10px]">LOCKED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="SEARCH_THE_DATABASE..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border-4 border-black p-4 text-sm font-black uppercase placeholder-black/30 focus:outline-none focus:bg-[#ff4d00] focus:text-white transition-all shadow-[4px_4px_0px_#000]"
                />
              </div>
              <CategoryFilter active={category} onChange={setCategory} />
            </div>
          </div>
        </div>
      </header>

      {/* Main List Area */}
      <main className="max-w-4xl mx-auto px-4 pt-12 pb-32">
        <div className="mb-8 flex items-baseline justify-between border-b-4 border-black pb-2">
          <h2 className="text-2xl font-black italic">
            TRICK_LOG [{filtered.length}]
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-1">
            FILTER: {category}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-black">
            <p className="text-xl font-black uppercase italic mb-4">NO TRICKS FOUND IN THE BAG</p>
            <button 
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="zine-button"
            >
              [ RESET_DATABASE ]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
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

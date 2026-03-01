"use client";

import { useState } from "react";
import type { TrickWithStatus, TrickCategory, DiceFilterSettings } from "@/lib/types";

interface DiceButtonProps {
  tricks: TrickWithStatus[];
}

const CATEGORY_OPTIONS: TrickCategory[] = [
  "flatground", "street", "rails", "ledges", "gaps", "vert", "bowl", "freestyle", "downhill",
];

export function DiceButton({ tricks }: DiceButtonProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState<TrickWithStatus | null>(null);
  const [rolling, setRolling] = useState(false);
  const [settings, setSettings] = useState<DiceFilterSettings>({
    excludeLanded: false,
    excludeLocked: false,
    categories: [...CATEGORY_OPTIONS],
  });

  function roll() {
    setRolling(true);
    setResult(null);

    let pool = tricks.filter((t) =>
      settings.categories.includes(t.category as TrickCategory)
    );
    if (settings.excludeLanded) pool = pool.filter((t) => t.userStatus !== "landed");
    if (settings.excludeLocked) pool = pool.filter((t) => t.userStatus !== "locked");

    setTimeout(() => {
      if (pool.length === 0) {
        setRolling(false);
        return;
      }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setResult(pick);
      setRolling(false);
    }, 600);
  }

  function toggleCategory(cat: TrickCategory) {
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  return (
    <>
      {/* Result Overlay */}
      {result && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 px-6"
          onClick={() => setResult(null)}
        >
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-[#666] uppercase tracking-widest mb-4">Try this trick</p>
            <h2 className="text-4xl font-black text-white tracking-tight mb-2">{result.name}</h2>
            <p className="text-sm text-[#555] capitalize mb-8">{result.category}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setResult(null)}
                className="px-5 py-2.5 bg-[#1a1a1a] text-white rounded-lg text-sm font-semibold"
              >
                Dismiss
              </button>
              <button
                onClick={roll}
                className="px-5 py-2.5 bg-[#e8ff00] text-black rounded-lg text-sm font-semibold"
              >
                Roll Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/80 flex items-end justify-center z-40"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-lg bg-[#111] rounded-t-2xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Dice Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-[#555] text-xl">✕</button>
            </div>

            {/* Exclude options */}
            <div className="space-y-3 mb-5">
              <label className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Exclude Landed</span>
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.excludeLanded ? "bg-[#e8ff00]" : "bg-[#333]"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white mx-1 transition-transform ${
                      settings.excludeLanded ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Exclude On Lock</span>
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.excludeLocked ? "bg-[#e8ff00]" : "bg-[#333]"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white mx-1 transition-transform ${
                      settings.excludeLocked ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Category filters */}
            <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    settings.categories.includes(cat)
                      ? "bg-[#e8ff00] text-black"
                      : "bg-[#1a1a1a] text-[#555]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dice FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-30">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#666] hover:text-white transition-colors"
          title="Dice Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${
            rolling
              ? "bg-[#666] rotate-180"
              : "bg-[#e8ff00] hover:scale-110 active:scale-95"
          }`}
          title="Roll for a trick"
        >
          <DiceIcon rolling={rolling} />
        </button>
      </div>
    </>
  );
}

function DiceIcon({ rolling }: { rolling: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${rolling ? "rotate-180" : ""}`}
    >
      <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
      <circle cx="7" cy="7" r="1.5" fill="black" stroke="none" />
      <circle cx="17" cy="7" r="1.5" fill="black" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="black" stroke="none" />
      <circle cx="7" cy="17" r="1.5" fill="black" stroke="none" />
      <circle cx="17" cy="17" r="1.5" fill="black" stroke="none" />
    </svg>
  );
}

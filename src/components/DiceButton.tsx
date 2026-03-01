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
    }, 800);
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
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] px-6 transition-all duration-500 animate-in fade-in"
          onClick={() => setResult(null)}
        >
          <div className="text-center scale-up-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] text-[#e8ff00] font-black uppercase tracking-[0.3em] mb-6">Your next mission</p>
            <h2 className="text-6xl font-black text-white tracking-tighter mb-4 uppercase italic">
              {result.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-12">
              <span className="text-xs text-[#555] font-bold uppercase tracking-widest">{result.category}</span>
              <span className="w-1 h-1 rounded-full bg-[#222]"></span>
              <span className="text-xs text-[#e8ff00] font-bold uppercase tracking-widest italic">LVL {result.difficulty}</span>
            </div>
            <div className="flex flex-col gap-3 max-w-[200px] mx-auto">
              <button
                onClick={roll}
                className="w-full py-4 bg-[#e8ff00] text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(232,255,0,0.2)]"
              >
                Roll Again
              </button>
              <button
                onClick={() => setResult(null)}
                className="w-full py-4 bg-[#111] text-[#444] rounded-2xl text-xs font-black uppercase tracking-widest hover:text-white transition-all border border-[#1a1a1a]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-40"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0a0a0a] rounded-t-[32px] p-8 pb-12 border-t border-[#1a1a1a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Dice Settings</h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-[#444] hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Exclude options */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button
                onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  settings.excludeLanded 
                    ? "bg-[#e8ff00] border-[#e8ff00] text-black" 
                    : "bg-[#111] border-[#1a1a1a] text-[#444] hover:border-[#333]"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Status</p>
                <p className="text-sm font-bold">Exclude Landed</p>
              </button>
              <button
                onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  settings.excludeLocked 
                    ? "bg-white border-white text-black" 
                    : "bg-[#111] border-[#1a1a1a] text-[#444] hover:border-[#333]"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Status</p>
                <p className="text-sm font-bold">Exclude Locked</p>
              </button>
            </div>

            {/* Category filters */}
            <p className="text-[10px] text-[#333] font-black uppercase tracking-[0.2em] mb-4">Select Categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    settings.categories.includes(cat)
                      ? "bg-[#222] text-[#e8ff00] border border-[#e8ff00]/30"
                      : "bg-[#111] text-[#333] border border-[#1a1a1a] hover:border-[#222]"
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
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4 z-30">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center text-[#444] hover:text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
          title="Dice Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`w-20 h-20 rounded-[28px] flex items-center justify-center transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${
            rolling
              ? "bg-[#222] scale-90"
              : "bg-[#e8ff00] hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(232,255,0,0.15)]"
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
    <div className={`transition-all duration-500 ${rolling ? "animate-spin scale-75" : "scale-110"}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="4" ry="4" />
        <circle cx="8" cy="8" r="1.5" fill="black" stroke="none" />
        <circle cx="16" cy="8" r="1.5" fill="black" stroke="none" />
        <circle cx="12" cy="12" r="1.5" fill="black" stroke="none" />
        <circle cx="8" cy="16" r="1.5" fill="black" stroke="none" />
        <circle cx="16" cy="16" r="1.5" fill="black" stroke="none" />
      </svg>
    </div>
  );
}

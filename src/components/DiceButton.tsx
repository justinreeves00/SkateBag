"use client";

import { useState } from "react";
import type { TrickWithStatus, TrickCategory, DiceFilterSettings } from "@/lib/types";

interface DiceButtonProps {
  tricks: TrickWithStatus[];
}

const CATEGORY_OPTIONS: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill",
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
    }, 1500);
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
          className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500"
          onClick={() => setResult(null)}
        >
          <div className="max-w-xl w-full text-center space-y-12" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em]">Random Selection Acquired</span>
              <h2 className="text-7xl font-extrabold tracking-tighter text-white italic">
                {result.name}
              </h2>
              <div className="flex items-center justify-center gap-4 text-slate-500 text-sm font-medium uppercase tracking-widest">
                <span>{result.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                <span className="text-blue-500">Level {result.difficulty}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <button
                onClick={roll}
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold uppercase tracking-widest hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)]"
              >
                Roll Again
              </button>
              <button
                onClick={() => setResult(null)}
                className="w-full py-5 bg-white/5 text-slate-400 rounded-3xl font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[50] flex items-end justify-center"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0f1115] rounded-t-[3rem] p-10 pb-16 border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white tracking-tight">Dice Logic</h3>
                <p className="text-xs text-slate-500 font-medium">Configure your random selection parameters</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                  className={`flex flex-col gap-1 p-6 rounded-3xl border text-left transition-all ${
                    settings.excludeLanded ? "bg-blue-600 border-blue-500 shadow-lg" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.excludeLanded ? "text-white/60" : "text-slate-600"}`}>Filter</span>
                  <span className={`text-sm font-bold ${settings.excludeLanded ? "text-white" : ""}`}>Exclude Landed</span>
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                  className={`flex flex-col gap-1 p-6 rounded-3xl border text-left transition-all ${
                    settings.excludeLocked ? "bg-indigo-600 border-indigo-500 shadow-lg" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.excludeLocked ? "text-white/60" : "text-slate-600"}`}>Filter</span>
                  <span className={`text-sm font-bold ${settings.excludeLocked ? "text-white" : ""}`}>Exclude Locked</span>
                </button>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Select Categories</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        settings.categories.includes(cat)
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-white/5 text-slate-600 border-transparent hover:text-slate-400"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FABs */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-6 z-[45]">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          </svg>
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] ${
            rolling 
              ? "bg-slate-800 scale-90" 
              : "bg-white text-black hover:scale-105 active:scale-95"
          }`}
        >
          <div className={rolling ? "animate-spin opacity-40" : ""}>
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="4" ry="4" />
              <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
              <circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
              <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
              <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </button>
      </div>
    </>
  );
}

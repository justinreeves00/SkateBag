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
    }, 1200);
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
      {/* HUD-style Result Overlay */}
      {result && (
        <div
          className="fixed inset-0 bg-[#0a0c10]/95 backdrop-blur-xl flex items-center justify-center z-[100] px-6 animate-in fade-in"
          onClick={() => setResult(null)}
        >
          <div className="absolute inset-0 pointer-events-none border-[40px] border-[#00f2ff]/5 mix-blend-overlay opacity-20" />
          
          <div className="text-center relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="w-12 h-px bg-[#00f2ff]/20"></span>
              <p className="text-[10px] text-[#00f2ff] font-mono font-black uppercase tracking-[0.4em]">Target Acquired</p>
              <span className="w-12 h-px bg-[#00f2ff]/20"></span>
            </div>
            
            <h2 className="text-6xl font-bold text-white tracking-tighter mb-4 uppercase font-sans">
              {result.name}
            </h2>
            
            <div className="flex items-center justify-center gap-6 mb-16">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-[#475569] uppercase tracking-widest mb-1">Class</span>
                <span className="text-xs text-white font-bold uppercase tracking-widest">{result.category}</span>
              </div>
              <div className="w-px h-8 bg-[#1e232d]"></div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-[#475569] uppercase tracking-widest mb-1">Risk</span>
                <span className="text-xs text-[#00f2ff] font-bold uppercase tracking-widest">LVL {result.difficulty}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-w-[240px] mx-auto">
              <button
                onClick={roll}
                className="w-full py-4 bg-[#00f2ff] text-black rounded-lg text-[11px] font-mono font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.3)]"
              >
                [ NEW_SEQUENCE ]
              </button>
              <button
                onClick={() => setResult(null)}
                className="w-full py-4 bg-transparent text-[#475569] border border-[#1e232d] rounded-lg text-[11px] font-mono font-black uppercase tracking-[0.2em] hover:text-white hover:border-[#334155] transition-all"
              >
                [ ABORT ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-[#0a0c10]/80 backdrop-blur-md flex items-end justify-center z-[50]"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#11141b] rounded-t-3xl p-8 pb-16 border-t border-[#1e232d] shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f2ff]/0 via-[#00f2ff]/40 to-[#00f2ff]/0" />
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Dice Parameters</h3>
                <span className="text-[9px] font-mono text-[#475569] uppercase tracking-[0.3em]">System Config v1.0.4</span>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-10 h-10 rounded-xl bg-[#0f1115] border border-[#1e232d] flex items-center justify-center text-[#475569] hover:text-[#00f2ff] transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-[10px] font-mono text-[#00f2ff] uppercase tracking-[0.2em] border-b border-[#1e232d] pb-2">Filter_Overrides</p>
                <div className="space-y-4">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      settings.excludeLanded 
                        ? "bg-[#00f2ff]/5 border-[#00f2ff]/30 text-[#00f2ff]" 
                        : "bg-[#0f1115] border-[#1e232d] text-[#475569] hover:border-[#334155]"
                    }`}
                  >
                    <span className="text-xs font-mono uppercase font-bold tracking-widest">Exclude Mastered</span>
                    <div className={`w-4 h-4 rounded-sm border-2 transition-all ${settings.excludeLanded ? "bg-[#00f2ff] border-[#00f2ff]" : "border-[#1e232d]"}`} />
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      settings.excludeLocked 
                        ? "bg-white/5 border-white/30 text-white" 
                        : "bg-[#0f1115] border-[#1e232d] text-[#475569] hover:border-[#334155]"
                    }`}
                  >
                    <span className="text-xs font-mono uppercase font-bold tracking-widest">Exclude Locked</span>
                    <div className={`w-4 h-4 rounded-sm border-2 transition-all ${settings.excludeLocked ? "bg-white border-white" : "border-[#1e232d]"}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-mono text-[#00f2ff] uppercase tracking-[0.2em] border-b border-[#1e232d] pb-2">Category_Matrix</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-3 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest transition-all border ${
                        settings.categories.includes(cat)
                          ? "bg-[#161a23] text-[#00f2ff] border-[#00f2ff]/40 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                          : "bg-[#0f1115] text-[#334155] border-[#1e232d] hover:border-[#334155]"
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

      {/* Tactical FAB */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-5 z-[45]">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 rounded-xl bg-[#11141b] border border-[#1e232d] flex items-center justify-center text-[#475569] hover:text-[#00f2ff] transition-all hover:scale-105 active:scale-95 shadow-xl group"
          title="Dice Parameters"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          </svg>
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-[0_20px_40px_rgba(0,0,0,0.6)] group border-2 ${
            rolling
              ? "bg-[#11141b] border-[#1e232d] scale-90"
              : "bg-[#00f2ff] border-[#00f2ff] hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(0,242,255,0.25)]"
          }`}
          title="Generate Sequence"
        >
          <div className={`transition-all duration-700 ${rolling ? "animate-spin scale-75" : "scale-110 group-hover:rotate-12"}`}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke={rolling ? "#475569" : "black"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="4" ry="4" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </button>
      </div>
    </>
  );
}

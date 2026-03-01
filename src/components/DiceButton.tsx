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
    }, 1000);
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
          className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 border-[20px] border-black"
          onClick={() => setResult(null)}
        >
          <div className="text-center rotate-[-3deg]" onClick={(e) => e.stopPropagation()}>
            <p className="text-xl font-black uppercase italic bg-black text-white px-4 py-1 inline-block mb-8 underline decoration-[#ff4d00] decoration-4 underline-offset-8">
              DO_THIS_TRICK_OR_DIE
            </p>
            <h2 className="text-7xl md:text-9xl font-black text-black tracking-tighter mb-4 uppercase leading-[0.8]">
              {result.name}
            </h2>
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className="text-2xl font-black uppercase italic border-4 border-black px-4 py-2">{result.category}</span>
              <span className="text-2xl font-black uppercase italic bg-[#ff4d00] text-white px-4 py-2">LVL_{result.difficulty}</span>
            </div>
            <div className="flex flex-col gap-4 max-w-[300px] mx-auto rotate-[3deg]">
              <button
                onClick={roll}
                className="w-full py-6 bg-black text-white text-2xl font-black uppercase italic border-4 border-black hover:bg-[#ff4d00] transition-all shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                ROLL_AGAIN
              </button>
              <button
                onClick={() => setResult(null)}
                className="w-full py-4 bg-white text-black text-lg font-black uppercase italic border-4 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_#000]"
              >
                ABORT_MISSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/90 z-[50] flex items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-2xl bg-white border-[10px] border-black p-8 relative rotate-[-1deg]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 border-b-8 border-black pb-4">
              <h3 className="text-4xl font-black italic uppercase">DICE_LOGIC</h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="bg-black text-white px-4 py-2 font-black text-xl hover:bg-[#ff4d00]"
              >
                [X]
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                  className={`p-4 border-4 border-black text-left transition-all ${
                    settings.excludeLanded ? "bg-[#ff4d00] text-white shadow-[4px_4px_0px_#000]" : "bg-white text-black"
                  }`}
                >
                  <p className="text-xs font-black uppercase mb-1">STATUS</p>
                  <p className="text-xl font-black italic">EXCL_LANDED</p>
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                  className={`p-4 border-4 border-black text-left transition-all ${
                    settings.excludeLocked ? "bg-black text-white shadow-[4px_4px_0px_#000]" : "bg-white text-black"
                  }`}
                >
                  <p className="text-xs font-black uppercase mb-1">STATUS</p>
                  <p className="text-xl font-black italic">EXCL_LOCKED</p>
                </button>
              </div>

              <div>
                <p className="text-xs font-black uppercase mb-4 underline decoration-4 underline-offset-4">CATEGORIES</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 border-4 border-black text-[10px] font-black uppercase transition-all ${
                        settings.categories.includes(cat)
                          ? "bg-black text-white"
                          : "bg-white text-black hover:bg-[#ff4d00] hover:text-white"
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
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-[45]">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_#000] rotate-[-5deg]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          </svg>
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`w-24 h-24 border-[6px] border-black flex items-center justify-center transition-all shadow-[8px_8px_0px_#000] rotate-[5deg] active:translate-x-1 active:translate-y-1 active:shadow-none ${
            rolling ? "bg-black" : "bg-[#ff4d00] hover:bg-black hover:text-[#ff4d00]"
          }`}
        >
          <div className={rolling ? "animate-spin" : ""}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
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

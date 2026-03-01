"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { TrickWithStatus, TrickCategory, DiceFilterSettings } from "@/lib/types";

interface DiceButtonProps {
  tricks: TrickWithStatus[];
}

const CATEGORY_OPTIONS: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill",
];

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export function DiceButton({ tricks }: DiceButtonProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState<TrickWithStatus | null>(null);
  const [rolling, setRolling] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<DiceFilterSettings>({
    excludeLanded: false,
    excludeLocked: false,
    categories: [...CATEGORY_OPTIONS],
    levels: [...LEVEL_OPTIONS],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch YouTube video ID when result changes
  useEffect(() => {
    if (result && result.youtube_query) {
      setFetchingVideo(true);
      setVideoId(null);
      fetch(`/api/youtube?q=${encodeURIComponent(result.youtube_query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.videoId) setVideoId(data.videoId);
        })
        .finally(() => setFetchingVideo(false));
    }
  }, [result]);

  function roll() {
    setRolling(true);
    setResult(null);
    setVideoId(null);

    let pool = tricks.filter((t) =>
      settings.categories.includes(t.category as TrickCategory)
    );
    
    pool = pool.filter((t) => t.difficulty !== null && settings.levels.includes(t.difficulty));
    
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

  function toggleLevel(lvl: number) {
    setSettings((prev) => ({
      ...prev,
      levels: prev.levels.includes(lvl)
        ? prev.levels.filter((l) => l !== lvl)
        : [...prev.levels, lvl],
    }));
  }

  const overlays = (
    <>
      {/* Result Overlay Card */}
      {result && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] overflow-y-auto flex flex-col items-center justify-start py-12 px-4 md:px-8 animate-in fade-in duration-500"
          onClick={() => setResult(null)}
        >
          <div 
            className="max-w-2xl w-full bg-[#0f1115] rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 relative my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em]">Random Selection Acquired</span>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white italic leading-tight">
                {result.name}
              </h2>
              <div className="flex items-center justify-center gap-4 text-slate-500 text-xs font-medium uppercase tracking-widest">
                <span>{result.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                <span className="text-blue-500">Level {result.difficulty}</span>
              </div>
            </div>

            {/* Video Player */}
            <div className="aspect-video w-full bg-black/40 rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/5 relative shadow-inner">
              {videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${result.name} tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : fetchingVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Accessing Feed...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-widest italic">Visual data unavailable</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={roll}
                className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                Roll Again
              </button>
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-5 bg-white/5 text-slate-400 rounded-2xl font-bold uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel Card */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] overflow-y-auto flex flex-col items-center justify-start py-12 px-4 md:px-6 animate-in fade-in duration-300"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0f1115] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white tracking-tight italic uppercase">Dice Logic</h3>
                <p className="text-xs text-slate-500 font-medium">Configure random selection parameters</p>
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
                  className={`flex flex-col gap-1 p-6 rounded-[1.5rem] border text-left transition-all ${
                    settings.excludeLanded ? "bg-blue-600 border-blue-500 shadow-lg" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.excludeLanded ? "text-white/60" : "text-slate-600"}`}>Filter</span>
                  <span className={`text-sm font-bold ${settings.excludeLanded ? "text-white" : ""}`}>Exclude Landed</span>
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                  className={`flex flex-col gap-1 p-6 rounded-[1.5rem] border text-left transition-all ${
                    settings.excludeLocked ? "bg-indigo-600 border-indigo-500 shadow-lg" : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.excludeLocked ? "text-white/60" : "text-slate-600"}`}>Filter</span>
                  <span className={`text-sm font-bold ${settings.excludeLocked ? "text-white" : ""}`}>Exclude Locked</span>
                </button>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Trick Levels</span>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className={`w-12 h-12 rounded-xl text-xs font-bold transition-all border ${
                        settings.levels.includes(lvl)
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                          : "bg-white/5 text-slate-600 border-transparent hover:text-slate-400"
                      }`}
                    >
                      L{lvl}
                    </button>
                  ))}
                </div>
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
    </>
  );

  return (
    <>
      {/* Header Inline Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 group"
          title="Dice Parameters"
        >
          <GearIcon size={20} />
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`h-12 px-6 rounded-2xl flex items-center gap-3 transition-all ${
            rolling 
              ? "bg-slate-800 scale-95" 
              : "bg-white text-black hover:bg-blue-400 hover:scale-105 active:scale-95 shadow-lg"
          }`}
        >
          <div className={rolling ? "animate-spin" : ""}>
            <DiceIcon size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {rolling ? "Rolling..." : "Roll Dice"}
          </span>
        </button>
      </div>

      {mounted && createPortal(overlays, document.body)}
    </>
  );
}

function GearIcon({ size = 24 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="group-hover:rotate-90 transition-transform duration-500"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function DiceIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
  );
}

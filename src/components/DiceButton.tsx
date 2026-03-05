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
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [searchMode, setSearchMode] = useState<"query" | "exact">("query");
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

  const fetchVideos = (mode: "query" | "exact", trick: TrickWithStatus) => {
    const q = mode === "exact" ? trick.name : (trick.youtube_query || trick.name);
    setFetchingVideo(true);
    setVideoIds([]);
    setCurrentVideoIndex(0);
    setSearchMode(mode);
    fetch(`/api/youtube?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.videoIds && data.videoIds.length > 0) {
          setVideoIds(data.videoIds);
        }
      })
      .finally(() => setFetchingVideo(false));
  };

  useEffect(() => {
    if (result && videoIds.length === 0 && !fetchingVideo) {
      fetchVideos("query", result);
    }
  }, [result]);

  function roll() {
    setRolling(true);
    setResult(null);
    setVideoIds([]);
    setCurrentVideoIndex(0);
    setSearchMode("query");

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

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoIds.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoIds.length) % videoIds.length);
  };

  const tryExact = () => {
    if (result) fetchVideos("exact", result);
  };

  const overlays = (
    <>
      {/* Result Overlay Card */}
      {result && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] overflow-y-auto flex flex-col items-center justify-start py-12 px-4 md:px-8 animate-in fade-in duration-500"
          onClick={() => setResult(null)}
        >
          <div 
            className="max-w-3xl w-full bg-white border-8 border-black p-8 md:p-14 shadow-[12px_12px_0px_#000] space-y-10 animate-in zoom-in-95 duration-300 relative my-auto rotate-[-1deg]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-6">
              <span className="px-5 py-2 bg-black text-[var(--safety-orange)] text-xs font-black uppercase tracking-widest border-4 border-black">Next Mission</span>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-black italic leading-[0.9] uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                {result.name}
              </h2>
              <div className="flex items-center justify-center gap-6 text-slate-500 text-sm font-black uppercase tracking-widest">
                <span>{result.category}</span>
                <div className="w-2 h-2 bg-black rotate-45" />
                <span className="text-[var(--safety-orange)]">Tier {result.difficulty}</span>
              </div>
            </div>

            {/* Video Player */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-black uppercase tracking-widest bg-black/5 px-2 py-1">Tutorial Feed</span>
                <div className="flex gap-2">
                  {searchMode === "query" && (
                    <button 
                      onClick={tryExact}
                      className="text-[9px] font-black text-black uppercase tracking-widest bg-[var(--caution-yellow)] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]"
                    >
                      Exact Search 🎯
                    </button>
                  )}
                  {videoIds.length > 1 && (
                    <div className="flex gap-2">
                      <button 
                        onClick={prevVideo}
                        className="text-[9px] font-black text-black uppercase tracking-widest bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]"
                      >
                        Prev
                      </button>
                      <button 
                        onClick={nextVideo}
                        className="text-[9px] font-black text-black uppercase tracking-widest bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]"
                      >
                        Next ({currentVideoIndex + 1}/{videoIds.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="aspect-video w-full bg-black border-4 border-black shadow-inner relative group/video">
                {videoIds.length > 0 ? (
                  <iframe
                    key={videoIds[currentVideoIndex]}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoIds[currentVideoIndex]}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${result.name} tutorial`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : fetchingVideo ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                    <div className="w-10 h-10 border-4 border-[var(--caution-yellow)]/20 border-t-[var(--caution-yellow)] animate-spin" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Buffering...</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <span className="text-xs text-white font-black uppercase tracking-widest italic">No visual relay available</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <button
                onClick={roll}
                className="flex-1 py-6 bg-[var(--safety-orange)] text-white border-4 border-black font-black uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[8px_8px_0px_#000] transition-all"
              >
                Roll Again
              </button>
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-6 bg-white text-black border-4 border-black font-black uppercase tracking-widest hover:bg-slate-100 shadow-[8px_8px_0px_#000] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel Card */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] overflow-y-auto flex flex-col items-center justify-start py-12 px-4 md:px-6 animate-in fade-in duration-300"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-3xl bg-[var(--background)] border-8 border-black p-10 md:p-14 shadow-[12px_12px_0px_#000] relative animate-in zoom-in-95 duration-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-14">
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white tracking-tighter italic uppercase drop-shadow-[4px_4px_0px_#000]">Session Logic</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black w-fit px-2 py-0.5">Configure Dice Parameters</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center text-black hover:bg-[var(--safety-orange)] hover:text-white transition-all shadow-[4px_4px_0px_#000]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                  className={`flex flex-col gap-2 p-8 border-4 border-black text-left transition-all shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                    settings.excludeLanded ? "bg-[var(--safety-orange)] text-white" : "bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-widest ${settings.excludeLanded ? "text-white/60" : "text-slate-400"}`}>Filter Mode</span>
                  <span className="text-xl font-black uppercase tracking-tight italic">Exclude Landed</span>
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                  className={`flex flex-col gap-2 p-8 border-4 border-black text-left transition-all shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                    settings.excludeLocked ? "bg-[var(--caution-yellow)] text-black" : "bg-white text-black hover:bg-slate-50"
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-widest ${settings.excludeLocked ? "text-black/40" : "text-slate-400"}`}>Filter Mode</span>
                  <span className="text-xl font-black uppercase tracking-tight italic">Exclude Locked</span>
                </button>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black px-2 py-0.5">Levels</span>
                <div className="flex flex-wrap gap-3">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className={`w-16 h-16 text-xl font-black transition-all border-4 border-black shadow-[4px_4px_0px_#000] ${
                        settings.levels.includes(lvl)
                          ? "bg-[var(--safety-orange)] text-white scale-110 -rotate-3"
                          : "bg-white text-black hover:bg-[var(--caution-yellow)]"
                      }`}
                    >
                      L{lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black px-2 py-0.5">Categories</span>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-2 border-black shadow-[3px_3px_0px_#000] ${
                        settings.categories.includes(cat)
                          ? "bg-white text-black"
                          : "bg-black text-slate-500 border-white/10 hover:text-white"
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
      {/* Header Inline Controls - More compact for mobile */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-11 h-11 md:w-14 md:h-14 bg-white border-4 border-black flex items-center justify-center text-black hover:bg-[var(--caution-yellow)] transition-all shadow-[4px_4px_0px_#000] group shrink-0"
          title="Dice Parameters"
        >
          <GearIcon size={20} />
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`h-11 md:h-14 px-4 md:px-8 flex items-center gap-2 md:gap-4 transition-all border-4 border-black shrink-0 shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            rolling 
              ? "bg-zinc-800 text-slate-500" 
              : "bg-[var(--safety-orange)] text-white hover:brightness-110"
          }`}
        >
          <div className={rolling ? "animate-spin" : ""}>
            <DiceIcon size={20} />
          </div>
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
            {rolling ? "..." : "Roll"}
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
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="group-hover:rotate-180 transition-transform duration-700"
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
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="1" ry="1" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

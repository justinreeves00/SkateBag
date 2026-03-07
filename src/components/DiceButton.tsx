"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { setTrickStatus } from "@/lib/trick-actions";
import type { TrickWithStatus, TrickCategory, DiceFilterSettings, TrickStatus } from "@/lib/types";

interface DiceButtonProps {
  tricks: TrickWithStatus[];
  isAuthenticated: boolean;
  onStatusChange?: (id: string, status: TrickStatus | null, consistency: number | null) => void;
}

const CATEGORY_OPTIONS: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill",
];

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export function DiceButton({ tricks, isAuthenticated, onStatusChange }: DiceButtonProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [result, setResult] = useState<TrickWithStatus | null>(null);
  const [rolling, setRolling] = useState(false);
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [searchMode, setSearchMode] = useState<"query" | "exact">("query");
  const [mounted, setMounted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [settings, setSettings] = useState<DiceFilterSettings>({
    excludeLanded: false,
    excludeLocked: false,
    categories: ["flatground"],
    levels: [...LEVEL_OPTIONS],
    consistencyMode: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchVideos = (mode: "query" | "exact", trick: TrickWithStatus) => {
    const q = trick.name;
    setFetchingVideo(true);
    setVideoIds([]);
    setCurrentVideoIndex(0);
    setSearchMode(mode);
    fetch(`/api/youtube?q=${encodeURIComponent(q)}&mode=${mode}`)
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
    setShowPrompt(false);

    let pool = tricks.filter((t) =>
      settings.categories.includes(t.category as TrickCategory)
    );
    
    pool = pool.filter((t) => t.difficulty !== null && settings.levels.includes(t.difficulty));
    
    if (settings.consistencyMode) {
      pool = pool.filter((t) => t.userStatus === "landed");
    } else {
      if (settings.excludeLanded) pool = pool.filter((t) => t.userStatus !== "landed" && t.userStatus !== "locked");
      if (settings.excludeLocked) pool = pool.filter((t) => t.userStatus !== "locked");
    }

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

  async function handleStatusToggle(newStatus: TrickStatus, value: number | null = null) {
    if (!isAuthenticated || updating || !result) return;
    setUpdating(true);

    const resultId = result.id;
    
    if (onStatusChange) {
      onStatusChange(resultId, newStatus, value);
    }
    
    const res = await setTrickStatus(resultId, newStatus, value);
    
    if (res.success) {
      // Close overlays on success
      setResult(null);
      setShowPrompt(false);
    }
    setUpdating(false);
  }

  function selectCategory(cat: TrickCategory | "all") {
    setSettings((prev) => ({
      ...prev,
      categories: [cat === "all" ? "flatground" : cat],
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
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] overflow-y-auto flex flex-col items-center justify-start py-6 px-3 md:px-6 animate-in fade-in duration-500"
          onClick={() => { if(!showPrompt) setResult(null); }}
        >
          <div 
            className="max-w-3xl w-full bg-[var(--surface)] rounded-2xl p-5 md:p-10 border border-[var(--board-accent)] shadow-lg shadow-black/30 space-y-6 animate-in zoom-in-95 duration-300 relative my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* 10 Tries Prompt Overlay (Internal to Card) */}
            {showPrompt && (
              <div className="absolute inset-0 z-[100] bg-black/98 rounded-2xl p-6 md:p-10 flex flex-col justify-center animate-in fade-in duration-300 border-2 border-[var(--warn-accent)]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <button 
                  onClick={() => setShowPrompt(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-white border border-white/10 transition-all hover:scale-110 active:scale-95"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <span className="px-3 py-1 rounded-full bg-[var(--warn-accent)]/10 text-[var(--warn-accent)] text-[9px] font-black uppercase tracking-[0.3em] border border-[var(--warn-accent)]/20 shadow-lg">Bag Check</span>
                    <h4 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-tight">Session Test</h4>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-black/40 py-1.5 border border-white/5 rounded-lg max-w-[240px] mx-auto">Landed reps out of 10</p>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {[...Array(11)].map((_, i) => (
                      <button
                        key={i}
                        disabled={updating}
                        onClick={() => handleStatusToggle("locked", i)}
                        className={`h-10 md:h-12 flex items-center justify-center text-base font-black border-2 transition-all rounded-xl ${
                          updating
                            ? "opacity-50 grayscale"
                            : "bg-black/40 text-[var(--text-muted)] hover:bg-[var(--warn-accent)]/20 hover:text-[var(--warn-accent)] hover:border-[var(--warn-accent)]/50 border-white/5 hover:scale-105 active:scale-90"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setShowPrompt(false)}
                    className="w-full py-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-md bg-[var(--board-accent)]/10 text-[var(--board-accent)] text-[8px] font-black uppercase tracking-[0.25em] border border-[var(--board-accent)]/20">You Rolled</span>
              
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white italic leading-[0.9] uppercase">
                {result.name}
              </h2>
              
              <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                <span className="text-[var(--text-muted)] text-[11px] font-black uppercase tracking-wider">{result.category}</span>
                <span className="text-[var(--board-accent)] text-[10px]">•</span>
                <span className="text-[var(--board-accent)] text-[11px] font-black uppercase tracking-wider italic">Level {result.difficulty}</span>
                <span className="text-[var(--board-accent)] text-[10px]">•</span>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--board-accent)] hover:border-[var(--board-accent)]/30 transition-all"
                  title="Change Roll Settings"
                >
                  <FilterIcon size={10} />
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em]">Trick Feed</span>
                <div className="flex gap-3">
                  {searchMode === "query" && (
                    <button 
                      onClick={tryExact}
                      className="text-[8px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors"
                    >
                      Exact 🎯
                    </button>
                  )}
                  {videoIds.length > 1 && (
                    <div className="flex gap-2">
                      <button 
                        onClick={prevVideo}
                        className="text-[8px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors"
                      >
                        Prev
                      </button>
                      <button 
                        onClick={nextVideo}
                        className="text-[8px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors"
                      >
                        Next ({currentVideoIndex + 1}/{videoIds.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="aspect-video w-full bg-black/60 rounded-2xl overflow-hidden border border-[var(--border)] relative shadow-inner group/video">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-3 border-[var(--board-accent)]/20 border-t-[var(--board-accent)] rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Searching...</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] italic">Video unavailable</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {isAuthenticated && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={updating}
                    onClick={() => handleStatusToggle("learning")}
                    className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 text-[8px] ${
                      result.userStatus === "learning"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border-blue-500/20"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                    <span>Learning</span>
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleStatusToggle("landed")}
                    className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 text-[8px] ${
                      result.userStatus === "landed" || result.userStatus === "locked"
                        ? "bg-[var(--board-accent)] text-[#041316] border-[var(--board-accent)]"
                        : "bg-[var(--board-accent)]/10 text-[var(--board-accent)] hover:bg-[var(--board-accent)] hover:text-[#041316] border-[var(--board-accent)]/30"
                    }`}
                  >
                    <CheckIcon size={14} />
                    <span>Landed</span>
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => setShowPrompt(true)}
                    className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 text-[8px] ${
                      result.userStatus === "locked"
                        ? "bg-[var(--warn-accent)] text-black border-[var(--warn-accent)]"
                        : "bg-[var(--warn-accent)]/10 text-[var(--warn-accent)] hover:bg-[var(--warn-accent)] hover:text-black border-[var(--warn-accent)]/30"
                    }`}
                  >
                    <LockIcon size={12} />
                    <span>Lock it</span>
                  </button>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={roll}
                  className={`flex-1 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${rolling ? "opacity-50" : ""}`}
                >
                  <div className={rolling ? "animate-spin" : ""}>
                    <DiceIcon size={16} />
                  </div>
                  <span>Roll Again</span>
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 bg-[var(--surface-muted)] text-[var(--text-muted)] rounded-xl font-black uppercase tracking-widest hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all border border-[var(--border)] text-[10px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel Card */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] overflow-y-auto flex flex-col items-center justify-start py-4 px-3 md:px-6 animate-in fade-in duration-300"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-lg bg-[var(--surface)] rounded-2xl p-4 md:p-5 border border-[var(--border)] shadow-2xl relative animate-in zoom-in-95 duration-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-white tracking-tighter italic uppercase">Dice Settings</h3>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Configure Roll</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all shadow-lg"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => setSettings((s) => ({ ...s, consistencyMode: !s.consistencyMode }))}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    settings.consistencyMode ? "bg-[var(--warn-accent)]/20 border-[var(--warn-accent)] shadow-lg shadow-black/30" : "bg-[var(--surface-muted)] border-[var(--border)] text-slate-600 hover:border-[var(--warn-accent)]/35 hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="flex flex-col gap-0">
                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${settings.consistencyMode ? "text-[var(--warn-accent)]" : "text-[var(--text-muted)]"}`}>Mission Mode</span>
                    <span className={`text-[11px] font-black uppercase tracking-tight ${settings.consistencyMode ? "text-white" : ""}`}>Roll for Consistency</span>
                  </div>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${settings.consistencyMode ? "bg-[var(--warn-accent)] border-[var(--warn-accent)] text-black rotate-12" : "border-white/10 text-slate-700"}`}>
                    <LockIcon size={12} />
                  </div>
                </button>
                <p className="text-[8px] text-slate-500 font-medium leading-relaxed px-1">
                  Roll only from your <span className="text-[var(--board-accent)]">Landed</span> list to test consistency.
                </p>
              </div>

              {!settings.consistencyMode && (
                <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-4 duration-300">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                    className={`flex flex-col gap-0 p-2.5 rounded-xl border text-left transition-all ${
                      settings.excludeLanded ? "bg-[var(--board-accent)]/20 border-[var(--board-accent)] shadow-lg shadow-black/30" : "bg-[var(--surface-muted)] border-[var(--border)] text-slate-600 hover:border-[var(--board-accent)]/35 hover:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${settings.excludeLanded ? "text-[var(--board-accent)]" : "text-[var(--text-muted)]"}`}>Filter</span>
                    <span className={`text-[11px] font-black uppercase tracking-tight ${settings.excludeLanded ? "text-white" : ""}`}>Exclude Landed</span>
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                    className={`flex flex-col gap-0 p-2.5 rounded-xl border text-left transition-all ${
                      settings.excludeLocked ? "bg-[#f59e0b]/20 border-[#f59e0b] shadow-lg shadow-black/30" : "bg-[var(--surface-muted)] border-[var(--border)] text-slate-600 hover:border-[var(--board-accent)]/35 hover:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${settings.excludeLocked ? "text-[#f59e0b]" : "text-[var(--text-muted)]"}`}>Filter</span>
                    <span className={`text-[11px] font-black uppercase tracking-tight ${settings.excludeLocked ? "text-white" : ""}`}>Exclude Locked</span>
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Levels</span>
                <div className="flex flex-wrap gap-1.5">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all border ${
                        settings.levels.includes(lvl)
                          ? "bg-[var(--board-accent)] text-[#041316] border-[var(--board-accent)] shadow-lg shadow-black/30 scale-105"
                          : "bg-[var(--surface-muted)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-muted)]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.12em] transition-all border ${
                        settings.categories.length === 1 && settings.categories.includes(cat)
                          ? "bg-[var(--surface-elevated)] text-white border-white/20 shadow-lg scale-105"
                          : "bg-[var(--surface-muted)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-muted)]"
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
      {/* Floating Dice Button - Anchored to middle-right */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[90]">
        {/* Two-Panel Unified Button */}
        <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
          {/* Roll Button - Top Panel */}
          <button
            onClick={roll}
            disabled={rolling}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-14 h-14 flex items-center justify-center transition-all ${
              rolling 
                ? "bg-[var(--surface-muted)] scale-95" 
                : "bg-[var(--board-accent)] hover:brightness-110 active:scale-95"
            }`}
            title="Roll Dice"
          >
            <div className={`transition-transform duration-300 ${rolling ? "animate-spin" : isHovered ? "animate-[dice-roll_0.5s_ease-in-out]" : ""}`}>
              <DiceIcon size={26} />
            </div>
          </button>
          
          {/* Settings Button - Bottom Panel */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-14 h-14 flex items-center justify-center transition-all border-t border-white/10 ${
              showSettings 
                ? "bg-[var(--board-accent)] text-black" 
                : "bg-[#1c1c1e] text-slate-500 hover:text-white"
            }`}
            title="Dice Settings"
          >
            <FilterIcon size={18} />
          </button>
        </div>
      </div>

      {mounted && createPortal(overlays, document.body)}
    </>
  );
}

function FilterIcon({ size = 24 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="group-hover:scale-110 transition-transform"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
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
      strokeWidth="3"
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

function CheckIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17L4 12"/>
    </svg>
  );
}

function LockIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="1" ry="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

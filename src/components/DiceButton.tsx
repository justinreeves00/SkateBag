"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { setTrickStatus } from "@/lib/trick-actions";
import type { TrickWithStatus, TrickCategory, DiceFilterSettings, TrickStatus } from "@/lib/types";

interface DiceButtonProps {
  tricks: TrickWithStatus[];
  isAuthenticated: boolean;
}

const CATEGORY_OPTIONS: TrickCategory[] = [
  "flatground", "street", "ledge/rail", "transition", "gaps", "freestyle", "downhill",
];

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export function DiceButton({ tricks, isAuthenticated }: DiceButtonProps) {
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
  const [settings, setSettings] = useState<DiceFilterSettings>({
    excludeLanded: false,
    excludeLocked: false,
    categories: [...CATEGORY_OPTIONS],
    levels: [...LEVEL_OPTIONS],
    consistencyMode: false,
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
    setShowPrompt(false);

    let pool = tricks.filter((t) =>
      settings.categories.includes(t.category as TrickCategory)
    );
    
    pool = pool.filter((t) => t.difficulty !== null && settings.levels.includes(t.difficulty));
    
    if (settings.consistencyMode) {
      pool = pool.filter((t) => t.userStatus === "landed");
    } else if (settings.projectMode) {
      pool = pool.filter((t) => t.userStatus === "learning");
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
      categories: cat === "all" ? [...CATEGORY_OPTIONS] : [cat],
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
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] overflow-y-auto flex flex-col items-center justify-start py-12 px-4 md:px-8 animate-in fade-in duration-500"
          onClick={() => { if(!showPrompt) setResult(null); }}
        >
          <div 
            className="max-w-3xl w-full bg-[var(--surface)] rounded-3xl p-8 md:p-14 border border-[var(--board-accent)] shadow-lg shadow-black/30 space-y-10 animate-in zoom-in-95 duration-300 relative my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* 10 Tries Prompt Overlay (Internal to Card) */}
            {showPrompt && (
              <div className="absolute inset-0 z-[100] bg-black/98 rounded-3xl p-8 md:p-14 flex flex-col justify-center animate-in fade-in duration-300 border-2 border-[var(--warn-accent)]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <button 
                  onClick={() => setShowPrompt(false)}
                  className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-white border border-white/10 transition-all hover:scale-110 active:scale-95"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                
                <div className="space-y-12">
                  <div className="text-center space-y-4">
                    <span className="px-4 py-1.5 rounded-full bg-[var(--warn-accent)]/10 text-[var(--warn-accent)] text-[10px] font-black uppercase tracking-[0.4em] border border-[var(--warn-accent)]/20 shadow-lg">Bag Check</span>
                    <h4 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-tight">Session Test</h4>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest bg-black/40 py-2 border border-white/5 rounded-lg max-w-[280px] mx-auto">Landed reps out of 10</p>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {[...Array(11)].map((_, i) => (
                      <button
                        key={i}
                        disabled={updating}
                        onClick={() => handleStatusToggle("locked", i)}
                        className={`h-14 md:h-16 flex items-center justify-center text-lg font-black border-2 transition-all rounded-2xl ${
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
                    className="w-full py-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="text-center space-y-6">
              <span className="px-5 py-2 rounded-xl bg-[var(--board-accent)]/10 text-[var(--board-accent)] text-[10px] font-black uppercase tracking-[0.4em] border border-[var(--board-accent)]/20 shadow-lg shadow-black/30">Next Mission</span>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white italic leading-[0.9] uppercase">
                {result.name}
              </h2>
              <div className="flex items-center justify-center gap-6 text-[var(--text-muted)] text-sm font-black uppercase tracking-[0.2em]">
                <span>{result.category}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--board-accent)] shadow-lg shadow-black/30" />
                <span className="text-[var(--board-accent)] italic">Tier {result.difficulty}</span>
              </div>
            </div>

            {/* Video Player */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Trick Feed</span>
                <div className="flex gap-4">
                  {searchMode === "query" && (
                    <button 
                      onClick={tryExact}
                      className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors"
                    >
                      Exact Search 🎯
                    </button>
                  )}
                  {videoIds.length > 1 && (
                    <div className="flex gap-3">
                      <button 
                        onClick={prevVideo}
                        className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors"
                      >
                        Prev
                      </button>
                      <button 
                        onClick={nextVideo}
                        className="text-[9px] font-black text-[var(--board-accent)] uppercase tracking-widest hover:text-[var(--foreground)] transition-colors"
                      >
                        Next ({currentVideoIndex + 1}/{videoIds.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="aspect-video w-full bg-black/60 rounded-3xl overflow-hidden border border-[var(--border)] relative shadow-inner group/video">
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
            <div className="grid grid-cols-1 gap-5 pt-4">
              {isAuthenticated && (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    disabled={updating}
                    onClick={() => handleStatusToggle("learning")}
                    className="flex-1 py-4 bg-blue-500/10 text-blue-400 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-[9px]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                    <span>Learning</span>
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleStatusToggle("landed")}
                    className="flex-1 py-4 bg-[var(--board-accent)]/10 text-[var(--board-accent)] rounded-2xl font-black uppercase tracking-widest hover:bg-[var(--board-accent)] hover:text-[#041316] transition-all border border-[var(--board-accent)]/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-[9px]"
                  >
                    <CheckIcon size={16} />
                    <span>Landed</span>
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => setShowPrompt(true)}
                    className="flex-1 py-4 bg-[var(--warn-accent)]/10 text-[var(--warn-accent)] rounded-2xl font-black uppercase tracking-widest hover:bg-[var(--warn-accent)] hover:text-black transition-all border border-[var(--warn-accent)]/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-[9px]"
                  >
                    <LockIcon size={14} />
                    <span>Lock it</span>
                  </button>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-5">
                <button
                  onClick={roll}
                  className={`flex-1 py-6 bg-white text-black rounded-3xl font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${rolling ? "opacity-50" : ""}`}
                >
                  <div className={rolling ? "animate-spin" : ""}>
                    <DiceIcon size={20} />
                  </div>
                  <span>Roll Again</span>
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-6 bg-[var(--surface-muted)] text-[var(--text-muted)] rounded-3xl font-black uppercase tracking-widest hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all border border-[var(--border)]"
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
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] overflow-y-auto flex flex-col items-center justify-start py-12 px-4 md:px-6 animate-in fade-in duration-300"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-3xl bg-[var(--surface)] rounded-3xl p-10 md:p-14 border border-[var(--border)] shadow-2xl relative animate-in zoom-in-95 duration-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-14">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">Dice Settings</h3>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Configure Roll Parameters</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-14 h-14 rounded-3xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)] transition-all shadow-xl"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  onClick={() => setSettings((s) => ({ ...s, consistencyMode: !s.consistencyMode, projectMode: false }))}
                  className={`flex items-center justify-between p-6 rounded-3xl border text-left transition-all ${
                    settings.consistencyMode ? "bg-[var(--warn-accent)]/20 border-[var(--warn-accent)] shadow-lg shadow-black/30" : "bg-[var(--surface-muted)] border-[var(--border)] text-slate-600 hover:border-[var(--warn-accent)]/35 hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${settings.consistencyMode ? "text-[var(--warn-accent)]" : "text-[var(--text-muted)]"}`}>Mission Mode</span>
                    <span className={`text-base font-black uppercase tracking-tight ${settings.consistencyMode ? "text-white" : ""}`}>Roll for Consistency</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${settings.consistencyMode ? "bg-[var(--warn-accent)] border-[var(--warn-accent)] text-black rotate-12" : "border-white/10 text-slate-700"}`}>
                    <LockIcon size={20} />
                  </div>
                </button>

                <button
                  onClick={() => setSettings((s) => ({ ...s, projectMode: !s.projectMode, consistencyMode: false }))}
                  className={`flex items-center justify-between p-6 rounded-3xl border text-left transition-all ${
                    settings.projectMode ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-black/30" : "bg-[var(--surface-muted)] border-[var(--border)] text-slate-600 hover:border-blue-500/35 hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${settings.projectMode ? "text-blue-400" : "text-[var(--text-muted)]"}`}>Project Mode</span>
                    <span className={`text-base font-black uppercase tracking-tight ${settings.projectMode ? "text-white" : ""}`}>Roll for Projects</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${settings.projectMode ? "bg-blue-500 border-blue-500 text-white -rotate-12" : "border-white/10 text-slate-700"}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
                  </div>
                </button>
              </div>

              {!settings.consistencyMode && !settings.projectMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in slide-in-from-top-4 duration-300">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, excludeLanded: !s.excludeLanded }))}
                    className={`flex flex-col gap-2 p-8 rounded-3xl border text-left transition-all ${
                      settings.excludeLanded ? "bg-[var(--board-accent)]/20 border-[var(--board-accent)] shadow-lg shadow-black/30" : "bg-[var(--surface-muted)] border-[var(--border)] text-slate-600 hover:border-[var(--board-accent)]/35 hover:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${settings.excludeLanded ? "text-[var(--board-accent)]" : "text-[var(--text-muted)]"}`}>Filter Mode</span>
                    <span className={`text-lg font-black uppercase tracking-tight ${settings.excludeLanded ? "text-white" : ""}`}>Exclude Landed</span>
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, excludeLocked: !s.excludeLocked }))}
                    className={`flex flex-col gap-2 p-8 rounded-3xl border text-left transition-all ${
                      settings.excludeLocked ? "bg-[#f59e0b]/20 border-[#f59e0b] shadow-lg shadow-black/30" : "bg-[var(--surface-muted)] border-[var(--border)] text-slate-600 hover:border-[var(--board-accent)]/35 hover:bg-[var(--surface-elevated)]"
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${settings.excludeLocked ? "text-[#f59e0b]" : "text-[var(--text-muted)]"}`}>Filter Mode</span>
                    <span className={`text-lg font-black uppercase tracking-tight ${settings.excludeLocked ? "text-white" : ""}`}>Exclude Locked</span>
                  </button>
                </div>
              )}

              <div className="space-y-6">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Levels</span>
                <div className="flex flex-wrap gap-3">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => toggleLevel(lvl)}
                      className={`w-16 h-16 rounded-3xl text-base font-black transition-all border ${
                        settings.levels.includes(lvl)
                          ? "bg-[var(--board-accent)] text-[#041316] border-[var(--board-accent)] shadow-lg shadow-black/30 scale-110"
                          : "bg-[var(--surface-muted)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-muted)]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Categories</span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => selectCategory("all")}
                    className={`px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                      settings.categories.length === CATEGORY_OPTIONS.length
                        ? "bg-[var(--surface-elevated)] text-white border-white/20 shadow-lg scale-105"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-muted)]"
                    }`}
                  >
                    ALL
                  </button>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className={`px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
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
      {/* Header Inline Controls - More compact for mobile */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-11 h-11 md:w-14 md:h-14 rounded-3xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--board-accent)] transition-all shadow-xl group shrink-0"
          title="Dice Settings"
        >
          <GearIcon size={20} />
        </button>
        <button
          onClick={roll}
          disabled={rolling}
          className={`h-11 md:h-14 px-4 md:px-8 rounded-3xl flex items-center gap-2 md:gap-4 transition-all border border-transparent shrink-0 ${
            rolling 
              ? "bg-[var(--surface-muted)] border-[var(--border)] scale-95" 
              : "bg-[var(--board-accent)] text-[#041316] hover:brightness-110 hover:scale-105 active:scale-95 shadow-lg shadow-black/30"
          }`}
        >
          <div className={rolling ? "animate-spin" : ""}>
            <DiceIcon size={20} />
          </div>
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">
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
      strokeWidth="3" 
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

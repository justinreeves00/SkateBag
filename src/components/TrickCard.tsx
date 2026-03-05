"use client";

import { useState, useEffect } from "react";
import { setTrickStatus, submitTrickLevelSuggestion } from "@/lib/trick-actions";
import type { TrickWithStatus, TrickStatus } from "@/lib/types";

interface TrickCardProps {
  trick: TrickWithStatus;
  isAuthenticated: boolean;
}

export function TrickCard({ trick, isAuthenticated }: TrickCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<TrickStatus | null>(trick.userStatus);
  const [consistency, setConsistency] = useState<number | null>(trick.userConsistency);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLevelEdit, setShowLevelEdit] = useState(false);
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [searchMode, setSearchMode] = useState<"query" | "exact">("query");

  const fetchVideos = (mode: "query" | "exact") => {
    const q = mode === "exact" ? trick.name : (trick.youtube_query || trick.name);
    setFetchingVideo(true);
    setSearchMode(mode);
    fetch(`/api/youtube?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.videoIds && data.videoIds.length > 0) {
          setVideoIds(data.videoIds);
          setCurrentVideoIndex(0);
        }
      })
      .finally(() => setFetchingVideo(false));
  };

  useEffect(() => {
    if (expanded && videoIds.length === 0 && !fetchingVideo) {
      fetchVideos("query");
    }
  }, [expanded, trick.youtube_query, videoIds.length, fetchingVideo]);

  async function handleStatusToggle(newStatus: TrickStatus, value: number | null = null) {
    if (!isAuthenticated || loading) return;
    setLoading(true);

    const nextStatus = (status === newStatus && value === null) ? null : newStatus;
    const nextConsistency = value;

    setStatus(nextStatus);
    setConsistency(nextConsistency);
    
    const result = await setTrickStatus(trick.id, nextStatus, nextConsistency);
    if (result.error) {
      setStatus(status);
      setConsistency(consistency);
    }
    setLoading(false);
    setShowPrompt(false);
  }

  async function handleLevelSuggestion(level: number) {
    if (!isAuthenticated || loading) return;
    setLoading(true);
    const result = await submitTrickLevelSuggestion(trick.id, level);
    if (result.success) {
      setSuggestionSubmitted(true);
      setTimeout(() => {
        setShowLevelEdit(false);
        setSuggestionSubmitted(false);
      }, 2000);
    }
    setLoading(false);
  }

  const nextVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentVideoIndex((prev) => (prev + 1) % videoIds.length);
  };

  const prevVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentVideoIndex((prev) => (prev - 1 + videoIds.length) % videoIds.length);
  };

  const tryExact = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchVideos("exact");
  };

  return (
    <div
      className={`sticker-card flex flex-col group ${
        expanded ? "rotate-0 scale-[1.01] z-10 shadow-2xl" : "rotate-[0.5deg]"
      }`}
    >
      {/* Interactive Zone */}
      <div
        className="p-6 flex flex-col gap-5 cursor-pointer relative"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl font-black tracking-tight text-white uppercase italic drop-shadow-md">
                {trick.name}
              </h3>
              {trick.difficulty && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAuthenticated) setShowLevelEdit(!showLevelEdit);
                  }}
                  className="text-[10px] px-2 py-0.5 bg-black text-[var(--caution-yellow)] font-black uppercase border-2 border-[var(--caution-yellow)] shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] transition-transform"
                >
                  LVL {trick.difficulty}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
                {trick.category}
              </span>
              {status && (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                  status === "landed" ? "bg-[var(--safety-orange)] text-white" : "bg-[var(--caution-yellow)] text-black"
                }`}>
                  {status === "landed" ? "Landed" : `Locked (${consistency ?? 0}/10)`}
                </span>
              )}
            </div>
          </div>

          <div className={`w-10 h-10 flex items-center justify-center border-4 border-black bg-white text-black transition-all duration-300 ${expanded ? "rotate-180 bg-[var(--safety-orange)] text-white" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Level Edit Overlay */}
        {showLevelEdit && (
          <div className="bg-black/80 p-5 border-4 border-black space-y-4 animate-in slide-in-from-top-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[var(--caution-yellow)] uppercase tracking-widest">Suggest Level Change</span>
              <button onClick={() => setShowLevelEdit(false)} className="text-white hover:text-[var(--safety-orange)] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            {suggestionSubmitted ? (
              <p className="text-[var(--safety-orange)] text-xs font-black uppercase text-center py-2 italic bg-white border-2 border-black">Sent! 🛹</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleLevelSuggestion(lvl)}
                    className={`h-10 font-black text-xs transition-all border-2 border-black shadow-[2px_2px_0px_#000] ${
                      trick.difficulty === lvl 
                        ? "bg-[var(--caution-yellow)] text-black" 
                        : "bg-white text-black hover:bg-[var(--safety-orange)] hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Log Buttons */}
        {isAuthenticated && (
          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleStatusToggle("landed")}
              className={`flex-1 h-12 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                status === "landed"
                  ? "bg-[var(--safety-orange)] text-white"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
              disabled={loading}
            >
              <CheckIcon size={18} />
              <span>Landed</span>
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className={`flex-1 h-12 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                status === "locked"
                  ? "bg-[var(--caution-yellow)] text-black"
                  : "bg-white text-black hover:bg-slate-100"
              }`}
              disabled={loading}
            >
              <LockIcon size={16} />
              <span>Locked</span>
            </button>
          </div>
        )}
      </div>

      {/* 10 Tries Overlay */}
      {showPrompt && (
        <div className="absolute inset-0 z-20 bg-black/95 p-8 flex flex-col justify-center animate-in fade-in duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowPrompt(false); }}
            className="absolute top-6 right-6 w-10 h-10 bg-white text-black flex items-center justify-center border-4 border-black hover:bg-[var(--safety-orange)] hover:text-white transition-colors shadow-[4px_4px_0px_#000]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h4 className="text-4xl font-black tracking-tighter text-[var(--caution-yellow)] uppercase italic drop-shadow-lg">Session Test</h4>
              <p className="text-white text-sm font-black uppercase tracking-widest bg-white/10 py-1">Perform 10 attempts now</p>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleStatusToggle("locked", i); }}
                  className={`h-12 flex items-center justify-center text-sm font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-all ${
                    consistency === i && status === "locked"
                      ? "bg-[var(--safety-orange)] text-white scale-110"
                      : "bg-white text-black hover:bg-[var(--caution-yellow)]"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
          <div className="h-1 w-full bg-black/20" />

          {/* Video Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black px-2 py-1">Trick Feed</span>
              <div className="flex gap-2">
                {searchMode === "query" && (
                  <button 
                    onClick={tryExact}
                    className="text-[9px] font-black text-black uppercase tracking-widest bg-[var(--caution-yellow)] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-[-1px]"
                  >
                    Exact Match 🎯
                  </button>
                )}
                {videoIds.length > 1 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={prevVideo}
                      className="text-[9px] font-black text-black uppercase tracking-widest bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-[-1px]"
                    >
                      Prev
                    </button>
                    <button 
                      onClick={nextVideo}
                      className="text-[9px] font-black text-black uppercase tracking-widest bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-y-[-1px]"
                    >
                      Next ({currentVideoIndex + 1}/{videoIds.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-[4/3] sm:aspect-video w-full bg-black border-4 border-black shadow-xl overflow-hidden relative">
              {videoIds.length > 0 ? (
                <iframe
                  key={videoIds[currentVideoIndex]}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoIds[currentVideoIndex]}?autoplay=0&rel=0&modestbranding=1`}
                  title={`${trick.name} tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : fetchingVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                  <div className="w-8 h-8 border-4 border-[var(--caution-yellow)]/20 border-t-[var(--caution-yellow)] animate-spin" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Searching...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <span className="text-xs text-white font-black uppercase tracking-widest italic">Video unavailable</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {trick.history && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-white bg-black px-2 py-0.5 uppercase tracking-widest w-fit block">Intel</span>
                  <p className="text-sm text-black font-medium leading-relaxed italic border-l-4 border-[var(--safety-orange)] pl-4">{trick.history}</p>
                </div>
              )}
              
              <div className="flex gap-12">
                {trick.inventor && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Creator</span>
                    <p className="text-sm text-black font-black uppercase italic">{trick.inventor}</p>
                  </div>
                )}
                {trick.year && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Year</span>
                    <p className="text-sm text-black font-black uppercase">{trick.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metric */}
            <div className="grip-tape p-8 flex flex-col items-center justify-center text-center gap-4 border-4 border-black">
              <div className={`w-20 h-20 flex items-center justify-center transition-all duration-1000 border-4 border-black ${
                status === "landed" ? "bg-[var(--safety-orange)] rotate-6 scale-110 shadow-[8px_8px_0px_#000]" : "bg-white/5"
              }`}>
                {status === "landed" ? <CheckIcon size={40} color="white" /> : <SkateboardIcon size={40} color="rgba(255,255,255,0.1)" />}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  {status === "landed" ? "Bagged!" : "Practice Session"}
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                  {status === "landed" ? "Logged in your bag" : "Repeat until consistent"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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

function SkateboardIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11h2a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2h2"/>
      <circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/>
      <path d="M6 15h12"/>
    </svg>
  );
}

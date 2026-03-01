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
      className={`aurora-card rounded-[2.5rem] flex flex-col group ${
        expanded ? "bg-white/[0.08] ring-1 ring-white/20" : ""
      }`}
    >
      {/* Interactive Zone */}
      <div
        className="p-7 flex flex-col gap-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                {trick.name}
              </h3>
              {trick.difficulty && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAuthenticated) setShowLevelEdit(!showLevelEdit);
                  }}
                  className="text-[9px] px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5 font-black uppercase tracking-tighter hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
                >
                  LVL {trick.difficulty}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                {trick.category}
              </span>
              {status && (
                <>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    status === "landed" ? "text-emerald-400" : "text-emerald-200"
                  }`}>
                    {status === "landed" ? "In Bag" : `Locked (${consistency ?? 0}/10)`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${expanded ? "bg-white/10 border-white/20 rotate-180" : "bg-white/5 border-white/5"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Level Edit Overlay */}
        {showLevelEdit && (
          <div className="bg-white/5 p-5 rounded-2xl border border-emerald-500/20 space-y-4 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Suggest Level Change</span>
              <button onClick={() => setShowLevelEdit(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            {suggestionSubmitted ? (
              <p className="text-emerald-400 text-xs font-bold uppercase text-center py-2 italic">Suggestion sent for review! 🛹</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleLevelSuggestion(lvl)}
                    className={`h-10 rounded-xl font-black text-xs transition-all border ${
                      trick.difficulty === lvl 
                        ? "bg-white/10 text-emerald-400 border-white/20" 
                        : "bg-white/5 text-slate-500 border-white/5 hover:text-white hover:border-emerald-500/30"
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
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-500 ${
                status === "landed"
                  ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
              disabled={loading}
            >
              <CheckIcon size={18} />
              <span>Landed</span>
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-500 ${
                status === "locked"
                  ? "bg-emerald-800 text-white shadow-[0_0_30px_rgba(6,78,59,0.4)]"
                  : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 border border-white/5"
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
        <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-3xl p-8 flex flex-col justify-center animate-in fade-in duration-300 rounded-[2.5rem]">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowPrompt(false); }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white border border-white/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h4 className="text-3xl font-black tracking-tighter text-white uppercase italic">Session Test</h4>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Perform 10 attempts now.</p>
            </div>
            
            <div className="grid grid-cols-6 gap-3">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleStatusToggle("locked", i); }}
                  className={`h-12 flex items-center justify-center text-sm font-black rounded-xl transition-all ${
                    consistency === i && status === "locked"
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white border border-white/5"
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
        <div className="px-7 pb-10 space-y-10 animate-in fade-in duration-500">
          <div className="h-px w-full bg-white/5" />

          {/* Video Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Trick Feed</span>
              </div>
              <div className="flex gap-4">
                {searchMode === "query" && (
                  <button 
                    onClick={tryExact}
                    className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Exact Match Search 🎯
                  </button>
                )}
                {videoIds.length > 1 && (
                  <div className="flex gap-3">
                    <button 
                      onClick={prevVideo}
                      className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Prev Video
                    </button>
                    <button 
                      onClick={nextVideo}
                      className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Next Video ({currentVideoIndex + 1}/{videoIds.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-[4/3] sm:aspect-video w-full bg-black/60 rounded-[2.5rem] overflow-hidden border border-white/10 relative shadow-2xl">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Searching...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-[0.2em] italic">Video unavailable</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-8">
              {trick.history && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Intel</span>
                  <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/20 pl-5">"{trick.history}"</p>
                </div>
              )}
              
              <div className="flex gap-16">
                {trick.inventor && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Creator</span>
                    <p className="text-sm text-white font-bold tracking-tight uppercase">{trick.inventor}</p>
                  </div>
                )}
                {trick.year && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Year</span>
                    <p className="text-sm text-white font-bold tracking-tight uppercase">{trick.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metric */}
            <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-10 flex flex-col items-center justify-center text-center gap-5">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-1000 ${
                status === "landed" ? "bg-emerald-500 rotate-12 shadow-[0_0_60px_rgba(16,185,129,0.3)]" : "bg-white/5"
              }`}>
                {status === "landed" ? <CheckIcon size={48} color="white" /> : <SkateboardIcon size={48} color="#1e293b" />}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                  {status === "landed" ? "Bagged!" : "Practice Session"}
                </p>
                <p className="text-sm text-slate-500 font-medium">
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17L4 12"/>
    </svg>
  );
}

function LockIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function SkateboardIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11h2a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2h2"/>
      <circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/>
      <path d="M6 15h12"/>
    </svg>
  );
}

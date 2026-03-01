"use client";

import { useState, useEffect } from "react";
import { setTrickStatus } from "@/lib/trick-actions";
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
  const [videoId, setVideoId] = useState<string | null>(null);
  const [fetchingVideo, setFetchingVideo] = useState(false);

  // Fetch YouTube video ID only when expanded and if query exists
  useEffect(() => {
    if (expanded && trick.youtube_query && !videoId && !fetchingVideo) {
      setFetchingVideo(true);
      fetch(`/api/youtube?q=${encodeURIComponent(trick.youtube_query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.videoId) setVideoId(data.videoId);
        })
        .finally(() => setFetchingVideo(false));
    }
  }, [expanded, trick.youtube_query, videoId, fetchingVideo]);

  async function handleStatusToggle(newStatus: TrickStatus, value: number | null = null) {
    if (!isAuthenticated || loading) return;
    setLoading(true);

    // If same status and no consistency value provided, toggle off
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

  return (
    <div
      className={`mb-4 rounded-3xl border transition-all duration-500 overflow-hidden ${
        expanded 
          ? "bg-[#121212] border-[#222] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] scale-[1.02] z-10" 
          : "bg-[#080808] border-[#141414] hover:border-[#1a1a1a] hover:bg-[#0a0a0a]"
      }`}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-4 px-6 py-6 cursor-pointer relative group"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status Group - Integrated into layout */}
        {isAuthenticated && (
          <div className="flex bg-[#111] p-1 rounded-2xl border border-[#1a1a1a] shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleStatusToggle("landed")}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                status === "landed"
                  ? "bg-[#e8ff00] text-black shadow-[0_0_20px_rgba(232,255,0,0.2)]"
                  : "text-[#333] hover:text-[#e8ff00] hover:bg-[#1a1a1a]"
              }`}
              disabled={loading}
              title="Mark as Landed"
            >
              <CheckIcon size={22} />
            </button>
            <div className="w-px h-6 bg-[#1a1a1a] self-center mx-1 opacity-50" />
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                status === "locked"
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  : "text-[#333] hover:text-white hover:bg-[#1a1a1a]"
              }`}
              disabled={loading}
              title="Mark as Locked"
            >
              <LockIcon size={20} />
            </button>
          </div>
        )}

        {/* Trick Name & Difficulty */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">
              {trick.name}
            </h3>
            {trick.difficulty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#444] border border-[#222] font-black uppercase tracking-tighter shrink-0">
                LVL {trick.difficulty}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
            <span className="text-[10px] text-[#333] font-black uppercase tracking-[0.2em] truncate">
              {trick.category}
            </span>
            {status && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#222] shrink-0" />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${
                  status === "landed" ? "text-[#e8ff00]" : "text-white"
                }`}>
                  {status === "landed" ? "Landed" : `Locked (${consistency ?? 0}/10)`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div className={`p-2 rounded-full bg-[#111] border border-[#1a1a1a] transition-all duration-500 ${expanded ? "rotate-180 bg-[#1a1a1a]" : "group-hover:border-[#2a2a2a]"}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={expanded ? "#fff" : "#333"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* 10 Tries Prompt - Animated Overlay */}
      {showPrompt && (
        <div className="px-6 pb-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-[#2a2a2a] relative overflow-hidden group/prompt">
            <div className="absolute top-0 right-0 p-2">
              <button 
                onClick={() => setShowPrompt(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#444] hover:text-white hover:bg-black/20 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <LockIcon size={16} color="white" />
              </div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Consistency Check</h4>
            </div>
            
            <p className="text-sm text-[#888] mb-6 leading-relaxed">Go land 10 right now. How many did you make?</p>
            
            <div className="flex flex-wrap gap-2">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleStatusToggle("locked", i)}
                  className={`flex-1 min-w-[40px] h-11 flex items-center justify-center text-xs font-black rounded-xl transition-all ${
                    consistency === i && status === "locked"
                      ? "bg-white text-black shadow-lg"
                      : "bg-white/5 text-[#555] hover:bg-white/10 hover:text-white border border-white/5"
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
        <div className="px-6 pb-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent" />

          {/* YouTube Inline Player */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#e8ff00] animate-pulse" />
                <span className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Live Tutorial</span>
              </div>
              {trick.youtube_query && (
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(trick.youtube_query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em] hover:text-[#e8ff00] transition-colors"
                >
                  Full Search ↗
                </a>
              )}
            </div>

            <div className="aspect-video w-full bg-[#111] rounded-3xl overflow-hidden border border-[#1a1a1a] relative group/video">
              {videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                  title={`${trick.name} tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : fetchingVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#e8ff00]/20 border-t-[#e8ff00] rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-[#333] uppercase tracking-widest">Finding Tutorial...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-[#333] font-bold uppercase tracking-widest italic">Video not found</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Meta Information */}
            <div className="space-y-6">
              {trick.history && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Origins</span>
                  <p className="text-sm text-[#777] leading-relaxed italic">"{trick.history}"</p>
                </div>
              )}
              
              <div className="flex gap-8">
                {trick.inventor && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Inventor</span>
                    <p className="text-xs text-[#999] font-bold uppercase tracking-tight">{trick.inventor}</p>
                  </div>
                )}
                {trick.year && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">Year</span>
                    <p className="text-xs text-[#999] font-bold uppercase tracking-tight">{trick.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Stats (Placeholder/Modern Detail) */}
            <div className="bg-[#111]/50 p-6 rounded-3xl border border-[#1a1a1a] flex flex-col justify-center items-center text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                status === "landed" ? "bg-[#e8ff00] rotate-12 scale-110 shadow-[0_0_30px_rgba(232,255,0,0.2)]" : "bg-white/5 border border-white/5"
              }`}>
                {status === "landed" ? <CheckIcon size={32} color="black" /> : <SkateboardIcon size={32} color="#222" />}
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">
                {status === "landed" ? "Trick Mastery" : "Next Milestone"}
              </p>
              <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest">
                {status === "landed" ? "Landed & Logged" : status === "locked" ? `Locked (${consistency}/10)` : "Ready to practice"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17L4 12"/>
    </svg>
  );
}

function LockIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

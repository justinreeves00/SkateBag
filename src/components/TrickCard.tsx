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
      className={`group/card rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
        expanded 
          ? "bg-[#161a23] border-[#00f2ff]/40 shadow-[0_0_50px_rgba(0,242,255,0.1)] ring-1 ring-[#00f2ff]/20" 
          : "bg-[#11141b] border-[#1e232d] hover:border-[#334155] hover:bg-[#161a23]"
      }`}
    >
      {/* Header Info */}
      <div
        className="flex-1 p-6 flex flex-col gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight font-sans">
                {trick.name}
              </h3>
              {trick.difficulty && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#1e232d] text-[#00f2ff] border border-[#334155] font-mono font-black uppercase tracking-tighter">
                  LVL {trick.difficulty}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#475569] font-mono uppercase tracking-[0.2em]">
              {trick.category}
            </p>
          </div>

          <div className={`p-1.5 rounded-lg border transition-all duration-300 ${expanded ? "bg-[#00f2ff]/10 border-[#00f2ff]/30 rotate-180" : "bg-[#0f1115] border-[#1e232d] group-hover/card:border-[#334155]"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={expanded ? "#00f2ff" : "#475569"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Tactical Status Row */}
        {isAuthenticated && (
          <div className="flex bg-[#0f1115] p-1 rounded-xl border border-[#1e232d] w-fit" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleStatusToggle("landed")}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                status === "landed"
                  ? "bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]"
                  : "text-[#334155] hover:text-[#00f2ff] hover:bg-[#161a23]"
              }`}
              disabled={loading}
              title="Landed"
            >
              <CheckIcon size={18} />
            </button>
            <div className="w-px h-5 bg-[#1e232d] self-center mx-0.5" />
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                status === "locked"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "text-[#334155] hover:text-white hover:bg-[#161a23]"
              }`}
              disabled={loading}
              title="Locked"
            >
              <LockIcon size={16} />
            </button>
            
            {status && (
              <div className="flex flex-col justify-center px-3 border-l border-[#1e232d] ml-1">
                <span className="text-[8px] font-mono text-[#475569] uppercase tracking-widest leading-none mb-1">Status</span>
                <span className={`text-[9px] font-bold uppercase tracking-tighter leading-none ${
                  status === "landed" ? "text-[#00f2ff]" : "text-white"
                }`}>
                  {status === "landed" ? "MASTERED" : `LVL ${consistency ?? 0}/10`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 10 Tries Prompt */}
      {showPrompt && (
        <div className="px-6 pb-6 animate-in fade-in duration-300">
          <div className="bg-[#0f1115] p-5 rounded-xl border border-[#00f2ff]/20 relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[9px] font-mono text-[#00f2ff] uppercase tracking-[0.2em]">CONSISTENCY_CHECK v1.0</h4>
              <button 
                onClick={() => setShowPrompt(false)}
                className="text-[#475569] hover:text-[#00f2ff]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <p className="text-[11px] text-[#475569] mb-4 font-mono uppercase">Landed per 10 Attempts:</p>
            
            <div className="grid grid-cols-6 gap-2">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleStatusToggle("locked", i)}
                  className={`h-9 flex items-center justify-center text-[10px] font-mono font-black rounded-md transition-all ${
                    consistency === i && status === "locked"
                      ? "bg-[#00f2ff] text-black"
                      : "bg-[#161a23] text-[#475569] hover:text-[#00f2ff] border border-[#1e232d]"
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
        <div className="px-6 pb-6 space-y-6 border-t border-[#1e232d] pt-6 animate-in fade-in duration-500 bg-[#0a0c10]/40">
          {/* YouTube Inline Player */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#475569] uppercase tracking-[0.2em]">Visual Reference</span>
              <span className="text-[8px] font-mono text-[#00f2ff] uppercase tracking-widest animate-pulse">Live Link</span>
            </div>

            <div className="aspect-video w-full bg-[#0a0c10] rounded-xl overflow-hidden border border-[#1e232d] relative shadow-inner">
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
                  <div className="w-6 h-6 border-2 border-[#00f2ff]/20 border-t-[#00f2ff] rounded-full animate-spin" />
                  <span className="text-[9px] font-mono text-[#334155] uppercase tracking-widest">Scanning...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-[#334155] font-mono uppercase tracking-widest">[ NO VIDEO DATA ]</span>
                </div>
              )}
            </div>
          </div>

          {/* History/Meta Information */}
          <div className="space-y-4">
            {trick.history && (
              <div className="bg-[#0f1115] p-4 rounded-xl border border-[#1e232d] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00f2ff]/20" />
                <span className="text-[9px] font-mono text-[#475569] uppercase tracking-[0.2em] block mb-2">History File</span>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed italic">{trick.history}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f1115] p-3 rounded-xl border border-[#1e232d]">
                <span className="text-[9px] font-mono text-[#475569] uppercase tracking-[0.2em] block mb-1">Source</span>
                <p className="text-[10px] text-white font-bold uppercase tracking-tight">{trick.inventor || "Unknown"}</p>
              </div>
              <div className="bg-[#0f1115] p-3 rounded-xl border border-[#1e232d]">
                <span className="text-[9px] font-mono text-[#475569] uppercase tracking-[0.2em] block mb-1">Created</span>
                <p className="text-[10px] text-white font-bold uppercase tracking-tight">{trick.year || "----"}</p>
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

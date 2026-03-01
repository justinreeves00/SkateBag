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
      className={`aurora-card rounded-[2rem] flex flex-col group ${
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
              <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                {trick.name}
              </h3>
              {trick.difficulty && (
                <span className="text-[9px] px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5 font-black uppercase tracking-tighter">
                  LVL {trick.difficulty}
                </span>
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
                    status === "landed" ? "text-blue-400" : "text-purple-400"
                  }`}>
                    {status === "landed" ? "Mastered" : `Ready (${consistency ?? 0}/10)`}
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

        {/* Quick Log Buttons */}
        {isAuthenticated && (
          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleStatusToggle("landed")}
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-500 ${
                status === "landed"
                  ? "bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]"
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
                  ? "bg-purple-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]"
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
        <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-3xl p-8 flex flex-col justify-center animate-in fade-in duration-300 rounded-[2rem]">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowPrompt(false); }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white border border-white/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h4 className="text-3xl font-black tracking-tighter text-white uppercase italic">Calibration</h4>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Perform 10 attempts now.</p>
            </div>
            
            <div className="grid grid-cols-6 gap-3">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleStatusToggle("locked", i); }}
                  className={`h-12 flex items-center justify-center text-sm font-black rounded-xl transition-all ${
                    consistency === i && status === "locked"
                      ? "bg-purple-500 text-white shadow-lg"
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
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Data stream</span>
              </div>
            </div>

            <div className="aspect-video w-full bg-black/60 rounded-[2.5rem] overflow-hidden border border-white/10 relative shadow-2xl">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Linking...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-[0.2em] italic">No visual data available</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              {trick.history && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Intelligence</span>
                  <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-blue-500/20 pl-5">"{trick.history}"</p>
                </div>
              )}
              
              <div className="flex gap-16">
                {trick.inventor && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Pioneer</span>
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
            <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center justify-center text-center gap-5">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-1000 ${
                status === "landed" ? "bg-blue-500 rotate-12 shadow-[0_0_50px_rgba(59,130,246,0.3)]" : "bg-white/5"
              }`}>
                {status === "landed" ? <CheckIcon size={40} color="white" /> : <SkateboardIcon size={40} color="#1e293b" />}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                  {status === "landed" ? "Verified Mastery" : "Protocol active"}
                </p>
                <p className="text-xs text-slate-500 font-medium">
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

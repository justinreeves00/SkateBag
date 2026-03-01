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
      className={`relative group rounded-[2rem] transition-all duration-500 overflow-hidden flex flex-col ${
        expanded 
          ? "bg-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] scale-[1.02] z-10 ring-1 ring-white/20" 
          : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10"
      }`}
    >
      {/* Action Area */}
      <div
        className="p-6 flex flex-col gap-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                {trick.name}
              </h3>
              {trick.difficulty && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tabular-nums">
                  LVL {trick.difficulty}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {trick.category}
              </span>
              {status && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    status === "landed" ? "text-green-400" : "text-blue-400"
                  }`}>
                    {status === "landed" ? "Mastered" : `Consistency: ${consistency ?? 0}/10`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${expanded ? "bg-white/10 border-white/20 rotate-180" : "bg-black/20 border-white/5"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Integrated Tactical Status */}
        {isAuthenticated && (
          <div className="flex gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleStatusToggle("landed")}
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                status === "landed"
                  ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
              disabled={loading}
            >
              <CheckIcon size={18} />
              <span>Landed</span>
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                status === "locked"
                  ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
              disabled={loading}
            >
              <LockIcon size={16} />
              <span>Locked</span>
            </button>
          </div>
        )}
      </div>

      {/* 10 Tries Prompt Overlay */}
      {showPrompt && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-xl p-8 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowPrompt(false); }}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-2xl font-bold tracking-tight">Consistency Check</h4>
              <p className="text-slate-400 text-sm">Attempt the trick 10 times. How many did you land?</p>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleStatusToggle("locked", i); }}
                  className={`h-12 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                    consistency === i && status === "locked"
                      ? "bg-blue-500 text-white shadow-lg"
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
        <div className="px-6 pb-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* YouTube Player */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Video Tutorial</span>
              </div>
            </div>

            <div className="aspect-video w-full bg-black/40 rounded-3xl overflow-hidden border border-white/5 relative group/video">
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
                  <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Fetching...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-slate-700 font-bold uppercase tracking-widest">No Video Available</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Meta */}
            <div className="space-y-6">
              {trick.history && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Origin Story</span>
                  <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">"{trick.history}"</p>
                </div>
              )}
              
              <div className="flex gap-12">
                {trick.inventor && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Creator</span>
                    <p className="text-sm text-white font-bold">{trick.inventor}</p>
                  </div>
                )}
                {trick.year && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Year</span>
                    <p className="text-sm text-white font-bold">{trick.year}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mastery Card */}
            <div className="bg-gradient-to-br from-white/5 to-transparent p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center gap-4">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-700 ${
                status === "landed" ? "bg-green-500 rotate-12 shadow-[0_0_30px_rgba(34,197,94,0.3)]" : "bg-white/5"
              }`}>
                {status === "landed" ? <CheckIcon size={32} color="black" /> : <SkateboardIcon size={32} color="#334155" />}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                  {status === "landed" ? "Trick Mastered" : "Ready to Train"}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {status === "landed" ? "Logged in your bag" : "Consistency builds mastery"}
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

function SkateboardIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11h2a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2h2"/>
      <circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/>
      <path d="M6 15h12"/>
    </svg>
  );
}

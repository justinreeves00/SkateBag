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
      className={`border-4 border-black transition-all duration-100 mb-4 ${
        expanded 
          ? "bg-[#f0f0f0] -translate-x-1 -translate-y-1 shadow-[8px_8px_0px_#000]" 
          : "bg-white hover:bg-[#fff900]/10"
      }`}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status Group */}
        {isAuthenticated && (
          <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleStatusToggle("landed")}
              className={`w-12 h-12 border-4 border-black flex items-center justify-center transition-all ${
                status === "landed"
                  ? "bg-[#ff4d00] text-white"
                  : "bg-white text-black hover:bg-[#ff4d00]/20"
              }`}
              disabled={loading}
            >
              <CheckIcon size={24} />
            </button>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className={`w-12 h-12 border-4 border-black flex items-center justify-center transition-all ${
                status === "locked"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-black/10"
              }`}
              disabled={loading}
            >
              <LockIcon size={22} />
            </button>
          </div>
        )}

        {/* Trick Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black uppercase italic leading-none">
              {trick.name}
            </h3>
            {trick.difficulty && (
              <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rotate-[2deg]">
                LVL_{trick.difficulty}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#888]">
              {trick.category}
            </span>
            {status && (
              <span className={`text-[10px] font-black uppercase tracking-widest px-1 ${
                status === "landed" ? "bg-[#ff4d00] text-white" : "bg-black text-white"
              }`}>
                {status === "landed" ? "LANDED" : `LOCKED [${consistency ?? 0}/10]`}
              </span>
            )}
          </div>
        </div>

        <div className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* 10 Tries Prompt */}
      {showPrompt && (
        <div className="p-4 bg-black text-white border-t-4 border-black">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black italic">CONSISTENCY_CHECK // LAND 10</h4>
            <button onClick={() => setShowPrompt(false)} className="text-white hover:text-[#ff4d00]">
              [X]
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(11)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleStatusToggle("locked", i)}
                className={`h-10 font-black border-2 border-white transition-all ${
                  consistency === i && status === "locked"
                    ? "bg-[#ff4d00] border-[#ff4d00]"
                    : "hover:bg-white hover:text-black"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-6 border-t-4 border-black">
          {/* YouTube Inline Player */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">LEARN_THIS_SH*T</span>
            </div>

            <div className="aspect-video w-full bg-black border-4 border-black relative overflow-hidden">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-[#ff4d00] border-t-transparent animate-spin" />
                  <span className="text-xs font-black uppercase text-white">SEARCHING...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black uppercase text-white">VIDEO_NOT_FOUND</span>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {trick.history && (
            <div className="bg-white border-4 border-black p-4 rotate-[-1deg] shadow-[4px_4px_0px_#000]">
              <span className="text-[10px] font-black uppercase block mb-2 underline">ORIGIN_STORY</span>
              <p className="text-sm font-bold leading-tight">{trick.history}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="border-4 border-black p-3 bg-white">
              <span className="text-[10px] font-black uppercase block mb-1">INVENTOR</span>
              <p className="text-xs font-black italic">{trick.inventor || "UNKNOWN"}</p>
            </div>
            <div className="border-4 border-black p-3 bg-white">
              <span className="text-[10px] font-black uppercase block mb-1">YEAR</span>
              <p className="text-xs font-black italic">{trick.year || "----"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="square">
      <path d="M20 6L9 17L4 12"/>
    </svg>
  );
}

function LockIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="square">
      <rect width="18" height="11" x="3" y="11"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

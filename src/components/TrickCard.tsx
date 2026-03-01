"use client";

import { useState } from "react";
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

  async function handleStatusToggle(newStatus: TrickStatus, value: number | null = null) {
    if (!isAuthenticated || loading) return;
    setLoading(true);

    const nextStatus = status === newStatus && value === null ? null : newStatus;
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
      className={`mb-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
        expanded 
          ? "bg-[#161616] border-[#333] shadow-2xl scale-[1.02] z-10" 
          : "bg-[#0c0c0c] border-[#1a1a1a] hover:border-[#2a2a2a]"
      }`}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-4 px-5 py-5 cursor-pointer relative"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status Indicators */}
        {isAuthenticated && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                handleStatusToggle("landed"); 
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                status === "landed"
                  ? "bg-[#e8ff00] text-black shadow-[0_0_15px_rgba(232,255,0,0.3)]"
                  : "bg-[#1a1a1a] text-[#444] hover:text-[#888]"
              }`}
              disabled={loading}
            >
              <CheckIcon size={20} />
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowPrompt(!showPrompt);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                status === "locked"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "bg-[#1a1a1a] text-[#444] hover:text-[#888]"
              }`}
              disabled={loading}
            >
              <LockIcon size={18} />
            </button>
          </div>
        )}

        {/* Trick Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              {trick.name}
            </span>
            {trick.difficulty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#666] border border-[#222] font-black uppercase tracking-tighter">
                LVL {trick.difficulty}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#444] uppercase tracking-widest font-semibold">
              {trick.category}
            </span>
            {status && (
              <span className={`text-[11px] font-black uppercase tracking-widest ${
                status === "landed" ? "text-[#e8ff00]" : "text-white"
              }`}>
                • {status === "landed" ? "Landed" : `Locked (${consistency ?? 0}/10)`}
              </span>
            )}
          </div>
        </div>

        {/* Expand Arrow */}
        <div className={`p-2 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* 10 Tries Prompt */}
      {showPrompt && (
        <div className="bg-[#1a1a1a] mx-5 mb-5 p-4 rounded-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-white uppercase tracking-widest">
              Consistency Check (10 Tries)
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowPrompt(false); }}
              className="text-[#444] hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <p className="text-sm text-[#888] mb-4">Go do 10 tries right now. How many did you land?</p>
          <div className="grid grid-cols-6 gap-2">
            {[...Array(11)].map((_, i) => (
              <button
                key={i}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleStatusToggle("locked", i); 
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  consistency === i && status === "locked"
                    ? "bg-white text-black"
                    : "bg-[#252525] text-[#888] hover:bg-[#333] hover:text-white"
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
        <div className="px-5 pb-6 space-y-6 border-t border-[#1a1a1a] pt-6 transition-all duration-300">
          {/* History */}
          {trick.history && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">History</span>
              <p className="text-sm text-[#999] leading-relaxed italic">"{trick.history}"</p>
            </div>
          )}

          <div className="flex items-end justify-between gap-4">
            {/* Meta */}
            <div className="space-y-3">
              {trick.inventor && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Inventor</span>
                  <span className="text-xs text-[#777] font-medium">{trick.inventor}</span>
                </div>
              )}
              {trick.year && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Year</span>
                  <span className="text-xs text-[#777] font-medium">{trick.year}</span>
                </div>
              )}
            </div>

            {/* YouTube Tutorial */}
            {trick.youtube_query && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(trick.youtube_query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#e8ff00] text-black px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Tutorial
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17L4 12"/>
    </svg>
  );
}

function LockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

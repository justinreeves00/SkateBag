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
  const [loading, setLoading] = useState(false);

  async function handleStatusToggle(newStatus: TrickStatus) {
    if (!isAuthenticated || loading) return;
    setLoading(true);

    const nextStatus = status === newStatus ? null : newStatus;
    setStatus(nextStatus); // optimistic
    const result = await setTrickStatus(trick.id, nextStatus);
    if (result.error) {
      setStatus(status); // revert on error
    }
    setLoading(false);
  }

  return (
    <div
      className={`border-b border-[#1a1a1a] transition-all duration-200 ${
        expanded ? "bg-[#111]" : "hover:bg-[#0f0f0f]"
      }`}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-4 px-4 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status Indicators */}
        {isAuthenticated && (
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusToggle("landed"); }}
              title="Landed"
              className={`w-6 h-6 rounded-full border transition-all ${
                status === "landed"
                  ? "bg-[#e8ff00] border-[#e8ff00]"
                  : "border-[#333] hover:border-[#e8ff00]"
              }`}
              disabled={loading}
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusToggle("locked"); }}
              title="On Lock (5/10+)"
              className={`w-6 h-6 rounded-full border transition-all ${
                status === "locked"
                  ? "bg-white border-white"
                  : "border-[#333] hover:border-white"
              }`}
              disabled={loading}
            />
          </div>
        )}

        {/* Trick Name */}
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-medium text-white tracking-tight">
            {trick.name}
          </span>
          {status && (
            <span
              className={`ml-2 text-[11px] font-bold uppercase tracking-widest ${
                status === "landed" ? "text-[#e8ff00]" : "text-white"
              }`}
            >
              {status === "landed" ? "Landed" : "On Lock"}
            </span>
          )}
        </div>

        {/* Expand Arrow */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`shrink-0 text-[#444] transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-5 space-y-4">
          {/* History */}
          {trick.history && (
            <p className="text-sm text-[#888] leading-relaxed">{trick.history}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-[#555]">
            {trick.inventor && (
              <span>
                <span className="text-[#666]">Invented by</span>{" "}
                <span className="text-[#999]">{trick.inventor}</span>
              </span>
            )}
            {trick.year && (
              <span>
                <span className="text-[#666]">Year</span>{" "}
                <span className="text-[#999]">{trick.year}</span>
              </span>
            )}
          </div>

          {/* YouTube Tutorial */}
          {trick.youtube_query && (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(trick.youtube_query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#e8ff00] hover:text-white transition-colors tracking-wide uppercase"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch Tutorial
            </a>
          )}
        </div>
      )}
    </div>
  );
}

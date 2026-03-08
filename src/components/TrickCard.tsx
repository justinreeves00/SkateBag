"use client";

import { useState, useEffect } from "react";
import { reportTrickIssue, setTrickStatus, submitTrickLevelSuggestion } from "@/lib/trick-actions";
import type { TrickWithStatus, TrickStatus } from "@/lib/types";

interface TrickCardProps {
  trick: TrickWithStatus;
  isAuthenticated: boolean;
  onStatusChange?: (id: string, status: TrickStatus | null, consistency: number | null) => void;
  onInteract?: (id: string) => void;
  reporterName?: string | null;
}

export function TrickCard({ trick, isAuthenticated, onStatusChange, onInteract, reporterName }: TrickCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showLevelEdit, setShowLevelEdit] = useState(false);
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [issueType, setIssueType] = useState("incorrect name");
  const [issueDetails, setIssueDetails] = useState("");
  const [isReportingIssue, setIsReportingIssue] = useState(false);
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [searchMode, setSearchMode] = useState<"query" | "exact">("query");

  const fetchVideos = (mode: "query" | "exact") => {
    const q = trick.name;
    setFetchingVideo(true);
    setSearchMode(mode);
    fetch(`/api/youtube?q=${encodeURIComponent(q)}&mode=${mode}`)
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
  }, [expanded, trick.id, videoIds.length, fetchingVideo]);

  async function handleStatusToggle(newStatus: TrickStatus, value: number | null = null) {
    if (!isAuthenticated || loading) return;
    setLoading(true);

    const previousStatus = trick.userStatus;
    const previousConsistency = trick.userConsistency;
    const nextStatus = (trick.userStatus === newStatus && value === null) ? null : newStatus;
    const nextConsistency = value;

    if (onStatusChange) {
      onStatusChange(trick.id, nextStatus, nextConsistency);
    }
    
    const result = await setTrickStatus(trick.id, nextStatus, nextConsistency);
    if (result.error) {
      console.error('Failed to update trick status:', result.error);
      onStatusChange?.(trick.id, previousStatus, previousConsistency);
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

  async function openIssueDraft() {
    setIsReportingIssue(true);
    const result = await reportTrickIssue({
      trickName: trick.name,
      category: trick.category,
      difficulty: trick.difficulty,
      issueType,
      details: issueDetails,
      reporterName,
    });

    if (result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }

    setIsReportingIssue(false);
    setShowIssueReport(false);
    setIssueDetails("");
    setIssueType("incorrect name");
  }

  return (
    <div
      className={`cyber-card flex flex-col group ${
        expanded ? "bg-[var(--surface-muted)] border-[var(--board-accent)]" : ""
      }`}
    >
      {/* Interactive Zone */}
      <div
        className="p-6 flex flex-col gap-6 cursor-pointer"
        onClick={() => {
          onInteract?.(trick.id);
          setExpanded(!expanded);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-black tracking-tight text-white group-hover:text-[var(--board-accent)] transition-colors uppercase italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {trick.name}
              </h3>
              {trick.difficulty && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInteract?.(trick.id);
                    if (isAuthenticated) setShowLevelEdit(!showLevelEdit);
                  }}
                  className="label-tag hover:border-[var(--board-accent)] hover:text-white transition-all"
                >
                  LVL {trick.difficulty}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                {trick.category}
              </span>
              {trick.userStatus && (
                <>
                  <div className="w-1.5 h-1.5 bg-black rotate-45 border border-white/10" />
                  <span className={`text-[10px] font-black uppercase tracking-widest drop-shadow-sm ${
                    trick.userStatus === "landed" ? "text-[var(--board-accent)]" : 
                    trick.userStatus === "locked" ? "text-[var(--warn-accent)]" :
                    "text-blue-400"
                  }`}>
                    {trick.userStatus === "locked" ? `In Bag (Locked ${trick.userConsistency ?? 0}/10)` : 
                     trick.userStatus === "landed" ? "In Bag" :
                     "Learning"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300 ${expanded ? "bg-[var(--board-accent)] border-[var(--board-accent)] text-white rotate-180" : "bg-black/40 border-white/10 text-white/40"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Toggle details">
              <title>Toggle details</title>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Level Edit Overlay */}
        {showLevelEdit && (
          <div className="bg-black/60 p-5 rounded-lg border border-white/10 space-y-4 animate-in fade-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[var(--board-accent)] uppercase tracking-widest">Suggest Level Change</span>
              <button onClick={() => setShowLevelEdit(false)} aria-label="Close" className="text-[var(--text-muted)] hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" role="img" aria-label="Close">
                  <title>Close</title>
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            {suggestionSubmitted ? (
              <p className="text-[var(--board-accent)] text-xs font-black uppercase text-center py-2 italic bg-black/40 border border-[var(--board-accent)]/20 rounded">Suggestion sent! 🛹</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleLevelSuggestion(lvl)}
                    className={`h-10 rounded-md font-black text-xs transition-all border ${
                      trick.difficulty === lvl 
                        ? "bg-[var(--board-accent)] text-white border-white shadow-lg" 
                        : "bg-black/40 text-[var(--text-muted)] border-white/10 hover:text-white hover:bg-black/60"
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
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                onInteract?.(trick.id);
                handleStatusToggle("learning");
              }}
              className={`flex-1 h-11 rounded-lg flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                trick.userStatus === "learning"
                  ? "bg-blue-500 text-white shadow-lg shadow-black/40"
                  : "bg-black/40 text-[var(--text-muted)] hover:text-white border border-white/10"
              }`}
              disabled={loading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
              <span>Learning</span>
            </button>
            <button
              onClick={() => {
                onInteract?.(trick.id);
                handleStatusToggle("landed");
              }}
              className={`flex-1 h-11 rounded-lg flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                (trick.userStatus === "landed" || trick.userStatus === "locked")
                  ? "bg-[var(--board-accent)] text-white shadow-lg shadow-black/40"
                  : "bg-black/40 text-[var(--text-muted)] hover:text-white border border-white/10"
              }`}
              disabled={loading}
            >
              <CheckIcon size={16} />
              <span>Landed</span>
            </button>
            <button
              onClick={() => {
                onInteract?.(trick.id);
                setShowPrompt(!showPrompt);
              }}
              className={`flex-1 h-11 rounded-lg flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                trick.userStatus === "locked"
                  ? "bg-[var(--warn-accent)] text-black shadow-lg shadow-black/40"
                  : "bg-black/40 text-[var(--text-muted)] hover:text-white border border-white/10"
              }`}
              disabled={loading}
            >
              <LockIcon size={14} />
              <span>Locked</span>
            </button>
          </div>
        )}
      </div>

      {/* 10 Tries Overlay - Contained within card */}
      {showPrompt && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/95 p-3 rounded-xl backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full">
            <div className="text-center mb-3">
              <h4 className="text-lg font-black tracking-tighter text-white uppercase italic">Session Test</h4>
              <p className="text-[var(--warn-accent)] text-[7px] font-black uppercase tracking-[0.2em]">Need 6+ to lock in</p>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    // Only lock in if 6 or more reps (more than 5/10)
                    if (i >= 6) {
                      handleStatusToggle("locked", i);
                    } else {
                      setShowPrompt(false);
                    }
                  }}
                  className={`h-9 rounded-lg text-xs font-black border transition-all ${
                    trick.userConsistency === i && trick.userStatus === "locked"
                      ? "bg-[var(--warn-accent)] text-black border-white shadow-[0_0_15px_rgba(255,235,59,0.3)]"
                      : i >= 6
                        ? "bg-black/40 text-[var(--text-muted)] hover:bg-black/60 hover:text-white border-white/10"
                        : "bg-black/20 text-slate-600 border-white/5"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest text-center mt-2">
              Tap rep count (6+ to lock)
            </p>
          </div>
        </div>
      )}
      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-8 space-y-8 animate-in fade-in duration-500">
          <div className="h-px w-full bg-white/5 shadow-[0_1px_0_rgba(255,255,255,0.02)]" />

          {/* Video Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[var(--board-accent)] rotate-45 shadow-[0_0_8px_var(--board-accent)]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tutorial Feed</span>
              </div>
              <div className="flex gap-2">
                {searchMode === "query" && (
                  <button 
                    onClick={tryExact}
                    className="text-[9px] font-black text-black bg-[var(--warn-accent)] px-2 py-1 rounded shadow-sm hover:translate-y-[-1px] transition-transform uppercase tracking-widest"
                  >
                    Exact Search 🎯
                  </button>
                )}
                {videoIds.length > 1 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={prevVideo}
                      className="text-[9px] font-black text-white bg-black/40 border border-white/10 px-2 py-1 rounded hover:bg-black/60 uppercase tracking-widest"
                    >
                      Prev
                    </button>
                    <button 
                      onClick={nextVideo}
                      className="text-[9px] font-black text-white bg-black/40 border border-white/10 px-2 py-1 rounded hover:bg-black/60 uppercase tracking-widest"
                    >
                      Next ({currentVideoIndex + 1}/{videoIds.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border-2 border-black relative shadow-2xl">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
                  <div className="w-8 h-8 border-2 border-[var(--board-accent)]/20 border-t-[var(--board-accent)] rounded-full animate-spin" />
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Intercepting...</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                  <span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest italic">Signal lost</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {trick.history && (
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] bg-black/40 px-2 py-0.5 rounded w-fit block">Intel</span>
                  <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-[var(--board-accent)]/40 pl-4">{trick.history}</p>
                </div>
              )}
              
              <div className="flex gap-12 pt-2 border-t border-white/5">
                {trick.inventor && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block">Creator</span>
                    <p className="text-xs text-white font-black uppercase italic tracking-tight">{trick.inventor}</p>
                  </div>
                )}
                {trick.year && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block">Year</span>
                    <p className="text-xs text-white font-black uppercase tracking-tight">{trick.year}</p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIssueReport(true);
                  }}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] transition-all hover:text-white"
                >
                  Report an issue with the trick
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIssueReport && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-black/92 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[var(--surface)] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">GitHub Draft</p>
                <h4 className="text-2xl font-black uppercase italic tracking-tight text-white">Report Trick Issue</h4>
              </div>
              <button
                onClick={() => setShowIssueReport(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--text-muted)] transition-all hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" role="img" aria-label="Close">
                  <title>Close</title>
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white outline-none"
              >
                <option value="incorrect name">Incorrect Name</option>
                <option value="wrong category">Wrong Category</option>
                <option value="wrong difficulty">Wrong Difficulty</option>
                <option value="duplicate">Duplicate</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={issueDetails}
                onChange={(e) => setIssueDetails(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                placeholder="What should be fixed?"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowIssueReport(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]"
              >
                Cancel
              </button>
              <button
                onClick={openIssueDraft}
                disabled={isReportingIssue}
                className="flex-1 rounded-2xl bg-[var(--board-accent)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black disabled:opacity-60"
              >
                {isReportingIssue ? "Opening..." : "Open Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Check mark">
      <title>Check mark</title>
      <path d="M20 6L9 17L4 12"/>
    </svg>
  );
}

function LockIcon({ size = 24, color = "currentColor" }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Lock">
      <title>Lock</title>
      <rect width="18" height="11" x="3" y="11" rx="1" ry="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import type { TrickCategory } from "@/lib/types";

interface CompactFilterBarProps {
  category: TrickCategory | "all";
  onCategoryChange: (cat: TrickCategory | "all") => void;
  statusFilter: "all" | "landed" | "locked" | "learning";
  onStatusChange: (status: "all" | "landed" | "locked" | "learning") => void;
  levelFilter: number | "all";
  onLevelChange: (level: number | "all") => void;
  trickCounts: {
    unlearned: number;
    landed: number;
    locked: number;
    learning: number;
  };
  isAuthenticated: boolean;
}

const CATEGORIES: { value: TrickCategory | "all"; label: string }[] = [
  { value: "all", label: "All Tricks" },
  { value: "flatground", label: "Flatground" },
  { value: "street", label: "Street" },
  { value: "ledge/rail", label: "Ledge/Rail" },
  { value: "transition", label: "Transition" },
  { value: "gaps", label: "Gaps" },
  { value: "freestyle", label: "Freestyle" },
  { value: "downhill", label: "Downhill" },
];

const STATUS_OPTIONS = [
  { value: "all" as const, label: "On Deck", key: "unlearned" },
  { value: "learning" as const, label: "In Progress", key: "learning" },
  { value: "landed" as const, label: "Landed", key: "landed" },
  { value: "locked" as const, label: "Locked", key: "locked" },
];

export function CompactFilterBar({
  category,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  levelFilter,
  onLevelChange,
  trickCounts,
  isAuthenticated,
}: CompactFilterBarProps) {
  const [openPanel, setOpenPanel] = useState<"category" | "status" | "level" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close panel when selection changes
  useEffect(() => {
    setOpenPanel(null);
  }, [category, statusFilter, levelFilter]);

  const activeCategory = CATEGORIES.find((c) => c.value === category)?.label ?? "All Tricks";
  const activeStatus = STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ?? "On Deck";

  return (
    <div ref={containerRef} className="relative">
      {/* Three Filter Buttons with Headers - Reordered: Category, Difficulty, Status */}
      <div className="flex items-stretch gap-2">
        {/* Category Section */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] pl-1">Category</span>
          <button
            onClick={() => setOpenPanel(openPanel === "category" ? null : "category")}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all ${
              openPanel === "category"
                ? "bg-white/10 border-[var(--board-accent)]"
                : "bg-black/20 border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--board-accent)] shrink-0">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
              </svg>
              <span className="text-[11px] font-black uppercase tracking-wider text-white truncate">
                {activeCategory}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-[var(--text-muted)] transition-transform duration-200 ${openPanel === "category" ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Difficulty Section */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] pl-1">Difficulty</span>
          <button
            onClick={() => setOpenPanel(openPanel === "level" ? null : "level")}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all ${
              openPanel === "level"
                ? "bg-white/10 border-[var(--board-accent)]"
                : "bg-black/20 border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--board-accent)] shrink-0">
                <path d="M12 2v20"/>
                <path d="M2 12h20"/>
                <path d="m4.93 4.93 14.14 14.14"/>
                <path d="m19.07 4.93-14.14 14.14"/>
              </svg>
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                {levelFilter === "all" ? "All" : `L${levelFilter}`}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-[var(--text-muted)] transition-transform duration-200 ${openPanel === "level" ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Status Section */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] pl-1">Status</span>
          <button
            onClick={() => setOpenPanel(openPanel === "status" ? null : "status")}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all ${
              openPanel === "status"
                ? "bg-white/10 border-[var(--board-accent)]"
                : "bg-black/20 border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--board-accent)] shrink-0">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
              </svg>
              <span className="text-[11px] font-black uppercase tracking-wider text-white truncate">
                {activeStatus}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-[var(--text-muted)] transition-transform duration-200 ${openPanel === "status" ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category Dropdown */}
      {openPanel === "category" && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[200] w-full rounded-2xl border border-white/10 bg-[#1c1c1e] shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-white/10 bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Categories</p>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    category === cat.value
                      ? "bg-[var(--board-accent)] text-black"
                      : "bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Dropdown */}
      {openPanel === "level" && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[200] w-full rounded-2xl border border-white/10 bg-[#1c1c1e] shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-white/10 bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Difficulty</p>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onLevelChange("all")}
                className={`w-10 h-8 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  levelFilter === "all"
                    ? "bg-[var(--board-accent)] text-black"
                    : "bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10"
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all ${
                    levelFilter === lvl
                      ? "bg-[var(--board-accent)] text-black"
                      : "bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Dropdown */}
      {openPanel === "status" && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[200] w-full rounded-2xl border border-white/10 bg-[#1c1c1e] shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-white/10 bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white">Status</p>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => {
                const count = isAuthenticated
                  ? trickCounts[status.key as keyof typeof trickCounts]
                  : "-";
                return (
                  <button
                    key={status.value}
                    onClick={() => onStatusChange(status.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      statusFilter === status.value
                        ? "bg-[var(--board-accent)] text-black"
                        : "bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{status.label}</span>
                    {isAuthenticated && (
                      <span className="text-[9px] opacity-70">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

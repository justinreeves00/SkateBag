"use client";

import { useState, useRef, useEffect } from "react";
import type { TrickCategory, TrickStatus } from "@/lib/types";

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
  { value: "all" as const, label: "Unlearned", key: "unlearned" },
  { value: "learning" as const, label: "Progress", key: "learning" },
  { value: "landed" as const, label: "My Bag", key: "landed" },
  { value: "locked" as const, label: "On Lock", key: "locked" },
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCategory = CATEGORIES.find((c) => c.value === category)?.label ?? "All Tricks";
  const activeStatus = STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ?? "Unlearned";
  const activeLevel = levelFilter === "all" ? "All Levels" : `Level ${levelFilter}`;

  return (
    <div ref={containerRef} className="relative">
      {/* Compact Filter Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all ${
          isOpen
            ? "bg-white/10 border-white/20"
            : "bg-black/20 border-white/5 hover:border-white/10"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-[var(--board-accent)] shrink-0"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white truncate">
            <span className="text-[var(--board-accent)]">{activeCategory}</span>
            <span className="text-white/30">•</span>
            <span>{activeStatus}</span>
            <span className="text-white/30">•</span>
            <span className="text-[var(--text-muted)]">{activeLevel}</span>
          </div>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-3xl border border-white/10 bg-[#1c1c1e] shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          {/* Category Section */}
          <div className="p-4 border-b border-white/5">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)] mb-3">
              Category
            </p>
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

          {/* Status Section */}
          <div className="p-4 border-b border-white/5">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)] mb-3">
              Status
            </p>
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

          {/* Level Section */}
          <div className="p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[var(--text-muted)] mb-3">
              Difficulty
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onLevelChange("all")}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
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
                  className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${
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

          {/* Close Button */}
          <div className="p-3 border-t border-white/5 bg-black/20">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

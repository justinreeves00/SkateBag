"use client";

import { useState, useRef, useEffect } from "react";
import type { TrickCategory } from "@/lib/types";

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

interface CategoryFilterProps {
  active: TrickCategory | "all";
  onChange: (cat: TrickCategory | "all") => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLabel = CATEGORIES.find((c) => c.value === active)?.label || "All Tricks";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-400 transition-all hover:bg-white/10 hover:border-[var(--neon-cyan)]/30 active:scale-[0.98]"
      >
        <div className="flex flex-col items-start">
          <span className="text-[8px] font-black text-[var(--neon-cyan)] uppercase tracking-[0.3em] mb-1">Sector</span>
          <span className="text-xs font-black uppercase tracking-widest text-white">{activeLabel}</span>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 z-[60] bg-[var(--surface)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  onChange(cat.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-5 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  active === cat.value
                    ? "bg-[var(--neon-cyan)] text-black shadow-lg"
                    : "text-slate-600 hover:bg-white/5 hover:text-[var(--neon-cyan)]"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${active === cat.value ? "bg-black" : "bg-[var(--neon-cyan)]/20"}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

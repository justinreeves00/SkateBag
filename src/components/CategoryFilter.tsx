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
        className="w-full flex items-center justify-between px-6 py-4 bg-white border-4 border-black text-black transition-all hover:bg-[var(--caution-yellow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_#000]"
      >
        <div className="flex flex-col items-start">
          <span className="text-[8px] font-black text-[var(--safety-orange)] uppercase tracking-[0.3em] mb-1 bg-black px-1.5 py-0.5">Sector</span>
          <span className="text-xs font-black uppercase tracking-widest">{activeLabel}</span>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 z-[60] bg-white border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  onChange(cat.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                  active === cat.value
                    ? "bg-[var(--safety-orange)] text-white"
                    : "text-black hover:bg-slate-100"
                }`}
              >
                <div className={`w-2 h-2 rotate-45 ${active === cat.value ? "bg-white" : "bg-black"}`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

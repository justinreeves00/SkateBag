"use client";

import type { TrickCategory } from "@/lib/types";

const CATEGORIES: { value: TrickCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "flatground", label: "Flatground" },
  { value: "street", label: "Street" },
  { value: "rails", label: "Rails" },
  { value: "ledges", label: "Ledges" },
  { value: "gaps", label: "Gaps" },
  { value: "vert", label: "Vert" },
  { value: "bowl", label: "Bowl" },
  { value: "freestyle", label: "Freestyle" },
  { value: "downhill", label: "Downhill" },
];

interface CategoryFilterProps {
  active: TrickCategory | "all";
  onChange: (cat: TrickCategory | "all") => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${
            active === cat.value
              ? "bg-[#e8ff00] text-black border-[#e8ff00] shadow-[0_0_15px_rgba(232,255,0,0.1)]"
              : "bg-[#111] text-[#333] border-[#1a1a1a] hover:border-[#2a2a2a] hover:text-[#888]"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

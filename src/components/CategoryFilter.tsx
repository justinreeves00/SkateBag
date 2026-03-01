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
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 px-5 py-3 rounded-xl text-[10px] font-mono font-black uppercase tracking-[0.2em] transition-all border ${
            active === cat.value
              ? "bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.05)]"
              : "bg-[#0f1115] text-[#334155] border-[#1e232d] hover:border-[#334155] hover:text-[#475569]"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

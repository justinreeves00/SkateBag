"use client";

import type { TrickCategory } from "@/lib/types";

const CATEGORIES: { value: TrickCategory | "all"; label: string }[] = [
  { value: "all", label: "All Tricks" },
  { value: "flatground", label: "Flat" },
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
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={`flex-1 min-w-[120px] px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
              active === cat.value
                ? "bg-[var(--board-accent)] text-white border-[var(--board-accent)] shadow-[0_0_20px_rgba(255,87,34,0.3)] scale-105 z-10"
                : "bg-black/40 text-slate-500 border-white/5 hover:border-white/10 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

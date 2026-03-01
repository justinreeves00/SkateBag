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
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
            active === cat.value
              ? "bg-[#e8ff00] text-black"
              : "bg-[#1a1a1a] text-[#666] hover:text-white"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import type { TrickCategory } from "@/lib/types";

const CATEGORIES: { value: TrickCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "flatground", label: "Flat" },
  { value: "street", label: "Street" },
  { value: "ledge/rail", label: "Ledge/Rail" },
  { value: "transition", label: "Trans" },
  { value: "gaps", label: "Gaps" },
  { value: "freestyle", label: "Free" },
  { value: "downhill", label: "Hill" },
];

interface CategoryFilterProps {
  active: TrickCategory | "all";
  onChange: (cat: TrickCategory | "all") => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
            active === cat.value
              ? "bg-white text-black border-white shadow-xl scale-105"
              : "bg-white/5 text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

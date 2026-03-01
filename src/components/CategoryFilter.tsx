"use client";

import type { TrickCategory } from "@/lib/types";

const CATEGORIES: { value: TrickCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
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
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
            active === cat.value
              ? "bg-white text-black border-white shadow-lg"
              : "bg-white/5 text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

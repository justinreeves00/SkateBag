"use client";

import type { TrickCategory } from "@/lib/types";

const CATEGORIES: { value: TrickCategory | "all"; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "flatground", label: "FLAT" },
  { value: "street", label: "STREET" },
  { value: "ledge/rail", label: "LEDGE/RAIL" },
  { value: "transition", label: "TRANS" },
  { value: "gaps", label: "GAPS" },
  { value: "freestyle", label: "FREE" },
  { value: "downhill", label: "HILL" },
];

interface CategoryFilterProps {
  active: TrickCategory | "all";
  onChange: (cat: TrickCategory | "all") => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 px-4 py-2 border-4 border-black text-[10px] font-black transition-all ${
            active === cat.value
              ? "bg-[#ff4d00] text-white -translate-y-1 shadow-[4px_4px_0px_#000]"
              : "bg-white text-black hover:bg-black hover:text-white"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

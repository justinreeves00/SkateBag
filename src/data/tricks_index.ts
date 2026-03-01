// Auto-generated tricks database
// Contains 330+ skateboarding tricks across all disciplines
// Parts 1-9 are stored as separate JSON files to avoid token limits

import part1 from "./tricks_part1.json";
import part2 from "./tricks_part2.json";
import part3 from "./tricks_part3.json";
import part4 from "./tricks_part4.json";
import part5 from "./tricks_part5.json";
import part6 from "./tricks_part6.json";
import part7 from "./tricks_part7.json";
import part8 from "./tricks_part8.json";
import part9 from "./tricks_part9.json";

export type TrickCategory =
  | "flatground"
  | "street"
  | "rails"
  | "ledges"
  | "gaps"
  | "vert"
  | "bowl"
  | "freestyle"
  | "downhill";

export interface Trick {
  name: string;
  category: TrickCategory;
  history: string | null;
  inventor: string | null;
  year: number | null;
  youtube_query: string;
}

const allTricks: Trick[] = [
  ...part1,
  ...part2,
  ...part3,
  ...part4,
  ...part5,
  ...part6,
  ...part7,
  ...part8,
  ...part9,
] as Trick[];

// Deduplicate by name (case-insensitive)
const seen = new Set<string>();
export const tricks: Trick[] = allTricks.filter((trick) => {
  const key = trick.name.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

export default tricks;

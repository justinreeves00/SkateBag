export type TrickStatus = "landed" | "locked";

export type TrickCategory =
  | "flatground"
  | "street"
  | "ledge/rail"
  | "transition"
  | "gaps"
  | "freestyle"
  | "downhill";

export interface Trick {
  id: string;
  name: string;
  category: TrickCategory;
  history: string | null;
  inventor: string | null;
  year: number | null;
  difficulty: number | null; // 1-5
  sort_order: number | null;
  youtube_query: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  updated_at: string;
}

export interface UserTrick {
  id: string;
  user_id: string;
  trick_id: string;
  status: TrickStatus;
  consistency: number | null;
  sort_order: number;
  is_manually_sorted: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrickWithStatus extends Trick {
  userStatus: TrickStatus | null;
  userConsistency: number | null;
  sortOrder: number | null;
  isManuallySorted: boolean | null;
}

export interface DiceFilterSettings {
  excludeLanded: boolean;
  excludeLocked: boolean;
  categories: TrickCategory[];
  levels: number[];
  consistencyMode?: boolean;
}

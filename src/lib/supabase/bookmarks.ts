import type { SelectedRunes } from "@/types";

export interface PublishedBuild {
  id: string;
  user_id: string;
  champion_id: string;
  build_name: string;
  level: number;
  items: unknown; // jsonb — typically (string | null)[]
  runes: unknown; // jsonb — typically SelectedRunes
  lane: string | null;
  role: string | null;
  spells: unknown; // jsonb — typically [string | null, string | null]
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  bookmark_count?: number;
  is_bookmarked?: boolean;
}

export interface Bookmark {
  id: string;
  user_id: string;
  build_id: string;
  created_at: string;
}

export const MAX_BOOKMARKS = 20;

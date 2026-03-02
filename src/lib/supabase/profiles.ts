import type { SupabaseClient } from '@supabase/supabase-js';

export type ProfileMap = Record<string, { display_name: string | null; avatar_url: string | null }>;

/**
 * Fetch profiles for a list of user IDs and return a lookup map.
 */
export async function fetchProfileMap(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<ProfileMap> {
  if (userIds.length === 0) return {};

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds);

  const map: ProfileMap = {};
  if (profiles) {
    for (const p of profiles) {
      map[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url };
    }
  }
  return map;
}

import { STAT_SHARDS } from '@/lib/data/runes';
import type { SelectedRunes } from '@/types';

/**
 * URL-safe build encoding/decoding.
 *
 * Format: <championId>.<level>.<item1>-<item2>-...-<item6>.<rune fields...>.<shard indices>
 *
 * Rune fields (dot-separated): primaryPath, keystone, primarySlot1, primarySlot2, primarySlot3,
 *                                secondaryPath, secondarySlot1, secondarySlot2
 * Shard indices: <row0idx>.<row1idx>.<row2idx>  (0-based index into STAT_SHARDS[row])
 *
 * Example: Aatrox.18.3153-3071-3111-0-0-0.8000.8005.9111.9104.8299.8200.8224.8233.0.0.0
 */

export interface SavedBuild {
  championId: string;
  level: number;
  items: (string | null)[];
  runes: SelectedRunes;
}

/** Map shard ID → [row, index] */
function shardIdToIndex(id: string): number {
  for (let row = 0; row < STAT_SHARDS.length; row++) {
    const idx = STAT_SHARDS[row].findIndex((s) => s.id === id);
    if (idx !== -1) return idx;
  }
  return 0;
}

/** Map [row, index] → shard ID */
function indexToShardId(row: number, idx: number): string {
  return STAT_SHARDS[row]?.[idx]?.id ?? STAT_SHARDS[row]?.[0]?.id ?? '';
}

export function encodeBuild(build: SavedBuild): string {
  const { championId, level, items, runes } = build;

  // Items: use "0" for empty slots
  const itemStr = items.map((id) => id ?? '0').join('-');

  // Rune numeric fields (8 values)
  const runeFields = [
    runes.primaryPath,
    runes.keystone,
    runes.primarySlot1,
    runes.primarySlot2,
    runes.primarySlot3,
    runes.secondaryPath,
    runes.secondarySlot1,
    runes.secondarySlot2,
  ].join('.');

  // Shard indices (3 values)
  const shardIndices = [
    shardIdToIndex(runes.statShard1),
    shardIdToIndex(runes.statShard2),
    shardIdToIndex(runes.statShard3),
  ].join('.');

  return `${championId}.${level}.${itemStr}.${runeFields}.${shardIndices}`;
}

export function decodeBuild(str: string): SavedBuild | null {
  try {
    const parts = str.split('.');
    // championId.level.items(single segment with dashes).8 rune fields.3 shard indices = 14 parts minimum
    if (parts.length < 14) return null;

    const championId = parts[0];
    const level = Math.max(1, Math.min(18, parseInt(parts[1], 10)));
    if (isNaN(level)) return null;

    // Items: single segment with dashes
    const itemParts = parts[2].split('-');
    const items: (string | null)[] = Array.from({ length: 6 }, (_, i) => {
      const val = itemParts[i];
      return val && val !== '0' ? val : null;
    });

    // Rune fields: parts[3] through parts[10]
    const runeNums = parts.slice(3, 11).map((s) => parseInt(s, 10));
    if (runeNums.some(isNaN)) return null;

    // Shard indices: parts[11], parts[12], parts[13]
    const shardNums = parts.slice(11, 14).map((s) => parseInt(s, 10));
    if (shardNums.some(isNaN)) return null;

    const runes: SelectedRunes = {
      primaryPath: runeNums[0],
      keystone: runeNums[1],
      primarySlot1: runeNums[2],
      primarySlot2: runeNums[3],
      primarySlot3: runeNums[4],
      secondaryPath: runeNums[5],
      secondarySlot1: runeNums[6],
      secondarySlot2: runeNums[7],
      statShard1: indexToShardId(0, shardNums[0]),
      statShard2: indexToShardId(1, shardNums[1]),
      statShard3: indexToShardId(2, shardNums[2]),
    };

    return { championId, level, items, runes };
  } catch {
    return null;
  }
}

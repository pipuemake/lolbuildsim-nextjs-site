import type { RunePath, RuneSlot, Rune, StatShard } from '@/types';

interface DDragonRune {
  id: number;
  key: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  icon: string;
}

interface DDragonRuneSlot {
  runes: DDragonRune[];
}

interface DDragonRunePath {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: DDragonRuneSlot[];
}

export function parseRunes(data: unknown[]): RunePath[] {
  return (data as DDragonRunePath[]).map((path) => ({
    id: path.id,
    key: path.key,
    name: path.name,
    icon: path.icon,
    slots: path.slots.map(
      (slot): RuneSlot => ({
        runes: slot.runes.map(
          (rune): Rune => ({
            id: rune.id,
            key: rune.key,
            name: rune.name,
            shortDesc: rune.shortDesc,
            longDesc: rune.longDesc,
            icon: rune.icon,
          })
        ),
      })
    ),
  }));
}

/**
 * Hardcoded stat shards (Riot's stat shard system).
 * Row 1: Offense, Row 2: Flex, Row 3: Defense
 */
export const STAT_SHARDS: StatShard[][] = [
  // Row 1
  [
    {
      id: 'shard_adaptive',
      name: 'Adaptive Force',
      description: '+9 Adaptive Force',
      value: { ad: 9 },
    },
    {
      id: 'shard_attack_speed',
      name: 'Attack Speed',
      description: '+10% Attack Speed',
      value: { attackSpeed: 0.1 },
    },
    {
      id: 'shard_ability_haste',
      name: 'Ability Haste',
      description: '+8 Ability Haste',
      value: { abilityHaste: 8 },
    },
  ],
  // Row 2
  [
    {
      id: 'shard_adaptive2',
      name: 'Adaptive Force',
      description: '+9 Adaptive Force',
      value: { ad: 9 },
    },
    {
      id: 'shard_move_speed',
      name: 'Move Speed',
      description: '+2% Move Speed',
      value: { moveSpeedPercent: 0.02 },
    },
    {
      id: 'shard_hp_scaling',
      name: 'Health',
      description: '+10-180 HP (based on level)',
      value: { hp: 10 }, // base value; actual value scales with level
    },
  ],
  // Row 3
  [
    {
      id: 'shard_hp_flat',
      name: 'Health',
      description: '+65 HP',
      value: { hp: 65 },
    },
    {
      id: 'shard_tenacity',
      name: 'Tenacity & Slow Resist',
      description: '+15% Tenacity & Slow Resist',
      value: { tenacity: 0.15 },
    },
    {
      id: 'shard_hp_scaling2',
      name: 'Health Scaling',
      description: '+10-180 HP (based on level)',
      value: { hp: 10 }, // actual value computed dynamically: 10 * level
    },
  ],
];

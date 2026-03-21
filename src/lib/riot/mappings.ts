// Riot numeric summoner spell IDs → project summoner spell IDs
// Note: Ghost uses 'SummonerGhost' in the project (image: SummonerHaste.png)
// Note: Ignite uses 'SummonerIgnite' in the project (image: SummonerDot.png)
export const SUMMONER_SPELL_ID_MAP: Record<number, string> = {
  1: 'SummonerBoost',      // Cleanse
  3: 'SummonerExhaust',    // Exhaust
  4: 'SummonerFlash',      // Flash
  6: 'SummonerGhost',      // Ghost (Riot key: SummonerHaste)
  7: 'SummonerHeal',       // Heal
  11: 'SummonerSmite',     // Smite
  12: 'SummonerTeleport',  // Teleport
  14: 'SummonerIgnite',    // Ignite (Riot key: SummonerDot)
  21: 'SummonerBarrier',   // Barrier
};

// Riot stat perk IDs → simulator StatShard IDs
// Mapped by (row, riotId) because Riot reuses IDs across rows
type StatShardRow = 'offense' | 'flex' | 'defense';

const STAT_SHARD_MAP: Record<StatShardRow, Record<number, string>> = {
  offense: {
    5008: 'shard_adaptive',
    5005: 'shard_attack_speed',
    5007: 'shard_ability_haste',
  },
  flex: {
    5008: 'shard_adaptive2',
    5010: 'shard_move_speed',
    5001: 'shard_hp_scaling',
  },
  defense: {
    5011: 'shard_hp_flat',
    5013: 'shard_tenacity',
    5001: 'shard_hp_scaling2',
  },
};

export function mapStatPerk(row: StatShardRow, riotId: number): string | undefined {
  return STAT_SHARD_MAP[row]?.[riotId];
}

export function mapStatPerks(statPerks: { offense: number; flex: number; defense: number }): {
  offense: string | undefined;
  flex: string | undefined;
  defense: string | undefined;
} {
  return {
    offense: mapStatPerk('offense', statPerks.offense),
    flex: mapStatPerk('flex', statPerks.flex),
    defense: mapStatPerk('defense', statPerks.defense),
  };
}

// Champion name normalization
// Riot API sometimes returns different casing than DDragon expects
const CHAMPION_NAME_OVERRIDES: Record<string, string> = {
  FiddleSticks: 'Fiddlesticks',
};

export function normalizeChampionName(name: string): string {
  return CHAMPION_NAME_OVERRIDES[name] ?? name;
}

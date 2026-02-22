import type {
  Champion,
  ChampionStats,
  ChampionSpell,
  DDragonChampionListData,
  DDragonChampionDetail,
} from '@/types';
// Image filenames are stored raw; construct full URLs at component level

/**
 * Level growth formula from Riot's stat growth formula.
 * stat = base + growth * (level - 1) * (0.7025 + 0.0175 * (level - 1))
 */
export function getStatAtLevel(base: number, growth: number, level: number): number {
  if (level <= 1) return base;
  return base + growth * (level - 1) * (0.7025 + 0.0175 * (level - 1));
}

function parseStats(raw: Record<string, number>): ChampionStats {
  return {
    hp: raw['hp'] ?? 0,
    hpPerLevel: raw['hpperlevel'] ?? 0,
    mp: raw['mp'] ?? 0,
    mpPerLevel: raw['mpperlevel'] ?? 0,
    moveSpeed: raw['movespeed'] ?? 0,
    armor: raw['armor'] ?? 0,
    armorPerLevel: raw['armorperlevel'] ?? 0,
    magicResist: raw['spellblock'] ?? 0,
    magicResistPerLevel: raw['spellblockperlevel'] ?? 0,
    attackRange: raw['attackrange'] ?? 0,
    hpRegen: raw['hpregen'] ?? 0,
    hpRegenPerLevel: raw['hpregenperlevel'] ?? 0,
    mpRegen: raw['mpregen'] ?? 0,
    mpRegenPerLevel: raw['mpregenperlevel'] ?? 0,
    attackDamage: raw['attackdamage'] ?? 0,
    attackDamagePerLevel: raw['attackdamageperlevel'] ?? 0,
    attackSpeed: raw['attackspeed'] ?? 0,
    attackSpeedPerLevel: raw['attackspeedperlevel'] ?? 0,
    crit: raw['crit'] ?? 0,
    critPerLevel: raw['critperlevel'] ?? 0,
  };
}

export function parseChampionList(
  data: DDragonChampionListData,
): Champion[] {
  return Object.values(data).map((raw) => ({
    id: raw.id,
    key: raw.key,
    name: raw.name,
    title: raw.title,
    tags: raw.tags,
    stats: parseStats(raw.stats),
    spells: [], // filled by detail fetch
    passive: {
      name: '',
      description: '',
      image: '',
    },
    image: raw.image.full,
    splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${raw.id}_0.jpg`,
  }));
}

export function parseChampionDetail(
  data: DDragonChampionDetail,
): Champion {
  const spells: ChampionSpell[] = data.spells.map((spell) => ({
    id: spell.id,
    name: spell.name,
    description: spell.description,
    tooltip: spell.tooltip,
    maxrank: spell.maxrank,
    cooldown: spell.cooldown,
    cost: spell.cost,
    costType: spell.costType,
    image: spell.image.full,
  }));

  return {
    id: data.id,
    key: data.key,
    name: data.name,
    title: data.title,
    tags: data.tags,
    stats: parseStats(data.stats),
    spells,
    passive: {
      name: data.passive.name,
      description: data.passive.description,
      image: data.passive.image.full,
    },
    image: data.image.full,
    splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${data.id}_0.jpg`,
  };
}

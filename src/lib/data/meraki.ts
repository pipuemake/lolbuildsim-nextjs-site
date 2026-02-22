import type { SkillData, SkillScaling, ScalingStat } from '@/types';
import { getSkillOverrides } from './champion-skill-overrides';

// Proxied through Next.js rewrites to avoid CORS issues
const MERAKI_BASE = '/api/meraki';

// Simple in-memory cache
const cache = new Map<string, SkillData[]>();

// Hoisted RegExp patterns for mapScalingStat (avoid re-creation per call)
const RE_BONUS_AD = /^bonus\s*ad$/i;
const RE_AD = /^(total\s*)?ad$/i;
const RE_AP = /^ap$/i;
const RE_BONUS_HP = /^bonus\s*hp$/i;
const RE_MAX_HP = /^max(imum)?\s*h(p|ealth)$/i;
const RE_HP = /^hp$/i;
const RE_ARMOR = /^armor$/i;
const RE_MR = /^m(r|agic\s*resist(ance)?)$/i;
const RE_BONUS_MANA = /^bonus\s*mana$/i;
const RE_MANA = /^mana$/i;
const RE_AS = /^attack\s*speed$/i;
const RE_TARGET_MAX_HP = /^target('s)?\s*max(imum)?\s*h(p|ealth)$/i;
const RE_TARGET_CURRENT_HP = /^target('s)?\s*current\s*h(p|ealth)$/i;
const RE_TARGET_MISSING_HP = /^target('s)?\s*missing\s*h(p|ealth)$/i;

const DIRECT_STAT_MAPPING: Record<string, ScalingStat> = {
  attackdamage: 'ad',
  bonusattackdamage: 'bonusAd',
  abilitypowermagnitude: 'ap',
  hp: 'hp',
  bonushp: 'bonusHp',
  armor: 'armor',
  magicresist: 'mr',
  mana: 'mana',
  bonusmana: 'bonusMana',
  attackspeed: 'attackSpeed',
  maxhp: 'maxHp',
  targetmaxhp: 'targetMaxHp',
  targetcurrenthp: 'targetCurrentHp',
  targetmissinghp: 'targetMissingHp',
};

// Map Meraki stat names to our ScalingStat type
function mapScalingStat(merakiStat: string): ScalingStat | null {
  const s = merakiStat.toLowerCase().trim();

  if (DIRECT_STAT_MAPPING[s]) return DIRECT_STAT_MAPPING[s];

  // Handle Meraki's "% AD", "% AP", "% bonus AD" etc. unit format
  const cleaned = s.replace(/^%\s*/, '');

  if (RE_BONUS_AD.test(cleaned) || cleaned === 'bonus attack damage') return 'bonusAd';
  if (RE_AD.test(cleaned) || cleaned === 'attack damage') return 'ad';
  if (RE_AP.test(cleaned) || cleaned === 'ability power') return 'ap';
  if (RE_BONUS_HP.test(cleaned) || cleaned === 'bonus health') return 'bonusHp';
  if (RE_MAX_HP.test(cleaned)) return 'maxHp';
  if (RE_HP.test(cleaned) || cleaned === 'health') return 'hp';
  if (RE_ARMOR.test(cleaned)) return 'armor';
  if (RE_MR.test(cleaned)) return 'mr';
  if (RE_BONUS_MANA.test(cleaned)) return 'bonusMana';
  if (RE_MANA.test(cleaned)) return 'mana';
  if (RE_AS.test(cleaned)) return 'attackSpeed';
  if (RE_TARGET_MAX_HP.test(cleaned)) return 'targetMaxHp';
  if (RE_TARGET_CURRENT_HP.test(cleaned)) return 'targetCurrentHp';
  if (RE_TARGET_MISSING_HP.test(cleaned)) return 'targetMissingHp';

  return null;
}

interface MerakiEffect {
  description?: string;
  leveling?: Array<{
    attribute: string;
    modifiers: Array<{
      values: number[];
      units: string[];
    }>;
  }>;
}

interface MerakiAbility {
  name?: string;
  effects?: MerakiEffect[];
  cooldown?: {
    modifiers?: Array<{
      values: number[];
    }>;
  };
  cost?: {
    modifiers?: Array<{
      values: number[];
      units?: string[];
    }>;
  };
  maxLevel?: number;
}

interface MerakiChampion {
  abilities?: {
    P?: MerakiAbility[];
    Q?: MerakiAbility[];
    W?: MerakiAbility[];
    E?: MerakiAbility[];
    R?: MerakiAbility[];
  };
}

/**
 * Find the primary damage leveling entry for an ability.
 * Filters out non-damage attributes like "Bonus Attack Damage" (stat buffs),
 * "Minion Damage", "Monster Damage" (target-specific), etc.
 * Real damage entries have a flat base component (first modifier with empty units).
 */
function findPrimaryDamageLeveling(ability: MerakiAbility): {
  leveling: { attribute: string; modifiers: Array<{ values: number[]; units: string[] }> };
  effect: MerakiEffect;
} | null {
  if (!ability.effects) return null;

  for (const effect of ability.effects) {
    if (!effect.leveling) continue;
    for (const lvl of effect.leveling) {
      const attr = (lvl.attribute ?? '').toLowerCase();
      // Must contain a damage-related keyword
      if (!attr.includes('damage') && !attr.includes('physical') && !attr.includes('magic')) continue;
      // Skip target-specific variants (minion/monster damage)
      if (attr.includes('minion') || attr.includes('monster')) continue;
      // Real damage has a flat base component: first modifier units are empty strings.
      // Stat buffs like "Bonus Attack Damage" only have "% AD" units → no flat base.
      const firstMod = lvl.modifiers?.[0];
      if (!firstMod?.values?.length) continue;
      const firstUnit = (firstMod.units?.[0] ?? '').trim();
      if (firstUnit !== '') continue;
      return { leveling: lvl, effect };
    }
  }
  return null;
}

function extractBaseDamage(ability: MerakiAbility): number[] {
  const found = findPrimaryDamageLeveling(ability);
  if (!found) return [0];
  return found.leveling.modifiers[0].values;
}

function extractScalings(ability: MerakiAbility): SkillScaling[] {
  const scalings: SkillScaling[] = [];
  const found = findPrimaryDamageLeveling(ability);
  if (!found) return scalings;

  // Skip first modifier (flat base damage), process the rest (scaling ratios)
  const mods = found.leveling.modifiers;
  for (let i = 1; i < mods.length; i++) {
    const mod = mods[i];
    // Only use the first unit — all units across ranks are identical (e.g. "% AD" × 5)
    const unit = mod.units?.[0];
    if (!unit) continue;
    const stat = mapScalingStat(unit);
    if (stat && mod.values?.length) {
      const raw = mod.values[0];
      scalings.push({
        stat,
        ratio: raw > 1 ? raw / 100 : raw,
      });
    }
  }

  return scalings;
}

function extractCooldowns(ability: MerakiAbility): number[] {
  return ability.cooldown?.modifiers?.[0]?.values ?? [0];
}

function extractCosts(ability: MerakiAbility): { values: number[]; type: string } {
  const mod = ability.cost?.modifiers?.[0];
  return {
    values: mod?.values ?? [0],
    type: mod?.units?.[0] ?? 'Mana',
  };
}

function parseDamageType(ability: MerakiAbility): 'physical' | 'magic' | 'true' {
  if (!ability.effects) return 'magic';

  // First: check effect descriptions for explicit damage type keywords
  for (const effect of ability.effects) {
    const desc = (effect.description ?? '').toLowerCase();
    if (desc.includes('physical damage')) return 'physical';
    if (desc.includes('true damage')) return 'true';
    if (desc.includes('magic damage')) return 'magic';
  }

  // Second: check the primary damage attribute name
  const found = findPrimaryDamageLeveling(ability);
  if (found) {
    const attr = found.leveling.attribute.toLowerCase();
    if (attr.includes('physical')) return 'physical';
    if (attr.includes('true')) return 'true';
    if (attr.includes('magic')) return 'magic';
  }

  return 'magic';
}

function parseAbility(
  key: 'Q' | 'W' | 'E' | 'R' | 'P',
  abilities: MerakiAbility[] | undefined
): SkillData | null {
  const ability = abilities?.[0];
  if (!ability) return null;

  const baseDamage = extractBaseDamage(ability);
  const costs = extractCosts(ability);

  return {
    key,
    name: ability.name ?? key,
    maxRank: ability.maxLevel ?? (key === 'R' ? 3 : key === 'P' ? 1 : 5),
    baseDamage,
    damageType: parseDamageType(ability),
    scalings: extractScalings(ability),
    cooldown: extractCooldowns(ability),
    cost: costs.values,
    costType: costs.type,
  };
}

/**
 * Apply champion-specific skill overrides (e.g. multi-hit sub-casts).
 * Merges subCasts into matching SkillData entries.
 */
export function applySkillOverrides(championId: string, skills: SkillData[]): SkillData[] {
  const overrides = getSkillOverrides(championId);
  if (overrides.length === 0) return skills;

  return skills.map((skill) => {
    const override = overrides.find((o) => o.skillKey === skill.key);
    if (!override) return skill;
    return { ...skill, subCasts: override.subCasts };
  });
}

// ===== Fallback skill data for champions not yet in Meraki =====
const FALLBACK_SKILLS: Record<string, SkillData[]> = {
  Zaahen: [
    {
      key: 'P',
      name: '戦威修養',
      maxRank: 1,
      baseDamage: [0],
      damageType: 'physical',
      scalings: [],
      cooldown: [0],
      cost: [0],
      costType: '',
    },
    {
      key: 'Q',
      name: 'ダーキングレイヴ',
      maxRank: 5,
      baseDamage: [15, 30, 45, 60, 75],
      damageType: 'physical',
      scalings: [{ stat: 'bonusAd', ratio: 0.2 }],
      cooldown: [10, 9, 8, 7, 6],
      cost: [25, 25, 25, 25, 25],
      costType: 'Mana',
    },
    {
      key: 'W',
      name: '戦慄の再臨',
      maxRank: 5,
      baseDamage: [80, 120, 160, 200, 240],
      damageType: 'physical',
      scalings: [{ stat: 'bonusAd', ratio: 1.0 }],
      cooldown: [16, 15, 14, 13, 12],
      cost: [50, 50, 50, 50, 50],
      costType: 'Mana',
    },
    {
      key: 'E',
      name: '絢爛たる進撃',
      maxRank: 5,
      baseDamage: [40, 60, 80, 100, 120],
      damageType: 'physical',
      scalings: [{ stat: 'bonusAd', ratio: 0.5 }],
      cooldown: [10, 9.5, 9, 8.5, 8],
      cost: [40, 40, 40, 40, 40],
      costType: 'Mana',
    },
    {
      key: 'R',
      name: '無慈悲なる裁き',
      maxRank: 3,
      baseDamage: [250, 400, 550],
      damageType: 'physical',
      scalings: [{ stat: 'bonusAd', ratio: 2.0 }],
      cooldown: [110, 95, 80],
      cost: [100, 100, 100],
      costType: 'Mana',
    },
  ],
};

export async function fetchMerakiChampion(championKey: string): Promise<SkillData[]> {
  if (cache.has(championKey)) {
    return cache.get(championKey)!;
  }

  // Use fallback data for champions not yet in Meraki
  if (FALLBACK_SKILLS[championKey]) {
    const skills = FALLBACK_SKILLS[championKey];
    cache.set(championKey, skills);
    return skills;
  }

  try {
    const url = `${MERAKI_BASE}/${championKey}.json`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Meraki fetch failed for ${championKey}: ${res.status}`);
      return [];
    }

    const data: MerakiChampion = await res.json();
    const abilities = data.abilities;
    if (!abilities) return [];

    const keys: Array<'Q' | 'W' | 'E' | 'R' | 'P'> = ['Q', 'W', 'E', 'R', 'P'];
    const skills: SkillData[] = [];

    for (const key of keys) {
      const skill = parseAbility(key, abilities[key]);
      if (skill) skills.push(skill);
    }

    cache.set(championKey, skills);
    return skills;
  } catch (err) {
    console.warn(`Meraki fetch error for ${championKey}:`, err);
    return [];
  }
}

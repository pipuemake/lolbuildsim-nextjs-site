import type { MinionType, MinionStats, TowerStats, ComputedStats } from '@/types';
import { calcEffectiveArmor, calcPhysicalDamage, calcLethality } from './damage';

// ===== Minion Stats =====

interface MinionBase {
  hp: number;
  hpPerMin: number;
  ad: number;
  adPerMin: number;
  armorPer3Min: number;
  mr: number;
  attackSpeed: number;
  goldValue: number;
}

const MINION_BASES: Record<Exclude<MinionType, 'super'>, MinionBase> = {
  melee: {
    hp: 477,
    hpPerMin: 21,
    ad: 12,
    adPerMin: 0.5,
    armorPer3Min: 0.5,
    mr: 0,
    attackSpeed: 1.0,
    goldValue: 21,
  },
  ranged: {
    hp: 296,
    hpPerMin: 14,
    ad: 23,
    adPerMin: 0.5,
    armorPer3Min: 0.5,
    mr: 0,
    attackSpeed: 0.667,
    goldValue: 14,
  },
  cannon: {
    hp: 900,
    hpPerMin: 50,
    ad: 40,
    adPerMin: 1,
    armorPer3Min: 3,
    mr: 0,
    attackSpeed: 0.5,
    goldValue: 60,
  },
};

export function getMinionStats(type: MinionType, gameMinute: number): MinionStats {
  if (type === 'super') {
    return {
      type: 'super',
      hp: 1500,
      ad: 190,
      armor: 100,
      mr: 100,
      attackSpeed: 0.75,
      goldValue: 35,
    };
  }

  const base = MINION_BASES[type];
  const minutesAfter15 = Math.max(0, gameMinute - 15);
  const threeMinPeriods = Math.floor(gameMinute / 3);

  return {
    type,
    hp: base.hp + base.hpPerMin * minutesAfter15,
    ad: base.ad + base.adPerMin * minutesAfter15,
    armor: base.armorPer3Min * threeMinPeriods,
    mr: base.mr,
    attackSpeed: base.attackSpeed,
    goldValue: base.goldValue,
  };
}

// ===== Tower Stats =====

interface TowerBase {
  hp: number;
  baseAD: number;
  armor: number;
  mr: number;
  attackSpeed: number;
  shotDamageGrowth: number;
}

const TOWER_BASES: Record<'outer' | 'inner' | 'inhibitor', TowerBase> = {
  outer: {
    hp: 5000,
    baseAD: 152,
    armor: 40,
    mr: 40,
    attackSpeed: 0.83,
    shotDamageGrowth: 0.4,
  },
  inner: {
    hp: 6400,
    baseAD: 170,
    armor: 40,
    mr: 40,
    attackSpeed: 0.83,
    shotDamageGrowth: 0.4,
  },
  inhibitor: {
    hp: 4000,
    baseAD: 170,
    armor: 40,
    mr: 40,
    attackSpeed: 0.83,
    shotDamageGrowth: 0.4,
  },
};

export function getTowerStats(
  type: 'outer' | 'inner' | 'inhibitor',
  _gameMinute: number
): TowerStats {
  const base = TOWER_BASES[type];
  return {
    hp: base.hp,
    ad: base.baseAD,
    armor: base.armor,
    mr: base.mr,
    attackSpeed: base.attackSpeed,
    shotDamageGrowth: base.shotDamageGrowth,
  };
}

// ===== Damage calculations =====

export function calcDamageToMinion(
  attacker: ComputedStats,
  minion: MinionStats
): number {
  const flatPen = calcLethality(attacker.lethality, 18);
  const effectiveAR = calcEffectiveArmor(
    minion.armor,
    0,
    0,
    attacker.percentArmorPen,
    flatPen
  );
  const avgRaw = attacker.ad * (1 + attacker.critChance * (attacker.critMultiplier - 1));
  return calcPhysicalDamage(avgRaw, effectiveAR);
}

export function calcDamageFromMinion(
  minion: MinionStats,
  defender: ComputedStats
): number {
  const effectiveAR = calcEffectiveArmor(
    defender.armor,
    0,
    0,
    0,
    0
  );
  return calcPhysicalDamage(minion.ad, effectiveAR);
}

export function calcTowerDamageToChampion(
  tower: TowerStats,
  shotNumber: number,
  defender: ComputedStats
): number {
  // Damage increases by 40% (shotDamageGrowth) per consecutive shot to same champion
  // shotNumber starts at 1 for the first shot
  const rawDamage = tower.ad * Math.pow(1 + tower.shotDamageGrowth, shotNumber - 1);
  const effectiveAR = calcEffectiveArmor(defender.armor, 0, 0, 0, 0);
  return calcPhysicalDamage(rawDamage, effectiveAR);
}

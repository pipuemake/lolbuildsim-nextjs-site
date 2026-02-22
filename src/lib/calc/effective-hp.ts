import type { ComputedStats, EffectiveHPResult } from '@/types';

export function calcPhysicalEHP(hp: number, armor: number): number {
  return hp * (1 + armor / 100);
}

export function calcMagicEHP(hp: number, mr: number): number {
  return hp * (1 + mr / 100);
}

export function calcDamageReduction(resistance: number): number {
  return resistance / (100 + resistance);
}

export function calcEffectiveHP(stats: ComputedStats): EffectiveHPResult {
  return {
    physicalEHP: calcPhysicalEHP(stats.hp, stats.armor),
    magicEHP: calcMagicEHP(stats.hp, stats.mr),
    physicalReduction: calcDamageReduction(stats.armor),
    magicReduction: calcDamageReduction(stats.mr),
  };
}

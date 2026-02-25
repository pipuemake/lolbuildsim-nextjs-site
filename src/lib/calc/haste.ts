import type { ComputedStats, SkillData, HasteInfo } from '@/types';

export function calcActualCooldown(baseCD: number, haste: number): number {
  return baseCD * 100 / (100 + haste);
}

export function calcCDREquivalent(haste: number): number {
  return 1 - 100 / (100 + haste);
}

export function calcTenacityCCDuration(
  baseDuration: number,
  tenacity: number
): number {
  return baseDuration * (1 - tenacity / 100);
}

export function getHasteInfo(
  stats: ComputedStats,
  skills: SkillData[],
  skillRanks: Record<string, number>
): HasteInfo {
  const cooldownReduction = calcCDREquivalent(stats.abilityHaste);

  const skillCooldowns = skills
    .filter((skill) => skill.key !== 'P')
    .map((skill) => {
      const rank = skillRanks[skill.key] ?? 1;
      const safeRank = Math.max(1, Math.min(rank, skill.maxRank));
      const baseCD = skill.cooldown[safeRank - 1] ?? 0;
      // R (ultimate) uses Ultimate Haste; other skills use Ability Haste
      const haste = skill.key === 'R'
        ? stats.abilityHaste + (stats.ultimateHaste ?? 0)
        : stats.abilityHaste;
      return {
        key: skill.key,
        baseCooldown: baseCD,
        actualCooldown: calcActualCooldown(baseCD, haste),
      };
    });

  return {
    abilityHaste: stats.abilityHaste,
    ultimateHaste: stats.ultimateHaste ?? 0,
    cooldownReduction,
    skillCooldowns,
    tenacity: stats.tenacity,
    ccReduction: stats.tenacity / 100,
  };
}

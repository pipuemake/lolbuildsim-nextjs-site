import type { ComputedStats, DPSResult, ItemOnHitEffect } from '@/types';
import { calcLethality, calcEffectiveArmor, calcPhysicalDamage, calcOnHitDamage } from './damage';

export function calcDPS(
  attacker: ComputedStats,
  target: ComputedStats,
  level: number = 18,
  onHitEffects?: ItemOnHitEffect[]
): DPSResult {
  const flatPen = calcLethality(attacker.lethality, level);
  const effectiveAR = calcEffectiveArmor(
    target.armor,
    0,
    0,
    attacker.percentArmorPen,
    flatPen
  );

  // Average damage per auto including crit
  const avgRawPerAA = attacker.ad * (1 + attacker.critChance * (attacker.critMultiplier - 1));
  const effectiveDmgPerAA = calcPhysicalDamage(avgRawPerAA, effectiveAR);

  // On-hit DPS: only 'onhit' trigger (not spellblade)
  let onHitDpsContribution = 0;
  if (onHitEffects && onHitEffects.length > 0) {
    const onHitOnly = onHitEffects.filter((e) => e.trigger === 'onhit');
    if (onHitOnly.length > 0) {
      const ohResults = calcOnHitDamage(onHitOnly, attacker, target, level);
      const totalOnHitPerAA = ohResults.reduce((sum, r) => sum + r.effectiveDamage, 0);
      onHitDpsContribution = totalOnHitPerAA * attacker.attackSpeed;
    }
  }

  const dps = effectiveDmgPerAA * attacker.attackSpeed + onHitDpsContribution;

  return {
    dps,
    effectiveAD: effectiveDmgPerAA,
    attackSpeed: attacker.attackSpeed,
    critRate: attacker.critChance,
    critMultiplier: attacker.critMultiplier,
    onHitDpsContribution: onHitDpsContribution > 0 ? onHitDpsContribution : undefined,
  };
}

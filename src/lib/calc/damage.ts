import type {
  ComputedStats,
  SkillData,
  SkillSubCast,
  DamageResult,
  SkillDamageResult,
  ComboDamageResult,
  ItemOnHitEffect,
  OnHitDamageResult,
  ItemActiveEffect,
  ItemActiveDamageResult,
  ChampionComboPassive,
} from '@/types';

// ===== Penetration helpers =====

export function calcLethality(lethality: number, level: number): number {
  return lethality * (0.6 + 0.4 * level / 18);
}

export function calcEffectiveArmor(
  targetAR: number,
  flatReduction: number,
  percentReduction: number,
  percentPen: number,
  flatPen: number
): number {
  // Order: flat reduction -> % reduction -> % pen -> flat pen (lethality)
  let ar = targetAR - flatReduction;
  ar = ar * (1 - percentReduction);
  ar = ar * (1 - percentPen);
  ar = ar - flatPen;
  return Math.max(0, ar);
}

export function calcEffectiveMR(
  targetMR: number,
  flatPen: number,
  percentPen: number
): number {
  // Order: flat pen -> % pen
  let mr = targetMR - flatPen;
  mr = mr * (1 - percentPen);
  return Math.max(0, mr);
}

// ===== Damage formulas =====

export function calcPhysicalDamage(rawDmg: number, effectiveAR: number): number {
  if (effectiveAR >= 0) {
    return rawDmg * 100 / (100 + effectiveAR);
  }
  // Negative armor: amplifies damage
  return rawDmg * (2 - 100 / (100 - effectiveAR));
}

export function calcMagicDamage(rawDmg: number, effectiveMR: number): number {
  if (effectiveMR >= 0) {
    return rawDmg * 100 / (100 + effectiveMR);
  }
  return rawDmg * (2 - 100 / (100 - effectiveMR));
}

// ===== On-Hit damage =====

export function calcOnHitDamage(
  effects: ItemOnHitEffect[],
  attacker: ComputedStats,
  target: ComputedStats,
  level: number
): OnHitDamageResult[] {
  const flatArmorPen = calcLethality(attacker.lethality, level);
  const effectiveAR = calcEffectiveArmor(target.armor, 0, 0, attacker.percentArmorPen, flatArmorPen);
  const effectiveMR = calcEffectiveMR(target.mr, attacker.flatMagicPen, attacker.percentMagicPen);

  return effects.map((effect) => {
    const rawDamage = effect.calc(attacker, target, level);
    let effectiveDamage: number;
    switch (effect.damageType) {
      case 'physical':
        effectiveDamage = calcPhysicalDamage(rawDamage, effectiveAR);
        break;
      case 'magic':
        effectiveDamage = calcMagicDamage(rawDamage, effectiveMR);
        break;
      case 'true':
      default:
        effectiveDamage = rawDamage;
        break;
    }
    return {
      itemId: effect.itemId,
      itemName: effect.nameEn,
      itemNameJa: effect.nameJa,
      damageType: effect.damageType,
      rawDamage,
      effectiveDamage,
      trigger: effect.trigger,
    };
  });
}

// ===== Auto attack =====

export function calcAutoAttackDamage(
  attacker: ComputedStats,
  target: ComputedStats,
  level: number = 18,
  onHitEffects?: ItemOnHitEffect[],
  critCount?: number,
  totalAA?: number,
): DamageResult {
  const flatPen = calcLethality(attacker.lethality, level);
  const effectiveAR = calcEffectiveArmor(
    target.armor,
    0,
    0,
    attacker.percentArmorPen,
    flatPen
  );

  const rawAD = attacker.ad;
  // When critCount is specified, use exact crit calculation per AA
  let avgRaw: number;
  if (critCount != null && totalAA != null && totalAA > 0) {
    const critDmg = critCount * rawAD * attacker.critMultiplier;
    const normalDmg = (totalAA - critCount) * rawAD;
    avgRaw = (critDmg + normalDmg) / totalAA;
  } else {
    // Average damage accounting for crit:
    // avgRaw = AD * (1 + critChance * (critMultiplier - 1))
    avgRaw = rawAD * (1 + attacker.critChance * (attacker.critMultiplier - 1));
  }
  let physical = calcPhysicalDamage(avgRaw, effectiveAR);
  let magical = 0;
  let trueDamage = 0;

  // On-hit effects
  let onHitResults: OnHitDamageResult[] | undefined;
  if (onHitEffects && onHitEffects.length > 0) {
    onHitResults = calcOnHitDamage(onHitEffects, attacker, target, level);
    for (const oh of onHitResults) {
      switch (oh.damageType) {
        case 'physical': physical += oh.effectiveDamage; break;
        case 'magic': magical += oh.effectiveDamage; break;
        case 'true': trueDamage += oh.effectiveDamage; break;
      }
    }
  }

  return {
    physical,
    magical,
    trueDamage,
    total: physical + magical + trueDamage,
    onHitEffects: onHitResults,
  };
}

// ===== Skill damage =====

function getStatValue(stat: string, attacker: ComputedStats, target: ComputedStats): number {
  switch (stat) {
    case 'ad': return attacker.ad;
    case 'bonusAd': return attacker.ad - attacker.baseAd;
    case 'ap': return attacker.ap;
    case 'hp': return attacker.hp;
    case 'bonusHp': return attacker.hp - attacker.baseHp;
    case 'armor': return attacker.armor;
    case 'mr': return attacker.mr;
    case 'mana': return attacker.mp;
    case 'bonusMana': return attacker.mp - attacker.baseMp;
    case 'attackSpeed': return attacker.attackSpeed;
    case 'maxHp': return attacker.maxHp;
    case 'targetMaxHp': return target.maxHp;
    case 'targetCurrentHp': return target.hp;
    case 'targetMissingHp': return target.maxHp - target.hp;
    default: return 0;
  }
}

export function calcSkillDamage(
  skill: SkillData,
  skillRank: number,
  attacker: ComputedStats,
  target: ComputedStats,
  attackerLevel: number = 18
): SkillDamageResult {
  const rank = Math.max(1, Math.min(skillRank, skill.maxRank));
  const baseDamage = skill.baseDamage[rank - 1] ?? 0;

  let scaledDamage = 0;
  for (const scaling of skill.scalings) {
    scaledDamage += getStatValue(scaling.stat, attacker, target) * scaling.ratio;
  }

  const totalRaw = baseDamage + scaledDamage;

  let totalAfterResist: number;
  switch (skill.damageType) {
    case 'physical': {
      const effectiveAR = calcEffectiveArmor(
        target.armor,
        0,
        0,
        attacker.percentArmorPen,
        calcLethality(attacker.lethality, attackerLevel)
      );
      totalAfterResist = calcPhysicalDamage(totalRaw, effectiveAR);
      break;
    }
    case 'magic': {
      const effectiveMR = calcEffectiveMR(
        target.mr,
        attacker.flatMagicPen,
        attacker.percentMagicPen
      );
      totalAfterResist = calcMagicDamage(totalRaw, effectiveMR);
      break;
    }
    case 'true':
    default:
      totalAfterResist = totalRaw;
      break;
  }

  const missingHpScaling = skill.scalings.find(s => s.stat === 'targetMissingHp');
  return {
    skillKey: skill.key,
    skillName: skill.name,
    baseDamage,
    scaledDamage,
    totalRaw,
    totalAfterResist,
    damageType: skill.damageType,
    hasMissingHpScaling: !!missingHpScaling,
    missingHpRatio: missingHpScaling?.ratio,
  };
}

// ===== Item active damage =====

export function calcItemActiveDamage(
  effect: ItemActiveEffect,
  attacker: ComputedStats,
  target: ComputedStats,
  level: number
): ItemActiveDamageResult {
  const flatArmorPen = calcLethality(attacker.lethality, level);
  const effectiveAR = calcEffectiveArmor(target.armor, 0, 0, attacker.percentArmorPen, flatArmorPen);
  const effectiveMR = calcEffectiveMR(target.mr, attacker.flatMagicPen, attacker.percentMagicPen);

  const rawDamage = effect.calc(attacker, target, level);
  let effectiveDamage: number;
  switch (effect.damageType) {
    case 'physical':
      effectiveDamage = calcPhysicalDamage(rawDamage, effectiveAR);
      break;
    case 'magic':
      effectiveDamage = calcMagicDamage(rawDamage, effectiveMR);
      break;
    case 'true':
    default:
      effectiveDamage = rawDamage;
      break;
  }

  return {
    itemId: effect.itemId,
    itemName: effect.nameEn,
    itemNameJa: effect.nameJa,
    damageType: effect.damageType,
    rawDamage,
    effectiveDamage,
  };
}

// ===== Sub-cast skill damage =====

export function calcSubCastDamage(
  subCast: SkillSubCast,
  skillKey: 'Q' | 'W' | 'E' | 'R' | 'P',
  skillRank: number,
  maxRank: number,
  attacker: ComputedStats,
  target: ComputedStats,
  attackerLevel: number = 18,
  distanceMultiplier?: number
): SkillDamageResult {
  const rank = Math.max(1, Math.min(skillRank, maxRank));
  const baseDamage = subCast.baseDamage[rank - 1] ?? 0;

  let scaledDamage = 0;
  for (const scaling of subCast.scalings) {
    scaledDamage += getStatValue(scaling.stat, attacker, target) * scaling.ratio;
  }

  let totalRaw = baseDamage + scaledDamage;

  // Apply distance multiplier if provided (e.g. Nidalee Q)
  if (distanceMultiplier != null && distanceMultiplier !== 1) {
    totalRaw *= distanceMultiplier;
  }

  let totalAfterResist: number;
  switch (subCast.damageType) {
    case 'physical': {
      const effectiveAR = calcEffectiveArmor(
        target.armor,
        0,
        0,
        attacker.percentArmorPen,
        calcLethality(attacker.lethality, attackerLevel)
      );
      totalAfterResist = calcPhysicalDamage(totalRaw, effectiveAR);
      break;
    }
    case 'magic': {
      const effectiveMR = calcEffectiveMR(
        target.mr,
        attacker.flatMagicPen,
        attacker.percentMagicPen
      );
      totalAfterResist = calcMagicDamage(totalRaw, effectiveMR);
      break;
    }
    case 'true':
    default:
      totalAfterResist = totalRaw;
      break;
  }

  const missingHpScaling = subCast.scalings.find(s => s.stat === 'targetMissingHp');
  return {
    skillKey,
    skillName: subCast.nameEn,
    skillNameJa: subCast.nameJa,
    baseDamage,
    scaledDamage,
    totalRaw,
    totalAfterResist,
    damageType: subCast.damageType,
    subCastId: subCast.id,
    hasMissingHpScaling: !!missingHpScaling,
    missingHpRatio: missingHpScaling?.ratio,
  };
}

// ===== Missing HP recalculation helper =====

/**
 * Recalculate a skill's damage with an adjusted target HP (for missing HP ordering).
 * Only the targetMissingHp portion changes; other scalings remain the same.
 */
export function recalcMissingHpSkillDamage(
  original: SkillDamageResult,
  priorDamage: number,
  targetMaxHp: number,
  targetCurrentHp: number,
  attacker: ComputedStats,
  target: ComputedStats,
  attackerLevel: number,
): number {
  if (!original.hasMissingHpScaling || !original.missingHpRatio) {
    return original.totalAfterResist;
  }

  // Original missing HP used in calculation
  const originalMissingHp = targetMaxHp - targetCurrentHp;
  // New missing HP after prior damage
  const newCurrentHp = Math.max(0, targetCurrentHp - priorDamage);
  const newMissingHp = targetMaxHp - newCurrentHp;
  // Additional raw damage from increased missing HP
  const additionalMissingHp = newMissingHp - originalMissingHp;
  const additionalRaw = additionalMissingHp * original.missingHpRatio;

  // Apply resistance to the additional raw damage
  let additionalEffective: number;
  const flatArmorPen = calcLethality(attacker.lethality, attackerLevel);
  switch (original.damageType) {
    case 'physical': {
      const effectiveAR = calcEffectiveArmor(target.armor, 0, 0, attacker.percentArmorPen, flatArmorPen);
      additionalEffective = calcPhysicalDamage(additionalRaw, effectiveAR);
      break;
    }
    case 'magic': {
      const effectiveMR = calcEffectiveMR(target.mr, attacker.flatMagicPen, attacker.percentMagicPen);
      additionalEffective = calcMagicDamage(additionalRaw, effectiveMR);
      break;
    }
    case 'true':
    default:
      additionalEffective = additionalRaw;
      break;
  }

  return original.totalAfterResist + additionalEffective;
}

// ===== Full combo =====

export function calcFullCombo(
  skills: SkillData[],
  skillRanks: { Q: number; W: number; E: number; R: number },
  attacker: ComputedStats,
  target: ComputedStats,
  autoAttacks: number,
  attackerLevel: number = 18
): ComboDamageResult {
  const skillResults: SkillDamageResult[] = [];

  for (const skill of skills) {
    if (skill.key === 'P') continue; // Skip passive in combo by default
    const rank = skillRanks[skill.key as 'Q' | 'W' | 'E' | 'R'] ?? 1;
    if (rank > 0) {
      skillResults.push(calcSkillDamage(skill, rank, attacker, target, attackerLevel));
    }
  }

  const aaResult = calcAutoAttackDamage(attacker, target, attackerLevel);
  const aaDamage = aaResult.total * autoAttacks;
  const skillTotal = skillResults.reduce((sum, s) => sum + s.totalAfterResist, 0);
  const totalDamage = skillTotal + aaDamage;
  const overkill = Math.max(0, totalDamage - target.hp);
  const killable = totalDamage >= target.hp;

  return {
    skills: skillResults,
    autoAttacks,
    aaDamage,
    totalDamage,
    overkill,
    killable,
  };
}

// ===== Combo Passive Damage Helpers =====

/** Calculate on-hit damage from a combo passive (e.g. Irelia P) */
export function calcComboPassiveOnHitDamage(
  passive: ChampionComboPassive,
  passiveValue: number,
  attacker: ComputedStats,
  target: ComputedStats,
  level: number
): number {
  if (!passive.onHit) return 0;
  const rawDmg = passive.onHit.calc(passiveValue, attacker, target, level);
  if (rawDmg <= 0) return 0;

  const flatArmorPen = calcLethality(attacker.lethality, level);
  switch (passive.onHit.damageType) {
    case 'physical': {
      const effAR = calcEffectiveArmor(target.armor, 0, 0, attacker.percentArmorPen, flatArmorPen);
      return calcPhysicalDamage(rawDmg, effAR);
    }
    case 'magic': {
      const effMR = calcEffectiveMR(target.mr, attacker.flatMagicPen, attacker.percentMagicPen);
      return calcMagicDamage(rawDmg, effMR);
    }
    case 'true':
    default:
      return rawDmg;
  }
}

/** Calculate skill bonus damage from a combo passive (e.g. Nasus Q stacks) */
export function calcComboPassiveSkillBonus(
  passive: ChampionComboPassive,
  passiveValue: number,
  attacker: ComputedStats,
  target: ComputedStats,
  level: number
): number {
  if (!passive.skillBonus) return 0;
  const rawDmg = passive.skillBonus.calc(passiveValue, attacker, target, level);
  if (rawDmg <= 0) return 0;

  const flatArmorPen = calcLethality(attacker.lethality, level);
  switch (passive.skillBonus.damageType) {
    case 'physical': {
      const effAR = calcEffectiveArmor(target.armor, 0, 0, attacker.percentArmorPen, flatArmorPen);
      return calcPhysicalDamage(rawDmg, effAR);
    }
    case 'magic': {
      const effMR = calcEffectiveMR(target.mr, attacker.flatMagicPen, attacker.percentMagicPen);
      return calcMagicDamage(rawDmg, effMR);
    }
    case 'true':
    default:
      return rawDmg;
  }
}

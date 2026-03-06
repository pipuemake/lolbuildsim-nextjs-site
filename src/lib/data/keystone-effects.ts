/**
 * Precision keystone rune effect calculations.
 *
 * IDs (DDragon):
 *   Press the Attack: 8005
 *   Lethal Tempo:     8008
 *   Fleet Footwork:   8021
 *   Conqueror:        8010
 */

export const KEYSTONE_IDS = {
  PRESS_THE_ATTACK: 8005,
  LETHAL_TEMPO: 8008,
  FLEET_FOOTWORK: 8021,
  CONQUEROR: 8010,
} as const;

/** Whether attackRange qualifies as melee (<=350). */
export function isMelee(attackRange: number): boolean {
  return attackRange <= 350;
}

// ===== Press the Attack =====

/** PtA bonus damage on the 3rd AA hit (adaptive, before resist). */
export function calcPtaDamage(level: number): number {
  return 40 + (120 / 17) * (level - 1);
}

/** PtA damage amplification after proc (8%). */
export const PTA_AMP = 0.08;

// ===== Lethal Tempo =====

/** Bonus AS per stack (%). Melee: 6%, Ranged: 4%. Max 6 stacks. */
export function calcLethalTempoAS(stacks: number, melee: boolean): number {
  return stacks * (melee ? 6 : 4);
}

export const LETHAL_TEMPO_MAX_STACKS = 6;

/**
 * Lethal Tempo on-hit damage per AA after 6 stacks (raw, adaptive).
 * Base = 30 + 90/17*(level-1), then scaled by (1 + bonusAS%/100).
 * Melee base is ×1 and Ranged base is ×0.6 of this.
 */
export function calcLethalTempoOnHit(
  level: number,
  melee: boolean,
  bonusASPercent: number,
): number {
  const base = (30 + (90 / 17) * (level - 1)) * (melee ? 1 : 0.6);
  return base * (1 + bonusASPercent / 100);
}

// ===== Fleet Footwork =====

/**
 * Fleet Footwork heal per proc.
 * Melee: 10 + 90/17*(level-1) + 0.10 bonusAD + 0.05 AP
 * Ranged: (10 + 90/17*(level-1) + 0.10 bonusAD + 0.05 AP) * 0.6
 *
 * For simplicity we return the base heal (without scaling) and let the caller add ratios.
 */
export function calcFleetHeal(
  level: number,
  melee: boolean,
  bonusAD: number,
  ap: number,
): number {
  const base = 10 + (90 / 17) * (level - 1) + 0.10 * bonusAD + 0.05 * ap;
  return melee ? base : base * 0.6;
}

// ===== Conqueror =====

/** Conqueror per-stack value that scales with level. */
export function calcConquerorPerStack(level: number): number {
  return 1.8 + ((4 - 1.8) / 17) * (level - 1);
}

export const CONQUEROR_MAX_STACKS = 12;

/** Conqueror AD bonus (per-stack value × 0.6 × stacks). */
export function calcConquerorAD(stacks: number, level: number): number {
  return stacks * calcConquerorPerStack(level) * 0.6;
}

/** Conqueror AP bonus (per-stack value × stacks). */
export function calcConquerorAP(stacks: number, level: number): number {
  return stacks * calcConquerorPerStack(level);
}

/**
 * Keystone and sub-rune effect calculations.
 *
 * Precision IDs:
 *   Press the Attack: 8005
 *   Lethal Tempo:     8008
 *   Fleet Footwork:   8021
 *   Conqueror:        8010
 *
 * Domination IDs:
 *   Electrocute:      8112
 *   Dark Harvest:     8128
 *   Hail of Blades:   9923
 *
 * Sorcery IDs:
 *   Summon Aery:      8214
 *   Arcane Comet:     8229
 *   Phase Rush:       8230
 *
 * Resolve IDs:
 *   Grasp of the Undying: 8437
 *   Aftershock:       8439
 *   Guardian:         8465
 *
 * Inspiration IDs:
 *   Glacial Augment:  8351
 *   Unsealed Spellbook: 8360
 *   First Strike:     8369
 *
 * Sub-rune IDs:
 *   Cheap Shot:       8126
 *   Taste of Blood:   8139
 *   Sudden Impact:    8143
 *   Eyeball Collection: 8138
 *   Absolute Focus:   8233
 *   Transcendence:    8210
 *   Scorch:           8237
 *   Conditioning:     8429
 *   Overgrowth:       8451
 *   Bone Plating:     8473
 *   Second Wind:      8444
 *   Shield Bash:      8401
 *   Coup de Grace:    8014
 *   Cut Down:         8017
 *   Last Stand:       8299
 *   Unflinching:      8242
 *   Biscuit Delivery: 8345
 *   Triple Tonic:     8313
 */

import type { SelectedRunes } from '@/types';

export const KEYSTONE_IDS = {
  // Precision
  PRESS_THE_ATTACK: 8005,
  LETHAL_TEMPO: 8008,
  FLEET_FOOTWORK: 8021,
  CONQUEROR: 8010,
  // Domination
  ELECTROCUTE: 8112,
  DARK_HARVEST: 8128,
  HAIL_OF_BLADES: 9923,
  // Sorcery
  SUMMON_AERY: 8214,
  ARCANE_COMET: 8229,
  PHASE_RUSH: 8230,
  // Resolve
  GRASP_OF_THE_UNDYING: 8437,
  AFTERSHOCK: 8439,
  GUARDIAN: 8465,
  // Inspiration
  GLACIAL_AUGMENT: 8351,
  UNSEALED_SPELLBOOK: 8360,
  FIRST_STRIKE: 8369,
} as const;

export const SUBRUNE_IDS = {
  CHEAP_SHOT: 8126,
  TASTE_OF_BLOOD: 8139,
  SUDDEN_IMPACT: 8143,
  EYEBALL_COLLECTION: 8138,
  ABSOLUTE_FOCUS: 8233,
  TRANSCENDENCE: 8210,
  SCORCH: 8237,
  CONDITIONING: 8429,
  OVERGROWTH: 8451,
  BONE_PLATING: 8473,
  SECOND_WIND: 8444,
  SHIELD_BASH: 8401,
  // Precision slot 3
  COUP_DE_GRACE: 8014,
  CUT_DOWN: 8017,
  LAST_STAND: 8299,
  // Resolve slot 3
  UNFLINCHING: 8242,
  // Inspiration
  BISCUIT_DELIVERY: 8345,
  TRIPLE_TONIC: 8313,
  JACK_OF_ALL_TRADES: 8316,
} as const;

/** Whether attackRange qualifies as melee (<=350). */
export function isMelee(attackRange: number): boolean {
  return attackRange <= 350;
}

/** Check if a sub-rune is selected in any slot. */
export function hasSubRune(runes: SelectedRunes, runeId: number): boolean {
  return (
    runes.primarySlot1 === runeId ||
    runes.primarySlot2 === runeId ||
    runes.primarySlot3 === runeId ||
    runes.secondarySlot1 === runeId ||
    runes.secondarySlot2 === runeId
  );
}

// =============================================
// Precision Keystones
// =============================================

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
 * Ranged: above * 0.6
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

// =============================================
// Domination Keystones
// =============================================

// ===== Electrocute =====

/** Electrocute damage: 70-260 (level) + 10% bonusAD + 5% AP. Adaptive. */
export function calcElectrocuteDamage(level: number, bonusAD: number, ap: number): number {
  const base = 70 + (190 / 17) * (level - 1);
  return base + 0.10 * bonusAD + 0.05 * ap;
}

// ===== Dark Harvest =====

/** Dark Harvest proc damage: 30 + 11*stacks + 10% bonusAD + 5% AP. Adaptive. */
export function calcDarkHarvestDamage(stacks: number, bonusAD: number, ap: number): number {
  return 30 + 11 * stacks + 0.10 * bonusAD + 0.05 * ap;
}

// ===== Hail of Blades =====

/** Hail of Blades bonus AS. Melee: 160%, Ranged: 80%. */
export function calcHailOfBladesAS(melee: boolean): number {
  return melee ? 1.60 : 0.80;
}

export const HAIL_OF_BLADES_ATTACKS = 2;

// =============================================
// Sorcery Keystones
// =============================================

// ===== Summon Aery =====

/** Summon Aery damage: 10-54.71 (level) + 10% bonusAD + 5% AP. Adaptive. */
export function calcAeryDamage(level: number, bonusAD: number, ap: number): number {
  const base = 10 + (44.71 / 17) * (level - 1);
  return base + 0.10 * bonusAD + 0.05 * ap;
}

// ===== Arcane Comet =====

/** Arcane Comet damage: 30-141.76 (level) + 10% bonusAD + 5% AP. Adaptive. */
export function calcCometDamage(level: number, bonusAD: number, ap: number): number {
  const base = 30 + (111.76 / 17) * (level - 1);
  return base + 0.10 * bonusAD + 0.05 * ap;
}

// =============================================
// Resolve Keystones
// =============================================

// ===== Grasp of the Undying =====

/** Grasp on-hit magic damage. Melee: 3.5% maxHP, Ranged: 1.4% maxHP. */
export function calcGraspDamage(maxHp: number, melee: boolean): number {
  return maxHp * (melee ? 0.035 : 0.014);
}

/** Grasp heal per proc. Melee: 1.3% maxHP, Ranged: 0.52% maxHP. */
export function calcGraspHeal(maxHp: number, melee: boolean): number {
  return maxHp * (melee ? 0.013 : 0.0052);
}

// ===== Aftershock =====

/** Aftershock shockwave damage: 25-120 (level) + 8% bonusHP. Magic. */
export function calcAftershockDamage(level: number, bonusHp: number): number {
  const base = 25 + (95 / 17) * (level - 1);
  return base + 0.08 * bonusHp;
}

// =============================================
// Inspiration Keystones
// =============================================

// ===== First Strike =====

/** First Strike: 7% bonus true damage on all post-mitigation damage. */
export const FIRST_STRIKE_AMP = 0.07;

// =============================================
// Sub-rune damage
// =============================================

// ===== Cheap Shot =====

/** Cheap Shot: 10-49.12 (level) bonus true damage (4s CD). */
export function calcCheapShotDamage(level: number): number {
  return 10 + (39.12 / 17) * (level - 1);
}

// ===== Sudden Impact =====

/** Sudden Impact: 20-80 (level) bonus true damage (10s CD). */
export function calcSuddenImpactDamage(level: number): number {
  return 20 + (60 / 17) * (level - 1);
}

// ===== Scorch =====

/** Scorch: 20-42.35 (level) bonus magic damage (10s CD). */
export function calcScorchDamage(level: number): number {
  return 20 + (22.35 / 17) * (level - 1);
}

// ===== Taste of Blood =====

/** Taste of Blood heal: 16-42.82 (level) + 10% bonusAD + 5% AP (20s CD). */
export function calcTasteOfBloodHeal(level: number, bonusAD: number, ap: number): number {
  const base = 16 + (26.82 / 17) * (level - 1);
  return base + 0.10 * bonusAD + 0.05 * ap;
}

// =============================================
// Precision Slot 3 — Damage Amplification
// =============================================

/** Coup de Grace: 8% bonus damage to targets below 40% max HP. */
export const COUP_DE_GRACE_AMP = 0.08;
export const COUP_DE_GRACE_THRESHOLD = 0.40;

/** Cut Down: 8% bonus damage to targets above 60% max HP. */
export const CUT_DOWN_AMP = 0.08;
export const CUT_DOWN_THRESHOLD = 0.60;

/**
 * Last Stand: 5-11% bonus damage based on own missing HP.
 * Activates below 60% HP, maxes at 30% HP.
 * @param ownHpPercent - attacker's current HP as a fraction (0-1)
 */
export function calcLastStandAmp(ownHpPercent: number): number {
  if (ownHpPercent >= 0.60) return 0;
  if (ownHpPercent <= 0.30) return 0.11;
  // Linear interpolation: 5% at 60% HP → 11% at 30% HP
  const t = (0.60 - ownHpPercent) / (0.60 - 0.30);
  return 0.05 + t * (0.11 - 0.05);
}

// ===== Bone Plating =====

/** Bone Plating damage reduction per hit: 30-63.53 (based on level). Blocks 3 hits. */
export function calcBonePlatingReduction(level: number): number {
  return 30 + (33.53 / 17) * (level - 1);
}
export const BONE_PLATING_HITS = 3;

// ===== Second Wind =====

/** Second Wind heal: 4% of missing HP over 10 seconds (triggered by enemy damage). */
export function calcSecondWindHeal(maxHp: number, currentHp: number): number {
  const missingHp = maxHp - currentHp;
  return missingHp * 0.04;
}

// ===== Biscuit Delivery =====

/** Biscuit Delivery: consuming a biscuit permanently grants +30 max HP. Max 3 biscuits. */
export const BISCUIT_MAX_HP_PER_USE = 30;
export const BISCUIT_MAX_COUNT = 3;

// ===== Triple Tonic =====

// ===== Jack of All Trades =====

import type { Item } from '@/types';

/** Count unique stat types from equipped items for Jack of All Trades. */
export function countJackStacks(items: Item[]): number {
  const stats = new Set<string>();
  for (const item of items) {
    if (!item?.stats) continue;
    for (const [key, val] of Object.entries(item.stats)) {
      if (val && val !== 0) stats.add(key);
    }
  }
  return stats.size;
}

/** Calculate Jack of All Trades bonuses. Returns { abilityHaste, ad, ap } */
export function calcJackBonus(stacks: number, isAdaptiveAD: boolean): { abilityHaste: number; ad: number; ap: number } {
  const ah = stacks; // 1 AH per stack
  let ad = 0, ap = 0;
  if (stacks >= 5) {
    if (isAdaptiveAD) ad += 6; else ap += 10;
  }
  if (stacks >= 10) {
    if (isAdaptiveAD) ad += 9; else ap += 15;
  }
  return { abilityHaste: ah, ad, ap };
}

// =============================================
// Sub-runes that should be charge-managed in combo bar
// =============================================
export const CHARGE_SUBRUNE_IDS: number[] = [
  SUBRUNE_IDS.CHEAP_SHOT,
  SUBRUNE_IDS.SUDDEN_IMPACT,
  SUBRUNE_IDS.TASTE_OF_BLOOD,
  SUBRUNE_IDS.SCORCH,
  SUBRUNE_IDS.BONE_PLATING,
  SUBRUNE_IDS.SECOND_WIND,
];

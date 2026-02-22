import type { ItemOnHitEffect, ItemActiveEffect } from '@/types';

// ===== On-Hit Item Effect Registry =====

const ALL_ON_HIT_EFFECTS: ItemOnHitEffect[] = [
  // Blade of the Ruined King — 9% target current HP physical (min 15)
  {
    itemId: '3153',
    nameEn: 'Blade of the Ruined King',
    nameJa: 'ルインドキング・ブレード',
    trigger: 'onhit',
    damageType: 'physical',
    calc: (_attacker, target) => Math.max(15, target.hp * 0.09),
  },
  // Nashor's Tooth — 15 + 20% AP magic
  {
    itemId: '3115',
    nameEn: "Nashor's Tooth",
    nameJa: 'ナッシャー・トゥース',
    trigger: 'onhit',
    damageType: 'magic',
    calc: (attacker) => 15 + attacker.ap * 0.2,
  },
  // Wit's End — 15-80 magic (level scaling)
  {
    itemId: '3091',
    nameEn: "Wit's End",
    nameJa: 'ウィッツエンド',
    trigger: 'onhit',
    damageType: 'magic',
    calc: (_attacker, _target, level) => {
      // 15 at lv1, 80 at lv18, linear interpolation
      return 15 + (80 - 15) * (level - 1) / 17;
    },
  },
  // Recurve Bow — 15 physical on-hit
  {
    itemId: '1043',
    nameEn: 'Recurve Bow',
    nameJa: 'リカーブ・ボウ',
    trigger: 'onhit',
    damageType: 'physical',
    calc: () => 15,
  },
  // Titanic Hydra — 5 + 1.5% bonus HP physical on-hit
  {
    itemId: '3748',
    nameEn: 'Titanic Hydra',
    nameJa: 'タイタン・ハイドラ',
    trigger: 'onhit',
    damageType: 'physical',
    calc: (attacker) => {
      const bonusHp = attacker.hp - attacker.baseHp;
      return 5 + bonusHp * 0.015;
    },
  },
  // Lich Bane — 75% base AD + 50% AP magic (Spellblade)
  {
    itemId: '3100',
    nameEn: 'Lich Bane',
    nameJa: 'リッチベイン',
    trigger: 'spellblade',
    damageType: 'magic',
    calc: (attacker) => attacker.baseAd * 0.75 + attacker.ap * 0.5,
  },
  // Trinity Force — 200% base AD physical (Spellblade)
  {
    itemId: '3078',
    nameEn: 'Trinity Force',
    nameJa: 'トリニティ・フォース',
    trigger: 'spellblade',
    damageType: 'physical',
    calc: (attacker) => attacker.baseAd * 2.0,
  },
  // Sheen — 100% base AD physical (Spellblade)
  {
    itemId: '3057',
    nameEn: 'Sheen',
    nameJa: 'シーン',
    trigger: 'spellblade',
    damageType: 'physical',
    calc: (attacker) => attacker.baseAd * 1.0,
  },
];

// Spellblade priority: Trinity Force > Lich Bane > Sheen (only highest applies)
const SPELLBLADE_PRIORITY: string[] = ['3078', '3100', '3057'];

// Pre-built Map for O(1) spellblade lookup by itemId
const SPELLBLADE_MAP = new Map(
  ALL_ON_HIT_EFFECTS
    .filter(e => e.trigger === 'spellblade')
    .map(e => [e.itemId, e])
);

/**
 * Get active on-hit effects for the given item IDs.
 * Handles spellblade mutual exclusion (highest priority only).
 */
export function getItemOnHitEffects(itemIds: string[]): ItemOnHitEffect[] {
  const idSet = new Set(itemIds);
  const results: ItemOnHitEffect[] = [];

  // Add all regular on-hit effects
  for (const effect of ALL_ON_HIT_EFFECTS) {
    if (!idSet.has(effect.itemId)) continue;
    if (effect.trigger === 'onhit') {
      results.push(effect);
    }
  }

  // Add only the highest priority spellblade
  for (const spellbladeId of SPELLBLADE_PRIORITY) {
    if (idSet.has(spellbladeId)) {
      const effect = SPELLBLADE_MAP.get(spellbladeId);
      if (effect) results.push(effect);
      break; // only the highest priority
    }
  }

  return results;
}

// ===== Item Active Effect Registry =====

const ALL_ACTIVE_EFFECTS: ItemActiveEffect[] = [
  // Hextech Rocketbelt — 125 + 15% AP magic (level scales base: 75-150)
  {
    itemId: '3152',
    nameEn: 'Hextech Rocketbelt',
    nameJa: 'ヘクステック・ロケットベルト',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 75 + (75 * (level - 1) / 17);
      return base + attacker.ap * 0.15;
    },
  },
  // Stridebreaker — 75% total AD physical
  {
    itemId: '6631',
    nameEn: 'Stridebreaker',
    nameJa: 'ストライドブレイカー',
    damageType: 'physical',
    calc: (attacker) => attacker.ad * 0.75,
  },
  // Goredrinker — 100% total AD physical
  {
    itemId: '6630',
    nameEn: 'Goredrinker',
    nameJa: 'ゴアドリンカー',
    damageType: 'physical',
    calc: (attacker) => attacker.ad * 1.0,
  },
  // Prowler's Claw — 65 + 25% bonus AD physical
  {
    itemId: '6693',
    nameEn: "Prowler's Claw",
    nameJa: 'プラウラークロウ',
    damageType: 'physical',
    calc: (attacker) => 65 + (attacker.ad - attacker.baseAd) * 0.25,
  },
  // Everfrost — 100 + 30% AP magic (root/slow)
  {
    itemId: '6656',
    nameEn: 'Everfrost',
    nameJa: 'エバーフロスト',
    damageType: 'magic',
    calc: (attacker) => 100 + attacker.ap * 0.3,
  },
  // Sunfire Aegis / Jak'Sho — Immolate 15-30 + 1% bonus HP magic per second (approx per tick)
  {
    itemId: '3068',
    nameEn: 'Sunfire Aegis',
    nameJa: 'サンファイア・イージス',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 15 + (15 * (level - 1) / 17);
      const bonusHp = attacker.hp - attacker.baseHp;
      return base + bonusHp * 0.01;
    },
  },
  // Ravenous Hydra — Crescent: 60% total AD physical (active)
  {
    itemId: '3074',
    nameEn: 'Ravenous Hydra',
    nameJa: 'ラヴァナス・ハイドラ',
    damageType: 'physical',
    calc: (attacker) => attacker.ad * 0.6,
  },
  // Titanic Hydra — Reset: 5 + 1.5% bonus HP physical (active, same as on-hit)
  {
    itemId: '3748',
    nameEn: 'Titanic Hydra',
    nameJa: 'タイタン・ハイドラ',
    damageType: 'physical',
    calc: (attacker) => {
      const bonusHp = attacker.hp - attacker.baseHp;
      return 5 + bonusHp * 0.015;
    },
  },
];

/**
 * Get item active effects for the given item IDs.
 */
export function getItemActiveEffects(itemIds: string[]): ItemActiveEffect[] {
  const idSet = new Set(itemIds);
  return ALL_ACTIVE_EFFECTS.filter((e) => idSet.has(e.itemId));
}

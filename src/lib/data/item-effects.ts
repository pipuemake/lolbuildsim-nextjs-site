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
  // Terminus — 30 bonus magic damage on-hit
  {
    itemId: '3302',
    nameEn: 'Terminus',
    nameJa: '終わりなき絶望',
    trigger: 'onhit',
    damageType: 'magic',
    calc: () => 30,
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
  // Hextech Gunblade — 175-262 + 30% AP magic (active)
  {
    itemId: '3146',
    nameEn: 'Hextech Gunblade',
    nameJa: 'ヘクステック・ガンブレード',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 175 + (87 * (level - 1) / 17);
      return base + attacker.ap * 0.3;
    },
  },
  // Hextech Alternator — 65 magic damage proc
  {
    itemId: '3145',
    nameEn: 'Hextech Alternator',
    nameJa: 'アクチュアライザー',
    damageType: 'magic',
    calc: () => 65,
  },
  // Luden's Tempest — 100 + 10% AP magic per orb
  {
    itemId: '6655',
    nameEn: "Luden's Tempest",
    nameJa: 'ルーデンエコー',
    damageType: 'magic',
    calc: (attacker) => 100 + attacker.ap * 0.1,
  },
  // Stormsurge — 125 + 10% AP magic proc
  {
    itemId: '4646',
    nameEn: 'Stormsurge',
    nameJa: 'ストームサージ',
    damageType: 'magic',
    calc: (attacker) => 125 + attacker.ap * 0.1,
  },
  // Hollow Radiance — 15 + 1% bonus HP magic per second (aura)
  {
    itemId: '6664',
    nameEn: 'Hollow Radiance',
    nameJa: 'ホロウレディアンス',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 15 + (15 * (level - 1) / 17);
      const bonusHp = attacker.hp - attacker.baseHp;
      return base + bonusHp * 0.01;
    },
  },
  // Sundered Sky — 100% crit damage physical proc (once per target per 10s)
  {
    itemId: '6610',
    nameEn: 'Sundered Sky',
    nameJa: 'サンダードスカイ',
    damageType: 'physical',
    calc: (attacker) => attacker.ad * attacker.critMultiplier,
  },
  // Elixir of Sorcery — 25 true damage on hit to champions
  {
    itemId: '2139',
    nameEn: 'Elixir of Sorcery',
    nameJa: 'ソーサリー エリクサー',
    damageType: 'true',
    calc: () => 25,
  },
];

/**
 * Get item active effects for the given item IDs.
 */
export function getItemActiveEffects(itemIds: string[]): ItemActiveEffect[] {
  const idSet = new Set(itemIds);
  return ALL_ACTIVE_EFFECTS.filter((e) => idSet.has(e.itemId));
}

// ===== Item Stack Bonuses (Dark Seal, Mejai's, Yuntal, etc.) =====

export interface ItemStackBonus {
  itemId: string;
  nameEn: string;
  nameJa: string;
  maxStacks: number;
  statBonus: (stacks: number) => Record<string, number>;
}

export const ITEM_STACK_BONUSES: ItemStackBonus[] = [
  {
    itemId: '1082', // Dark Seal
    nameEn: 'Dark Seal',
    nameJa: 'ダークシール',
    maxStacks: 10,
    statBonus: (stacks) => ({ ap: stacks * 4 }),
  },
  {
    itemId: '3041', // Mejai's Soulstealer
    nameEn: "Mejai's Soulstealer",
    nameJa: 'メジャイソウルスティーラー',
    maxStacks: 25,
    statBonus: (stacks) => ({
      ap: stacks * 5,
      ...(stacks >= 10 ? { moveSpeedPercent: 0.10 } : {}),
    }),
  },
  {
    itemId: '4010', // Yuntal Wildarrows
    nameEn: 'Yuntal Wildarrows',
    nameJa: 'ユンタルワイルドアロー',
    maxStacks: 25,
    statBonus: (stacks) => ({ critChance: stacks * 0.01 }),
  },
  // Elixirs (toggle: 0=inactive, 1=active)
  {
    itemId: '2140', // Elixir of Wrath
    nameEn: 'Elixir of Wrath',
    nameJa: 'ラース エリクサー',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { ad: 30 } : ({}  as Record<string, number>)),
  },
  {
    itemId: '2139', // Elixir of Sorcery
    nameEn: 'Elixir of Sorcery',
    nameJa: 'ソーサリー エリクサー',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { ap: 50 } : ({} as Record<string, number>)),
  },
  {
    itemId: '2138', // Elixir of Iron
    nameEn: 'Elixir of Iron',
    nameJa: 'アイアン エリクサー',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { hp: 300, tenacity: 0.25 } : ({} as Record<string, number>)),
  },
];

export function getItemStackBonuses(itemIds: string[]): ItemStackBonus[] {
  const idSet = new Set(itemIds);
  return ITEM_STACK_BONUSES.filter((b) => idSet.has(b.itemId));
}

// ===== Item Heal Effects (Potions) =====

export interface ItemHealEffect {
  itemId: string;
  nameEn: string;
  nameJa: string;
  healPerCharge: number;
  maxCharges: number;
}

const ITEM_HEAL_EFFECTS: ItemHealEffect[] = [
  {
    itemId: '2003', // Health Potion
    nameEn: 'Health Potion',
    nameJa: '体力ポーション',
    healPerCharge: 120,
    maxCharges: 1,
  },
  {
    itemId: '2031', // Refillable Potion
    nameEn: 'Refillable Potion',
    nameJa: '詰め替えポーション',
    healPerCharge: 100,
    maxCharges: 2,
  },
];

export function getItemHealEffects(itemIds: string[]): ItemHealEffect[] {
  const idSet = new Set(itemIds);
  return ITEM_HEAL_EFFECTS.filter((e) => idSet.has(e.itemId));
}

// ===== Lifeline Shield Registry =====

export interface ItemLifelineShield {
  itemId: string;
  nameEn: string;
  nameJa: string;
  /** Calculate shield amount given the holder's computed stats and level */
  calc: (holder: { hp: number; baseHp: number; ad: number; ap: number; mr: number }, level: number) => number;
}

const LIFELINE_SHIELDS: ItemLifelineShield[] = [
  // Maw of Malmortius — Lifeline: magic shield = 200 + 20% max HP (for 2.5s)
  {
    itemId: '3156',
    nameEn: 'Maw of Malmortius',
    nameJa: 'マルモティウスの胃袋',
    calc: (holder) => 200 + holder.hp * 0.2,
  },
  // Sterak's Gage — Lifeline: shield = 75% bonus HP (decays over 3.75s)
  {
    itemId: '3053',
    nameEn: "Sterak's Gage",
    nameJa: 'ステラックの篭手',
    calc: (holder) => {
      const bonusHp = holder.hp - holder.baseHp;
      return bonusHp * 0.75;
    },
  },
  // Immortal Shieldbow — Lifeline: shield = 300 + 800 over levels 1-18
  {
    itemId: '6673',
    nameEn: 'Immortal Shieldbow',
    nameJa: 'イモータルシールドボウ',
    calc: (_holder, level) => {
      return 300 + (800 * (level - 1) / 17);
    },
  },
];

/**
 * Get the Lifeline shield for the given items.
 * Lifeline is a unique passive — only one can proc. We pick the first matching item.
 */
export function getLifelineShield(
  itemIds: string[],
  holder: { hp: number; baseHp: number; ad: number; ap: number; mr: number },
  level: number,
): { shield: number; item: ItemLifelineShield } | null {
  const idSet = new Set(itemIds);
  for (const ls of LIFELINE_SHIELDS) {
    if (!idSet.has(ls.itemId)) continue;
    return { shield: ls.calc(holder, level), item: ls };
  }
  return null;
}

import type { ItemOnHitEffect, ItemActiveEffect } from '@/types';

// ===== On-Hit Item Effect Registry =====

const ALL_ON_HIT_EFFECTS: ItemOnHitEffect[] = [
  // Blade of the Ruined King — 12% target current HP physical (melee) / 8% (ranged), min 15
  {
    itemId: '3153',
    nameEn: 'Blade of the Ruined King',
    nameJa: 'ルインドキング・ブレード',
    trigger: 'onhit',
    damageType: 'physical',
    calc: (attacker, target) => {
      const pct = attacker.attackRange <= 350 ? 0.12 : 0.08;
      return Math.max(15, target.hp * pct);
    },
  },
  // Nashor's Tooth — 15 + 15% AP magic
  {
    itemId: '3115',
    nameEn: "Nashor's Tooth",
    nameJa: 'ナッシャー・トゥース',
    trigger: 'onhit',
    damageType: 'magic',
    calc: (attacker) => 15 + attacker.ap * 0.15,
  },
  // Wit's End — 15-80 magic on-hit (level scaling)
  {
    itemId: '3091',
    nameEn: "Wit's End",
    nameJa: 'ウィッツエンド',
    trigger: 'onhit',
    damageType: 'magic',
    calc: (_attacker, _target, level) => 15 + (65 * (level - 1) / 17),
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
  // Titanic Hydra — 1% max HP physical on-hit (melee) / 0.5% (ranged)
  {
    itemId: '3748',
    nameEn: 'Titanic Hydra',
    nameJa: 'タイタン・ハイドラ',
    trigger: 'onhit',
    damageType: 'physical',
    calc: (attacker) => {
      const pct = attacker.attackRange <= 350 ? 0.01 : 0.005;
      return attacker.maxHp * pct;
    },
  },
  // Terminus — 30 bonus magic damage on-hit
  {
    itemId: '3302',
    nameEn: 'Terminus',
    nameJa: 'ターミナス',
    trigger: 'onhit',
    damageType: 'magic',
    calc: () => 30,
  },
  // Guinsoo's Rageblade — 30 flat + 1.5 per 1% crit (max 180) magic on-hit
  {
    itemId: '3124',
    nameEn: "Guinsoo's Rageblade",
    nameJa: 'グインソー・レイジブレード',
    trigger: 'onhit',
    damageType: 'magic',
    calc: (attacker) => {
      const critBonus = Math.min((attacker.critChance ?? 0) * 150, 180);
      return 30 + critBonus;
    },
  },
  // Profane Hydra — Cleave: 40% AD (melee) / 20% AD (ranged) physical splash on-hit
  {
    itemId: '6698',
    nameEn: 'Profane Hydra',
    nameJa: 'プロフェイン ハイドラ',
    trigger: 'onhit',
    damageType: 'physical',
    calc: (attacker) => {
      const pct = attacker.attackRange <= 350 ? 0.4 : 0.2;
      return attacker.ad * pct;
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
  // Iceborn Gauntlet — 150% base AD physical (Spellblade)
  {
    itemId: '6662',
    nameEn: 'Iceborn Gauntlet',
    nameJa: 'アイスボーンガントレット',
    trigger: 'spellblade',
    damageType: 'physical',
    calc: (attacker) => attacker.baseAd * 1.5,
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

// Spellblade priority: Trinity Force > Lich Bane > Iceborn > Sheen (only highest applies)
const SPELLBLADE_PRIORITY: string[] = ['3078', '3100', '6662', '3057'];

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
  // Hextech Rocketbelt — 100 + 10% AP magic
  {
    itemId: '3152',
    nameEn: 'Hextech Rocketbelt',
    nameJa: 'ヘクステック・ロケットベルト',
    damageType: 'magic',
    calc: (attacker) => 100 + attacker.ap * 0.1,
  },
  // Stridebreaker — 175% base AD physical
  {
    itemId: '6631',
    nameEn: 'Stridebreaker',
    nameJa: 'ストライドブレイカー',
    damageType: 'physical',
    calc: (attacker) => attacker.baseAd * 1.75,
  },
  // Goredrinker — 175% base AD physical
  {
    itemId: '6630',
    nameEn: 'Goredrinker',
    nameJa: 'ゴアドリンカー',
    damageType: 'physical',
    calc: (attacker) => attacker.baseAd * 1.75,
  },
  // Sunfire Aegis — Immolate: 12-30 + 1% bonus HP magic per second
  {
    itemId: '3068',
    nameEn: 'Sunfire Aegis',
    nameJa: 'サンファイア・イージス',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 12 + (18 * (level - 1) / 17);
      const bonusHp = attacker.maxHp - attacker.baseHp;
      return base + bonusHp * 0.01;
    },
  },
  // Ravenous Hydra — Crescent: 80% total AD physical
  {
    itemId: '3074',
    nameEn: 'Ravenous Hydra',
    nameJa: 'ラヴァナス・ハイドラ',
    damageType: 'physical',
    calc: (attacker) => attacker.ad * 0.8,
  },
  // Titanic Hydra — Active: 4% max HP (melee) / 2% (ranged) physical
  {
    itemId: '3748',
    nameEn: 'Titanic Hydra',
    nameJa: 'タイタン・ハイドラ',
    damageType: 'physical',
    calc: (attacker) => {
      const pct = attacker.attackRange <= 350 ? 0.04 : 0.02;
      return attacker.maxHp * pct;
    },
  },
  // Hextech Alternator — 50-125 magic (level scaling)
  {
    itemId: '3145',
    nameEn: 'Hextech Alternator',
    nameJa: 'アクチュアライザー',
    damageType: 'magic',
    calc: (_attacker, _target, level) => 50 + (75 * (level - 1) / 17),
  },
  // Luden's Companion — 100 + 10% AP magic per orb
  {
    itemId: '6655',
    nameEn: "Luden's Companion",
    nameJa: 'ルーデンの仲間',
    damageType: 'magic',
    calc: (attacker) => 100 + attacker.ap * 0.1,
  },
  // Stormsurge — 125 + 10% AP magic (flat, 30s CD)
  {
    itemId: '4646',
    nameEn: 'Stormsurge',
    nameJa: 'ストームサージ',
    damageType: 'magic',
    calc: (attacker) => 125 + attacker.ap * 0.1,
  },
  // Hollow Radiance — Immolate: 12-30 + 1% bonus HP magic per second (same as Sunfire)
  {
    itemId: '6664',
    nameEn: 'Hollow Radiance',
    nameJa: 'ホロウレディアンス',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 12 + (18 * (level - 1) / 17);
      const bonusHp = attacker.maxHp - attacker.baseHp;
      return base + bonusHp * 0.01;
    },
  },
  // Sundered Sky — Guaranteed crit at 175% (affected by crit modifiers like IE), bonus over normal AA
  {
    itemId: '6610',
    nameEn: 'Sundered Sky',
    nameJa: 'サンダードスカイ',
    damageType: 'physical',
    calc: (attacker) => attacker.ad * ((attacker.critMultiplier || 1.75) - 1.0),
  },
  // Kraken Slayer — 3rd hit proc: 140-310 (level) physical, +0-50% by target missing HP
  {
    itemId: '6672',
    nameEn: 'Kraken Slayer',
    nameJa: 'クラーケンスレイヤー',
    damageType: 'physical',
    calc: (_attacker, target, level) => {
      const base = 140 + (170 * (level - 1) / 17);
      // Missing HP bonus: 0-50% scaled by target missing HP %
      const missingHpPct = target.maxHp > 0 ? 1 - (target.hp / target.maxHp) : 0;
      return base * (1 + missingHpPct * 0.5);
    },
  },
  // Statikk Shiv — Energized proc: 90 magic (150 vs minions)
  {
    itemId: '3087',
    nameEn: 'Statikk Shiv',
    nameJa: 'スタティック・シヴ',
    damageType: 'magic',
    calc: () => 90,
  },
  // Voltaic Cyclosword — Energized proc: 100 physical
  {
    itemId: '6699',
    nameEn: 'Voltaic Cyclosword',
    nameJa: 'ボルテックサイクロソード',
    damageType: 'physical',
    calc: () => 100,
  },
  // Rapid Firecannon — Energized proc: 60-140 magic (level scaling)
  {
    itemId: '3094',
    nameEn: 'Rapid Firecannon',
    nameJa: 'ラピッドファイアキャノン',
    damageType: 'magic',
    calc: (_attacker, _target, level) => 60 + (80 * (level - 1) / 17),
  },
  // Hextech Gunblade — Active: 175-253 (level) + 30% AP magic, 40% slow 2s
  {
    itemId: '3146',
    nameEn: 'Hextech Gunblade',
    nameJa: 'ヘクステック・ガンブレード',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 175 + (78 * (level - 1) / 17);
      return base + attacker.ap * 0.3;
    },
  },
  // Eclipse — Ever Rising Moon: 6% target max HP physical (melee) / 4% (ranged)
  {
    itemId: '6692',
    nameEn: 'Eclipse',
    nameJa: '赤月の刃',
    damageType: 'physical',
    calc: (attacker, target) => {
      const pct = attacker.attackRange <= 350 ? 0.06 : 0.04;
      return target.maxHp * pct;
    },
  },
  // Liandry's Torment — Burn: 1% target max HP per 0.5s × 6 ticks = 6% max HP over 3s
  {
    itemId: '6653',
    nameEn: "Liandry's Torment",
    nameJa: 'リアンドリーの苦悶',
    damageType: 'magic',
    calc: (_attacker, target) => target.maxHp * 0.06,
  },
  // Blackfire Torch — Burn: (10 + 1% AP) per 0.5s × 6 ticks = 60 + 6% AP over 3s
  {
    itemId: '2503',
    nameEn: 'Blackfire Torch',
    nameJa: '黒炎のトーチ',
    damageType: 'magic',
    calc: (attacker) => 60 + attacker.ap * 0.06,
  },
  // Profane Hydra — Heretical Cleave: 80% total AD physical (10s CD)
  {
    itemId: '6698',
    nameEn: 'Profane Hydra',
    nameJa: 'プロフェイン ハイドラ',
    damageType: 'physical',
    calc: (attacker) => attacker.ad * 0.8,
  },
  // Heartsteel — Colossal Consumption: 70 + 6% max HP physical (30s CD per target)
  {
    itemId: '3084',
    nameEn: 'Heartsteel',
    nameJa: '心の鋼',
    damageType: 'physical',
    calc: (attacker) => 70 + attacker.maxHp * 0.06,
  },
  // Dead Man's Plate — Shipwrecker: 40 + 100% base AD physical at max momentum
  {
    itemId: '3742',
    nameEn: "Dead Man's Plate",
    nameJa: 'デッド マン プレート',
    damageType: 'physical',
    calc: (attacker) => 40 + attacker.baseAd,
  },
  // Unending Despair — Anguish: 30-50 (level) + 3% bonus HP magic per tick (4s interval)
  {
    itemId: '2502',
    nameEn: 'Unending Despair',
    nameJa: '終わりなき絶望',
    damageType: 'magic',
    calc: (attacker, _target, level) => {
      const base = 30 + (20 * (level - 1) / 17);
      const bonusHp = attacker.maxHp - attacker.baseHp;
      return base + bonusHp * 0.03;
    },
  },
  // Thornmail — Thorns: 25 + 10% bonus armor magic reflected per AA received (defender-side)
  {
    itemId: '3075',
    nameEn: 'Thornmail',
    nameJa: 'ソーンメイル',
    damageType: 'magic',
    calc: (attacker) => {
      // "attacker" here is the Thornmail holder (defender), bonusArmor = total - base
      const bonusArmor = Math.max(0, attacker.armor - 40); // approximate base armor
      return 25 + bonusArmor * 0.1;
    },
  },
  // Jak'Sho — Voidborn Resilience: 80 + 7% bonus HP magic burst at max stacks (8s charge)
  {
    itemId: '6665',
    nameEn: "Jak'Sho, The Protean",
    nameJa: '変幻自在のジャック＝ショー',
    damageType: 'magic',
    calc: (attacker) => {
      const bonusHp = attacker.maxHp - attacker.baseHp;
      return 80 + bonusHp * 0.07;
    },
  },
  // Malignance — Hatefog: 180 + 15% AP magic total over 3s (ult zone burn)
  {
    itemId: '3118',
    nameEn: 'Malignance',
    nameJa: 'マリグナンス',
    damageType: 'magic',
    calc: (attacker) => 180 + attacker.ap * 0.15,
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
    maxStacks: 63,
    statBonus: (stacks) => ({ critChance: stacks * 0.004 }),
  },
  {
    itemId: '3084', // Heartsteel (stacked bonus HP from procs, ~5.6 HP per stack)
    nameEn: 'Heartsteel',
    nameJa: '心の鋼',
    maxStacks: 50, // practical max stacks in a game
    statBonus: (stacks) => ({ hp: stacks * 6 }),
  },
  {
    itemId: '3071', // Black Cleaver — 5% armor reduction per stack, max 5 = 30%
    nameEn: 'Black Cleaver',
    nameJa: 'ブラック クリーバー',
    maxStacks: 5,
    statBonus: (stacks) => ({ percentArmorReduction: stacks * 0.06 }),
  },
  {
    itemId: '6701', // Opportunity — +5-10 lethality when out of combat (toggle)
    nameEn: 'Opportunity',
    nameJa: 'オポチュニティー',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { lethality: 10 } : ({} as Record<string, number>)),
  },
  {
    itemId: '3143', // Randuin's Omen — 20% crit damage reduction (toggle)
    nameEn: "Randuin's Omen",
    nameJa: 'ランデュイン オーメン',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { critDamageReduction: 0.20 } : ({} as Record<string, number>)),
  },
  {
    itemId: '3065', // Spirit Visage — 25% heal/shield power (toggle)
    nameEn: 'Spirit Visage',
    nameJa: 'スピリット ビサージュ',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { healShieldPower: 0.25 } : ({} as Record<string, number>)),
  },
  {
    itemId: '3033', // Mortal Reminder — 40% grievous wounds (toggle)
    nameEn: 'Mortal Reminder',
    nameJa: 'モータル リマインダー',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { grievousWounds: 0.40 } : ({} as Record<string, number>)),
  },
  {
    itemId: '3165', // Morellonomicon — 40% grievous wounds (toggle)
    nameEn: 'Morellonomicon',
    nameJa: 'モレロノミコン',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { grievousWounds: 0.40 } : ({} as Record<string, number>)),
  },
  {
    itemId: '3075', // Thornmail — 40% grievous wounds (toggle)
    nameEn: 'Thornmail',
    nameJa: 'ソーンメイル',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { grievousWounds: 0.40 } : ({} as Record<string, number>)),
  },
  {
    itemId: '6609', // Chempunk Chainsword — 40% grievous wounds (toggle)
    nameEn: 'Chempunk Chainsword',
    nameJa: 'ケミパンク チェーンソード',
    maxStacks: 1,
    statBonus: (stacks) => (stacks ? { grievousWounds: 0.40 } : ({} as Record<string, number>)),
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

export interface LifelineHolder {
  hp: number;
  maxHp: number;
  baseHp: number;
  ad: number;
  baseAd: number;
  ap: number;
  mr: number;
  attackRange: number;
}

export interface ItemLifelineShield {
  itemId: string;
  nameEn: string;
  nameJa: string;
  /** Calculate shield amount given the holder's computed stats and level */
  calc: (holder: LifelineHolder, level: number) => number;
}

const LIFELINE_SHIELDS: ItemLifelineShield[] = [
  // Maw of Malmortius — Lifeline: 200 + 150% bonus AD (melee) / 150 + 112.5% bonus AD (ranged)
  {
    itemId: '3156',
    nameEn: 'Maw of Malmortius',
    nameJa: 'マルモティウスの胃袋',
    calc: (holder) => {
      const bonusAD = holder.ad - holder.baseAd;
      if (holder.attackRange <= 350) {
        return 200 + bonusAD * 1.5;
      }
      return 150 + bonusAD * 1.125;
    },
  },
  // Sterak's Gage — Lifeline: 75% bonus HP
  {
    itemId: '3053',
    nameEn: "Sterak's Gage",
    nameJa: 'ステラックの篭手',
    calc: (holder) => {
      const bonusHp = holder.maxHp - holder.baseHp;
      return bonusHp * 0.75;
    },
  },
  // Immortal Shieldbow — Lifeline: 400-700 (melee) / 320-560 (ranged) by level
  {
    itemId: '6673',
    nameEn: 'Immortal Shieldbow',
    nameJa: 'イモータルシールドボウ',
    calc: (holder, level) => {
      if (holder.attackRange <= 350) {
        return 400 + (300 * (level - 1) / 17);
      }
      return 320 + (240 * (level - 1) / 17);
    },
  },
];

/**
 * Get the Lifeline shield for the given items.
 * Lifeline is a unique passive — only one can proc. We pick the first matching item.
 */
export function getLifelineShield(
  itemIds: string[],
  holder: LifelineHolder,
  level: number,
): { shield: number; item: ItemLifelineShield } | null {
  const idSet = new Set(itemIds);
  for (const ls of LIFELINE_SHIELDS) {
    if (!idSet.has(ls.itemId)) continue;
    return { shield: ls.calc(holder, level), item: ls };
  }
  return null;
}

// ===== Conditional Shield Registry (non-lifeline, stackable) =====

export interface ItemConditionalShield {
  itemId: string;
  nameEn: string;
  nameJa: string;
  /** 'physical' = only blocks physical, 'magic' = only blocks magic, 'all' = blocks all */
  shieldType: 'physical' | 'magic' | 'all';
  /** Max charges (undefined or 1 = single toggle, >1 = charge counter) */
  maxCharges?: number;
  calc: (holder: LifelineHolder, level: number) => number;
}

const CONDITIONAL_SHIELDS: ItemConditionalShield[] = [
  // Armored Advance — Noxian Endurance: 10-120 (level) + 4% max HP physical shield, 15s CD
  {
    itemId: '3174',
    nameEn: 'Armored Advance',
    nameJa: '装甲強化の進撃',
    shieldType: 'physical',
    maxCharges: 5,
    calc: (holder, level) => {
      const base = 10 + (110 * (level - 1) / 17);
      return base + holder.maxHp * 0.04;
    },
  },
  // Chainlaced Crushers — Noxian Persistence: 10-120 (level) + 4% max HP magic shield, 15s CD
  {
    itemId: '3173',
    nameEn: 'Chainlaced Crushers',
    nameJa: 'チェインレースド クラッシャー',
    shieldType: 'magic',
    maxCharges: 5,
    calc: (holder, level) => {
      const base = 10 + (110 * (level - 1) / 17);
      return base + holder.maxHp * 0.04;
    },
  },
  // Bloodthirster — Ichorshield: max 165-315 (level) overheal shield
  {
    itemId: '3072',
    nameEn: 'Bloodthirster',
    nameJa: 'ブラッドサースター',
    shieldType: 'all',
    calc: (_holder, level) => {
      if (level <= 8) return 165;
      return 165 + (level - 8) * 15; // 165 at lv8, 315 at lv18
    },
  },
  // Kaenic Rookern — Magebane: 15% max HP magic shield
  {
    itemId: '2504',
    nameEn: 'Kaenic Rookern',
    nameJa: 'ケイニック ルーケルン',
    shieldType: 'magic',
    calc: (holder) => holder.maxHp * 0.15,
  },
  // Eclipse — Ever Rising Moon: 160 + 40% bonus AD (melee) / 80 + 20% (ranged) shield
  {
    itemId: '6692',
    nameEn: 'Eclipse',
    nameJa: '赤月の刃',
    shieldType: 'all',
    calc: (holder) => {
      const bonusAD = holder.ad - holder.baseAd;
      if (holder.attackRange <= 350) {
        return 160 + bonusAD * 0.4;
      }
      return 80 + bonusAD * 0.2;
    },
  },
  // Locket of the Iron Solari — Devotion: 290-360 (target level) shield, 2.5s decaying
  {
    itemId: '3190',
    nameEn: 'Locket of the Iron Solari',
    nameJa: 'ソラリのロケット',
    shieldType: 'all',
    calc: (_holder, level) => 290 + (70 * (level - 1) / 17),
  },
];

/**
 * Get conditional (non-lifeline) shield effects for the given item IDs.
 * These shields can stack with each other and with lifeline.
 */
export function getConditionalShields(itemIds: string[]): ItemConditionalShield[] {
  const idSet = new Set(itemIds);
  return CONDITIONAL_SHIELDS.filter((s) => idSet.has(s.itemId));
}

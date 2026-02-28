import type { ChampionBonusDefinition } from '@/types';

// ===== Champion-specific stack/passive bonuses =====

export const CHAMPION_BONUSES: ChampionBonusDefinition[] = [
  // --- Stack-based bonuses ---
  {
    id: 'veigar-passive',
    championId: 'Veigar',
    type: 'stack',
    nameEn: 'Phenomenal Evil (P)',
    nameJa: '驚異の邪悪 (P)',
    descriptionEn: '+1 AP per stack',
    descriptionJa: 'スタック毎に+1AP',
    inputType: 'number',
    min: 0,
    max: 9999,
    defaultValue: 0,
    calc: (stacks) => ({ ap: stacks }),
  },
  {
    id: 'senna-passive',
    championId: 'Senna',
    type: 'stack',
    nameEn: 'Absolution (P)',
    nameJa: '赦免 (P)',
    descriptionEn: '+0.75 AD per stack, +20 range per 20 stacks',
    descriptionJa: 'スタック毎に+0.75AD, 20スタック毎に+20射程',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: (stacks) => ({
      ad: stacks * 0.75,
      attackRange: Math.floor(stacks / 20) * 20,
      critChance: Math.min(1.0, stacks * 0.0035),
    }),
  },
  {
    id: 'chogath-r',
    championId: 'Chogath',
    type: 'stack',
    nameEn: 'Feast (R)',
    nameJa: '捕食 (R)',
    descriptionEn: '+80/120/160 HP per stack (by R rank)',
    descriptionJa: 'スタック毎に+80/120/160 HP (Rランクによる)',
    inputType: 'number',
    min: 0,
    max: 255,
    defaultValue: 0,
    calc: (stacks, level) => {
      const perStack = level >= 16 ? 160 : level >= 11 ? 120 : 80;
      return { hp: stacks * perStack };
    },
  },
  {
    id: 'thresh-passive',
    championId: 'Thresh',
    type: 'stack',
    nameEn: 'Damnation (P)',
    nameJa: '魂の収集 (P)',
    descriptionEn: '+1 Armor, +1 AP per stack',
    descriptionJa: 'スタック毎に+1物理防御, +1AP',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: (stacks) => ({ armor: stacks, ap: stacks }),
  },
  {
    id: 'kindred-passive',
    championId: 'Kindred',
    type: 'stack',
    nameEn: 'Mark of the Kindred (P)',
    nameJa: '永遠の狩人 (P)',
    descriptionEn: '+75 range per 4 stacks (from 4th), +5% AS per stack',
    descriptionJa: '4スタック毎に+75射程(4つ目以降), スタック毎に+5%AS',
    inputType: 'number',
    min: 0,
    max: 99,
    defaultValue: 0,
    calc: (stacks) => ({
      attackRange: stacks >= 4 ? Math.floor((stacks - 3) / 4) * 75 : 0,
      attackSpeed: stacks * 0.05,
    }),
  },
  {
    id: 'swain-passive',
    championId: 'Swain',
    type: 'stack',
    nameEn: 'Ravenous Flock (P)',
    nameJa: '鴉の饗宴 (P)',
    descriptionEn: '+12 HP per stack',
    descriptionJa: 'スタック毎に+12 HP',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: (stacks) => ({ hp: stacks * 12 }),
  },

  // --- Passive bonuses ---
  {
    id: 'yasuo-passive',
    championId: 'Yasuo',
    type: 'passive',
    nameEn: 'Way of the Wanderer (P)',
    nameJa: '浪人の道 (P)',
    descriptionEn: 'Crit chance doubled, crit damage reduced (-17.5%)',
    descriptionJa: 'クリティカル率2倍、クリティカルダメージ低下 (-17.5%)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled) => (enabled ? { critMultiplier: 2.0, critDamageModifier: -0.175 } : {}),
  },
  {
    id: 'yone-passive',
    championId: 'Yone',
    type: 'passive',
    nameEn: 'Way of the Hunter (P)',
    nameJa: '巡る命 (P)',
    descriptionEn: 'Crit chance doubled, crit damage reduced (-17.5%)',
    descriptionJa: 'クリティカル率2倍、クリティカルダメージ低下 (-17.5%)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled) => (enabled ? { critMultiplier: 2.0, critDamageModifier: -0.175 } : {}),
  },
  {
    id: 'kayle-passive',
    championId: 'Kayle',
    type: 'passive',
    nameEn: 'Divine Ascent (P)',
    nameJa: '神聖なる昇天 (P)',
    descriptionEn: 'Lv6: +6% AS | Lv11: +12% AS | Lv16: +18% AS, +100 range',
    descriptionJa: 'Lv6: +6% AS | Lv11: +12% AS | Lv16: +18% AS, +100射程',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      let as = 0;
      if (level >= 6) as += 0.06;
      if (level >= 11) as += 0.06;
      if (level >= 16) {
        as += 0.06;
        return { attackSpeed: as, attackRange: 100 };
      }
      return { attackSpeed: as };
    },
  },
  {
    id: 'hecarim-passive',
    championId: 'Hecarim',
    type: 'passive',
    nameEn: 'Warpath (P)',
    nameJa: 'ウォーパス (P)',
    descriptionEn: 'Bonus AD = 12-24% of bonus MS (by level)',
    descriptionJa: '増加MSの12-24%分の追加AD (レベル依存)',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: (bonusMs, level) => {
      if (bonusMs <= 0) return {};
      const pct = 0.12 + (0.12 * (level - 1) / 17);
      return { ad: bonusMs * pct };
    },
  },
  {
    id: 'sion-w-passive',
    championId: 'Sion',
    type: 'stack',
    nameEn: 'Soul Furnace (W) HP',
    nameJa: 'ソウルファーネス (W) 増加HP',
    descriptionEn: 'Total bonus HP from W passive',
    descriptionJa: 'Wパッシブによる合計増加HP',
    inputType: 'number',
    min: 0,
    max: 9999,
    defaultValue: 0,
    calc: (hp) => ({ hp }),
  },

];

// ===== Rune bonuses =====

export const RUNE_BONUSES: ChampionBonusDefinition[] = [
  {
    id: 'grasp',
    type: 'rune',
    nameEn: 'Grasp of the Undying',
    nameJa: '不死者の握撃',
    descriptionEn: '+5 HP per proc',
    descriptionJa: '発動毎に+5 HP',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: (stacks) => ({ hp: stacks * 5 }),
  },
  {
    id: 'conqueror-ad',
    type: 'rune',
    nameEn: 'Conqueror (AD)',
    nameJa: '征服者 (AD)',
    descriptionEn: '+2 AD per stack (0-12)',
    descriptionJa: 'スタック毎に+2 AD (0-12)',
    inputType: 'number',
    min: 0,
    max: 12,
    defaultValue: 0,
    calc: (stacks) => ({ ad: stacks * 2 }),
  },
  {
    id: 'conqueror-ap',
    type: 'rune',
    nameEn: 'Conqueror (AP)',
    nameJa: '征服者 (AP)',
    descriptionEn: '+3.5 AP per stack (0-12)',
    descriptionJa: 'スタック毎に+3.5 AP (0-12)',
    inputType: 'number',
    min: 0,
    max: 12,
    defaultValue: 0,
    calc: (stacks) => ({ ap: stacks * 3.5 }),
  },
  {
    id: 'dark-harvest',
    type: 'rune',
    nameEn: 'Dark Harvest',
    nameJa: '魂の収穫',
    descriptionEn: '+5 base damage per stack (bonus damage on proc, modeled as +AD)',
    descriptionJa: 'スタック毎に+5基礎ダメージ (発動時追加ダメージ、+ADとして計算)',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: (stacks) => ({ ad: stacks * 5 }),
  },
  {
    id: 'gathering-storm-ad',
    type: 'rune',
    nameEn: 'Gathering Storm (AD)',
    nameJa: '集めた嵐 (AD)',
    descriptionEn: '+AD based on game time (10min: +8, 20min: +24, 30min: +48...)',
    descriptionJa: 'ゲーム時間に応じてAD増加 (10分: +8, 20分: +24, 30分: +48...)',
    inputType: 'number',
    min: 0,
    max: 120,
    defaultValue: 0,
    calc: (minutes) => {
      const intervals = Math.floor(minutes / 10);
      if (intervals <= 0) return {};
      const total = 8 * (intervals * (intervals + 1)) / 2;
      return { ad: total };
    },
  },
  {
    id: 'gathering-storm-ap',
    type: 'rune',
    nameEn: 'Gathering Storm (AP)',
    nameJa: '集めた嵐 (AP)',
    descriptionEn: '+AP based on game time (10min: +8, 20min: +24, 30min: +48...)',
    descriptionJa: 'ゲーム時間に応じてAP増加 (10分: +8, 20分: +24, 30分: +48...)',
    inputType: 'number',
    min: 0,
    max: 120,
    defaultValue: 0,
    calc: (minutes) => {
      const intervals = Math.floor(minutes / 10);
      if (intervals <= 0) return {};
      const total = 8 * (intervals * (intervals + 1)) / 2;
      return { ap: total };
    },
  },
];

// ===== Item-based bonuses =====

export const ITEM_BONUSES: ChampionBonusDefinition[] = [
  {
    id: 'heartsteel-stacks',
    itemId: '3084',
    type: 'item',
    nameEn: 'Heartsteel Stacks',
    nameJa: '心の鋼 スタック',
    descriptionEn: 'Bonus HP gained from Colossal Consumption procs',
    descriptionJa: '巨大な消費の発動で獲得した増加HP',
    inputType: 'number',
    min: 0,
    max: 9999,
    defaultValue: 0,
    calc: (hp) => ({ hp }),
  },
  {
    id: 'hubris-stacks',
    itemId: '6697',
    type: 'item',
    nameEn: 'Hubris Stacks',
    nameJa: 'ヒュブリス スタック',
    descriptionEn: '+2 AD per takedown stack',
    descriptionJa: 'テイクダウン毎に+2 AD',
    inputType: 'number',
    min: 0,
    max: 99,
    defaultValue: 0,
    calc: (stacks) => ({ ad: stacks * 2 }),
  },
];

/** Get bonuses applicable to a specific champion */
export function getChampionBonuses(championId: string): ChampionBonusDefinition[] {
  return CHAMPION_BONUSES.filter(
    (b) => b.championId === championId
  );
}

/** Get item-based bonuses for equipped items */
export function getItemBonuses(itemIds: string[]): ChampionBonusDefinition[] {
  const idSet = new Set(itemIds);
  return ITEM_BONUSES.filter((b) => b.itemId && idSet.has(b.itemId));
}

/** Get all rune bonuses */
export function getRuneBonuses(): ChampionBonusDefinition[] {
  return RUNE_BONUSES;
}

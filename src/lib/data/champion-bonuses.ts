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

  // Smolder: Dragon Practice (P) — damage handled in champion-combo-effects.ts
  // Bard: Traveler's Call (P) — damage handled in champion-combo-effects.ts
  // --- Vladimir: Crimson Pact (P) ---
  // Every 30 bonus HP → +1 AP, every 1 AP → +1.4 bonus HP (non-recursive)
  // Input = bonus HP from items (user enters manually). Calculates AP bonus.
  {
    id: 'vladimir-passive',
    championId: 'Vladimir',
    type: 'stack',
    nameEn: 'Crimson Pact (P) Bonus HP',
    nameJa: '真紅の盟約 (P) 増加HP',
    descriptionEn: 'Enter bonus HP from items. +1 AP per 30 bonus HP.',
    descriptionJa: 'アイテムの増加HPを入力。増加HP30毎に+1AP。',
    inputType: 'number',
    min: 0,
    max: 5000,
    defaultValue: 0,
    calc: (bonusHp) => {
      if (bonusHp <= 0) return {};
      return { ap: Math.floor(bonusHp / 30) };
    },
  },
  // --- Ryze: Arcane Mastery (P) ---
  // Bonus mana → bonus AP (scaling by level)
  {
    id: 'ryze-passive',
    championId: 'Ryze',
    type: 'stack',
    nameEn: 'Arcane Mastery (P) Bonus Mana',
    nameJa: 'アーケインマスタリー (P) 増加マナ',
    descriptionEn: 'Bonus mana from items. Converts to AP (4% at lv1 to 10% at lv18)',
    descriptionJa: 'アイテムからの増加マナ。APに変換 (Lv1: 4%, Lv18: 10%)',
    inputType: 'number',
    min: 0,
    max: 9999,
    defaultValue: 0,
    calc: (bonusMana, level) => {
      const conversionRate = 0.04 + (0.06 / 17) * ((level ?? 1) - 1);
      return { ap: bonusMana * conversionRate };
    },
  },
  // --- Cassiopeia: Serpentine Grace (P) ---
  // Cannot buy boots. Gains 4 MS per level.
  {
    id: 'cassiopeia-passive',
    championId: 'Cassiopeia',
    type: 'passive',
    nameEn: 'Serpentine Grace (P)',
    nameJa: '蛇行の優雅 (P)',
    descriptionEn: '+4 MS per level (cannot buy boots)',
    descriptionJa: 'レベル毎に+4 MS (ブーツ購入不可)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      return { moveSpeed: 4 * ((level ?? 1) - 1) };
    },
  },
  // --- Nasus: Stacks of the Ancients ---
  // Already handled as combo passive (Q stacks). No stat bonus needed.

  // --- Aphelios: Hitman and the Seer (P) ---
  // Bonus AD/lethality from level (not items/stacks)
  // Auto-applied based on level, so just a passive
  {
    id: 'aphelios-passive',
    championId: 'Aphelios',
    type: 'passive',
    nameEn: 'Hitman and the Seer (P)',
    nameJa: '殺し屋と予言者 (P)',
    descriptionEn: '+1.7-18.7 AD + 3-18 lethality (by level)',
    descriptionJa: '+1.7-18.7 AD + 3-18 リーサリティ (レベル依存)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const lv = (level ?? 1) - 1;
      return {
        ad: 1.7 + (17 / 17) * lv,
        lethality: 3 + (15 / 17) * lv,
      };
    },
  },

  // --- Fiora: Duelist's Dance vitals ---
  // No stack bonus — vitals handled as combo passive

  // --- Singed: Noxious Slipstream (P) ---
  // Bonus MS when near champions (25% for 2s)
  // Not a great stat bonus to model, skip

  // --- Kled: Skaarl the Cowardly Lizard (P) ---
  // Mounted: uses Skaarl's HP pool. Stacks grant courage to remount.
  {
    id: 'kled-passive',
    championId: 'Kled',
    type: 'stack',
    nameEn: 'Skaarl HP',
    nameJa: 'スカール HP',
    descriptionEn: 'Skaarl\'s bonus HP pool (400-1635 based on level)',
    descriptionJa: 'スカールの追加HPプール (レベル依存: 400-1635)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const skHP = 400 + (1235 / 17) * ((level ?? 1) - 1);
      return { hp: skHP };
    },
  },
  // --- Gnar: Rage Gene (P) ---
  // Mega form: bonus HP, AR, MR based on level
  {
    id: 'gnar-mega',
    championId: 'Gnar',
    type: 'passive',
    nameEn: 'Rage Gene (P) Mega Form',
    nameJa: 'レイジジーン (P) メガ化',
    descriptionEn: 'Mega Gnar: +50-91 HP, +4.5-19 AR, +4.5-19 MR (by level)',
    descriptionJa: 'メガナー: +50-91HP, +4.5-19AR, +4.5-19MR (レベル依存)',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const lv = (level ?? 1) - 1;
      return {
        hp: 50 + (41 / 17) * lv,
        armor: 4.5 + (14.5 / 17) * lv,
        mr: 4.5 + (14.5 / 17) * lv,
      };
    },
  },
  // --- Shyvana: Fury of the Dragonborn (P) ---
  // +5 AR/MR per dragon killed
  {
    id: 'shyvana-passive',
    championId: 'Shyvana',
    type: 'stack',
    nameEn: 'Fury of the Dragonborn (P)',
    nameJa: '竜族の末裔 (P)',
    descriptionEn: '+5 AR, +5 MR per dragon killed',
    descriptionJa: 'ドラゴン1体撃破毎に+5 AR, +5 MR',
    inputType: 'number',
    min: 0,
    max: 7,
    defaultValue: 0,
    calc: (stacks) => ({
      armor: stacks * 5,
      mr: stacks * 5,
    }),
  },
  // --- Tryndamere: Battle Fury (P) ---
  // 0-40% crit chance from fury (0-100)
  {
    id: 'tryndamere-passive',
    championId: 'Tryndamere',
    type: 'passive',
    nameEn: 'Battle Fury (P) Fury',
    nameJa: 'バトルフューリー (P) フューリー',
    descriptionEn: 'Fury grants 0-40% crit chance (0-100 fury)',
    descriptionJa: 'フューリーでクリティカル率0-40%獲得 (0-100フューリー)',
    inputType: 'number',
    min: 0,
    max: 100,
    defaultValue: 0,
    calc: (fury) => ({
      critChance: (fury / 100) * 0.40,
    }),
  },
  // --- Ornn: Living Forge (P) ---
  // Can upgrade items (Masterwork items). Grants +10% bonus AR/MR/HP
  // --- Ornn: Living Forge (P) ---
  // Input = total bonus AR+MR+HP from items. Grants +10% of each.
  // Since calc only receives a single value + level, user enters total bonus AR.
  // Split into 3 separate entries for AR, MR, HP.
  {
    id: 'ornn-passive-ar',
    championId: 'Ornn',
    type: 'stack',
    nameEn: 'Living Forge (P) Bonus AR',
    nameJa: 'リビングフォージ (P) 増加AR',
    descriptionEn: 'Enter bonus armor from items. Grants +10%.',
    descriptionJa: 'アイテムの増加ARを入力。+10%付与。',
    inputType: 'number',
    min: 0,
    max: 500,
    defaultValue: 0,
    calc: (bonusAr) => (bonusAr > 0 ? { armor: Math.floor(bonusAr * 0.10) } : {}),
  },
  {
    id: 'ornn-passive-mr',
    championId: 'Ornn',
    type: 'stack',
    nameEn: 'Living Forge (P) Bonus MR',
    nameJa: 'リビングフォージ (P) 増加MR',
    descriptionEn: 'Enter bonus MR from items. Grants +10%.',
    descriptionJa: 'アイテムの増加MRを入力。+10%付与。',
    inputType: 'number',
    min: 0,
    max: 500,
    defaultValue: 0,
    calc: (bonusMr) => (bonusMr > 0 ? { mr: Math.floor(bonusMr * 0.10) } : {}),
  },
  {
    id: 'ornn-passive-hp',
    championId: 'Ornn',
    type: 'stack',
    nameEn: 'Living Forge (P) Bonus HP',
    nameJa: 'リビングフォージ (P) 増加HP',
    descriptionEn: 'Enter bonus HP from items. Grants +10%.',
    descriptionJa: 'アイテムの増加HPを入力。+10%付与。',
    inputType: 'number',
    min: 0,
    max: 5000,
    defaultValue: 0,
    calc: (bonusHp) => (bonusHp > 0 ? { hp: Math.floor(bonusHp * 0.10) } : {}),
  },
  // --- Cho'Gath R already exists above ---
  // --- Jhin: Whisper (P) ---
  // Every 1% crit = +0.3% AD, every 1% bonus AS = +0.25 AD
  // --- Jhin: Whisper (P) AD Conversion ---
  // Every 1% crit chance → +0.3% AD, every 1% bonus AS → +0.25 AD
  // Input = bonus AS% from items/runes (e.g. 40 for 40% bonus AS)
  {
    id: 'jhin-passive-bonus',
    championId: 'Jhin',
    type: 'stack',
    nameEn: 'Whisper (P) Bonus AS%',
    nameJa: 'ウィスパー (P) 増加AS%',
    descriptionEn: 'Enter bonus AS% from items/runes. Each 1% → +0.25 AD.',
    descriptionJa: 'アイテム/ルーンの増加AS%を入力。1%毎に+0.25AD。',
    inputType: 'number',
    min: 0,
    max: 300,
    defaultValue: 0,
    calc: (bonusAsPct) => (bonusAsPct > 0 ? { ad: bonusAsPct * 0.25 } : {}),
  },
  // --- Dr. Mundo: Goes Where He Pleases (P) ---
  // Bonus HP regen scaling. Not stat-modifying in a simple way.
  // --- Trundle: King's Tribute (P) ---
  // Heals on nearby unit death. Not a stat bonus.

  // --- Rammus: Defensive Ball Curl (W) ---
  // +40-120 bonus armor while active
  {
    id: 'rammus-w',
    championId: 'Rammus',
    type: 'passive',
    nameEn: 'Defensive Ball Curl (W)',
    nameJa: 'ディフェンシブボールカール (W)',
    descriptionEn: 'W active: +40-120 bonus armor (by W rank)',
    descriptionJa: 'W発動: +40-120 増加防御力 (Wランク依存)',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const wRank = Math.min(5, Math.max(1, Math.ceil((level ?? 1) / 3.6)));
      const bonusAr = 20 + 20 * wRank;
      return { armor: bonusAr };
    },
  },

  // --- Garen: Perseverance (P) ---
  // Not a stat bonus in combat.

  // --- Garen: Courage (W) ---
  // Passive: 0.25 AR/MR per unit killed (max 30). Active: 60% damage reduction briefly.
  {
    id: 'garen-w-stacks',
    championId: 'Garen',
    type: 'stack',
    nameEn: 'Courage (W) Passive Stacks',
    nameJa: '勇気 (W) パッシブスタック',
    descriptionEn: '+0.25 AR/MR per unit killed, max 30 each (120 units)',
    descriptionJa: 'ユニット毎+0.25 AR/MR、最大+30 (120体)',
    inputType: 'number',
    min: 0,
    max: 120,
    defaultValue: 0,
    calc: (stacks) => {
      const bonus = Math.min(30, stacks * 0.25);
      return { armor: bonus, mr: bonus };
    },
  },

  // --- Corki: Hextech Munitions (P) ---
  // AAs deal 80% as magic, 20% as physical. This is an inherent conversion,
  // not easily modeled as a stat bonus. Noted for reference.

  // --- Udyr: Iron Mantle (W) ---
  // Shield + lifesteal/omnivamp. Not a stat bonus toggle.

  // --- Azir: Shurima's Legacy (P) ---
  // No stat bonus.

  // --- Singed: Noxious Slipstream (P) ---
  // MS near champions. Not a stat modifier for damage calc.

  // --- Nilah: Joy Unending (P) ---
  // +50% bonus from all nearby heal/shield sources
  // Hard to model as stat bonus

  // --- Smolder: Dragon Practice (P) ---
  // Stack system handled in combo-effects

  // --- Cassiopeia: Serpentine Grace (P) ---
  // Cannot buy boots, gains 4 MS per level
  {
    id: 'cassiopeia-ms',
    championId: 'Cassiopeia',
    type: 'passive',
    nameEn: 'Serpentine Grace (P)',
    nameJa: 'サーペンタイングレイス (P)',
    descriptionEn: '+4 MS per level (cannot buy boots)',
    descriptionJa: 'レベル毎+4 MS (ブーツ購入不可)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      return { moveSpeed: 4 * (level - 1) };
    },
  },

  // --- Nami: Surging Tides (P) ---
  // Abilities grant allies MS. Not a combat stat for damage.

  // --- Nocturne: Shroud of Darkness (W) ---
  // Passive: +20/25/30/35/40% AS. Active: spell shield.
  {
    id: 'nocturne-w',
    championId: 'Nocturne',
    type: 'passive',
    nameEn: 'Shroud of Darkness (W) Passive AS',
    nameJa: 'シュラウドオブダークネス (W) パッシブAS',
    descriptionEn: 'Passive: +20/25/30/35/40% AS (by W rank)',
    descriptionJa: 'パッシブ: +20/25/30/35/40% AS (Wランク依存)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      return { attackSpeed: (15 + 5 * wRank) / 100 };
    },
  },

  // --- Shen: Ki Barrier (P) ---
  // Shield: 60-145 + 14% bonus HP. Not a stat bonus.

  // --- Corki: Hextech Munitions (P) ---
  // AA damage split: 80% magic, 20% physical. Not easily modeled as stat bonus.

  // --- Olaf: Ragnarok (R) ---
  // Passive: +10/20/30 AR/MR. Active: removes CC, gains +10/25/40 AD for 3s.
  {
    id: 'olaf-r-passive',
    championId: 'Olaf',
    type: 'passive',
    nameEn: 'Ragnarok (R) Passive AR/MR',
    nameJa: 'ラグナロク (R) パッシブ AR/MR',
    descriptionEn: '+10/20/30 Armor & MR passively (by R rank)',
    descriptionJa: '+10/20/30 AR/MR パッシブ (Rランク依存)',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const rRank = level >= 16 ? 3 : level >= 11 ? 2 : level >= 6 ? 1 : 0;
      if (rRank === 0) return {};
      const bonus = rRank * 10;
      return { armor: bonus, mr: bonus };
    },
  },
  {
    id: 'olaf-r-active',
    championId: 'Olaf',
    type: 'passive',
    nameEn: 'Ragnarok (R) Active AD',
    nameJa: 'ラグナロク (R) アクティブ AD',
    descriptionEn: 'R active: +10/25/40 AD for 3s (loses passive AR/MR)',
    descriptionJa: 'R発動: +10/25/40 AD 3秒間 (パッシブAR/MR消失)',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const rRank = level >= 16 ? 3 : level >= 11 ? 2 : level >= 6 ? 1 : 0;
      if (rRank === 0) return {};
      const ad = rRank === 1 ? 10 : rRank === 2 ? 25 : 40;
      return { ad };
    },
  },

  // --- Quinn: no stat bonus passive for damage calc ---

  // --- Jarvan IV: no toggleable stat bonus ---

  // --- Shaco: no toggleable stat bonus ---

  // --- Lucian: no toggleable stat bonus ---

  // --- Garen: Decisive Strike (Q) ---
  // +30% MS for 1-3s. Not modeled as stat bonus.

  // --- Azir: no toggleable stat bonus ---

  // --- Xayah: no toggleable stat bonus ---

  // --- Udyr: Blazing Stampede (E) ---
  // Empowered: +30/40/50/60/70/80% AS for 4s
  {
    id: 'udyr-e-as',
    championId: 'Udyr',
    type: 'passive',
    nameEn: 'Blazing Stampede (E) AS Buff',
    nameJa: 'ブレイジングスタンピード (E) ASバフ',
    descriptionEn: 'E stance: +30-80% AS for 4s (by E rank)',
    descriptionJa: 'Eスタンス: +30-80% AS 4秒間 (Eランク依存)',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled, level) => {
      if (!enabled) return {};
      const eRank = Math.min(6, Math.max(1, Math.ceil(level / 3)));
      const bonus = 20 + 10 * eRank;
      return { attackSpeed: bonus / 100 };
    },
  },
];

// ===== Rune bonuses =====

export const RUNE_BONUSES: ChampionBonusDefinition[] = [
  {
    id: 'grasp',
    type: 'rune',
    runeId: 8437,
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
    runeId: 8010,
    nameEn: 'Conqueror (AD)',
    nameJa: '征服者 (AD)',
    descriptionEn: 'Adaptive AD per stack (0-12), scales with level',
    descriptionJa: 'スタック毎にAD加算 (0-12)、レベルでスケール',
    inputType: 'number',
    min: 0,
    max: 12,
    defaultValue: 0,
    calc: (stacks, level) => {
      const perStack = 1.8 + ((4 - 1.8) / 17) * ((level ?? 1) - 1);
      return { ad: stacks * perStack * 0.6 };
    },
  },
  {
    id: 'conqueror-ap',
    type: 'rune',
    runeId: 8010,
    nameEn: 'Conqueror (AP)',
    nameJa: '征服者 (AP)',
    descriptionEn: 'Adaptive AP per stack (0-12), scales with level',
    descriptionJa: 'スタック毎にAP加算 (0-12)、レベルでスケール',
    inputType: 'number',
    min: 0,
    max: 12,
    defaultValue: 0,
    calc: (stacks, level) => {
      const perStack = 1.8 + ((4 - 1.8) / 17) * ((level ?? 1) - 1);
      return { ap: stacks * perStack };
    },
  },
  {
    id: 'dark-harvest',
    type: 'rune',
    runeId: 8128,
    nameEn: 'Dark Harvest',
    nameJa: '魂の収穫',
    descriptionEn: 'Soul stacks (proc: 30 + 11/stack + 10% bAD + 5% AP)',
    descriptionJa: 'ソウルスタック (発動: 30 + 11/スタック + 10% bAD + 5% AP)',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: () => ({}), // Damage calculated as combo proc, not stat bonus
  },
  {
    id: 'gathering-storm-ad',
    type: 'rune',
    runeId: 8236,
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
    runeId: 8236,
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
  // --- Sorcery sub-runes ---
  {
    id: 'absolute-focus-ad',
    type: 'rune',
    runeId: 8233,
    nameEn: 'Absolute Focus (AD)',
    nameJa: '追い風 (AD)',
    descriptionEn: '+1.8-19.9 AD (above 70% HP, scales with level)',
    descriptionJa: 'HP70%以上で+1.8-19.9 AD (レベルでスケール)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      return { ad: 1.8 + (18.11 / 17) * ((level ?? 1) - 1) };
    },
  },
  {
    id: 'absolute-focus-ap',
    type: 'rune',
    runeId: 8233,
    nameEn: 'Absolute Focus (AP)',
    nameJa: '追い風 (AP)',
    descriptionEn: '+3-33.2 AP (above 70% HP, scales with level)',
    descriptionJa: 'HP70%以上で+3-33.2 AP (レベルでスケール)',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      return { ap: 3 + (30.18 / 17) * ((level ?? 1) - 1) };
    },
  },
  {
    id: 'transcendence',
    type: 'rune',
    runeId: 8210,
    nameEn: 'Transcendence',
    nameJa: '至高',
    descriptionEn: '+5 AH at Lv5, +5 AH at Lv8',
    descriptionJa: 'Lv5で+5 AH、Lv8で+5 AH',
    inputType: 'toggle',
    defaultValue: 1,
    calc: (enabled, level) => {
      if (!enabled) return {};
      let ah = 0;
      if ((level ?? 1) >= 5) ah += 5;
      if ((level ?? 1) >= 8) ah += 5;
      return ah > 0 ? { abilityHaste: ah } : {};
    },
  },
  // --- Domination sub-runes ---
  {
    id: 'eyeball-collection-ad',
    type: 'rune',
    runeId: 8138,
    nameEn: 'Eyeball Collection (AD)',
    nameJa: 'アイボールコレクター (AD)',
    descriptionEn: '+1.2 AD per stack (max 10), +6 AD at 10 stacks',
    descriptionJa: 'スタック毎に+1.2 AD (最大10), 10スタックで+6 AD',
    inputType: 'number',
    min: 0,
    max: 10,
    defaultValue: 0,
    calc: (stacks) => {
      if (stacks <= 0) return {};
      return { ad: stacks * 1.2 + (stacks >= 10 ? 6 : 0) };
    },
  },
  {
    id: 'eyeball-collection-ap',
    type: 'rune',
    runeId: 8138,
    nameEn: 'Eyeball Collection (AP)',
    nameJa: 'アイボールコレクター (AP)',
    descriptionEn: '+2 AP per stack (max 10), +10 AP at 10 stacks',
    descriptionJa: 'スタック毎に+2 AP (最大10), 10スタックで+10 AP',
    inputType: 'number',
    min: 0,
    max: 10,
    defaultValue: 0,
    calc: (stacks) => {
      if (stacks <= 0) return {};
      return { ap: stacks * 2 + (stacks >= 10 ? 10 : 0) };
    },
  },
  // --- Resolve sub-runes ---
  {
    id: 'conditioning',
    type: 'rune',
    runeId: 8429,
    nameEn: 'Conditioning',
    nameJa: '心身調整',
    descriptionEn: 'After 12min: +8 AR, +8 MR (+3% total AR/MR)',
    descriptionJa: '12分後: +8 AR, +8 MR (+3% 合計AR/MR)',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled) => {
      if (!enabled) return {};
      return { armor: 8, mr: 8 };
    },
  },
  {
    id: 'overgrowth',
    type: 'rune',
    runeId: 8451,
    nameEn: 'Overgrowth',
    nameJa: '超成長',
    descriptionEn: '+3 HP per stack (8 minions = 1 stack)',
    descriptionJa: 'スタック毎に+3 HP (8ミニオン = 1スタック)',
    inputType: 'number',
    min: 0,
    max: 999,
    defaultValue: 0,
    calc: (stacks) => {
      if (stacks <= 0) return {};
      return { hp: stacks * 3 };
    },
  },
  {
    id: 'aftershock-resist',
    type: 'rune',
    runeId: 8439,
    nameEn: 'Aftershock (AR/MR)',
    nameJa: 'アフターショック (AR/MR)',
    descriptionEn: '+35 AR, +35 MR while active (does not stack)',
    descriptionJa: '発動中: +35 AR, +35 MR (重複不可)',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled) => {
      if (!enabled) return {};
      return { armor: 35, mr: 35 };
    },
  },
  {
    id: 'unflinching',
    type: 'rune',
    runeId: 8242,
    nameEn: 'Unflinching',
    nameJa: '気迫',
    descriptionEn: '+10 AR, +10 MR while CC\'d (toggle on during CC)',
    descriptionJa: 'CC中: +10 AR, +10 MR',
    inputType: 'toggle',
    defaultValue: 0,
    calc: (enabled) => {
      if (!enabled) return {};
      return { armor: 10, mr: 10 };
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

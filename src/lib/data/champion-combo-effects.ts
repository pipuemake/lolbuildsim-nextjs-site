import type { ChampionComboPassive } from '@/types';

// ===== Champion Combo Passive Registry =====
// These are passives managed in the combo bar (click to set stacks/toggle)

const COMBO_PASSIVES: ChampionComboPassive[] = [
  // --- Irelia: Ionian Fervor (P) ---
  // At max stacks (4): bonus AS + on-hit magic damage: 7 + (3 × Lv) + (20% bonus AD)
  {
    id: 'irelia-passive',
    championId: 'Irelia',
    nameEn: 'Ionian Fervor (P)',
    nameJa: 'アイオニアの熱情 (P)',
    descriptionEn: 'At 4 stacks: +30-70% AS, on-hit: 7 + (3 × Lv) + (20% bonus AD) magic',
    descriptionJa: '4スタック時: +30-70% AS, 通常攻撃追加: 7 + (3 × Lv) + (20%増加AD) 魔法DM',
    inputType: 'stack',
    min: 0,
    max: 4,
    defaultValue: 0,
    statBonus: (stacks, level) => {
      if (stacks < 4) return {};
      const bonusAs = 0.30 + (0.40 * (level - 1) / 17);
      return { attackSpeed: bonusAs };
    },
    onHit: {
      damageType: 'magic',
      calc: (stacks, attacker, _target, level) => {
        if (stacks < 4) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        return 7 + 3 * level + 0.20 * bonusAd;
      },
    },
  },

  // --- Nasus: Siphoning Strike (Q) ---
  // Stacks add flat physical damage to Q only (NOT global AD)
  {
    id: 'nasus-q-stacks',
    championId: 'Nasus',
    nameEn: 'Siphoning Strike (Q) Stacks',
    nameJa: 'サイフォンストライク (Q) スタック',
    descriptionEn: 'Q gains flat physical damage equal to stack count',
    descriptionJa: 'Qスキルにスタック数と同じ物理ダメージを追加',
    inputType: 'stack',
    min: 0,
    max: 9999,
    defaultValue: 0,
    skillBonus: {
      skillKey: 'Q',
      damageType: 'physical',
      calc: (stacks) => stacks,
    },
  },

  // --- Darius: Hemorrhage (P) / Noxian Might ---
  // At 5 stacks: +30-230 bonus AD
  {
    id: 'darius-passive',
    championId: 'Darius',
    nameEn: 'Noxian Might (P)',
    nameJa: 'ノクサスの力 (P)',
    descriptionEn: 'At 5 bleed stacks: +30-230 bonus AD (by level)',
    descriptionJa: '出血5スタック時: +30-230 増加AD (レベル依存)',
    inputType: 'toggle',
    defaultValue: 0,
    statBonus: (enabled, level) => {
      if (!enabled) return {};
      const bonusAd = 30 + (200 * (level - 1) / 17);
      return { ad: bonusAd };
    },
  },

  // --- Jax: Grandmaster's Might (R) Active — AR/MR per champion hit ---
  {
    id: 'jax-r-active',
    championId: 'Jax',
    nameEn: 'R Active: Champions Hit',
    nameJa: 'Rアクティブ: 命中チャンピオン数',
    descriptionEn: 'R active grants AR/MR based on champions hit (base + per champion)',
    descriptionJa: 'Rアクティブ: 命中チャンピオン数に応じてAR/MR増加',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    statBonus: (championsHit, level) => {
      if (championsHit <= 0) return {};
      // R rank from level: 6→R1, 11→R2, 16→R3
      const rRank = level >= 16 ? 3 : level >= 11 ? 2 : level >= 6 ? 1 : 0;
      if (rRank === 0) return {};
      const baseAr = [45, 60, 75][rRank - 1];
      const baseMr = [27, 36, 45][rRank - 1];
      const perChampAr = [20, 25, 30][rRank - 1];
      const perChampMr = [12, 15, 18][rRank - 1];
      return {
        armor: baseAr + perChampAr * (championsHit - 1),
        mr: baseMr + perChampMr * (championsHit - 1),
      };
    },
  },

  // --- Jax: Grandmaster's Might (R) Passive — 3rd AA magic damage proc ---
  {
    id: 'jax-r-passive',
    championId: 'Jax',
    nameEn: 'R Passive: 3rd Hit Procs',
    nameJa: 'Rパッシブ: 3撃目発動回数',
    descriptionEn: 'R passive: every 3rd AA deals bonus magic damage. Set number of procs in combo.',
    descriptionJa: 'Rパッシブ: 3回目AA毎に追加魔法DM。コンボ内の発動回数を設定。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const rRank = level >= 16 ? 3 : level >= 11 ? 2 : level >= 6 ? 1 : 0;
        if (rRank === 0) return 0;
        const baseDmg = [75, 130, 185][rRank - 1];
        return (baseDmg + 0.6 * attacker.ap) * procCount;
      },
    },
  },

  // --- Jax: Relentless Assault (P) ---
  // +3.5-11% AS per stack (max 8)
  {
    id: 'jax-passive',
    championId: 'Jax',
    nameEn: 'Relentless Assault (P)',
    nameJa: '不屈の連撃 (P)',
    descriptionEn: '+3.5-11% AS per stack (max 8, by level)',
    descriptionJa: 'スタック毎に+3.5-11% AS (最大8スタック、レベル依存)',
    inputType: 'stack',
    min: 0,
    max: 8,
    defaultValue: 0,
    statBonus: (stacks, level) => {
      const perStack = 0.035 + (0.075 * (level - 1) / 17);
      return { attackSpeed: stacks * perStack };
    },
  },

  // --- Rengar: Unseen Predator (P) Trophies ---
  // +1-36 bonus AD from trophies
  {
    id: 'rengar-passive',
    championId: 'Rengar',
    nameEn: 'Unseen Predator (P) Trophies',
    nameJa: '見えざる捕食者 (P) トロフィー',
    descriptionEn: '+1-6 AD per trophy (max 6, by level)',
    descriptionJa: 'トロフィー毎に+1-6 AD (最大6、レベル依存)',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    statBonus: (stacks, level) => {
      const perTrophy = 1 + (5 * (level - 1) / 17);
      return { ad: stacks * perTrophy };
    },
  },
  // --- Zaahen: Cultivation of War (P) ---
  // Stacks grant bonus AD per stack (1.5%-2.95% AD based on level, max 12)
  // At max stacks: AD bonus doubles
  {
    id: 'zaahen-passive',
    championId: 'Zaahen',
    nameEn: 'Cultivation of War (P)',
    nameJa: '戦いの修養 (P)',
    descriptionEn: '0-12 stacks: +1.5-2.95% AD per stack. At 12: bonus doubles (36-70.87% AD)',
    descriptionJa: '0-12スタック: スタック毎に+1.5-2.95% AD。12スタック時: ボーナス2倍 (36-70.87% AD)',
    inputType: 'stack',
    min: 0,
    max: 12,
    defaultValue: 0,
    statBonus: (stacks, level) => {
      if (stacks <= 0) return {};
      // 1.5% at lv1, 2.95% at lv18 per stack
      const perStackPct = 0.015 + (0.0145 * (level - 1) / 17);
      // At max stacks (12), bonus doubles
      const multiplier = stacks >= 12 ? 2 : 1;
      // This is a % of AD, but since we're adding bonus AD and AD isn't known yet,
      // we model this as a percentage bonus. We use the ad field as flat bonus.
      // The actual % AD bonus needs the base AD — we approximate using level scaling.
      // Better approach: use a flat AD estimate. At max stacks lv18 with ~120 base AD:
      // 2.95% * 12 * 2 = 70.8% of AD. We'll return a percentage-based bonus.
      // Since BonusStats.ad is flat, we can't do % directly. Instead we note that
      // the bonus is applied multiplicatively. For simplicity, we model as:
      // bonus AD = stacks * perStackPct * multiplier (stored as ratio for later calc)
      // Actually, let's just store the flat ratio and handle it in stats computation.
      // For now, approximate with typical AD values per level.
      // Base AD at lv1 ~62, at lv18 ~120 for a fighter.
      // We'll use a rough estimate: level-scaled base AD.
      const estimatedBaseAd = 62 + (58 * (level - 1) / 17);
      const bonusAd = estimatedBaseAd * perStackPct * stacks * multiplier;
      return { ad: bonusAd };
    },
  },
  // --- Sylas: Petricite Burst (P) ---
  // After using a spell, Sylas's next AA deals bonus magic damage
  // 9 + (3.5 × Lv) + (25% AP) magic damage — tracks number of procs in combo
  {
    id: 'sylas-passive',
    championId: 'Sylas',
    nameEn: 'Petricite Burst (P)',
    nameJa: 'ペトリサイトバースト (P)',
    descriptionEn: 'After spell: next AA deals 9 + (3.5 × Lv) + (25% AP) magic. Set procs in combo.',
    descriptionJa: 'スキル使用後AA追加: 9 + (3.5 × Lv) + (25% AP) 魔法DM。コンボ内の発動回数を設定。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        return (9 + 3.5 * level + 0.25 * attacker.ap) * procCount;
      },
    },
  },
  // --- Akali: Assassin's Mark (P) ---
  // Ring proc: 35-212 (level) + 60% bonus AD + 55% AP magic
  {
    id: 'akali-passive',
    championId: 'Akali',
    nameEn: "Assassin's Mark (P) Procs",
    nameJa: '暗殺者の刻印 (P) 発動回数',
    descriptionEn: 'Ring proc: 35-212 (level) + 60% bonus AD + 55% AP magic.',
    descriptionJa: '輪発動: 35-212 (レベル) + 60%増加AD + 55%AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        const base = 35 + (177 / 17) * (level - 1);
        return (base + 0.60 * bonusAd + 0.55 * attacker.ap) * procCount;
      },
    },
  },

  // --- Diana: Moonsilver Blade (P) ---
  // Every 3rd AA: 20-250 (level) + 50% AP magic damage
  {
    id: 'diana-passive',
    championId: 'Diana',
    nameEn: 'Moonsilver Blade (P) Procs',
    nameJa: '月銀の刃 (P) 発動回数',
    descriptionEn: 'Every 3rd AA: 20-250 (by level) + 50% AP magic. Set procs in combo.',
    descriptionJa: '3回目AA毎: 20-250 (レベル) + 50% AP 魔法DM。コンボ内の発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 20 + (230 / 17) * (level - 1);
        return (base + 0.50 * attacker.ap) * procCount;
      },
    },
  },

  // --- Nocturne: Umbra Blades (P) ---
  // Periodic enhanced AA: 20% AD bonus physical + heals. Set procs in combo.
  {
    id: 'nocturne-passive',
    championId: 'Nocturne',
    nameEn: 'Umbra Blades (P) Procs',
    nameJa: 'アンブラブレード (P) 発動回数',
    descriptionEn: 'Periodic enhanced AA: +20% bonus AD physical (cleave). Set procs in combo.',
    descriptionJa: '定期的な強化AA: +20% 増加AD 物理DM (範囲)。コンボ内の発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker) => {
        if (procCount <= 0) return 0;
        return 0.20 * attacker.ad * procCount;
      },
    },
  },

  // --- Lillia: Dream-Laden Bough (P) ---
  // Abilities apply: 5% (+1.25% per 100 AP) target maxHP magic over 3s
  {
    id: 'lillia-passive',
    championId: 'Lillia',
    nameEn: 'Dream-Laden Bough (P) Procs',
    nameJa: '夢見の枝 (P) 発動回数',
    descriptionEn: '5% target maxHP (+1.25% per 100 AP) magic over 3s per proc.',
    descriptionJa: '5% 対象最大HP (+100AP毎+1.25%) 魔法DM/3秒。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, target) => {
        if (procCount <= 0) return 0;
        const hpPct = 0.05 + (attacker.ap / 100) * 0.0125;
        return hpPct * target.maxHp * procCount;
      },
    },
  },

  // --- Lux: Illumination (P) ---
  // AA detonates passive mark: 20-212 (level) + 20% AP magic damage
  {
    id: 'lux-passive',
    championId: 'Lux',
    nameEn: 'Illumination (P) Procs',
    nameJa: 'イルミネーション (P) 発動回数',
    descriptionEn: 'AA detonation after spell: 20-212 (by level) + 20% AP magic. Set procs.',
    descriptionJa: 'スキル後AA爆発: 20-212 (レベル) + 20% AP 魔法DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 20 + (192 / 17) * (level - 1);
        return (base + 0.20 * attacker.ap) * procCount;
      },
    },
  },

  // --- Lucian: Lightslinger (P) ---
  // After spell: next AA is a double-shot. 2nd shot deals reduced damage.
  // 2nd shot: 50/55/60% AD (levels 1/7/13)
  {
    id: 'lucian-passive',
    championId: 'Lucian',
    nameEn: 'Lightslinger (P) Procs',
    nameJa: 'ライトスリンガー (P) 発動回数',
    descriptionEn: 'After spell: 2nd shot deals 50/55/60% AD (lv1/7/13). Set procs.',
    descriptionJa: 'スキル後2発目: 50/55/60% AD (lv1/7/13)。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const ratio = level >= 13 ? 0.60 : level >= 7 ? 0.55 : 0.50;
        return ratio * attacker.ad * procCount;
      },
    },
  },

  // --- Volibear: The Relentless Storm (P) ---
  // Basic attacks grant a stack (max 5). At 5 stacks: AA chains lightning
  // Lightning: 11-60 (level) + 40% AP magic per target
  {
    id: 'volibear-passive',
    championId: 'Volibear',
    nameEn: 'The Relentless Storm (P)',
    nameJa: '嵐の咆哮 (P)',
    descriptionEn: 'At 5 stacks: AA chains lightning: 11-60 (level) + 40% AP magic. Set procs.',
    descriptionJa: '5スタック時: AA雷撃: 11-60 (レベル) + 40% AP 魔法DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 11 + (49 / 17) * (level - 1);
        return (base + 0.40 * attacker.ap) * procCount;
      },
    },
  },

  // --- Talon: Blade's End (P) ---
  // 3 Wound stacks → bleed: 80-303.53 (level) + 210% bonus AD physical over 2s
  {
    id: 'talon-passive',
    championId: 'Talon',
    nameEn: "Blade's End (P) Procs",
    nameJa: '刃の終焉 (P) 発動回数',
    descriptionEn: 'At 3 stacks: 80-303.5 (level) + 210% bonus AD physical bleed. Set procs.',
    descriptionJa: '3スタック時: 80-303.5 (レベル) + 210%増加AD 物理出血DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        const base = 80 + (223.53 / 17) * (level - 1);
        return (base + 2.10 * bonusAd) * procCount;
      },
    },
  },

  // --- Caitlyn: Headshot (P) ---
  // Enhanced AA: 60-210% AD (by level, increased by crit) + 1.3125 AD (crit)
  {
    id: 'caitlyn-passive',
    championId: 'Caitlyn',
    nameEn: 'Headshot (P) Procs',
    nameJa: 'ヘッドショット (P) 発動回数',
    descriptionEn: 'Headshot: 60-210% (level) + crit bonus AD physical.',
    descriptionJa: 'ヘッドショット: 60-210% (レベル) + クリティカル補正 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const ratio = 0.60 + (1.50 / 17) * (level - 1);
        return ratio * attacker.ad * procCount;
      },
    },
  },

  // --- Draven: Spinning Axe (Q) ---
  // Q-empowered AA: 40/45/50/55/60 + 75/85/95/105/115% bonus AD physical
  {
    id: 'draven-q',
    championId: 'Draven',
    nameEn: 'Spinning Axe (Q) Hits',
    nameJa: 'スピニングアックス (Q) ヒット数',
    descriptionEn: 'Q-empowered AA: 40-60 + 75-115% bonus AD physical per hit.',
    descriptionJa: 'Q強化AA: 40-60 + 75-115%増加AD 物理DM。ヒット数。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        // Approximate Q rank from level (Q maxed first typically)
        // Q rank 1-5: base 40/45/50/55/60, ratio 75/85/95/105/115%
        const qRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = 35 + 5 * qRank;
        const ratio = 0.65 + 0.10 * qRank;
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + ratio * bonusAd) * procCount;
      },
    },
  },

  // --- Camille: Adaptive Defenses (P) ---
  // Shield on AA against champion, not a damage passive.
  // But her Q passive (Precision Protocol) is handled in skill overrides.

  // --- Gangplank: Trial by Fire (P) ---
  // Next AA: 50-273.53 (level) + 100% bonus AD true damage burn over 2.5s
  {
    id: 'gangplank-passive',
    championId: 'Gangplank',
    nameEn: 'Trial by Fire (P) Procs',
    nameJa: '烈火の試練 (P) 発動回数',
    descriptionEn: 'Next AA burn: 50-274 (level) + 100% bonus AD true dmg.',
    descriptionJa: '次AA炎上: 50-274 (レベル) + 100%増加AD 確定DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        const base = 50 + (223.53 / 17) * (level - 1);
        return (base + 1.0 * bonusAd) * procCount;
      },
    },
  },

  // --- Katarina: Voracity (P) ---
  // Dagger pickup: 68-275 (level) + 60% bonus AD + 70-100% AP (level) magic
  {
    id: 'katarina-passive',
    championId: 'Katarina',
    nameEn: 'Voracity (P) Dagger Pickups',
    nameJa: '貪欲なる暗殺者 (P) 短剣回収数',
    descriptionEn: 'Dagger: 68-275 (level) + 60% bonus AD + 70-100% AP magic.',
    descriptionJa: '短剣回収: 68-275 (レベル) + 60%増加AD + 70-100%AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        const base = 68 + (207 / 17) * (level - 1);
        const apRatio = 0.70 + (0.30 / 17) * (level - 1);
        return (base + 0.60 * bonusAd + apRatio * attacker.ap) * procCount;
      },
    },
  },

  // --- Master Yi: Double Strike (P) ---
  // Every 3rd AA: 2nd strike deals 50% AD physical
  {
    id: 'masteryi-passive',
    championId: 'MasterYi',
    nameEn: 'Double Strike (P) Procs',
    nameJa: 'ダブルストライク (P) 発動回数',
    descriptionEn: 'Every 3rd AA: extra hit deals 50% AD physical.',
    descriptionJa: '3回目AA: 追加打撃 50% AD 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker) => {
        if (procCount <= 0) return 0;
        return 0.50 * attacker.ad * procCount;
      },
    },
  },

  // --- Master Yi: Wuju Style (E) ---
  // True damage on-hit: 20/25/30/35/40 + 35% bonus AD
  {
    id: 'masteryi-e',
    championId: 'MasterYi',
    nameEn: 'Wuju Style (E) On-Hit',
    nameJa: '無慈悲なる悟り (E) ヒット数',
    descriptionEn: 'E active: 20-40 + 35% bonus AD true on-hit per AA.',
    descriptionJa: 'E発動: 20-40 + 35%増加AD 確定DM/AA。ヒット数。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = 15 + 5 * eRank;
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + 0.35 * bonusAd) * procCount;
      },
    },
  },

  // --- Mordekaiser: Darkness Rise (P) ---
  // After 3 hits: aura deals 5 + 30% AP + 1-5.47% maxHP per second
  {
    id: 'mordekaiser-passive',
    championId: 'Mordekaiser',
    nameEn: 'Darkness Rise (P) Ticks',
    nameJa: '闇の隆盛 (P) ティック数',
    descriptionEn: 'Aura per second: 5 + 30% AP + 1-5.47% maxHP magic.',
    descriptionJa: 'オーラ毎秒: 5 + 30%AP + 1-5.47%maxHP 魔法DM。ティック数。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (ticks, attacker, _target, level) => {
        if (ticks <= 0) return 0;
        const hpPct = 0.01 + (0.0447 / 17) * (level - 1);
        return (5 + 0.30 * attacker.ap + hpPct * attacker.maxHp) * ticks;
      },
    },
  },

  // --- Vi: Denting Blows (W) ---
  // Every 3rd hit: 4-8% target maxHP physical + armor shred
  {
    id: 'vi-w',
    championId: 'Vi',
    nameEn: 'Denting Blows (W) Procs',
    nameJa: '牙砕き (W) 発動回数',
    descriptionEn: 'Every 3rd hit: 4-8% target maxHP physical.',
    descriptionJa: '3回目毎: 4-8% 対象最大HP 物理DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const hpPct = 0.03 + 0.01 * wRank;
        return hpPct * target.maxHp * procCount;
      },
    },
  },

  // --- Fizz: Seastone Trident (W) On-Hit ---
  // W passive bleed: 30/45/60/75/90 + 25% AP magic total over 3s
  {
    id: 'fizz-w-passive',
    championId: 'Fizz',
    nameEn: 'Seastone Trident (W) Bleed Procs',
    nameJa: 'シーストーントライデント (W) 出血回数',
    descriptionEn: 'W passive: 30-90 + 25% AP magic bleed over 3s per hit.',
    descriptionJa: 'Wパッシブ: 30-90 + 25% AP 魔法出血DM/3秒。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = 15 + 15 * wRank;
        return (base + 0.25 * attacker.ap) * procCount;
      },
    },
  },

  // --- Ziggs: Short Fuse (P) ---
  // Periodic enhanced AA: 16-130 (level) + 50% AP magic
  {
    id: 'ziggs-passive',
    championId: 'Ziggs',
    nameEn: 'Short Fuse (P) Procs',
    nameJa: 'ショートフューズ (P) 発動回数',
    descriptionEn: 'Periodic enhanced AA: 16-130 (level) + 50% AP magic.',
    descriptionJa: '定期強化AA: 16-130 (レベル) + 50% AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 16 + (114 / 17) * (level - 1);
        return (base + 0.50 * attacker.ap) * procCount;
      },
    },
  },

  // --- Cassiopeia: Twin Fang (E) Poisoned Bonus ---
  // E on poisoned: 52-120 (level) + 10% AP bonus magic
  {
    id: 'cassiopeia-e-poison',
    championId: 'Cassiopeia',
    nameEn: 'Twin Fang (E) Poison Bonus',
    nameJa: 'ツインファング (E) 毒追加ダメージ',
    descriptionEn: 'E on poisoned target: +52-120 (level) + 10% AP magic.',
    descriptionJa: '毒状態へのE: +52-120 (レベル) + 10% AP 魔法DM追加。',
    inputType: 'toggle',
    defaultValue: 1,
    statBonus: () => ({}),
  },

  // --- Vel'Koz: Organic Deconstruction (P) ---
  // 3 stacks: 33-169 (level) true damage proc
  {
    id: 'velkoz-passive',
    championId: 'Velkoz',
    nameEn: 'Organic Deconstruction (P) Procs',
    nameJa: '有機物分解 (P) 発動回数',
    descriptionEn: 'At 3 stacks: 33-169 (level) true damage.',
    descriptionJa: '3スタック時: 33-169 (レベル) 確定DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (procCount, _attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 33 + (136 / 17) * (level - 1);
        return base * procCount;
      },
    },
  },

  // --- Vayne: Silver Bolts (W) ---
  // Every 3rd hit: 6/7/8/9/10% target maxHP true damage (min 50-110)
  {
    id: 'vayne-w',
    championId: 'Vayne',
    nameEn: 'Silver Bolts (W) Procs',
    nameJa: 'シルバーボルト (W) 発動回数',
    descriptionEn: 'Every 3rd hit: 6-10% target maxHP true damage.',
    descriptionJa: '3回目毎: 6-10% 対象最大HP 確定DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const hpPct = 0.05 + 0.01 * wRank;
        const minDmg = 35 + 15 * wRank;
        const dmgPerProc = Math.max(minDmg, hpPct * target.maxHp);
        return dmgPerProc * procCount;
      },
    },
  },

  // --- Sett: Pit Grit (P) ---
  // Left punch: normal AA. Right punch: 5-90 (level) + 50% AD physical
  {
    id: 'sett-passive',
    championId: 'Sett',
    nameEn: 'Pit Grit (P) Right Punches',
    nameJa: 'ピットグリット (P) 右パンチ数',
    descriptionEn: 'Right punch: 5-90 (level) + 50% AD physical. Set count in combo.',
    descriptionJa: '右パンチ: 5-90 (レベル) + 50% AD 物理DM。コンボ内の回数。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 5 + (85 / 17) * (level - 1);
        return (base + 0.50 * attacker.ad) * procCount;
      },
    },
  },

  // --- Riven: Runic Blade (P) ---
  // After spell: next 3 AAs deal 25-50% (by level) total AD bonus physical
  {
    id: 'riven-passive',
    championId: 'Riven',
    nameEn: 'Runic Blade (P) Procs',
    nameJa: 'ルーンブレード (P) 発動回数',
    descriptionEn: 'After spell: AA deals 25-50% (by level) total AD bonus physical. Set procs.',
    descriptionJa: 'スキル後AA: 25-50% (レベル) 合計AD 物理DM追加。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 12,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const ratio = 0.25 + (0.25 / 17) * (level - 1);
        return ratio * attacker.ad * procCount;
      },
    },
  },

  // --- Ekko: Z-Drive Resonance (P) ---
  // Every 3rd hit on same target: 30-140 (level) + 80% AP magic
  {
    id: 'ekko-passive',
    championId: 'Ekko',
    nameEn: 'Z-Drive Resonance (P) Procs',
    nameJa: 'Z-ドライブ共鳴 (P) 発動回数',
    descriptionEn: 'Every 3rd hit: 30-140 (level) + 80% AP magic.',
    descriptionJa: '3回目毎: 30-140 (レベル) + 80% AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 30 + (110 / 17) * (level - 1);
        return (base + 0.80 * attacker.ap) * procCount;
      },
    },
  },

  // --- Yone: Way of the Hunter (P) ---
  // Every 2nd AA: 50% AD magic damage (replaces that portion of physical)
  {
    id: 'yone-passive-hit',
    championId: 'Yone',
    nameEn: 'Way of the Hunter (P) Magic Hits',
    nameJa: '狩鬼道 (P) 魔法打撃数',
    descriptionEn: 'Every 2nd AA deals bonus magic damage equal to a portion of AD.',
    descriptionJa: '2回毎のAAでADの一部が魔法DMに変換。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker) => {
        if (procCount <= 0) return 0;
        // Yone's 2nd AA converts ~50% physical to magic
        return 0.50 * attacker.ad * procCount;
      },
    },
  },

  // --- Brand: Blaze (P) ---
  // Abilities apply Ablaze: 3% maxHP magic over 4s. 3 stacks = detonate: 10-14% maxHP magic
  {
    id: 'brand-passive',
    championId: 'Brand',
    nameEn: 'Blaze (P) Procs',
    nameJa: 'ブレイズ (P) 発動回数',
    descriptionEn: 'Ablaze: 3% target maxHP magic over 4s per proc. Set total procs.',
    descriptionJa: '炎上: 3% 対象最大HP 魔法DM/4秒。合計発動回数。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target) => {
        if (procCount <= 0) return 0;
        return 0.03 * target.maxHp * procCount;
      },
    },
  },

  // --- Brand: Blaze Detonation ---
  // At 3 Ablaze stacks: detonation deals 10-14% maxHP magic
  {
    id: 'brand-detonate',
    championId: 'Brand',
    nameEn: 'Blaze Detonation Procs',
    nameJa: 'ブレイズ爆発 発動回数',
    descriptionEn: '3-stack detonation: 10-14% (by level) target maxHP magic.',
    descriptionJa: '3スタック爆発: 10-14% (レベル) 対象最大HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const hpPct = 0.10 + (0.04 / 17) * (level - 1);
        return hpPct * target.maxHp * procCount;
      },
    },
  },

  // --- Kog'Maw: Bio-Arcane Barrage (W) ---
  // W active: AA deals 3.5/4.25/5/5.75/6.5% target maxHP magic on-hit
  {
    id: 'kogmaw-w',
    championId: 'KogMaw',
    nameEn: 'Bio-Arcane Barrage (W) Hits',
    nameJa: 'バイオアーケインバレッジ (W) ヒット数',
    descriptionEn: 'W active: +3.5-6.5% target maxHP (+1% per 100 AP) magic on-hit.',
    descriptionJa: 'W発動時: +3.5-6.5% 対象最大HP (+100AP毎+1%) 魔法オンヒット。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const hpPct = 0.0275 + 0.0075 * wRank + (attacker.ap / 100) * 0.01;
        return hpPct * target.maxHp * procCount;
      },
    },
  },

  // --- Teemo: Toxic Shot (E) ---
  // On-hit: 11/22/33/44/55 + 30% AP magic + poison 12/24/36/48/60 + 40% AP over 4s
  {
    id: 'teemo-e',
    championId: 'Teemo',
    nameEn: 'Toxic Shot (E) Hits',
    nameJa: 'トキシックショット (E) ヒット数',
    descriptionEn: 'E on-hit: 11-55 + 30% AP magic + 12-60 + 40% AP poison.',
    descriptionJa: 'Eオンヒット: 11-55 + 30%AP 魔法DM + 12-60 + 40%AP 毒DM。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const onHitBase = 11 * eRank;
        const poisonBase = 12 * eRank;
        return (onHitBase + 0.30 * attacker.ap + poisonBase + 0.40 * attacker.ap) * procCount;
      },
    },
  },

  // --- Gnar: Hyper (W) ---
  // Every 3rd hit: 0-100% maxHP magic + flat based on rank
  {
    id: 'gnar-w',
    championId: 'Gnar',
    nameEn: 'Hyper (W) Procs',
    nameJa: 'ハイパー (W) 発動回数',
    descriptionEn: 'Every 3rd hit: 0-10% target maxHP + flat magic.',
    descriptionJa: '3回目毎: 0-10% 対象最大HP + 固定 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const flat = [0, 25, 30, 35, 40][wRank - 1];
        const hpPct = [0.06, 0.08, 0.10, 0.12, 0.14][wRank - 1];
        return (flat + hpPct * target.maxHp + 1.0 * attacker.ap) * procCount;
      },
    },
  },

  // --- Kennen: Mark of the Storm (P) ---
  // 3 marks → stun + 30-160 (level) magic damage
  {
    id: 'kennen-passive',
    championId: 'Kennen',
    nameEn: 'Mark of the Storm (P) Stun Procs',
    nameJa: '嵐の刻印 (P) スタン発動回数',
    descriptionEn: '3 marks: stun + 30-160 (level) magic.',
    descriptionJa: '3スタック時: スタン + 30-160 (レベル) 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 30 + (130 / 17) * (level - 1);
        return base * procCount;
      },
    },
  },

  // --- Thresh: Flay (E) Passive ---
  // Charged AA: up to 80-200% AD magic based on charge time
  {
    id: 'thresh-e-passive',
    championId: 'Thresh',
    nameEn: 'Flay (E) Passive Hits',
    nameJa: 'フレイ (E) パッシブヒット数',
    descriptionEn: 'Charged AA: up to 80-200% AD magic based on souls + charge.',
    descriptionJa: '溜めAA: 最大80-200%AD 魔法DM (ソウル+チャージ)。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const ratio = [0.80, 1.10, 1.40, 1.70, 2.00][eRank - 1];
        return ratio * attacker.ad * procCount;
      },
    },
  },

  // --- Warwick: Eternal Hunger (P) ---
  // On-hit: 12-46 (level) magic damage. Below 50% HP: heals same.
  {
    id: 'warwick-passive',
    championId: 'Warwick',
    nameEn: 'Eternal Hunger (P) Hits',
    nameJa: 'エターナルハンガー (P) ヒット数',
    descriptionEn: 'On-hit: 12-46 (level) magic. Below 50% HP: heals equal.',
    descriptionJa: 'オンヒット: 12-46 (レベル) 魔法DM。HP50%以下で同量回復。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 12 + (34 / 17) * (level - 1);
        return base * procCount;
      },
    },
  },

  // --- Xin Zhao: Determination (P) ---
  // Every 3rd AA: 15/25/35/45% AD + 7.5% target currentHP
  {
    id: 'xinzhao-passive',
    championId: 'XinZhao',
    nameEn: 'Determination (P) Procs',
    nameJa: 'デターミネーション (P) 発動回数',
    descriptionEn: 'Every 3rd AA: 15-45% AD + 7.5% target current HP physical.',
    descriptionJa: '3回目AA: 15-45% AD + 7.5% 対象現在HP 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, target, level) => {
        if (procCount <= 0) return 0;
        const pRank = level >= 13 ? 4 : level >= 7 ? 3 : level >= 4 ? 2 : 1;
        const adRatio = [0.15, 0.25, 0.35, 0.45][pRank - 1];
        return (adRatio * attacker.ad + 0.075 * target.maxHp) * procCount;
      },
    },
  },

  // --- Zed: Contempt for the Weak (P) ---
  // AA vs below 50% HP: 6/8/10% target maxHP magic (once per target per 10s)
  {
    id: 'zed-passive',
    championId: 'Zed',
    nameEn: 'Contempt for the Weak (P)',
    nameJa: '弱者必衰 (P)',
    descriptionEn: 'AA vs <50% HP: 6/8/10% (lv1/7/17) target maxHP magic.',
    descriptionJa: 'HP50%以下AA: 6/8/10% (lv1/7/17) 対象最大HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 3,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const hpPct = level >= 17 ? 0.10 : level >= 7 ? 0.08 : 0.06;
        return hpPct * target.maxHp * procCount;
      },
    },
  },

  // --- Kai'Sa: Second Skin (P) ---
  // Plasma stacks: 5th stack detonates for 15% (+6% per 100 AP) target missing HP magic
  {
    id: 'kaisa-passive',
    championId: 'Kaisa',
    nameEn: 'Second Skin (P) Rupture Procs',
    nameJa: 'セカンドスキン (P) 破裂発動回数',
    descriptionEn: '5th plasma stack: 15% (+6% per 100 AP) target missing HP magic.',
    descriptionJa: '5スタック破裂: 15% (+100AP毎+6%) 対象減少HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      missingHpScaling: true,
      calc: (procCount, attacker, target) => {
        if (procCount <= 0) return 0;
        const missingHpPct = 0.15 + (attacker.ap / 100) * 0.06;
        const missingHp = target.maxHp - target.hp;
        return missingHpPct * missingHp * procCount;
      },
    },
  },

  // --- Kayle: Starfire Spellblade (E) Passive ---
  // On-hit: 15-35 (level) + 25% AP + 10% bonus AD magic
  {
    id: 'kayle-e-passive',
    championId: 'Kayle',
    nameEn: 'Starfire Spellblade (E) On-Hit',
    nameJa: 'スターファイアスペルブレイド (E) ヒット数',
    descriptionEn: 'E passive on-hit: 15-35 (E rank) + 25% AP + 10% bonus AD magic.',
    descriptionJa: 'Eパッシブ: 15-35 (Eランク) + 25%AP + 10%増加AD 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = 10 + 5 * eRank;
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + 0.25 * attacker.ap + 0.10 * bonusAd) * procCount;
      },
    },
  },

  // --- Braum: Concussive Blows (P) ---
  // 4th stack: 16-126 (level) magic + stun
  {
    id: 'braum-passive',
    championId: 'Braum',
    nameEn: 'Concussive Blows (P) Procs',
    nameJa: 'コンカッシブブロウ (P) 発動回数',
    descriptionEn: '4th stack: 16-126 (level) magic + stun.',
    descriptionJa: '4スタック: 16-126 (レベル) 魔法DM + スタン。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 16 + (110 / 17) * (level - 1);
        return base * procCount;
      },
    },
  },

  // --- Varus: Blight (W) ---
  // W passive: AAs apply Blight. Skills detonate: 3/3.5/4/4.5/5% target maxHP + 1.3% per 100 AP per stack
  {
    id: 'varus-w',
    championId: 'Varus',
    nameEn: 'Blight (W) Detonation (3 stacks)',
    nameJa: 'ブライト (W) 爆発 (3スタック)',
    descriptionEn: '3-stack detonate: 9-15% target maxHP (+3.9% per 100 AP) magic.',
    descriptionJa: '3スタック爆発: 9-15% 対象最大HP (+100AP毎+3.9%) 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const pctPerStack = [0.03, 0.035, 0.04, 0.045, 0.05][wRank - 1];
        const apBonusPerStack = (attacker.ap / 100) * 0.013;
        // 3 stacks detonated per proc
        return 3 * (pctPerStack + apBonusPerStack) * target.maxHp * procCount;
      },
    },
  },

  // --- Twitch: Deadly Venom (P) ---
  // Poison: 1/2/3/4/5 true damage per second per stack (6 max stacks), 6s duration
  {
    id: 'twitch-passive',
    championId: 'Twitch',
    nameEn: 'Deadly Venom (P) Stacks Applied',
    nameJa: 'デッドリーヴェノム (P) 付与スタック数',
    descriptionEn: 'Total venom ticks (1-5 true dmg/sec/stack, 6 stacks max).',
    descriptionJa: '毒合計 (1-5確定DM/秒/スタック、最大6スタック)。',
    inputType: 'stack',
    min: 0,
    max: 36,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (ticks, _attacker, _target, level) => {
        if (ticks <= 0) return 0;
        // Damage per second per stack scales: 1/2/3/4/5 at lv1/5/9/13/17
        const dmgPerTick = level >= 17 ? 5 : level >= 13 ? 4 : level >= 9 ? 3 : level >= 5 ? 2 : 1;
        return dmgPerTick * ticks;
      },
    },
  },

  // --- Kled: Violent Tendencies (W) ---
  // 4th hit: 4/4.5/5/5.5/6% target maxHP + bonus physical
  {
    id: 'kled-w',
    championId: 'Kled',
    nameEn: 'Violent Tendencies (W) 4th Hit',
    nameJa: 'ヴァイオレントテンデンシー (W) 4撃目',
    descriptionEn: '4th hit: 4-6% target maxHP physical.',
    descriptionJa: '4撃目: 4-6% 対象最大HP 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const hpPct = 0.035 + 0.005 * wRank;
        return hpPct * target.maxHp * procCount;
      },
    },
  },

  // --- Bel'Veth: Death in Lavender (P) ---
  // Bonus permanent AS from takedowns and jungle camps
  {
    id: 'belveth-passive',
    championId: 'BelVeth',
    nameEn: "Death in Lavender (P) AS Stacks",
    nameJa: 'ラベンダーの死 (P) ASスタック',
    descriptionEn: 'Permanent bonus AS from takedowns.',
    descriptionJa: 'テイクダウンで永続AS増加。',
    inputType: 'stack',
    min: 0,
    max: 100,
    defaultValue: 0,
    statBonus: (stacks) => {
      if (stacks <= 0) return {};
      return { attackSpeed: stacks * 0.01 };
    },
  },

  // --- Tahm Kench: An Acquired Taste (P) ---
  // AA applies stack. At 3 stacks: Q stuns, W devours. On-hit: 8-60 (level) + 2.5% bonusHP magic
  {
    id: 'tahmkench-passive',
    championId: 'TahmKench',
    nameEn: 'An Acquired Taste (P) Hits',
    nameJa: '味蕾の報い (P) ヒット数',
    descriptionEn: 'On-hit: 8-60 (level) + 2.5% bonus HP magic.',
    descriptionJa: 'オンヒット: 8-60 (レベル) + 2.5%増加HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 8 + (52 / 17) * (level - 1);
        const bonusHp = Math.max(0, attacker.maxHp - attacker.baseHp);
        return (base + 0.025 * Math.max(0, bonusHp)) * procCount;
      },
    },
  },

  // --- Naafiri: We Are More (P) ---
  // Packmate damage: 3-66 (level) + 10% bonus AD physical per packmate hit
  {
    id: 'naafiri-passive',
    championId: 'Naafiri',
    nameEn: 'We Are More (P) Packmate Hits',
    nameJa: 'ウィーアーモア (P) パックメイト攻撃数',
    descriptionEn: 'Packmate hit: 3-66 (level) + 10% bonus AD physical.',
    descriptionJa: 'パックメイト攻撃: 3-66 (レベル) + 10%増加AD 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        const base = 3 + (63 / 17) * (level - 1);
        return (base + 0.10 * bonusAd) * procCount;
      },
    },
  },

  // --- Briar: Crimson Curse (P) ---
  // Bleed on-hit: 3% of damage dealt as physical bleed (modeled as fixed on-hit for simplicity)
  // Plus: heals for damage dealt (not damage-related here)

  // --- Rumble: Junkyard Titan (P) ---
  // Overheat: AAs deal 5-40 (level) + 25% AP bonus magic for 5.25s
  {
    id: 'rumble-passive',
    championId: 'Rumble',
    nameEn: 'Junkyard Titan (P) Overheat Hits',
    nameJa: 'ジャンクヤードタイタン (P) オーバーヒートAA数',
    descriptionEn: 'Overheat AA: 5-40 (level) + 25% AP magic on-hit.',
    descriptionJa: 'オーバーヒートAA: 5-40 (レベル) + 25%AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 5 + (35 / 17) * (level - 1);
        return (base + 0.25 * attacker.ap) * procCount;
      },
    },
  },

  // --- Fiora: Grand Challenge (P/R) ---
  // Vital proc: 3-7% target maxHP true damage
  {
    id: 'fiora-vital',
    championId: 'Fiora',
    nameEn: 'Duelist\'s Dance (P) Vital Procs',
    nameJa: 'デュエリストダンス (P) 急所発動数',
    descriptionEn: 'Vital hit: 3-7% (by level) target maxHP true dmg.',
    descriptionJa: '急所: 3-7% (レベル) 対象最大HP 確定DM。',
    inputType: 'stack',
    min: 0,
    max: 8,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (procCount, attacker, target, level) => {
        if (procCount <= 0) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        const pct = 0.03 + (0.04 / 17) * (level - 1) + 0.045 * (bonusAd / 100);
        return pct * target.maxHp * procCount;
      },
    },
  },

  // --- Kassadin: Nether Blade (W) ---
  // W active: next AA deals 50-90 + 80% AP magic
  {
    id: 'kassadin-w',
    championId: 'Kassadin',
    nameEn: 'Nether Blade (W) Active Hits',
    nameJa: 'ネザーブレイド (W) 発動数',
    descriptionEn: 'W active AA: 50-90 + 80% AP magic.',
    descriptionJa: 'W強化AA: 50-90 + 80%AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = 40 + 10 * wRank;
        return (base + 0.80 * attacker.ap) * procCount;
      },
    },
  },

  // --- Darius: Hemorrhage (P) Bleed ---
  // 5 stacks: bleed total = 12-42 (level) + 30% bonus AD per stack per 5s
  {
    id: 'darius-bleed',
    championId: 'Darius',
    nameEn: 'Hemorrhage (P) Bleed (5 stacks)',
    nameJa: 'ヘモレイジ (P) 出血 (5スタック)',
    descriptionEn: '5-stack bleed total: 60-210 (lv) + 150% bonus AD physical over 5s.',
    descriptionJa: '5スタック出血合計: 60-210 (レベル) + 150%増加AD 物理DM/5秒。',
    inputType: 'toggle',
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (enabled, attacker, _target, level) => {
        if (!enabled) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        const perStack = (12 + (30 / 17) * (level - 1));
        return 5 * perStack + 5 * 0.30 * bonusAd;
      },
    },
  },

  // --- Gwen: Snip Snip! Center (Q) ---
  // Center snip: 75% bonus true damage + magic damage
  {
    id: 'gwen-q-center',
    championId: 'Gwen',
    nameEn: 'Snip Snip! (Q) Center Snips',
    nameJa: 'チョキチョキ (Q) 中央ヒット数',
    descriptionEn: 'Center snip: bonus true damage equal to 75% of Q damage.',
    descriptionJa: '中央: Qダメージの75%を確定DMとして追加。',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (procCount, attacker) => {
        if (procCount <= 0) return 0;
        // Each snip: ~10 + 5% AP. Center bonus = 75% of that as true damage
        return 0.75 * (10 + 0.05 * attacker.ap) * procCount;
      },
    },
  },

  // --- Rengar: Unseen Predator (P) ---
  // Leap from bush: bonus damage at max ferocity
  // (Already has trophy bonuses. This is leap on-hit.)

  // --- Swain: Ravenous Flock (P) ---
  // Soul Fragment collection heal + R drain (handled in skill overrides)

  // --- Samira: Daredevil Impulse (P) ---
  // Melee AA on immobilized targets: bonus 3.5-14% target maxHP magic
  {
    id: 'samira-passive',
    championId: 'Samira',
    nameEn: 'Daredevil Impulse (P) Procs',
    nameJa: 'デアデビルインパルス (P) 発動回数',
    descriptionEn: 'Melee AA on CC target: 3.5-14% target maxHP magic.',
    descriptionJa: 'CC中の敵への近接AA: 3.5-14% 対象最大HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const hpPct = 0.035 + (0.105 / 17) * (level - 1);
        return hpPct * target.maxHp * procCount;
      },
    },
  },
  // --- Jinx: Get Excited! (P) ---
  // On takedown: +25% total AS, +175% MS decaying
  {
    id: 'jinx-passive',
    championId: 'Jinx',
    nameEn: 'Get Excited! (P)',
    nameJa: 'ゲットエキサイテッド! (P)',
    descriptionEn: 'On takedown: +25% total AS for 6s.',
    descriptionJa: 'テイクダウン時: +25% 合計AS (6秒間)。',
    inputType: 'toggle',
    defaultValue: 0,
    statBonus: (enabled) => {
      if (!enabled) return {};
      return { attackSpeed: 0.25 };
    },
  },

  // --- Jinx: Pow-Pow Stacks ---
  // Minigun stacks: +15/27.5/40/52.5/65% AS at 3 stacks
  {
    id: 'jinx-q-stacks',
    championId: 'Jinx',
    nameEn: 'Pow-Pow (Q) AS Stacks',
    nameJa: 'パウパウ (Q) ASスタック',
    descriptionEn: 'Minigun stacks: +0-65% AS (0-3 stacks, scales with Q rank).',
    descriptionJa: 'ミニガンスタック: +0-65% AS (0-3スタック、Qランクでスケール)。',
    inputType: 'stack',
    min: 0,
    max: 3,
    defaultValue: 0,
    statBonus: (stacks, level) => {
      if (stacks <= 0) return {};
      const qRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const perStack = [0.05, 0.0917, 0.133, 0.175, 0.2167][qRank - 1];
      return { attackSpeed: stacks * perStack };
    },
  },

  // --- Jhin: Whisper (P) 4th Shot ---
  // Every 4th AA: guaranteed crit + 15/20/25% target missing HP bonus physical
  // Only the missing HP bonus is calculated here (crit is already in AA damage)
  {
    id: 'jhin-passive',
    championId: 'Jhin',
    nameEn: 'Whisper (P) 4th Shot',
    nameJa: 'ウィスパー (P) 4撃目',
    descriptionEn: '4th shot bonus: 15/20/25% target missing HP physical. (1 per 4 AA)',
    descriptionJa: '4撃目追加DM: 15/20/25% 対象減少HP 物理。(4AA毎に1回)',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    aaLinked: true,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      missingHpScaling: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const pct = level >= 11 ? 0.25 : level >= 6 ? 0.20 : 0.15;
        const missingHp = target.maxHp - target.hp;
        return pct * missingHp * procCount;
      },
    },
  },

  // --- Ashe: Frost Shot (P) ---
  // Slowed targets: bonus 10% (+crit chance%) AD physical (replaces crit)
  {
    id: 'ashe-passive',
    championId: 'Ashe',
    nameEn: 'Frost Shot (P) Hits',
    nameJa: 'フロストショット (P) ヒット数',
    descriptionEn: 'Slowed target: +10% + (crit% × 0.75) AD physical per AA.',
    descriptionJa: 'スロー対象: +10% + (クリ率% × 0.75) AD 物理DM/AA。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker) => {
        if (procCount <= 0) return 0;
        // Ashe's slow bonus: (10% + critChance * 75%) AD
        // We approximate crit chance from items, assume ~50% mid-game
        return (0.10 + 0.50 * 0.75) * attacker.ad * procCount;
      },
    },
  },

  // --- Urgot: Echoing Flames (P) ---
  // Shotgun knee: 40-100% AD + 2-6% target maxHP physical (per unique knee)
  {
    id: 'urgot-passive',
    championId: 'Urgot',
    nameEn: 'Echoing Flames (P) Knee Procs',
    nameJa: 'エコーフレイム (P) 膝発動回数',
    descriptionEn: 'Knee proc: 40-100% AD + 2-6% target maxHP physical.',
    descriptionJa: '膝発動: 40-100%AD + 2-6% 対象最大HP 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, target, level) => {
        if (procCount <= 0) return 0;
        const adRatio = 0.40 + (0.60 / 17) * (level - 1);
        const hpPct = 0.02 + (0.04 / 17) * (level - 1);
        return (adRatio * attacker.ad + hpPct * target.maxHp) * procCount;
      },
    },
  },

  // --- Zeri: Living Battery (P) ---
  // Passive shield absorption → bonus MS. Not a damage passive.

  // --- Leona: Sunlight (P) ---
  // Abilities apply Sunlight. Allies detonate: 25-144 (level) magic.
  {
    id: 'leona-passive',
    championId: 'Leona',
    nameEn: 'Sunlight (P) Procs',
    nameJa: 'サンライト (P) 発動回数',
    descriptionEn: 'Ally detonates: 25-144 (level) magic per proc.',
    descriptionJa: '味方が爆発: 25-144 (レベル) 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 25 + (119 / 17) * (level - 1);
        return base * procCount;
      },
    },
  },

  // --- Lulu: Pix, Faerie Companion (P) ---
  // On-hit: 3 bolts of 5-39 (level) + 5% AP magic
  {
    id: 'lulu-passive',
    championId: 'Lulu',
    nameEn: 'Pix (P) On-Hit',
    nameJa: 'ピックス (P) ヒット数',
    descriptionEn: 'On-hit: 3 bolts × (5-39 + 5% AP) magic per AA.',
    descriptionJa: 'オンヒット: 3弾 × (5-39 + 5%AP) 魔法DM/AA。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const perBolt = 5 + (34 / 17) * (level - 1) + 0.05 * attacker.ap;
        return 3 * perBolt * procCount;
      },
    },
  },

  // --- Rammus: Spiked Shell (P) ---
  // Basic attacks deal bonus magic = 10% armor
  {
    id: 'rammus-passive',
    championId: 'Rammus',
    nameEn: 'Spiked Shell (P) Hits',
    nameJa: 'スパイクドシェル (P) ヒット数',
    descriptionEn: 'AA bonus: 10% armor magic damage.',
    descriptionJa: 'AA追加: 防御力の10% 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker) => {
        if (procCount <= 0) return 0;
        return 0.10 * attacker.armor * procCount;
      },
    },
  },

  // --- Shyvana: Twin Bite (Q) ---
  // Q: AA reset that deals 100% AD + 15-75% AD physical (2nd hit)
  {
    id: 'shyvana-q',
    championId: 'Shyvana',
    nameEn: 'Twin Bite (Q) Bonus Hit',
    nameJa: 'ツインバイト (Q) 追加打撃数',
    descriptionEn: 'Q 2nd hit: 15-75% AD physical. Set hits.',
    descriptionJa: 'Q2撃目: 15-75%AD 物理DM。ヒット数。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const qRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const ratio = [0.15, 0.30, 0.45, 0.60, 0.75][qRank - 1];
        return ratio * attacker.ad * procCount;
      },
    },
  },

  // --- Malphite: Thunderclap (W) ---
  // W passive: AA splash = 10/20/30/40/50 + 15% AP + 10% armor magic
  {
    id: 'malphite-w',
    championId: 'Malphite',
    nameEn: 'Thunderclap (W) Hits',
    nameJa: 'サンダークラップ (W) ヒット数',
    descriptionEn: 'W passive: 10-50 + 15% AP + 10% armor magic on-hit.',
    descriptionJa: 'Wパッシブ: 10-50 + 15%AP + 10%AR 魔法DM/AA。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = 10 * wRank;
        return (base + 0.15 * attacker.ap + 0.10 * attacker.armor) * procCount;
      },
    },
  },

  // --- Nunu: Consume (Q) ---
  // Q: large true damage to monsters, magic damage to champions
  {
    id: 'nunu-q',
    championId: 'Nunu',
    nameEn: 'Consume (Q) Champion Hits',
    nameJa: 'コンシューム (Q) チャンピオンヒット数',
    descriptionEn: 'Q on champion: 60-180 + 50% AP + 5% bonus HP magic.',
    descriptionJa: 'Qチャンピオン: 60-180 + 50%AP + 5%増加HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 3,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const qRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = 30 + 30 * qRank;
        const bonusHp = Math.max(0, attacker.maxHp - attacker.baseHp);
        return (base + 0.50 * attacker.ap + 0.05 * Math.max(0, bonusHp)) * procCount;
      },
    },
  },

  // --- Trundle: Chomp (Q) AD Steal ---
  // Q steals 20% target AD for 4s
  {
    id: 'trundle-q-steal',
    championId: 'Trundle',
    nameEn: 'Chomp (Q) AD Steal',
    nameJa: 'チョンプ (Q) AD奪取',
    descriptionEn: 'Steals 20% target AD for 4s.',
    descriptionJa: '対象ADの20%を4秒間奪取。',
    inputType: 'toggle',
    defaultValue: 0,
    statBonus: () => ({}), // Would need target AD; placeholder
  },

  // --- Blitzcrank: Mana Barrier (P) ---
  // Shield when low HP. Not a damage passive.
  // Power Fist (E) — next AA knockup + 200% AD
  {
    id: 'blitzcrank-e',
    championId: 'Blitzcrank',
    nameEn: 'Power Fist (E) Hits',
    nameJa: 'パワーフィスト (E) ヒット数',
    descriptionEn: 'E empowered AA: 200% AD physical + knockup.',
    descriptionJa: 'E強化AA: 200% AD 物理DM + ノックアップ。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker) => {
        if (procCount <= 0) return 0;
        // Extra damage beyond normal AA = 100% AD
        return 1.0 * attacker.ad * procCount;
      },
    },
  },

  // --- Skarner: Ixtal's Impact (P) ---
  // Q stun proc on 3 stacks
  {
    id: 'skarner-passive',
    championId: 'Skarner',
    nameEn: "Ixtal's Impact (P) Procs",
    nameJa: 'イクスタルの衝撃 (P) 発動回数',
    descriptionEn: '3rd hit stun: 10% bonus HP + 6% target maxHP physical.',
    descriptionJa: '3撃目スタン: 10%増加HP + 6%対象最大HP 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, target, level) => {
        if (procCount <= 0) return 0;
        const bonusHp = Math.max(0, attacker.maxHp - attacker.baseHp);
        return (0.10 * Math.max(0, bonusHp) + 0.06 * target.maxHp) * procCount;
      },
    },
  },

  // --- Sejuani: Permafrost (E) ---
  // Frozen target: E deals 20-80 + 6% target maxHP magic
  {
    id: 'sejuani-e',
    championId: 'Sejuani',
    nameEn: 'Permafrost (E) Procs',
    nameJa: 'パーマフロスト (E) 発動回数',
    descriptionEn: 'Frozen target: 20-80 + 6% target maxHP magic.',
    descriptionJa: '凍結対象: 20-80 + 6%対象最大HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = [20, 35, 50, 65, 80][eRank - 1];
        return (base + 0.06 * target.maxHp) * procCount;
      },
    },
  },

  // --- Maokai: Sap Magic (P) ---
  // Empowered AA heal: 4-13% maxHP. No damage bonus.

  // --- Ezreal: Rising Spell Force (P) ---
  // +10% AS per stack from hitting abilities, max 5 stacks
  {
    id: 'ezreal-passive',
    championId: 'Ezreal',
    nameEn: 'Rising Spell Force (P)',
    nameJa: 'ライジングスペルフォース (P)',
    descriptionEn: '+10% AS per stack (max 5, from hitting abilities).',
    descriptionJa: 'スタック毎+10% AS (最大5、スキル命中で蓄積)。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    statBonus: (stacks) => {
      if (stacks <= 0) return {};
      return { attackSpeed: stacks * 0.10 };
    },
  },
  // --- Garen: Judgment (E) Spin Count ---
  // Controlled by E sub-cast selection. Passive bonus: E crits.
  // Passive damage (P): per-hit regen bonus, no combat damage.

  // --- Shen: Spirit Blade (Q) Enhanced AA count ---
  {
    id: 'shen-q-procs',
    championId: 'Shen',
    nameEn: 'Spirit Blade (Q) Enhanced AAs',
    nameJa: 'スピリットブレード (Q) 強化AA回数',
    descriptionEn: 'Number of Q-enhanced auto attacks (max 3).',
    descriptionJa: 'Q強化オートアタック回数 (最大3回)。',
    inputType: 'stack',
    min: 0,
    max: 3,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, attacker, target) => {
        if (procs <= 0) return 0;
        // Q-enhanced: base + %maxHP. Approximation using just %maxHP portion.
        // Base is in skill-overrides. This adds nothing extra if using subCasts.
        return 0;
      },
    },
  },

  // --- Azir: Soldier Count ---
  // Number of soldiers for W damage (controlled by W sub-cast selection)

  // --- Udyr: Wildfang (Q) On-hit ---
  // After using Q, next 2 AAs deal 3-53 + 25% bonus AD physical on-hit
  {
    id: 'udyr-q-onhit',
    championId: 'Udyr',
    nameEn: 'Wildfang (Q) On-hit AAs',
    nameJa: 'ワイルドファング (Q) AA追加ダメージ',
    descriptionEn: 'Next 2 AAs after Q: 3-53 + 25% bonus AD physical on-hit.',
    descriptionJa: 'Q後の2回AA: 3-53 + 25%増加AD 物理追加ダメージ。',
    inputType: 'stack',
    min: 0,
    max: 2,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (hits, attacker, _target, level) => {
        if (hits <= 0) return 0;
        const base = 3 + ((53 - 3) / 17) * (level - 1);
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + bonusAd * 0.25) * hits;
      },
    },
  },

  // --- Corki: Hextech Munitions (P) ---
  // AAs deal 80% AD as magic damage + 20% AD as physical damage
  // (This is inherent, not toggleable. No combo entry needed.)

  // --- Singed: Poison Trail tick count handled via subCasts ---

  // --- Xayah: Clean Cuts (P) ---
  // After using an ability, next 3 AAs hurl feathers. Each feather can be recalled by E.
  {
    id: 'xayah-feather-count',
    championId: 'Xayah',
    nameEn: 'Feather Count for E',
    nameJa: 'E用フェザー数',
    descriptionEn: 'Number of feathers on field for Bladecaller (E) recall.',
    descriptionJa: 'ブレードコーラー (E) で回収するフェザー数。',
    inputType: 'stack',
    min: 0,
    max: 8,
    defaultValue: 3,
    // Damage handled by E sub-casts; this is informational
  },

  // --- Smolder: Dragon Practice (P) stacks ---
  {
    id: 'smolder-stacks',
    championId: 'Smolder',
    nameEn: 'Dragon Practice (P) Stacks',
    nameJa: 'ドラゴンの修練 (P) スタック',
    descriptionEn: 'Q/W/R stacks. At 25: +true dmg. At 125: +explosion. At 225: +burn.',
    descriptionJa: 'Q/W/Rスタック。25: 確定DM追加。125: 爆発追加。225: 炎上追加。',
    inputType: 'stack',
    min: 0,
    max: 225,
    defaultValue: 0,
    onHit: {
      damageType: 'true',
      perCombo: true,
      calc: (stacks, attacker) => {
        // At 25+ stacks: Q adds 15 + 8% AD true damage per Q cast
        if (stacks < 25) return 0;
        return 15 + attacker.ad * 0.08;
      },
    },
  },

  // --- Kayle: Exalted (P) Waves ---
  // At level 6: ranged. At level 11: waves on-hit (15 + 10% AP magic per wave).
  // At level 16: permanent ranged + waves.
  {
    id: 'kayle-waves',
    championId: 'Kayle',
    nameEn: 'Divine Ascent (P) Waves',
    nameJa: '天啓 (P) ウェーブ',
    descriptionEn: 'Lv11+: AAs fire waves dealing 20-47 + 10% bonus AD + 25% AP magic.',
    descriptionJa: 'Lv11+: AA時ウェーブ: 20-47 + 10%増加AD + 25%AP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      calc: (_toggle, attacker, _target, level) => {
        const base = 20 + ((47 - 20) / 17) * (level - 1);
        const bonusAd = attacker.ad - attacker.baseAd;
        return base + bonusAd * 0.10 + attacker.ap * 0.25;
      },
    },
  },

  // --- Bard: Traveler's Call (P) Meep damage ---
  // Base: 35 (+14 per 5 chimes beyond 5). +30% AP.
  {
    id: 'bard-meeps',
    championId: 'Bard',
    nameEn: "Traveler's Call (P) Chimes",
    nameJa: '旅人の呼び声 (P) チャイム数',
    descriptionEn: 'Chime count: meep on-hit = 35 (+10 per 5 chimes) + 40% AP magic.',
    descriptionJa: 'チャイム数: ミープ追加 = 35 (+5個毎+10) + 40% AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 100,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      calc: (chimes, attacker) => {
        const bonusSets = Math.floor(chimes / 5);
        return 35 + bonusSets * 10 + attacker.ap * 0.40;
      },
    },
  },

  // --- Cassiopeia: Twin Fang (E) Poisoned bonus ---
  // E: 52-120 + 10% AP (not poisoned) → 10-90 + 60% AP (poisoned bonus ON TOP)
  {
    id: 'cassiopeia-poison',
    championId: 'Cassiopeia',
    nameEn: 'Twin Fang (E) Poison Bonus',
    nameJa: 'ツインファング (E) 毒追加ダメージ',
    descriptionEn: 'Toggle ON: target is poisoned. E deals bonus 10/40/70/100/130 + 35% AP magic.',
    descriptionJa: 'ON: 毒状態の対象に追加 10/40/70/100/130 + 35% AP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 1,
    skillBonus: {
      skillKey: 'E',
      damageType: 'magic',
      calc: (enabled, attacker, _target, level) => {
        if (!enabled) return 0;
        // Poison bonus by E rank (approximated from level)
        const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const bases = [10, 40, 70, 100, 130];
        return bases[eRank - 1] + attacker.ap * 0.35;
      },
    },
  },

  // --- Nilah: Jubilant Veil (W) ---
  // Passive: gains XP bonus from nearby minion deaths. No combat passive.

  // --- Nami: Surging Tides (P) ---
  // Allies gain MS when hit by abilities. No damage passive.

  // --- Ryze: Arcane Mastery (P) ---
  // Bonus damage from E mark is in skill-overrides Q sub-casts.

  // --- Lillia: Dream-Laden Bough (P) ---
  // Abilities apply Dream Dust: 5% target maxHP + 1.25% per 100 AP magic over 3s
  {
    id: 'lillia-passive',
    championId: 'Lillia',
    nameEn: 'Dream-Laden Bough (P) Procs',
    nameJa: 'ゆめみる蕾 (P) 発動回数',
    descriptionEn: 'Ability hits apply: 5% target maxHP (+1.25% per 100 AP) magic over 3s.',
    descriptionJa: 'スキル命中: 対象最大HP 5% (+100AP毎1.25%) 魔法DM (3秒間)。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, attacker, target) => {
        if (procs <= 0) return 0;
        const hpRatio = 0.05 + (attacker.ap / 100) * 0.0125;
        return hpRatio * target.maxHp * procs;
      },
    },
  },

  // --- Garen: Judgment (E) Crit ---
  // E can crit for 33% bonus damage (per spin). Controlled via sub-casts.

  // --- Nocturne: Duskbringer (Q) Trail AD ---
  // While on Q trail: +20/30/40/50/60 bonus AD
  {
    id: 'nocturne-q-trail',
    championId: 'Nocturne',
    nameEn: 'Duskbringer (Q) Trail AD',
    nameJa: 'ダスクブリンガー (Q) 軌跡AD',
    descriptionEn: 'While on Q trail: +15/25/35/45/55 bonus AD.',
    descriptionJa: 'Qの軌跡上: +15/25/35/45/55 増加AD。',
    inputType: 'toggle',
    defaultValue: 0,
    statBonus: (enabled, level) => {
      if (!enabled) return {};
      const qRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      return { ad: 5 + 10 * qRank };
    },
  },

  // --- Olaf: Berserker Rage (P) ---
  // Up to 99% AS based on missing HP (1% AS per 1% missing HP)
  {
    id: 'olaf-passive',
    championId: 'Olaf',
    nameEn: 'Berserker Rage (P) Missing HP%',
    nameJa: 'バーサーカーレイジ (P) 減少HP%',
    descriptionEn: '+1% AS per 1% missing HP (max +99% AS).',
    descriptionJa: '減少HP 1%毎に+1% AS (最大+99%)。',
    inputType: 'stack',
    min: 0,
    max: 99,
    defaultValue: 0,
    statBonus: (missingHpPct) => {
      if (missingHpPct <= 0) return {};
      return { attackSpeed: missingHpPct / 100 };
    },
  },

  // --- Shaco: Backstab (P) ---
  // AAs from behind: bonus 20-35% AD physical (+ 15% AP)
  {
    id: 'shaco-backstab',
    championId: 'Shaco',
    nameEn: 'Backstab (P) Procs',
    nameJa: 'バックスタブ (P) 発動回数',
    descriptionEn: 'AAs from behind: +20-35% AD (by level) + 15% AP physical.',
    descriptionJa: '背後からAA: +20-35% AD (レベル依存) + 15% AP 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procs, attacker, _target, level) => {
        if (procs <= 0) return 0;
        const ratio = 0.20 + ((0.35 - 0.20) / 17) * (level - 1);
        return (ratio * attacker.ad + 0.15 * attacker.ap) * procs;
      },
    },
  },

  // --- Quinn: Harrier (P) ---
  // Valor marks targets. AA on marked target: 10-95 (by level) + 16-50% AD bonus physical
  {
    id: 'quinn-harrier',
    championId: 'Quinn',
    nameEn: 'Harrier (P) Mark Procs',
    nameJa: 'ハリアー (P) マーク発動回数',
    descriptionEn: 'AA on Valor-marked target: 10-95 (by level) + 16-50% AD physical.',
    descriptionJa: 'ヴァラーのマーク対象AA: 10-95 (レベル) + 16-50% AD 物理DM。',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procs, attacker, _target, level) => {
        if (procs <= 0) return 0;
        const base = 10 + ((95 - 10) / 17) * (level - 1);
        const adRatio = 0.16 + ((0.50 - 0.16) / 17) * (level - 1);
        return (base + adRatio * attacker.ad) * procs;
      },
    },
  },

  // --- Lucian: Lightslinger (P) ---
  // After using ability, next AA fires 2 shots. 2nd shot: 50-100% AD (by level) physical
  {
    id: 'lucian-passive',
    championId: 'Lucian',
    nameEn: 'Lightslinger (P) Double Shot Procs',
    nameJa: 'ライトスリンガー (P) ダブルショット回数',
    descriptionEn: 'After ability: 2nd shot deals 50-100% AD physical (scales with level).',
    descriptionJa: 'スキル後: 2発目 50-100% AD 物理DM (レベル依存)。',
    inputType: 'stack',
    min: 0,
    max: 8,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procs, attacker, _target, level) => {
        if (procs <= 0) return 0;
        const ratio = 0.50 + ((1.0 - 0.50) / 17) * (level - 1);
        return ratio * attacker.ad * procs;
      },
    },
  },

  // --- Jarvan IV: Martial Cadence (P) ---
  // 1st AA on each target: 6% target current HP physical (min 20). 6s CD per target.
  {
    id: 'jarvaniv-passive',
    championId: 'JarvanIV',
    nameEn: 'Martial Cadence (P)',
    nameJa: 'マーシャルケイデンス (P)',
    descriptionEn: '1st AA per target: 6% target current HP physical (min 20, 6s CD).',
    descriptionJa: '対象初回AA: 対象現在HP 6% 物理DM (最低20, 6秒CD)。',
    inputType: 'toggle',
    defaultValue: 1,
    onHit: {
      damageType: 'physical',
      calc: (enabled, _attacker, target) => {
        if (!enabled) return 0;
        return Math.max(20, target.hp * 0.06);
      },
    },
  },

  // --- Singed: no combat passive for damage ---

  // --- Corki: Hextech Munitions (P) ---
  // Basic attacks deal 80% as magic damage + 20% as physical.
  // This is handled by the damage system, not as a combo passive.

  // --- Mordekaiser: Darkness Rise (P) ---
  // After 3 hits/abilities: AoE magic per second: 2-8 + 1-3% maxHP + 30% AP
  {
    id: 'mordekaiser-passive',
    championId: 'Mordekaiser',
    nameEn: 'Darkness Rise (P) Ticks',
    nameJa: 'ダークネスライズ (P) ティック数',
    descriptionEn: 'AoE per second: 2-8 + 1-3% maxHP + 30% AP magic (after 3 hits).',
    descriptionJa: 'AoE毎秒: 2-8 + 1-3%最大HP + 30%AP 魔法DM (3ヒット後)。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (ticks, attacker, _target, level) => {
        if (ticks <= 0) return 0;
        const base = 2 + ((8 - 2) / 17) * (level - 1);
        const hpRatio = (0.01 + ((0.03 - 0.01) / 17) * (level - 1)) * attacker.maxHp;
        return (base + hpRatio + attacker.ap * 0.30) * ticks;
      },
    },
  },

  // --- Gnar: Hyper (W) ---
  // Every 3rd hit: 10/20/30/40/50 + 100% AP + 6/8/10/12/14% target maxHP magic
  {
    id: 'gnar-hyper',
    championId: 'Gnar',
    nameEn: 'Hyper (W) 3-hit Procs',
    nameJa: 'ハイパー (W) 3ヒット発動回数',
    descriptionEn: 'Every 3rd hit: 10-50 + 100% AP + 6-14% target maxHP magic.',
    descriptionJa: '3ヒット毎: 10-50 + 100%AP + 6-14%対象最大HP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, attacker, target, level) => {
        if (procs <= 0) return 0;
        const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
        const base = wRank * 10;
        const hpRatio = 0.04 + 0.02 * wRank;
        return (base + attacker.ap * 1.0 + hpRatio * target.maxHp) * procs;
      },
    },
  },

  // --- Braum: Concussive Blows (P) ---
  // 4th stack stuns and deals 16-120 magic damage (by level)
  {
    id: 'braum-passive',
    championId: 'Braum',
    nameEn: 'Concussive Blows (P) Procs',
    nameJa: 'コンカッシブブロー (P) 発動回数',
    descriptionEn: '4th hit stuns + 16-120 magic (by level). 1s CD after stun.',
    descriptionJa: '4ヒット目スタン + 16-120 魔法DM (レベル依存)。スタン後1秒CD。',
    inputType: 'stack',
    min: 0,
    max: 4,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, _attacker, _target, level) => {
        if (procs <= 0) return 0;
        const dmg = 16 + ((120 - 16) / 17) * (level - 1);
        return dmg * procs;
      },
    },
  },

  // --- Leona: Sunlight (P) ---
  // Abilities mark enemies. Allied AAs on marked target: 25-144 magic (by level)
  {
    id: 'leona-passive',
    championId: 'Leona',
    nameEn: 'Sunlight (P) Procs',
    nameJa: 'サンライト (P) 発動回数',
    descriptionEn: 'Allied AA on marked target: 25-144 magic (by level).',
    descriptionJa: 'マーク対象への味方AA: 25-144 魔法DM (レベル依存)。',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, _attacker, _target, level) => {
        if (procs <= 0) return 0;
        const dmg = 25 + ((144 - 25) / 17) * (level - 1);
        return dmg * procs;
      },
    },
  },

  // --- Nautilus: Staggering Blow (P) ---
  // 1st AA per target: root + 8-110 bonus physical (by level). ~6s CD per target.
  {
    id: 'nautilus-passive',
    championId: 'Nautilus',
    nameEn: 'Staggering Blow (P)',
    nameJa: 'スタッガリングブロウ (P)',
    descriptionEn: '1st AA per target: root + 8-110 physical (by level, 6s CD).',
    descriptionJa: '対象初回AA: ルート + 8-110 物理DM (レベル依存, 6秒CD)。',
    inputType: 'toggle',
    defaultValue: 1,
    onHit: {
      damageType: 'physical',
      calc: (enabled, _attacker, _target, level) => {
        if (!enabled) return 0;
        return 8 + ((110 - 8) / 17) * (level - 1);
      },
    },
  },

  // --- Lulu: Pix, Faerie Companion (P) ---
  // Pix fires 3 bolts on allied AA: 5-39 + 5% AP per bolt (magic). Total: 15-117 + 15% AP.
  {
    id: 'lulu-pix',
    championId: 'Lulu',
    nameEn: 'Pix (P) On-hit Bolts',
    nameJa: 'ピクス (P) 追撃',
    descriptionEn: 'Pix fires 3 bolts on AA: total 15-117 + 15% AP magic.',
    descriptionJa: 'AA時3発追撃: 合計 15-117 + 15% AP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 1,
    onHit: {
      damageType: 'magic',
      calc: (enabled, attacker, _target, level) => {
        if (!enabled) return 0;
        const perBolt = 5 + ((39 - 5) / 17) * (level - 1);
        return perBolt * 3 + attacker.ap * 0.15;
      },
    },
  },

  // --- Sona: Power Chord (P) ---
  // After 3 abilities: empowered AA deals 20-240 + 20% AP bonus magic
  {
    id: 'sona-passive',
    championId: 'Sona',
    nameEn: 'Power Chord (P)',
    nameJa: 'パワーコード (P)',
    descriptionEn: 'After 3 abilities: empowered AA deals 20-240 + 20% AP magic.',
    descriptionJa: '3スキル後: 強化AA 20-240 + 20% AP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      calc: (enabled, attacker, _target, level) => {
        if (!enabled) return 0;
        return 20 + ((240 - 20) / 17) * (level - 1) + attacker.ap * 0.20;
      },
    },
  },

  // --- Pyke: Gift of the Drowned Ones (P) ---
  // Cannot gain bonus HP. Converts to bonus AD instead.
  // Handled as champion bonus, not combo passive.

  // --- Senna: Absolution (P) mist stacks ---
  // Already in champion-bonuses

  // --- Blitzcrank: Mana Barrier (P) ---
  // Shield based on mana. Not a damage passive.

  // --- Zyra: Garden of Thorns (P) Plant Attacks ---
  // Plants deal 20-100 (by level) + 18% AP magic per hit
  {
    id: 'zyra-passive',
    championId: 'Zyra',
    nameEn: 'Plant Attacks (P)',
    nameJa: 'プラント攻撃 (P)',
    descriptionEn: 'Plants deal 20-100 (by level) + 18% AP magic per hit.',
    descriptionJa: 'プラント: 20-100 (レベル) + 18% AP 魔法DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 20 + (80 / 17) * (level - 1); // 20 → 100
        return (base + attacker.ap * 0.18) * procCount;
      },
    },
  },

  // --- Alistar: Trample (E) ---
  // After 5 E hits on champion: empowered AA deals 35-290 magic (by level)
  {
    id: 'alistar-trample',
    championId: 'Alistar',
    nameEn: 'Trample (E) Empowered AA',
    nameJa: 'トランプル (E) 強化AA',
    descriptionEn: 'After 5 E stacks on champion: empowered AA = 35-290 magic.',
    descriptionJa: '5スタック後: 強化AA = 35-290 魔法DM。',
    inputType: 'toggle',
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      calc: (enabled, _attacker, _target, level) => {
        if (!enabled) return 0;
        return 35 + ((290 - 35) / 17) * (level - 1);
      },
    },
  },

  // ====================================================================
  // High-impact passives added for accuracy (Wiki-verified 2026-03)
  // ====================================================================

  // --- Aatrox: Deathbringer Stance (P) ---
  // Enhanced AA: 4-10.71% target max HP magic damage. Heals 100%.
  {
    id: 'aatrox-passive',
    championId: 'Aatrox',
    nameEn: 'Deathbringer Stance (P) Procs',
    nameJa: 'デスブリンガースタンス (P) 発動回数',
    descriptionEn: 'Enhanced AA: 4-10.71% target max HP magic. Set procs in combo.',
    descriptionJa: '強化AA: 対象最大HPの4-10.71% 魔法DM。コンボ内発動回数。',
    inputType: 'stack',
    min: 0,
    max: 99,
    defaultValue: 0,
    aaLinked: true,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const pct = 0.04 + (0.0671 / 17) * (level - 1); // 4% → 10.71%
        return target.maxHp * pct * procCount;
      },
    },
  },

  // --- Camille: Hextech Ultimatum (R) On-Hit ---
  // While in R zone: AAs deal 4/6/8% of target current HP as magic damage
  {
    id: 'camille-r-onhit',
    championId: 'Camille',
    nameEn: 'Hextech Ultimatum (R) On-Hit',
    nameJa: 'ヘクステックアルティメイタム (R) AA追加',
    descriptionEn: 'While in R: AAs deal 4/6/8% target current HP magic. Set procs.',
    descriptionJa: 'R中: AA毎に対象現在HPの4/6/8% 魔法DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 99,
    defaultValue: 0,
    aaLinked: true,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        // R rank at level 6/11/16
        let pct = 0.04;
        if (level >= 16) pct = 0.08;
        else if (level >= 11) pct = 0.06;
        return target.maxHp * pct * procCount;
      },
    },
  },

  // --- Corki: Hextech Munitions (P) ---
  // AAs deal 20% AD as bonus true damage (can crit)
  {
    id: 'corki-passive',
    championId: 'Corki',
    nameEn: 'Hextech Munitions (P)',
    nameJa: 'ヘクステック榴散弾 (P)',
    descriptionEn: 'AAs deal 20% total AD as bonus true damage.',
    descriptionJa: 'AA毎に総ADの20%を確定ダメージとして追加。',
    inputType: 'toggle',
    defaultValue: 1,
    onHit: {
      damageType: 'true',
      calc: (enabled, attacker) => {
        if (!enabled) return 0;
        return attacker.ad * 0.20;
      },
    },
  },

  // --- Renekton: Dominus (R) ---
  // +300/500/700 HP, AoE magic damage: 30/75/120 (+5% bonus AD +5% AP) per 0.5s
  {
    id: 'renekton-r',
    championId: 'Renekton',
    nameEn: 'Dominus (R) AoE Ticks',
    nameJa: 'ドミナス (R) 範囲ダメージ',
    descriptionEn: 'R AoE: 30/75/120 + 5% bonus AD + 5% AP magic per 0.5s. Set ticks.',
    descriptionJa: 'R範囲: 30/75/120 + 5%増加AD + 5%AP 魔法DM/0.5秒。ティック数。',
    inputType: 'stack',
    min: 0,
    max: 30,
    defaultValue: 0,
    secondsPerUnit: 0.5,
    statBonus: (ticks, level) => {
      if (ticks <= 0) return {};
      // R rank at level 6/11/16
      let bonusHp = 300;
      if (level >= 16) bonusHp = 700;
      else if (level >= 11) bonusHp = 500;
      return { hp: bonusHp };
    },
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (ticks, attacker, _target, level) => {
        if (ticks <= 0) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        let baseDmg = 30;
        if (level >= 16) baseDmg = 120;
        else if (level >= 11) baseDmg = 75;
        return (baseDmg + 0.05 * bonusAd + 0.05 * attacker.ap) * ticks;
      },
    },
  },

  // --- Kayn: Shadow Assassin (P) ---
  // First hit on champion: 20-42.35% of post-mitigation damage as bonus magic damage
  // Modeled as a damage amplifier toggle; actual amplification in damage segment display
  {
    id: 'kayn-shadow-assassin',
    championId: 'Kayn',
    nameEn: 'Shadow Assassin (P)',
    nameJa: 'シャドウアサシン (P)',
    descriptionEn: 'Shadow form: 20-42.35% of damage dealt as bonus magic. Toggle.',
    descriptionJa: '影形態: 与ダメージの20-42.35%を追加魔法DMとして付与。',
    inputType: 'toggle',
    defaultValue: 0,
    formGroup: 'shadow',
  },

  // --- Kayn: Rhaast (P) ---
  // 25% (+0.5% per 100 bonus HP) spell vamp on ability damage vs champions
  {
    id: 'kayn-rhaast',
    championId: 'Kayn',
    nameEn: 'Rhaast / Darkin (P)',
    nameJa: 'ラースト / ダーキン (P)',
    descriptionEn: 'Darkin form: heal 25% (+0.5%/100 bonus HP) of ability damage. Toggle.',
    descriptionJa: 'ダーキン形態: スキルDMの25% (+増加HP100毎+0.5%) 回復。',
    inputType: 'toggle',
    formGroup: 'rhaast',
    defaultValue: 0,
  },

  // --- Wukong: Stone Skin (P) ---
  // Base: +6-10.47 AR always. At max stacks (5): total +36-62.82 AR.
  {
    id: 'wukong-passive',
    championId: 'MonkeyKing',
    nameEn: 'Stone Skin (P) Max Stacks',
    nameJa: 'ストーンスキン (P) 最大スタック',
    descriptionEn: 'Toggle: base +6-10 AR + 5 stacks = total +36-63 AR.',
    descriptionJa: 'トグル: 基本+6-10 AR + 5スタック = 合計+36-63 AR。',
    inputType: 'toggle',
    defaultValue: 0,
    statBonus: (enabled, level) => {
      if (!enabled) {
        // Base armor only (always active even without stacks)
        const baseAr = 6 + (4.47 / 17) * (level - 1);
        return { armor: baseAr };
      }
      // Full 5 stacks
      const baseAr = 6 + (4.47 / 17) * (level - 1);
      const perStack = 6 + (4 / 17) * (level - 1);
      return { armor: baseAr + perStack * 5 };
    },
  },

  // --- Poppy: Iron Ambassador (P) ---
  // Passive empowered AA: 20-198.82 (by level) bonus magic damage
  {
    id: 'poppy-passive',
    championId: 'Poppy',
    nameEn: 'Iron Ambassador (P) Procs',
    nameJa: 'アイアンアンバサダー (P) 発動回数',
    descriptionEn: 'Empowered AA: 20-199 (by level) bonus magic. Set procs.',
    descriptionJa: '強化AA: 20-199 (レベル) 魔法DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    aaLinked: true,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 20 + (178.82 / 17) * (level - 1); // 20 → 198.82
        return base * procCount;
      },
    },
  },

  // --- Poppy: Iron Ambassador (P) Shield ---
  // Shield: 15-21% max HP for 3s
  {
    id: 'poppy-passive-shield',
    championId: 'Poppy',
    nameEn: 'Iron Ambassador (P) Shield',
    nameJa: 'アイアンアンバサダー (P) シールド',
    descriptionEn: 'Shield = 15-21% max HP for 3s.',
    descriptionJa: 'シールド = 最大HPの15-21%。3秒間。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const pct = (15 + 6 / 17 * (level - 1)) / 100;
      return holder.maxHp * pct;
    },
  },

  // --- Graves: New Destiny (P) ---
  // 4 pellets: 1st = 70-105% AD, each extra = 23.3-35% AD.
  // Total all 4 hit = 140-210% AD. Extra beyond normal AA = 40-110% AD.
  {
    id: 'graves-passive',
    championId: 'Graves',
    nameEn: 'New Destiny (P) Extra Pellets',
    nameJa: 'ニューデスティニー (P) 追加弾',
    descriptionEn: '4 pellets per AA. Extra 3 pellets: ~70-105% AD total. Toggle.',
    descriptionJa: 'AA毎4発。追加3発分: 約70-105% AD。トグル。',
    inputType: 'toggle',
    defaultValue: 1,
    onHit: {
      damageType: 'physical',
      calc: (enabled, attacker, _target, level) => {
        if (!enabled) return 0;
        // 3 extra pellets, each 23.3-35% AD by level
        const perPellet = 0.233 + (0.117 / 17) * (level - 1); // 23.3% → 35%
        return attacker.ad * perPellet * 3;
      },
    },
  },

  // --- Briar: Blood Frenzy (W) ---
  // W active: +55/65/75/85/95% AS, empowered AA: 60/70/80/90/100% AD physical
  {
    id: 'briar-w',
    championId: 'Briar',
    nameEn: 'Blood Frenzy (W) Empowered AA',
    nameJa: 'ブラッドフレンジー (W) 強化AA',
    descriptionEn: 'W: +55-95% AS, empowered AA: 60-100% AD physical. Set AA count.',
    descriptionJa: 'W: +55-95% AS, 強化AA: 60-100% AD 物理DM。AA回数。',
    inputType: 'stack',
    min: 0,
    max: 15,
    defaultValue: 0,
    statBonus: (procs, level) => {
      if (procs <= 0) return {};
      // W rank roughly at level 1/4/7/10/13
      const asValues = [0.55, 0.65, 0.75, 0.85, 0.95];
      let rank = 0;
      if (level >= 13) rank = 4;
      else if (level >= 10) rank = 3;
      else if (level >= 7) rank = 2;
      else if (level >= 4) rank = 1;
      return { attackSpeed: asValues[rank] };
    },
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        // Empowered AA: 60/70/80/90/100% AD
        const ratios = [0.60, 0.70, 0.80, 0.90, 1.00];
        let rank = 0;
        if (level >= 13) rank = 4;
        else if (level >= 10) rank = 3;
        else if (level >= 7) rank = 2;
        else if (level >= 4) rank = 1;
        return attacker.ad * ratios[rank] * procCount;
      },
    },
  },

  // --- Rek'Sai: Queen's Wrath (Q) On-Hit ---
  // Q: next 3 AAs deal 30/35/40/45/50% total AD bonus physical. +35% AS for 3s.
  {
    id: 'reksai-q-onhit',
    championId: 'RekSai',
    nameEn: "Queen's Wrath (Q) Bonus AA",
    nameJa: '女王の怒り (Q) 追加AA',
    descriptionEn: 'Q: next 3 AAs deal 30-50% total AD physical. +35% AS. Set hits.',
    descriptionJa: 'Q: 次の3回AA追加 30-50% 総AD 物理DM。+35% AS。ヒット数。',
    inputType: 'stack',
    min: 0,
    max: 3,
    defaultValue: 0,
    statBonus: (procs) => {
      if (procs <= 0) return {};
      return { attackSpeed: 0.35 };
    },
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        // Q rank at level 1/4/7/10/13
        const ratios = [0.30, 0.35, 0.40, 0.45, 0.50];
        let rank = 0;
        if (level >= 13) rank = 4;
        else if (level >= 10) rank = 3;
        else if (level >= 7) rank = 2;
        else if (level >= 4) rank = 1;
        return attacker.ad * ratios[rank] * procCount;
      },
    },
  },

  // --- Pantheon: Mortal Will (P) --- REMOVED: empowered Q already in skill overrides with comboLabel: 'P'

  // --- Smolder: Dragon Practice (P) Q Burn ---
  // At 25 stacks: Q applies burn for 30 (+8/lvl) +10% bonus AD + 4% AP over 3s
  // At 125 stacks: Q explosion deals 40 (+10/lvl) +15% bonus AD + 6% AP
  // At 225 stacks: additional explosion 50 (+12/lvl) +20% bonus AD + 8% AP
  {
    id: 'smolder-passive',
    championId: 'Smolder',
    nameEn: 'Dragon Practice (P) Stacks',
    nameJa: 'ドラゴンの修行 (P) スタック',
    descriptionEn: 'Current stacks. 25+: Q burn, 125+: Q explode, 225+: extra explosion.',
    descriptionJa: '現在スタック。25+: Q炎上, 125+: Q爆発, 225+: 追加爆発。',
    inputType: 'stack',
    min: 0,
    max: 999,
    defaultValue: 0,
    skillBonus: {
      skillKey: 'Q',
      damageType: 'magic',
      calc: (stacks, attacker, _target, level) => {
        if (stacks < 25) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        let dmg = 0;
        // 25+ stacks: burn
        dmg += 30 + 8 * (level - 1) + 0.10 * bonusAd + 0.04 * attacker.ap;
        if (stacks >= 125) {
          // 125+ stacks: explosion
          dmg += 40 + 10 * (level - 1) + 0.15 * bonusAd + 0.06 * attacker.ap;
        }
        if (stacks >= 225) {
          // 225+ stacks: additional explosion
          dmg += 50 + 12 * (level - 1) + 0.20 * bonusAd + 0.08 * attacker.ap;
        }
        return dmg;
      },
    },
  },

  // --- Aurelion Sol: Stardust (P) — Q bonus ---
  // Each stack: +0.065 per stack on Q
  {
    id: 'aurelionsol-stardust-q',
    championId: 'AurelionSol',
    nameEn: 'Stardust (P) Q Bonus',
    nameJa: 'スターダスト (P) Q増加',
    descriptionEn: 'Stardust stacks. +0.065 flat magic per stack on Q.',
    descriptionJa: 'スターダストスタック。Q: +0.065/スタック 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 9999,
    defaultValue: 0,
    skillBonus: {
      skillKey: 'Q',
      damageType: 'magic',
      calc: (stacks) => (stacks > 0 ? stacks * 0.065 : 0),
    },
  },

  // --- Aurelion Sol: Stardust (P) — W bonus ---
  // Each stack: +1.1 per stack on W (center hit)
  {
    id: 'aurelionsol-stardust-w',
    championId: 'AurelionSol',
    nameEn: 'Stardust (P) W Bonus',
    nameJa: 'スターダスト (P) W増加',
    descriptionEn: 'Stardust stacks. +1.1 flat magic per stack on W center.',
    descriptionJa: 'スターダストスタック。W: +1.1/スタック 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 9999,
    defaultValue: 0,
    skillBonus: {
      skillKey: 'W',
      damageType: 'magic',
      calc: (stacks) => (stacks > 0 ? stacks * 1.1 : 0),
    },
  },

  // --- Aurelion Sol: Stardust (P) — R bonus ---
  // Each stack: +1.5 per stack on R
  {
    id: 'aurelionsol-stardust-r',
    championId: 'AurelionSol',
    nameEn: 'Stardust (P) R Bonus',
    nameJa: 'スターダスト (P) R増加',
    descriptionEn: 'Stardust stacks. +1.5 flat magic per stack on R.',
    descriptionJa: 'スターダストスタック。R: +1.5/スタック 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 9999,
    defaultValue: 0,
    skillBonus: {
      skillKey: 'R',
      damageType: 'magic',
      calc: (stacks) => (stacks > 0 ? stacks * 1.5 : 0),
    },
  },

  // --- Yone: Spirit Cleave (E) ---
  // E: marks all damage dealt during spirit form, then deals 25-35% of marked damage as true damage
  {
    id: 'yone-e-amplify',
    championId: 'Yone',
    nameEn: 'Soul Unbound (E) Amplification',
    nameJa: '縛魂の解放 (E) 増幅',
    descriptionEn: 'Toggle: E active. Repeats 25-35% (by level) of all damage dealt as true damage.',
    descriptionJa: 'トグル: E発動中。与ダメの25-35% (レベル) を真DMとして追加。',
    inputType: 'toggle',
    defaultValue: 0,
  },

  // --- Sion: Soul Furnace (W) Shield ---
  // W passive: +4 max HP per unit kill, +15 per large unit/champion
  // Input = bonus HP from W stacks
  {
    id: 'sion-w-hp',
    championId: 'Sion',
    nameEn: 'Soul Furnace (W) Bonus HP',
    nameJa: '魂の炉心 (W) 増加HP',
    descriptionEn: 'Bonus HP from W passive stacks.',
    descriptionJa: 'Wパッシブによる増加HP。',
    inputType: 'stack',
    min: 0,
    max: 9999,
    defaultValue: 0,
    statBonus: (hp) => (hp > 0 ? { hp } : {}),
  },

  // --- Vex: Doom \'n Gloom (P) ---
  // After using ability: next basic attack deals 30-180 (by level) + 20% AP bonus magic
  {
    id: 'vex-passive',
    championId: 'Vex',
    nameEn: 'Doom \'n Gloom (P)',
    nameJa: 'フコウとユーウツ (P)',
    descriptionEn: 'Gloom proc: 30-180 (by level) + 20% AP bonus magic per marked target hit.',
    descriptionJa: 'グルーム発動: 30-180 (レベル) + 20%AP 魔法DM。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 30 + (150 / 17) * (level - 1);
        return (base + attacker.ap * 0.20) * procCount;
      },
    },
  },

  // --- Yorick: Last Rites (Q) / Mist Walkers ---
  // Mist walkers deal 2-100 (by level) + 25% AD physical per hit
  {
    id: 'yorick-ghouls',
    championId: 'Yorick',
    nameEn: 'Shepherd of Souls (P) Ghoul Hits',
    nameJa: '魂の導き手 (P) グール攻撃回数',
    descriptionEn: 'Mist Walkers deal 2-100 (by level) + 25% AD physical per hit.',
    descriptionJa: 'ミストウォーカー: 2-100 (レベル) + 25%AD 物理DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 2 + (98 / 17) * (level - 1);
        return (base + attacker.ad * 0.25) * procCount;
      },
    },
  },

  // --- Yorick: The Maiden ---
  // Maiden deals 0 + 3-10% target max HP magic per hit
  {
    id: 'yorick-maiden',
    championId: 'Yorick',
    nameEn: 'Eulogy of the Isles (R) Maiden Hits',
    nameJa: '哀哭の使徒 (R) メイデン攻撃回数',
    descriptionEn: 'Maiden deals 3-10% target max HP magic per hit.',
    descriptionJa: 'メイデン: 3-10% 対象最大HP 魔法DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, _attacker, target, level) => {
        if (procCount <= 0) return 0;
        const pct = 0.03 + (0.07 / 17) * (level - 1);
        return pct * target.maxHp * procCount;
      },
    },
  },

  // --- Seraphine: Stage Presence (P) ---
  // Every 3rd basic ability echoes (casts twice at same damage). Notes deal magic per note.
  // Notes: on basic attack near echoed skill, each note deals 4-16 (by level) + 7% AP magic
  {
    id: 'seraphine-passive',
    championId: 'Seraphine',
    nameEn: 'Stage Presence (P) Note Hits',
    nameJa: 'ステージプレゼンス (P) 音符ヒット数',
    descriptionEn: 'Notes: 4-16 (by level) + 7% AP magic per note. Set total note hits in combo.',
    descriptionJa: '音符: 4-16 (レベル) + 7%AP 魔法DM/ノート。コンボ中の合計ヒット数。',
    inputType: 'stack',
    min: 0,
    max: 12,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 4 + (12 / 17) * (level - 1);
        return (base + attacker.ap * 0.07) * procCount;
      },
    },
  },

  // --- Rakan: Fey Feathers (P) Shield ---
  // Passive shield: 33-254 (by level) + 85% AP. Not damage, but defense.
  {
    id: 'rakan-passive',
    championId: 'Rakan',
    nameEn: 'Fey Feathers (P) Shield',
    nameJa: '神秘の翼 (P) シールド',
    descriptionEn: 'Toggle: passive shield = 30-248 (by level) + 95% AP.',
    descriptionJa: 'トグル: パッシブシールド = 30-248 (レベル) + 95%AP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      return 30 + (248 - 30) / 17 * (level - 1) + 0.95 * holder.ap;
    },
  },

  // --- Mel: Searing Brilliance (P) ---
  // AA fires projectiles = consumed stacks. Each projectile: 8-33 (by level) + 3% AP magic.
  // 3 stacks per ability, max 9. Set total projectile hits in combo.
  {
    id: 'mel-passive',
    championId: 'Mel',
    nameEn: 'Searing Brilliance (P) Projectiles',
    nameJa: '灼熱の輝き (P) 弾数',
    descriptionEn: 'AA fires projectiles: 8-33 (by level) + 3% AP magic each. Set total hits.',
    descriptionJa: 'AA発射弾: 8-33 (レベル) + 3%AP 魔法DM/弾。合計ヒット数。',
    inputType: 'stack',
    min: 0,
    max: 9,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 8 + (25 / 17) * (level - 1);
        return (base + attacker.ap * 0.03) * procCount;
      },
    },
  },

  // --- Mel: Overwhelm (P) ---
  // Stacks on target from abilities/AA. R detonates stacks.
  {
    id: 'mel-overwhelm',
    championId: 'Mel',
    nameEn: 'Overwhelm (P) Stacks on R',
    nameJa: '灼熱の輝き (P) Rスタック数',
    descriptionEn: 'R detonates stacks: 4-10 + 2.5% AP per stack bonus. Set stack count.',
    descriptionJa: 'Rスタック爆発: 4-10 + 2.5%AP/スタック追加。スタック数。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    skillBonus: {
      skillKey: 'R',
      damageType: 'magic',
      calc: (stacks, attacker) => {
        if (stacks <= 0) return 0;
        const perStack = 7 + attacker.ap * 0.025;
        return perStack * stacks;
      },
    },
  },

  // --- Zed: Contempt for the Weak (P) ---
  // AA against targets below 50% HP: bonus magic damage = 6-10% target max HP
  {
    id: 'zed-passive',
    championId: 'Zed',
    nameEn: 'Contempt for the Weak (P)',
    nameJa: '弱者必衰 (P)',
    descriptionEn: 'Toggle: AA vs <50% HP deals 6-10% target max HP magic (once per target).',
    descriptionJa: 'トグル: HP50%以下の敵へAA追加: 6-10% 対象最大HP 魔法DM (対象毎1回)。',
    inputType: 'toggle',
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      missingHpScaling: true,
      calc: (enabled, _attacker, target, level) => {
        if (!enabled) return 0;
        const pct = 0.06 + (0.04 / 17) * (level - 1);
        return pct * target.maxHp;
      },
    },
  },

  // --- Lee Sin: Flurry (P) ---
  // After using an ability: next 2 AAs have +40% AS and restore energy
  // First AA: full damage, Second AA: 50% bonus. Not direct damage passive.
  // Handled as AS bonus toggle.
  {
    id: 'leesin-passive',
    championId: 'LeeSin',
    nameEn: 'Flurry (P) Bonus AS',
    nameJa: '練気 (P) AS増加',
    descriptionEn: 'Toggle: +40% AS from passive (after ability cast).',
    descriptionJa: 'トグル: パッシブ+40% AS (スキル使用後)。',
    inputType: 'toggle',
    defaultValue: 0,
    statBonus: (enabled) => (enabled ? { attackSpeed: 0.40 } : {}),
  },

  // --- Twisted Fate: Stacked Deck (E) ---
  // Every 4th AA: bonus magic damage 65/90/115/140/165 + 50% AP
  {
    id: 'twistedfate-e-procs',
    championId: 'TwistedFate',
    nameEn: 'Stacked Deck (E) Procs',
    nameJa: 'スタックデッキ (E) 発動回数',
    descriptionEn: 'Every 4th AA: 65-165 + 50% AP magic. Set proc count in combo.',
    descriptionJa: '4回毎AA: 65-165 + 50%AP 魔法DM。コンボ中の発動回数。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, _level) => {
        if (procCount <= 0) return 0;
        // Uses E rank, but we don't have rank info here — use level-based approximation
        // E base: 65/90/115/140/165 — approximate as 65 + 25 * (rank-1), rank ≈ ceil(level/3) capped 5
        const rank = Math.min(5, Math.ceil(_level / 3));
        const base = 65 + 25 * (rank - 1);
        return (base + attacker.ap * 0.50) * procCount;
      },
    },
  },

  // --- Lulu: Pix, Faerie Companion (P) ---
  // Pix fires 3 bolts on AA: each bolt 5-39 (by level) + 5% AP magic
  {
    id: 'lulu-pix',
    championId: 'Lulu',
    nameEn: 'Pix Bolts (P)',
    nameJa: '仲良し妖精ピックス (P)',
    descriptionEn: 'Pix fires 3 bolts per AA: each 5-39 (by level) + 5% AP magic.',
    descriptionJa: 'AA毎3発: 各5-39 (レベル) + 5%AP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 1,
    onHit: {
      damageType: 'magic',
      calc: (_enabled, attacker, _target, level) => {
        const perBolt = 5 + (34 / 17) * (level - 1);
        return (perBolt + attacker.ap * 0.05) * 3;
      },
    },
  },

  // --- Orianna: Clockwork Windup (P) ---
  // AA deals bonus magic: 10-50 (by level) + 15% AP, stacks up to 2x on same target
  {
    id: 'orianna-passive',
    championId: 'Orianna',
    nameEn: 'Clockwork Windup (P) Stacks',
    nameJa: 'ぜんまい仕掛け (P) スタック',
    descriptionEn: 'AA bonus: 10-50 + 15% AP magic. Stacks to 2x on same target (1=base, 2=2x).',
    descriptionJa: 'AA追加: 10-50 + 15%AP 魔法DM。同対象2xまで (1=基本, 2=2倍)。',
    inputType: 'stack',
    min: 0,
    max: 2,
    defaultValue: 1,
    onHit: {
      damageType: 'magic',
      calc: (stacks, attacker, _target, level) => {
        if (stacks <= 0) return 0;
        const base = 10 + (40 / 17) * (level - 1);
        return (base + attacker.ap * 0.15) * stacks;
      },
    },
  },

  // --- Zyra: Garden of Thorns (P) / Plant Attacks ---
  // Plants deal 16-100 (by level) + 15% AP magic per hit
  {
    id: 'zyra-plants',
    championId: 'Zyra',
    nameEn: 'Plant Attack Hits',
    nameJa: '茨の楽園 (P) 植物攻撃回数',
    descriptionEn: 'Plants deal 16-100 (by level) + 15% AP magic per hit.',
    descriptionJa: '植物: 16-100 (レベル) + 15%AP 魔法DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 16 + (84 / 17) * (level - 1);
        return (base + attacker.ap * 0.15) * procCount;
      },
    },
  },

  // --- Heimerdinger: H-28G Evolution Turret (Q) ---
  // Turret beam: 6-50 (by level) + 30% AP magic per hit
  {
    id: 'heimerdinger-turrets',
    championId: 'Heimerdinger',
    nameEn: 'Turret Beam Hits',
    nameJa: 'H-28G革新砲 (Q) ビーム回数',
    descriptionEn: 'Turret beam: 6-50 (by level) + 30% AP magic per hit.',
    descriptionJa: 'タレットビーム: 6-50 (レベル) + 30%AP 魔法DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 6 + (44 / 17) * (level - 1);
        return (base + attacker.ap * 0.30) * procCount;
      },
    },
  },

  // --- Malzahar: Void Swarm (W) ---
  // Voidlings deal 5-64.5 (by level) + 12% bonus AD + 40% AP magic per hit
  {
    id: 'malzahar-voidlings',
    championId: 'Malzahar',
    nameEn: 'Voidling Hits',
    nameJa: 'ヴォイドスワーム (W) 攻撃回数',
    descriptionEn: 'Voidlings: 5-64.5 (by level) + 12% bonus AD + 40% AP magic per hit.',
    descriptionJa: 'ヴォイドリング: 5-64.5 (レベル) + 12%増AD + 40%AP 魔法DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procCount, attacker, _target, level) => {
        if (procCount <= 0) return 0;
        const base = 5 + (59.5 / 17) * (level - 1);
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + bonusAd * 0.12 + attacker.ap * 0.40) * procCount;
      },
    },
  },

  // --- Elise: Spider Form (R) ---
  // Spider Form: bonus on-hit magic damage 10/15/20/25 + 20% AP
  {
    id: 'elise-spider-onhit',
    championId: 'Elise',
    nameEn: 'Spider Form (R) On-Hit',
    nameJa: '蜘蛛形態 (R) AA追加',
    descriptionEn: 'Spider Form: on-hit 10-25 + 20% AP magic per AA.',
    descriptionJa: 'スパイダーフォーム: AA追加 10-25 + 20%AP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      calc: (enabled, attacker, _target, level) => {
        if (!enabled) return 0;
        const rRank = Math.min(4, Math.ceil(level / 5));
        const base = 10 + 5 * (rRank - 1);
        return base + attacker.ap * 0.20;
      },
    },
  },

  // --- Swain: Ravenous Flock (P) ---
  // R2 Demonflare: 150/225/300 + 60% AP magic (after R drain)
  {
    id: 'swain-r2',
    championId: 'Swain',
    nameEn: 'Demonflare (R2)',
    nameJa: '魔帝戴冠 (R2) デーモンフレア',
    descriptionEn: 'Toggle: R2 Demonflare deals 150-300 + 60% AP magic.',
    descriptionJa: 'トグル: R2 デーモンフレア 150-300 + 60%AP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (enabled, attacker) => {
        if (!enabled) return 0;
        // R rank approximation
        return 225 + attacker.ap * 0.60;
      },
    },
  },

  // --- Syndra: Transcendent (P) ---
  // At 120 Splinters: +15% damage to champions (damage amplifier like Yone E)
  {
    id: 'syndra-passive',
    championId: 'Syndra',
    nameEn: 'Transcendent (P) 120 Splinters',
    nameJa: '絶大なる魔力 (P) 120スプリンター',
    descriptionEn: 'Toggle: at 120 splinters, +15% total damage to champions.',
    descriptionJa: 'トグル: 120スプリンター時、チャンピオンへの与DM +15%。',
    inputType: 'toggle',
    defaultValue: 0,
  },

  // --- Pantheon: Mortal Will (P) ---
  // At 5 stacks: empowers next ability. Toggle for empowered state.
  {
    id: 'pantheon-passive',
    championId: 'Pantheon',
    nameEn: 'Mortal Will (P) Empowered',
    nameJa: '定命の意志 (P) 強化',
    descriptionEn: 'Toggle: empowered state (5 stacks). Empowered Q/W/E deal bonus damage.',
    descriptionJa: 'トグル: 強化状態 (5スタック)。強化Q/W/Eが追加ダメージ。',
    inputType: 'toggle',
    defaultValue: 0,
    // Empowered Q: deals 20-240 + 115% bonus AD bonus physical (thrust version)
    skillBonus: {
      skillKey: 'Q',
      damageType: 'physical',
      calc: (enabled, attacker) => {
        if (!enabled) return 0;
        const bonusAd = attacker.ad - attacker.baseAd;
        return 40 + bonusAd * 0.115;
      },
    },
  },

  // --- Nilah: Jubilant Veil (P) ---
  // Shared XP advantage — represented as bonus XP (stat-less, but passive also gives increased healing)
  // Her P's real combat effect: bonus AA range + attacks cleave nearby
  // AA cleave hits not directly modeled, but she has passive on-hit
  {
    id: 'nilah-passive',
    championId: 'Nilah',
    nameEn: 'Joy Unending (P) Healing Amp',
    nameJa: '終わりなき喜び (P) 回復増幅',
    descriptionEn: 'Toggle: +7.5-20% (by level) bonus healing and shielding.',
    descriptionJa: 'トグル: 回復・シールド+7.5-20% (レベル)。',
    inputType: 'toggle',
    defaultValue: 0,
  },

  // --- K'Sante: Ntofo Strikes (P) ---
  // 3rd hit on same target: 3-16% (by level) target max HP magic (min 35-120)
  {
    id: 'ksante-passive',
    championId: 'KSante',
    nameEn: 'Ntofo Strikes (P) Procs',
    nameJa: '不屈の本能 (P) 発動回数',
    descriptionEn: '3rd hit: 3-16% target max HP magic. Set proc count.',
    descriptionJa: '3ヒット目: 3-16% 対象最大HP 魔法DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, _attacker, target, level) => {
        if (procs <= 0) return 0;
        const pct = 0.03 + (0.13 / 17) * (level - 1);
        const minDmg = 35 + (85 / 17) * (level - 1);
        return Math.max(pct * target.maxHp, minDmg) * procs;
      },
    },
  },

  // --- Viego: Sovereign's Domination (P) ---
  // AA on-hit: 2% target current HP magic (min 10/max 50 vs minions)
  {
    id: 'viego-passive',
    championId: 'Viego',
    nameEn: 'Sovereign\'s Domination (P)',
    nameJa: '王の支配 (P)',
    descriptionEn: 'AA on-hit: 2% target current HP magic per AA.',
    descriptionJa: 'AA追加: 2% 対象現在HP 魔法DM。',
    inputType: 'toggle',
    defaultValue: 1,
    onHit: {
      damageType: 'magic',
      calc: (_enabled, _attacker, target) => {
        return 0.02 * target.hp;
      },
    },
  },

  // --- Ambessa: Drakehound's Step (P) ---
  // After ability: next AA empowered, deals 10-82 (by level) + 85% bonus AD physical
  {
    id: 'ambessa-passive',
    championId: 'Ambessa',
    nameEn: 'Drakehound\'s Step (P) Procs',
    nameJa: 'ドレイクハウンドの猛攻 (P) 発動回数',
    descriptionEn: 'Empowered AA: 10-82 + 85% bAD physical. Set proc count.',
    descriptionJa: '強化AA: 10-82 + 85%増AD 物理DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (procs, attacker, _target, level) => {
        if (procs <= 0) return 0;
        const base = 10 + (72 / 17) * (level - 1);
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + bonusAd * 0.85) * procs;
      },
    },
  },

  // --- Akshan: Dirty Fighting (P) ---
  // Every 3 hits: bonus magic damage 10-165 (by level) + 60% bonus AD
  // Also grants shield, but damage is primary
  {
    id: 'akshan-passive',
    championId: 'Akshan',
    nameEn: 'Dirty Fighting (P) 3-Hit Procs',
    nameJa: 'ダーティーファイト (P) 3ヒット発動数',
    descriptionEn: 'Every 3rd hit: 10-165 (by level) + 60% bAD magic. Set proc count.',
    descriptionJa: '3ヒット目: 10-165 (レベル) + 60%増AD 魔法DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, attacker, _target, level) => {
        if (procs <= 0) return 0;
        const base = 10 + (155 / 17) * (level - 1);
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + bonusAd * 0.60) * procs;
      },
    },
  },

  // --- Azir: Sand Soldier AA ---
  // Soldier AA: 0-110 (by level) + 55% AP magic per soldier hit
  {
    id: 'azir-soldiers',
    championId: 'Azir',
    nameEn: 'Sand Soldier Hits',
    nameJa: '目覚めよ！ (W) 砂兵士攻撃回数',
    descriptionEn: 'Soldier AA: 0-110 (by level) + 55% AP magic per hit.',
    descriptionJa: '砂兵士AA: 0-110 (レベル) + 55%AP 魔法DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (hits, attacker, _target, level) => {
        if (hits <= 0) return 0;
        const base = (110 / 17) * (level - 1);
        return (base + attacker.ap * 0.55) * hits;
      },
    },
  },

  // --- Kalista: Rend (E) ---
  // E: First spear 20/30/40/50/60 + 70% AD, additional spears 10/16/22/28/34 + 23.2/27.5/31.8/36.1/40.4% AD
  {
    id: 'kalista-rend',
    championId: 'Kalista',
    nameEn: 'Rend (E) Spears',
    nameJa: '引き裂く遺恨 (E) 投槍数',
    descriptionEn: 'E rend: first spear + additional spears. Set total spear count.',
    descriptionJa: 'Eレンド: 1本目+追加投槍。合計投槍数。',
    inputType: 'stack',
    min: 0,
    max: 20,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (spears, attacker, _target, level) => {
        if (spears <= 0) return 0;
        const eRank = Math.min(5, Math.ceil(level / 3));
        const firstBase = 20 + 10 * (eRank - 1);
        const firstDmg = firstBase + attacker.ad * 0.70;
        if (spears === 1) return firstDmg;
        const addBase = 10 + 6 * (eRank - 1);
        const addRatio = 0.232 + 0.043 * (eRank - 1);
        const addDmg = (addBase + attacker.ad * addRatio) * (spears - 1);
        return firstDmg + addDmg;
      },
    },
  },

  // --- Illaoi: Prophet of an Elder God (P) ---
  // Tentacle slam: 10-180 (by level) + 120% AD physical per hit
  {
    id: 'illaoi-tentacles',
    championId: 'Illaoi',
    nameEn: 'Tentacle Slam Hits',
    nameJa: '旧神の預言者 (P) 触手叩き回数',
    descriptionEn: 'Tentacle slam: 10-180 (by level) + 120% AD physical per hit.',
    descriptionJa: '触手叩き: 10-180 (レベル) + 120%AD 物理DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (hits, attacker, _target, level) => {
        if (hits <= 0) return 0;
        const base = 10 + (170 / 17) * (level - 1);
        return (base + attacker.ad * 1.20) * hits;
      },
    },
  },

  // --- Tryndamere: Battle Fury (P) ---
  // Fury grants crit chance: up to 40% at 100 fury
  {
    id: 'tryndamere-fury',
    championId: 'Tryndamere',
    nameEn: 'Battle Fury (P) Fury',
    nameJa: '戦場の咆哮 (P) 怒り',
    descriptionEn: 'Fury grants crit: 0-40% at 0-100 fury.',
    descriptionJa: '怒り: 0-40% クリ率 (0-100)。',
    inputType: 'stack',
    min: 0,
    max: 100,
    defaultValue: 0,
    statBonus: (fury) => (fury > 0 ? { critChance: (fury / 100) * 0.40 } : {}),
  },

  // --- Viktor: Glorious Evolution (P) ---
  // Hex Core upgrades grant AP. Each upgrade: +25 AP (3 upgrades = 75)
  {
    id: 'viktor-hexcore',
    championId: 'Viktor',
    nameEn: 'Glorious Evolution (P) Upgrades',
    nameJa: 'グロリアス・エヴォリューション (P) アップグレード数',
    descriptionEn: 'Hex Core upgrades: +25 AP each (max 3).',
    descriptionJa: 'ヘクスコアアップグレード: +25AP/個 (最大3)。',
    inputType: 'stack',
    min: 0,
    max: 3,
    defaultValue: 0,
    statBonus: (upgrades) => (upgrades > 0 ? { ap: upgrades * 25 } : {}),
  },

  // --- Jayce: Mercury Hammer (R) ---
  // Hammer form: next AA deals bonus magic damage 25/65/105/145 + 25% bonus AD
  {
    id: 'jayce-hammer-w',
    championId: 'Jayce',
    nameEn: 'Lightning Field (Hammer W) Procs',
    nameJa: 'ライトニング (ハンマーW) 発動数',
    descriptionEn: 'Hammer W on-hit: 35-95 + 25% bAD magic per AA (active).',
    descriptionJa: 'ハンマーW: AA追加 35-95 + 25%増AD 魔法DM/AA。',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, attacker, _target, level) => {
        if (procs <= 0) return 0;
        const wRank = Math.min(5, Math.ceil(level / 3));
        const base = 35 + 15 * (wRank - 1);
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + bonusAd * 0.25) * procs;
      },
    },
  },

  // --- Nidalee: Prowl (P) ---
  // Cougar Q on hunted target: +40% damage bonus
  {
    id: 'nidalee-hunt',
    championId: 'Nidalee',
    nameEn: 'Prowl (P) Hunt Mark',
    nameJa: '品定め (P) 狩猟マーク',
    descriptionEn: 'Toggle: Cougar Q on hunted target deals +40% damage.',
    descriptionJa: 'トグル: マーク対象へクーガーQ +40%DM。',
    inputType: 'toggle',
    defaultValue: 0,
    skillBonus: {
      skillKey: 'Q',
      damageType: 'magic',
      calc: (enabled, attacker, target, level) => {
        if (!enabled) return 0;
        // Cougar Q base: 60/90/120/150 + 75% AP + 0-8% target missing HP
        const qRank = Math.min(4, Math.ceil(level / 5));
        const base = 60 + 30 * (qRank - 1);
        const dmg = base + attacker.ap * 0.75;
        return dmg * 0.40; // 40% bonus
      },
    },
  },

  // --- Garen: Judgment (E) Spins ---
  // E: spins 7-10 times (by level), each 4/8/12/16/20 + 32/34/36/38/40% AD physical
  {
    id: 'garen-e-spins',
    championId: 'Garen',
    nameEn: 'Judgment (E) Spin Hits',
    nameJa: 'ジャッジメント (E) 回転ヒット数',
    descriptionEn: 'E spin: 4-20 + 32-40% AD physical per spin. Set spin count (7-10 by level).',
    descriptionJa: 'Eスピン: 4-20 + 32-40%AD 物理DM/回転。回転数 (7-10)。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'physical',
      perCombo: true,
      calc: (spins, attacker, _target, level) => {
        if (spins <= 0) return 0;
        const eRank = Math.min(5, Math.ceil(level / 3));
        const base = 4 + 4 * (eRank - 1);
        const ratio = 0.32 + 0.02 * (eRank - 1);
        return (base + attacker.ad * ratio) * spins;
      },
    },
  },

  // --- Fiddlesticks: Bountiful Harvest (W) ---
  // W drain: 8/11/14/17/20 + 4.5% AP per tick, last tick 12/16.5/21/25.5/30 + 6.75% AP
  // Total = ticks * normal + last tick
  {
    id: 'fiddlesticks-w-ticks',
    championId: 'Fiddlesticks',
    nameEn: 'Bountiful Harvest (W) Ticks',
    nameJa: '豊かな収穫 (W) ティック数',
    descriptionEn: 'W drain: 8-20 + 4.5% AP per tick (last tick ×1.5). Set tick count.',
    descriptionJa: 'Wドレイン: 8-20 + 4.5%AP/ティック (最終×1.5)。ティック数。',
    inputType: 'stack',
    min: 0,
    max: 6,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (ticks, attacker, _target, level) => {
        if (ticks <= 0) return 0;
        const wRank = Math.min(5, Math.ceil(level / 3));
        const tickDmg = 8 + 3 * (wRank - 1) + attacker.ap * 0.045;
        if (ticks === 1) return tickDmg * 1.5; // last tick
        return tickDmg * (ticks - 1) + tickDmg * 1.5;
      },
    },
  },

  // --- Karthus: Defile (E) ---
  // E aura: 30/50/70/90/110 + 20% AP magic per second
  {
    id: 'karthus-e-ticks',
    championId: 'Karthus',
    nameEn: 'Defile (E) Seconds',
    nameJa: '冒涜 (E) 秒数',
    descriptionEn: 'E aura: 30-110 + 20% AP magic per second.',
    descriptionJa: 'Eオーラ: 30-110 + 20%AP 魔法DM/秒。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    secondsPerUnit: 1,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (seconds, attacker, _target, level) => {
        if (seconds <= 0) return 0;
        const eRank = Math.min(5, Math.ceil(level / 3));
        const perSec = 30 + 20 * (eRank - 1) + attacker.ap * 0.20;
        return perSec * seconds;
      },
    },
  },

  // --- Kayle: Divine Ascent (P) ---
  // Exalted (Lv11+): waves deal 20-40 + 25% AP + 10% bonus AD magic per hit
  {
    id: 'kayle-waves',
    championId: 'Kayle',
    nameEn: 'Divine Ascent (P) Wave Hits',
    nameJa: '聖なる上昇 (P) 波ヒット数',
    descriptionEn: 'Exalted waves (Lv11+): 20-40 + 25% AP + 10% bAD magic per hit.',
    descriptionJa: '聖昇波 (Lv11+): 20-40 + 25%AP + 10%増AD 魔法DM/ヒット。',
    inputType: 'stack',
    min: 0,
    max: 10,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (hits, attacker, _target, level) => {
        if (hits <= 0 || level < 11) return 0;
        const base = level >= 16 ? 40 : 20;
        const bonusAd = attacker.ad - attacker.baseAd;
        return (base + attacker.ap * 0.25 + bonusAd * 0.10) * hits;
      },
    },
  },

  // --- Neeko: Shapesplitter (W) Passive ---
  // Every 3rd AA: 30/65/100/135/170 + 60% AP magic damage
  {
    id: 'neeko-w-passive',
    championId: 'Neeko',
    nameEn: 'Shapesplitter (W) 3rd Hit Procs',
    nameJa: 'シェイプスプリッター (W) 3ヒット発動数',
    descriptionEn: 'Every 3rd AA: 30-170 + 60% AP magic. Set proc count.',
    descriptionJa: '3回毎AA: 30-170 + 60%AP 魔法DM。発動回数。',
    inputType: 'stack',
    min: 0,
    max: 5,
    defaultValue: 0,
    onHit: {
      damageType: 'magic',
      perCombo: true,
      calc: (procs, attacker, _target, level) => {
        if (procs <= 0) return 0;
        const wRank = Math.min(5, Math.ceil(level / 3));
        const base = 30 + 35 * (wRank - 1);
        return (base + attacker.ap * 0.60) * procs;
      },
    },
  },

  // --- Yasuo: Way of the Wanderer (P) Shield ---
  // Shield = 100-475 (by level). Activates when passive is fully charged and hit by champion.
  {
    id: 'yasuo-passive-shield',
    championId: 'Yasuo',
    nameEn: 'Way of the Wanderer (P) Shield',
    nameJa: '打ち込む意志 (P) シールド',
    descriptionEn: 'Toggle: passive shield = 100-475 (by level).',
    descriptionJa: 'トグル: パッシブシールド = 100-475 (レベル依存)。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, _holder, level) => {
      if (!value) return 0;
      return 100 + (475 - 100) / 17 * (level - 1);
    },
  },

  // --- Yone: Spirit Cleave (W) Shield ---
  // Shield = 40-96 (by level) + 65% bonus AD. Increased per champion hit.
  {
    id: 'yone-w-shield',
    championId: 'Yone',
    nameEn: 'Spirit Cleave (W) Shield',
    nameJa: '霊魂斬り (W) シールド',
    descriptionEn: 'Toggle: W shield = 40-96 (by level) + 65% bonus AD.',
    descriptionJa: 'トグル: Wシールド = 40-96 (レベル) + 65%増加AD。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const base = 40 + (96 - 40) / 17 * (level - 1);
      const bonusAd = holder.ad - holder.baseAd;
      return base + 0.65 * bonusAd;
    },
  },

  // --- Sett: Haymaker (W) Shield ---
  // Shield = Grit consumed (max Grit = 50% max HP). Input is Grit % (0-100).
  {
    id: 'sett-w-shield',
    championId: 'Sett',
    nameEn: 'Haymaker (W) Grit %',
    nameJa: 'ヘイメーカー (W) グリット%',
    descriptionEn: 'Shield = Grit consumed (max = 50% max HP). Set Grit %.',
    descriptionJa: 'シールド = 消費グリット (最大 = 最大HPの50%)。グリット%を設定。',
    inputType: 'stack',
    min: 0,
    max: 100,
    defaultValue: 0,
    shieldCalc: (pct, holder) => {
      if (pct <= 0) return 0;
      return holder.maxHp * 0.5 * (pct / 100);
    },
  },

  // --- Camille: Adaptive Defenses (P) Shield ---
  // Shield = 20% max HP. Physical shield vs AD, magic shield vs AP champions.
  // Two separate entries for physical and magic variants
  {
    id: 'camille-passive-shield-physical',
    championId: 'Camille',
    nameEn: 'Adaptive Defenses (P) Physical Shield',
    nameJa: '戦況適応 (P) 物理シールド',
    descriptionEn: 'Toggle: physical shield = 20% max HP (vs AD champs).',
    descriptionJa: 'トグル: 物理シールド = 最大HPの20% (AD相手時)。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldType: 'physical',
    shieldCalc: (value, holder) => {
      if (!value) return 0;
      return holder.maxHp * 0.20;
    },
  },
  {
    id: 'camille-passive-shield-magic',
    championId: 'Camille',
    nameEn: 'Adaptive Defenses (P) Magic Shield',
    nameJa: '戦況適応 (P) 魔法シールド',
    descriptionEn: 'Toggle: magic shield = 20% max HP (vs AP champs).',
    descriptionJa: 'トグル: 魔法シールド = 最大HPの20% (AP相手時)。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldType: 'magic',
    shieldCalc: (value, holder) => {
      if (!value) return 0;
      return holder.maxHp * 0.20;
    },
  },

  // --- Malphite: Granite Shield (P) ---
  // Shield = 10% max HP.
  {
    id: 'malphite-passive-shield',
    championId: 'Malphite',
    nameEn: 'Granite Shield (P)',
    nameJa: 'グラナイトシールド (P)',
    descriptionEn: 'Toggle: shield = 10% max HP.',
    descriptionJa: 'トグル: シールド = 最大HPの10%。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder) => {
      if (!value) return 0;
      return holder.maxHp * 0.10;
    },
  },

  // --- Kassadin: Null Sphere (Q) Shield ---
  // Shield = 40-160 (by Q rank) + 30% AP. Magic damage shield.
  {
    id: 'kassadin-q-shield',
    championId: 'Kassadin',
    nameEn: 'Null Sphere (Q) Magic Shield',
    nameJa: 'ヌルスフィア (Q) 魔法シールド',
    descriptionEn: 'Toggle: magic shield = 80-200 (by Q rank) + 30% AP.',
    descriptionJa: 'トグル: 魔法シールド = 80-200 (Qランク) + 30%AP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldType: 'magic',
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const qRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const base = [80, 110, 140, 170, 200][qRank - 1];
      return base + 0.30 * holder.ap;
    },
  },

  // --- Udyr: Iron Mantle (W) Shield ---
  // Shield = 45-145 (by W rank) + 40% AP + 2-3.5% max HP.
  {
    id: 'udyr-w-shield',
    championId: 'Udyr',
    nameEn: 'Iron Mantle (W) Shield',
    nameJa: 'アイアンマントル (W) シールド',
    descriptionEn: 'Toggle: shield = 45-120 (by W rank) + 40% AP + 2-5% max HP.',
    descriptionJa: 'トグル: シールド = 45-120 (Wランク) + 40%AP + 2-5%最大HP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      // Udyr has 6 ability ranks (maxed via R levels)
      const wRank = Math.min(6, Math.max(1, Math.ceil(level / 3)));
      const base = [45, 60, 75, 90, 105, 120][wRank - 1];
      const hpPct = [0.02, 0.026, 0.032, 0.038, 0.044, 0.05][wRank - 1];
      return base + 0.40 * holder.ap + hpPct * holder.maxHp;
    },
  },

  // --- Sion: Soul Furnace (W) Shield ---
  // Shield = 60-180 (by W rank) + 8-12% max HP.
  {
    id: 'sion-w-shield',
    championId: 'Sion',
    nameEn: 'Soul Furnace (W) Shield',
    nameJa: 'ソウルファーネス (W) シールド',
    descriptionEn: 'Toggle: shield = 60-180 (by W rank) + 8-12% max HP.',
    descriptionJa: 'トグル: シールド = 60-180 (Wランク) + 8-12%最大HP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const base = [60, 90, 120, 150, 180][wRank - 1];
      const hpPct = [0.08, 0.09, 0.10, 0.11, 0.12][wRank - 1];
      return base + hpPct * holder.maxHp;
    },
  },

  // --- Volibear: Stormbringer (E) Shield ---
  // If Volibear is in the E zone, gains shield = 15% max HP + 80% AP.
  {
    id: 'volibear-e-shield',
    championId: 'Volibear',
    nameEn: 'Stormbringer (E) Shield',
    nameJa: 'ストームブリンガー (E) シールド',
    descriptionEn: 'Toggle: shield = 15% max HP + 80% AP (if in E zone).',
    descriptionJa: 'トグル: シールド = 最大HPの15% + 80%AP (E圏内時)。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder) => {
      if (!value) return 0;
      return holder.maxHp * 0.15 + 0.80 * holder.ap;
    },
  },

  // --- Blitzcrank: Mana Barrier (P) Shield ---
  // Shield = 30% current mana. Since we don't track current mana, use max mana.
  {
    id: 'blitzcrank-passive-shield',
    championId: 'Blitzcrank',
    nameEn: 'Mana Barrier (P) Shield',
    nameJa: 'マナバリア (P) シールド',
    descriptionEn: 'Toggle: shield = 35% max mana.',
    descriptionJa: 'トグル: シールド = 最大マナの35%。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder) => {
      if (!value) return 0;
      return holder.maxMp * 0.35;
    },
  },

  // --- Nunu & Willump: Absolute Zero (R) Shield ---
  // Shield per second = 65-85 (by R rank) + 30-50% bonus HP. Refreshes each second for ~3s.
  // Total shield remaining at end of channel ≈ per-second value (only last tick active).
  {
    id: 'nunu-r-shield',
    championId: 'Nunu',
    nameEn: 'Absolute Zero (R) Shield',
    nameJa: 'アブソリュートゼロ (R) シールド',
    descriptionEn: 'Toggle: R shield/s = 65-85 + 30-50% bonus HP (refreshes each second).',
    descriptionJa: 'トグル: Rシールド/秒 = 65-85 + 30-50%増加HP (毎秒更新)。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const rRank = level >= 16 ? 3 : level >= 11 ? 2 : level >= 6 ? 1 : 0;
      if (rRank <= 0) return 0;
      const base = [65, 75, 85][rRank - 1];
      const ratio = [0.30, 0.40, 0.50][rRank - 1];
      const bonusHp = holder.maxHp - holder.baseHp;
      return base + ratio * bonusHp;
    },
  },

  // --- Galio: Shield of Durand (W) Damage Reduction ---
  // W provides % damage reduction (not a shield). Model as effective shield.
  // Magic DR: 25-45%, Physical DR: 12.5-22.5%. Average effective shield vs burst.
  {
    id: 'galio-w-shield',
    championId: 'Galio',
    nameEn: 'Shield of Durand (W) DR',
    nameJa: 'デュランドの守り (W) 軽減',
    descriptionEn: 'Toggle: W magic DR 25-45%, physical DR 12.5-22.5%.',
    descriptionJa: 'トグル: W 魔法軽減25-45%, 物理軽減12.5-22.5%。',
    inputType: 'toggle',
    defaultValue: 0,
    // Model as shield equivalent: average DR (18.75-33.75%) × maxHP × 0.3 (burst fraction)
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const wRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const magicDr = [0.25, 0.30, 0.35, 0.40, 0.45][wRank - 1];
      const physDr = magicDr * 0.5;
      const avgDr = (magicDr + physDr) / 2;
      return holder.maxHp * avgDr * 0.3;
    },
  },

  // --- Morgana: Black Shield (E) ---
  // Shield = 80-240 (by E rank) + 70% AP. Blocks magic damage + CC.
  {
    id: 'morgana-e-shield',
    championId: 'Morgana',
    nameEn: 'Black Shield (E) Magic Shield',
    nameJa: 'ブラックシールド (E) 魔法シールド',
    descriptionEn: 'Toggle: magic shield = 100-500 (by E rank) + 100% AP.',
    descriptionJa: 'トグル: 魔法シールド = 100-500 (Eランク) + 100%AP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldType: 'magic',
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const base = [100, 200, 300, 400, 500][eRank - 1];
      return base + 1.00 * holder.ap;
    },
  },

  // --- Janna: Eye of the Storm (E) ---
  // Shield = 65-165 (by E rank) + 55% AP.
  {
    id: 'janna-e-shield',
    championId: 'Janna',
    nameEn: 'Eye of the Storm (E) Shield',
    nameJa: '恵みの風 (E) シールド',
    descriptionEn: 'Toggle: shield = 65-165 (by E rank) + 55% AP.',
    descriptionJa: 'トグル: シールド = 65-165 (Eランク) + 55%AP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const base = [65, 90, 115, 140, 165][eRank - 1];
      return base + 0.55 * holder.ap;
    },
  },

  // --- Karma: Inspire (E) ---
  // Shield = 80-200 (by E rank) + 50% AP.
  {
    id: 'karma-e-shield',
    championId: 'Karma',
    nameEn: 'Inspire (E) Shield',
    nameJa: 'インスパイア (E) シールド',
    descriptionEn: 'Toggle: shield = 80-280 (by E rank) + 60% AP.',
    descriptionJa: 'トグル: シールド = 80-280 (Eランク) + 60%AP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const base = [80, 130, 180, 230, 280][eRank - 1];
      return base + 0.60 * holder.ap;
    },
  },

  // --- Lulu: Help, Pix! (E) ---
  // Shield = 75-175 (by E rank) + 55% AP.
  {
    id: 'lulu-e-shield',
    championId: 'Lulu',
    nameEn: 'Help, Pix! (E) Shield',
    nameJa: 'おともだち! (E) シールド',
    descriptionEn: 'Toggle: shield = 70-230 (by E rank) + 50% AP.',
    descriptionJa: 'トグル: シールド = 70-230 (Eランク) + 50%AP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const base = [70, 110, 150, 190, 230][eRank - 1];
      return base + 0.50 * holder.ap;
    },
  },

  // --- Ivern: Triggerseed (E) ---
  // Shield = 80-200 (by E rank) + 75% AP.
  {
    id: 'ivern-e-shield',
    championId: 'Ivern',
    nameEn: 'Triggerseed (E) Shield',
    nameJa: 'しぜんのいかり (E) シールド',
    descriptionEn: 'Toggle: shield = 80-240 (by E rank) + 80% AP.',
    descriptionJa: 'トグル: シールド = 80-240 (Eランク) + 80%AP。',
    inputType: 'toggle',
    defaultValue: 0,
    shieldCalc: (value, holder, level) => {
      if (!value) return 0;
      const eRank = Math.min(5, Math.max(1, Math.ceil(level / 3.6)));
      const base = [80, 120, 160, 200, 240][eRank - 1];
      return base + 0.80 * holder.ap;
    },
  },
];

/** Get combo passives applicable to a specific champion */
export function getChampionComboPassives(championId: string): ChampionComboPassive[] {
  return COMBO_PASSIVES.filter((p) => p.championId === championId);
}

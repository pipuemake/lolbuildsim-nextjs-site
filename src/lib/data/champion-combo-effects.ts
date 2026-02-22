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
];

/** Get combo passives applicable to a specific champion */
export function getChampionComboPassives(championId: string): ChampionComboPassive[] {
  return COMBO_PASSIVES.filter((p) => p.championId === championId);
}

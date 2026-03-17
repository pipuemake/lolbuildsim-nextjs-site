import type { SkillSubCast } from '@/types';

// ===== Champion Skill Override Registry =====
// Defines multi-hit skills (sub-casts) for champions where the default
// Meraki single-damage model is insufficient.

export interface ChampionSkillOverride {
  skillKey: 'Q' | 'W' | 'E' | 'R' | 'P';
  subCasts?: SkillSubCast[];
  /** If true, show an evolution toggle for this skill (even without damage-affecting subCasts) */
  evolution?: boolean;
}

const OVERRIDES: Record<string, ChampionSkillOverride[]> = {
  // ── Aatrox ──
  // Q: 3 casts with different base damage and AD scaling
  Aatrox: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'The Darkin Blade (1st)',
          nameJa: 'ダーキンブレード (1段目)',
          baseDamage: [10, 30, 50, 70, 90],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.6 }],
        },
        {
          id: 'Q2',
          nameEn: 'The Darkin Blade (2nd)',
          nameJa: 'ダーキンブレード (2段目)',
          baseDamage: [25, 45, 65, 85, 105],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.625 }],
        },
        {
          id: 'Q3',
          nameEn: 'The Darkin Blade (3rd)',
          nameJa: 'ダーキンブレード (3段目)',
          baseDamage: [30, 70, 110, 150, 190],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.8 }],
        },
      ],
    },
  ],

  // ── Ahri ──
  // Q: outgoing = magic, returning = true damage
  Ahri: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Orb of Deception (out)',
          nameJa: '幻惑のオーブ (往路)',
          baseDamage: [40, 65, 90, 115, 140],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.45 }],
          comboLabel: '往',
        },
        {
          id: 'Q2',
          nameEn: 'Orb of Deception (return)',
          nameJa: '幻惑のオーブ (復路)',
          baseDamage: [40, 65, 90, 115, 140],
          damageType: 'true',
          scalings: [{ stat: 'ap', ratio: 0.45 }],
          comboLabel: '復',
        },
      ],
    },
  ],

  // ── Lillia ──
  // Q: Blooming Blows — center (magic) + outer edge (bonus true damage)
  Lillia: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Blooming Blows (center)',
          nameJa: 'ぱっちん! (中心)',
          baseDamage: [35, 45, 55, 65, 75],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.35 }],
          comboLabel: '中',
        },
        {
          id: 'Q2',
          nameEn: 'Blooming Blows (outer edge)',
          nameJa: 'ぱっちん! (外縁)',
          baseDamage: [35, 45, 55, 65, 75],
          damageType: 'true',
          scalings: [{ stat: 'ap', ratio: 0.35 }],
          comboLabel: '外',
        },
      ],
    },
  ],

  // ── Lux ──
  // P: Illumination — detonating passive mark on AA after spell
  // We handle this as a combo passive, not a skill override

  // ── MasterYi ──
  // Q: Alpha Strike — 4 bounces, single target max damage
  MasterYi: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Alpha Strike (1st hit)',
          nameJa: 'アルファストライク (初撃)',
          baseDamage: [20, 40, 60, 80, 100],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.70 }],
          comboLabel: '1',
        },
        {
          id: 'Q2',
          nameEn: 'Alpha Strike (extra hits ×3)',
          nameJa: 'アルファストライク (追加×3)',
          baseDamage: [15, 30, 45, 60, 75],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.525 }],
          comboLabel: '追',
        },
      ],
    },
  ],

  // ── MissFortune ──
  // Q: Double Up — first hit + bounce (bounce can crit if first target dies)
  MissFortune: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Double Up (1st hit)',
          nameJa: 'ダブルアップ (1段目)',
          baseDamage: [20, 45, 70, 95, 120],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 1.0 }, { stat: 'ap', ratio: 0.35 }],
          comboLabel: '1',
        },
        {
          id: 'Q2',
          nameEn: 'Double Up (bounce)',
          nameJa: 'ダブルアップ (バウンス)',
          baseDamage: [20, 45, 70, 95, 120],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 1.0 }, { stat: 'ap', ratio: 0.35 }],
          comboLabel: '2',
        },
      ],
    },
  ],

  // ── Neeko ──
  // Q: Blooming Burst — initial hit + up to 2 secondary blooms
  Neeko: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Blooming Burst (initial)',
          nameJa: 'はなさかニーコ (初撃)',
          baseDamage: [60, 110, 160, 210, 260],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.60 }],
          comboLabel: '初',
        },
        {
          id: 'Q2',
          nameEn: 'Blooming Burst (bloom ×1-2)',
          nameJa: 'はなさかニーコ (開花)',
          baseDamage: [35, 60, 85, 110, 135],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.25 }],
          distanceMultiplier: { min: 1, max: 2, defaultPct: 100, labelEn: 'Blooms', labelJa: '開花数' },
          comboLabel: '花',
        },
      ],
    },
  ],

  // ── LeBlanc ──
  // Q: Sigil of Malice — initial + mark detonation
  Leblanc: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Sigil of Malice (initial)',
          nameJa: '幻惑の印 (初撃)',
          baseDamage: [65, 90, 115, 140, 165],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.40 }],
          comboLabel: '印',
        },
        {
          id: 'Q2',
          nameEn: 'Sigil of Malice (detonate)',
          nameJa: '幻惑の印 (爆発)',
          baseDamage: [65, 90, 115, 140, 165],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.40 }],
          comboLabel: '爆',
        },
      ],
    },
  ],

  // ── Lee Sin ──
  // Q: Sonic Wave (Q1) + Resonating Strike (Q2, +8% missing HP)
  LeeSin: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Sonic Wave',
          nameJa: '音波',
          baseDamage: [55, 80, 105, 130, 155],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.1 }],
        },
        {
          id: 'Q2',
          nameEn: 'Resonating Strike',
          nameJa: '共鳴撃',
          baseDamage: [55, 80, 105, 130, 155],
          damageType: 'physical',
          scalings: [
            { stat: 'bonusAd', ratio: 1.1 },
            { stat: 'targetMissingHp', ratio: 0.08 },
          ],
        },
      ],
    },
  ],

  // ── Ekko ──
  // Q: outgoing has lower AP ratio, returning has higher
  Ekko: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Timewinder (out)',
          nameJa: 'タイムワインダー (往路)',
          baseDamage: [60, 75, 90, 105, 120],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.3 }],
        },
        {
          id: 'Q2',
          nameEn: 'Timewinder (return)',
          nameJa: 'タイムワインダー (復路)',
          baseDamage: [40, 65, 90, 115, 140],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.6 }],
        },
      ],
    },
  ],

  // ── Karma ──
  // Q normal + R+Q empowered (Soulflare: initial + detonation)
  Karma: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Inner Flame',
          nameJa: '心火 (通常)',
          baseDamage: [70, 120, 170, 220, 270],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.4 }],
        },
        {
          id: 'Q2',
          nameEn: 'Soulflare (R+Q)',
          nameJa: '魂炎 (R+Q)',
          // Empowered: initial + detonation combined
          // Initial: 70/120/170/220/270 + 60% AP
          // Detonation: 50/150/250/350 + 60% AP (scales with R rank, simplified to Q rank)
          baseDamage: [120, 270, 420, 570, 620],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 1.2 }],
        },
      ],
    },
  ],

  // ── Riven ──
  // Q: 3 casts (same damage each) — still useful for individual combo counting
  Riven: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Broken Wings (1st)',
          nameJa: 'ブロークンウィング (1段目)',
          baseDamage: [15, 35, 55, 75, 95],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.45 }],
        },
        {
          id: 'Q2',
          nameEn: 'Broken Wings (2nd)',
          nameJa: 'ブロークンウィング (2段目)',
          baseDamage: [15, 35, 55, 75, 95],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.45 }],
        },
        {
          id: 'Q3',
          nameEn: 'Broken Wings (3rd)',
          nameJa: 'ブロークンウィング (3段目)',
          baseDamage: [15, 35, 55, 75, 95],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.45 }],
        },
      ],
    },
    {
      skillKey: 'R',
      subCasts: [
        {
          id: 'R1',
          nameEn: 'Wind Slash',
          nameJa: 'ウィンドスラッシュ',
          baseDamage: [100, 150, 200],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.6 }],
          distanceMultiplier: { min: 1.0, max: 3.0, defaultPct: 0, labelEn: 'Target Missing HP%', labelJa: '対象減少HP%' },
        },
      ],
    },
  ],

  // ── Nidalee ──
  // R switches between Human and Cougar forms for Q/W/E
  // Q: Human (Javelin Toss, magic) vs Cougar (Takedown, magic + missing HP%)
  // W: Human (Bushwhack, trap magic) vs Cougar (Pounce, magic)
  // E: Human (Primal Surge, heal — no damage) vs Cougar (Swipe, magic)
  Nidalee: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Javelin Toss (Human)',
          nameJa: 'ジャベリントス (人間)',
          baseDamage: [70, 90, 110, 130, 150],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.5 }],
          // Damage scales 1x-3x based on distance traveled (up to 1300 units)
          distanceMultiplier: { min: 1.0, max: 3.0, defaultPct: 100, labelEn: 'Distance', labelJa: '飛距離' },
        },
        {
          id: 'Q2',
          nameEn: 'Takedown (Cougar)',
          nameJa: 'テイクダウン (クーガー)',
          // Base scales with R rank (3 ranks), simplified to Q rank slots
          baseDamage: [5, 30, 55, 80, 80],
          damageType: 'magic',
          scalings: [
            { stat: 'ap', ratio: 0.4 },
            { stat: 'targetMissingHp', ratio: 0.01 },
          ],
          image: 'https://raw.communitydragon.org/latest/game/assets/characters/nidalee/hud/icons2d/nidalee_q2.png',
        },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Bushwhack (Human)',
          nameJa: 'ブッシュワック (人間)',
          baseDamage: [40, 80, 120, 160, 200],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.2 }],
        },
        {
          id: 'W2',
          nameEn: 'Pounce (Cougar)',
          nameJa: 'ポウンス (クーガー)',
          // Base scales with R rank, simplified
          baseDamage: [60, 110, 160, 210, 210],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.3 }],
          image: 'https://raw.communitydragon.org/latest/game/assets/characters/nidalee/hud/icons2d/nidalee_w2.png',
        },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Primal Surge (Human)',
          nameJa: 'プライマルサージ (人間)',
          // Heal, no damage — base 0
          baseDamage: [0, 0, 0, 0, 0],
          damageType: 'magic',
          scalings: [],
        },
        {
          id: 'E2',
          nameEn: 'Swipe (Cougar)',
          nameJa: 'スワイプ (クーガー)',
          // Base scales with R rank, simplified
          baseDamage: [70, 130, 190, 250, 250],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.45 }],
          image: 'https://raw.communitydragon.org/latest/game/assets/characters/nidalee/hud/icons2d/nidalee_e2.png',
        },
      ],
    },
  ],

  // ── Jayce ──
  // Cannon vs Hammer forms for Q/W/E
  Jayce: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Shock Blast (Cannon)', nameJa: 'ショックブラスト (キャノン)', baseDamage: [55, 110, 165, 220, 275], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.2 }], formGroup: 'cannon' },
        { id: 'Q2', nameEn: 'To The Skies! (Hammer)', nameJa: 'トゥザスカイ (ハンマー)', baseDamage: [55, 95, 135, 175, 215], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.0 }], formGroup: 'hammer' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Hyper Charge (Cannon)', nameJa: 'ハイパーチャージ (キャノン)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.7 }], formGroup: 'cannon' },
        { id: 'W2', nameEn: 'Lightning Field (Hammer)', nameJa: 'ライトニングフィールド (ハンマー)', baseDamage: [60, 110, 160, 210, 260], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.0 }], formGroup: 'hammer' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Acceleration Gate (Cannon)', nameJa: 'アクセラレーションゲート (キャノン)', baseDamage: [0, 0, 0, 0, 0], damageType: 'magic', scalings: [], formGroup: 'cannon' },
        { id: 'E2', nameEn: 'Thundering Blow (Hammer)', nameJa: 'サンダーブロー (ハンマー)', baseDamage: [55, 95, 135, 175, 215], damageType: 'magic', scalings: [{ stat: 'bonusAd', ratio: 1.0 }, { stat: 'targetMaxHp', ratio: 0.06 }], formGroup: 'hammer' },
      ],
    },
  ],

  // ── Elise ──
  // Q: Human (Neurotoxin, %current HP magic) vs Spider (Venomous Bite, %missing HP magic)
  Elise: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Neurotoxin (Human)',
          nameJa: 'ニューロトキシン (人間)',
          baseDamage: [40, 75, 110, 145, 180],
          damageType: 'magic',
          scalings: [
            { stat: 'ap', ratio: 0.4 },
            { stat: 'targetCurrentHp', ratio: 0.04 },
          ],
        },
        {
          id: 'Q2',
          nameEn: 'Venomous Bite (Spider)',
          nameJa: 'ヴェノマスバイト (クモ)',
          baseDamage: [70, 105, 140, 175, 210],
          damageType: 'magic',
          scalings: [
            { stat: 'ap', ratio: 0.4 },
            { stat: 'targetMissingHp', ratio: 0.04 },
          ],
        },
      ],
    },
  ],

  // ── Gnar ──
  // Mini vs Mega forms for Q/W/E/R
  Gnar: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Boomerang Throw (Mini)', nameJa: 'ブーメランスロー (ミニ)', baseDamage: [5, 45, 85, 125, 165], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.15 }], formGroup: 'mini' },
        { id: 'Q2', nameEn: 'Boulder Toss (Mega)', nameJa: 'ボルダートス (メガ)', baseDamage: [25, 70, 115, 160, 205], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.2 }], formGroup: 'mega' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Hyper (Mini, 3rd hit)', nameJa: 'ハイパー (ミニ, 3撃目)', baseDamage: [10, 20, 30, 40, 50], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.0 }, { stat: 'targetMaxHp', ratio: 0.06 }], formGroup: 'mini' },
        { id: 'W2', nameEn: 'Wallop (Mega)', nameJa: 'ワロップ (メガ)', baseDamage: [25, 45, 65, 85, 105], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.0 }], formGroup: 'mega' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Hop (Mini)', nameJa: 'ホップ (ミニ)', baseDamage: [50, 85, 120, 155, 190], damageType: 'physical', scalings: [{ stat: 'maxHp', ratio: 0.06 }], formGroup: 'mini' },
        { id: 'E2', nameEn: 'Crunch (Mega)', nameJa: 'クランチ (メガ)', baseDamage: [50, 85, 120, 155, 190], damageType: 'physical', scalings: [{ stat: 'maxHp', ratio: 0.06 }], formGroup: 'mega' },
      ],
    },
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'GNAR! (Mega)', nameJa: 'グナー! (メガ)', baseDamage: [200, 300, 400], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.5 }, { stat: 'ap', ratio: 0.5 }], formGroup: 'mega' },
      ],
    },
  ],

  // ── Viktor ──
  // Q: initial hit (magic) + empowered auto (magic). Evolution: +shield, +MS (no dmg change)
  // W: Gravity Field (no damage). Evolution: drags enemies to center (no dmg change)
  // E: Death Ray + Aftershock (evolved only)
  // R: Chaos Storm initial + tick. Evolution: faster movement (no dmg change)
  Viktor: [
    {
      skillKey: 'Q',
      evolution: true,
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Siphon Power (cast)',
          nameJa: 'サイフォンパワー (発動)',
          baseDamage: [60, 75, 90, 105, 120],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.4 }],
        },
        {
          id: 'Q2',
          nameEn: 'Discharge (empowered AA)',
          nameJa: 'ディスチャージ (強化AA)',
          baseDamage: [20, 45, 70, 95, 120],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 1.0 }, { stat: 'ap', ratio: 0.5 }],
        },
      ],
    },
    {
      skillKey: 'W',
      evolution: true,
    },
    {
      skillKey: 'E',
      evolution: true,
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Death Ray (initial)',
          nameJa: 'デスレイ (通常)',
          baseDamage: [70, 110, 150, 190, 230],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.5 }],
        },
        {
          id: 'E2',
          nameEn: 'Death Ray Aftershock (Evolved)',
          nameJa: 'デスレイ 余震 (進化)',
          baseDamage: [20, 50, 80, 110, 140],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.8 }],
          evolutionGroup: 'evolved',
        },
      ],
    },
    {
      skillKey: 'R',
      evolution: true,
      subCasts: [
        {
          id: 'R1',
          nameEn: 'Chaos Storm (initial)',
          nameJa: 'カオスストーム (初撃)',
          baseDamage: [100, 175, 250],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.5 }],
        },
        {
          id: 'R2',
          nameEn: 'Chaos Storm (per tick)',
          nameJa: 'カオスストーム (1ティック)',
          baseDamage: [65, 105, 145],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.45 }],
        },
      ],
    },
  ],

  // ── Syndra ──
  // R: Unleashed Power — per-sphere damage, 3-7 spheres
  Syndra: [
    {
      skillKey: 'R',
      subCasts: [
        {
          id: 'R1',
          nameEn: 'Unleashed Power (per sphere)',
          nameJa: 'アンリーシュドパワー (1球)',
          baseDamage: [80, 120, 160],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.20 }],
          distanceMultiplier: { min: 3, max: 7, defaultPct: 43, labelEn: 'Spheres (3-7)', labelJa: '球数 (3-7)' },
        },
      ],
    },
  ],

  // ── Sett ──
  // W: Haymaker — center (true damage) vs sides (physical)
  Sett: [
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Haymaker (center, true)',
          nameJa: 'ヘイメーカー (中央, 確定)',
          baseDamage: [80, 100, 120, 140, 160],
          damageType: 'true',
          scalings: [{ stat: 'bonusAd', ratio: 0.25 }],
          comboLabel: '中',
        },
        {
          id: 'W2',
          nameEn: 'Haymaker (sides, physical)',
          nameJa: 'ヘイメーカー (側面, 物理)',
          baseDamage: [80, 100, 120, 140, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.25 }],
          comboLabel: '側',
        },
      ],
    },
  ],

  // ── Shyvana ──
  // Human vs Dragon form for Q/W/E
  Shyvana: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Twin Bite (Human)', nameJa: 'ツインバイト (人間)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.20 }], formGroup: 'human' },
        { id: 'Q2', nameEn: 'Twin Bite (Dragon)', nameJa: 'ツインバイト (ドラゴン)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.35 }], formGroup: 'dragon' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Flame Breath (Human)', nameJa: 'フレイムブレス (人間)', baseDamage: [60, 100, 140, 180, 220], damageType: 'magic', scalings: [{ stat: 'ad', ratio: 0.30 }, { stat: 'ap', ratio: 0.70 }], formGroup: 'human' },
        { id: 'E2', nameEn: 'Flame Breath (Dragon)', nameJa: 'フレイムブレス (ドラゴン)', baseDamage: [60, 100, 140, 180, 220], damageType: 'magic', scalings: [{ stat: 'ad', ratio: 0.30 }, { stat: 'ap', ratio: 0.70 }], formGroup: 'dragon' },
      ],
    },
  ],

  // ── Sivir ──
  // Q: Boomerang Blade — hits on the way out and on return
  Sivir: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Boomerang Blade (out)',
          nameJa: 'ブーメランブレード (往路)',
          baseDamage: [60, 85, 110, 135, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.7 }, { stat: 'ap', ratio: 0.6 }],
          comboLabel: '往',
        },
        {
          id: 'Q2',
          nameEn: 'Boomerang Blade (return)',
          nameJa: 'ブーメランブレード (復路)',
          baseDamage: [60, 85, 110, 135, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.7 }, { stat: 'ap', ratio: 0.6 }],
          comboLabel: '復',
        },
      ],
    },
  ],

  // ── Jax ──
  // E: Counter Strike — damage increases by 20% per AA dodged (up to 100% bonus)
  Jax: [
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Counter Strike',
          nameJa: 'カウンターストライク',
          baseDamage: [40, 70, 100, 130, 160],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.7 }],
          distanceMultiplier: { min: 1.0, max: 2.0, defaultPct: 0, labelEn: 'AAs Dodged', labelJa: 'AA無効化' },
        },
      ],
    },
  ],

  // ── Zaahen ──
  // Q: 2-hit AA + Recast knockup
  // E: normal hit vs outer edge (150% physical + %maxHP magic)
  Zaahen: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'The Darkin Glaive (2-hit)',
          nameJa: 'ダーキングレイヴ (2回攻撃)',
          baseDamage: [15, 30, 45, 60, 75],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.2 }],
        },
        {
          id: 'Q2',
          nameEn: 'The Darkin Glaive (Recast)',
          nameJa: 'ダーキングレイヴ (再発動)',
          baseDamage: [25, 50, 75, 100, 125],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.4 }],
        },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Aureate Rush (center)',
          nameJa: '絢爛たる進撃 (中心)',
          baseDamage: [40, 60, 80, 100, 120],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.5 }],
        },
        {
          id: 'E2',
          nameEn: 'Aureate Rush (outer edge)',
          nameJa: '絢爛たる進撃 (外縁部)',
          baseDamage: [60, 90, 120, 150, 180],
          damageType: 'physical',
          scalings: [
            { stat: 'bonusAd', ratio: 0.75 },
            { stat: 'targetMaxHp', ratio: 0.04 },
          ],
        },
      ],
    },
  ],

  // ── Kha'Zix ──
  // Q: normal vs isolated target (bonus damage)
  Khazix: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Taste Their Fear',
          nameJa: 'テイスト・ゼア・フィア (通常)',
          baseDamage: [60, 85, 110, 135, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.15 }],
        },
        {
          id: 'Q2',
          nameEn: 'Taste Their Fear (Isolated)',
          nameJa: 'テイスト・ゼア・フィア (孤立)',
          // Isolated bonus: +100% bonus damage
          baseDamage: [120, 170, 220, 270, 320],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 2.3 }],
        },
      ],
    },
  ],

  // ── Akshan ──
  // Q: boomerang out + return, E: per-shot swing
  Akshan: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Avengerang (out)',
          nameJa: 'アヴェンジェラン (往路)',
          baseDamage: [5, 25, 45, 65, 85],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 0.9 }],
          comboLabel: '往',
        },
        {
          id: 'Q2',
          nameEn: 'Avengerang (return)',
          nameJa: 'アヴェンジェラン (復路)',
          baseDamage: [5, 25, 45, 65, 85],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 0.9 }],
          comboLabel: '復',
        },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Heroic Swing (per shot)',
          nameJa: 'ヒロイックスウィング (1発)',
          baseDamage: [30, 45, 60, 75, 90],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.175 }],
          distanceMultiplier: { min: 1, max: 12, defaultPct: 25, labelEn: 'Shots', labelJa: '発射数' },
        },
      ],
    },
  ],

  // ── Anivia ──
  // Q: pass-through + explosion, E: normal vs chilled (×2)
  Anivia: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Flash Frost (pass)',
          nameJa: 'フラッシュフロスト (通過)',
          baseDamage: [50, 70, 90, 110, 130],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.25 }],
          comboLabel: '通',
        },
        {
          id: 'Q2',
          nameEn: 'Flash Frost (explode)',
          nameJa: 'フラッシュフロスト (爆発)',
          baseDamage: [60, 95, 130, 165, 200],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.45 }],
          comboLabel: '爆',
        },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Frostbite (normal)',
          nameJa: 'フロストバイト (通常)',
          baseDamage: [50, 80, 110, 140, 170],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.6 }],
        },
        {
          id: 'E2',
          nameEn: 'Frostbite (chilled ×2)',
          nameJa: 'フロストバイト (冷気×2)',
          baseDamage: [100, 160, 220, 280, 340],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 1.2 }],
        },
      ],
    },
  ],

  // ── Evelynn ──
  // Q: initial spike + recast spikes
  Evelynn: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Hate Spike (initial)',
          nameJa: 'ヘイトスパイク (初撃)',
          baseDamage: [40, 55, 70, 85, 100],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.45 }],
          comboLabel: '初',
        },
        {
          id: 'Q2',
          nameEn: 'Hate Spike (recast)',
          nameJa: 'ヘイトスパイク (再発動)',
          baseDamage: [30, 40, 50, 60, 70],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.25 }],
          comboLabel: '再',
        },
      ],
    },
  ],

  // ── Ambessa ──
  // Q: Q1 sweep + Q2 repudiation
  Ambessa: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Cunning Sweep (Q1)',
          nameJa: 'カニングスウィープ (Q1)',
          baseDamage: [60, 85, 110, 135, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.8 }],
        },
        {
          id: 'Q2',
          nameEn: 'Repudiation (Q2)',
          nameJa: 'レピュディエーション (Q2)',
          baseDamage: [60, 85, 110, 135, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.8 }],
        },
      ],
    },
  ],

  // ── Xin Zhao ──
  // W: slash + thrust (different scalings)
  XinZhao: [
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Wind Becomes Lightning (slash)',
          nameJa: '風斬り (斬撃)',
          baseDamage: [30, 40, 50, 60, 70],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.3 }],
        },
        {
          id: 'W2',
          nameEn: 'Wind Becomes Lightning (thrust)',
          nameJa: '風斬り (突き)',
          baseDamage: [50, 85, 120, 155, 190],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.9 }, { stat: 'ap', ratio: 0.65 }],
        },
      ],
    },
  ],

  // ── Pantheon ──
  // Q: tap (short press) vs charge (hold)
  Pantheon: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Comet Spear (tap)', nameJa: 'コメットスピア (短押し)', baseDamage: [70, 100, 130, 160, 190], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.15 }], comboLabel: '短' },
        { id: 'Q2', nameEn: 'Comet Spear (charge)', nameJa: 'コメットスピア (溜め)', baseDamage: [70, 115, 160, 205, 250], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.15 }], comboLabel: '溜' },
        { id: 'Q3', nameEn: 'Empowered Comet Spear (charge)', nameJa: '強化コメットスピア (溜め)', baseDamage: [70, 115, 160, 205, 250], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 2.3 }], comboLabel: 'P', image: 'https://raw.communitydragon.org/latest/game/assets/characters/pantheon/hud/icons2d/pantheon_q2.png' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Shield Vault', nameJa: 'シールドヴォルト', baseDamage: [60, 80, 100, 120, 140], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.0 }] },
        { id: 'W2', nameEn: 'Empowered Shield Vault (3 hits)', nameJa: '強化シールドヴォルト (3回)', baseDamage: [180, 240, 300, 360, 420], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 3.0 }], comboLabel: 'P', image: 'https://raw.communitydragon.org/latest/game/assets/characters/pantheon/hud/icons2d/pantheon_w2.png' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Aegis Assault (slam)', nameJa: 'イージスアサルト (叩きつけ)', baseDamage: [55, 105, 155, 205, 255], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.5 }] },
        { id: 'E2', nameEn: 'Empowered Aegis Assault', nameJa: '強化イージスアサルト', baseDamage: [55, 105, 155, 205, 255], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.5 }], comboLabel: 'P', image: 'https://raw.communitydragon.org/latest/game/assets/characters/pantheon/hud/icons2d/pantheon_e2.png' },
      ],
    },
  ],

  // ── Gwen ──
  // R: 3 recasts with increasing needle count
  Gwen: [
    {
      skillKey: 'R',
      subCasts: [
        {
          id: 'R1',
          nameEn: 'Needlework (R1: 1 needle)',
          nameJa: 'ニードルワーク (R1: 1本)',
          baseDamage: [75, 115, 155],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.1 }],
        },
        {
          id: 'R2',
          nameEn: 'Needlework (R2: 3 needles)',
          nameJa: 'ニードルワーク (R2: 3本)',
          baseDamage: [225, 345, 465],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.3 }],
        },
        {
          id: 'R3',
          nameEn: 'Needlework (R3: 5 needles)',
          nameJa: 'ニードルワーク (R3: 5本)',
          baseDamage: [375, 575, 775],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.5 }],
        },
      ],
    },
  ],

  // ── Twisted Fate ──
  // W: Pick a Card — Blue / Red / Gold
  TwistedFate: [
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Pick a Card (Blue)',
          nameJa: 'ピック・ア・カード (青)',
          baseDamage: [40, 60, 80, 100, 120],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 1.0 }, { stat: 'ap', ratio: 0.9 }],
          comboLabel: '青',
        },
        {
          id: 'W2',
          nameEn: 'Pick a Card (Red)',
          nameJa: 'ピック・ア・カード (赤)',
          baseDamage: [30, 45, 60, 75, 90],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 1.0 }, { stat: 'ap', ratio: 0.5 }],
          comboLabel: '赤',
        },
        {
          id: 'W3',
          nameEn: 'Pick a Card (Gold)',
          nameJa: 'ピック・ア・カード (金)',
          baseDamage: [15, 22.5, 30, 37.5, 45],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 1.0 }, { stat: 'ap', ratio: 0.5 }],
          comboLabel: '金',
        },
      ],
    },
  ],

  // ── Tristana ──
  // E: Explosive Charge — base + stack amplification (0-4 stacks, each +25%)
  Tristana: [
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Explosive Charge (detonation)',
          nameJa: 'エクスプロッシブチャージ (爆発)',
          baseDamage: [60, 85, 110, 135, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.80 }, { stat: 'ap', ratio: 0.50 }],
          distanceMultiplier: { min: 1.0, max: 2.0, defaultPct: 100, labelEn: 'Stacks (0-4)', labelJa: 'スタック (0-4)' },
        },
      ],
    },
  ],

  // ── Taliyah ──
  // Q: Threaded Volley — 5 rocks (1 on worked ground)
  Taliyah: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Threaded Volley (per rock)',
          nameJa: 'スレッドボレー (1発)',
          baseDamage: [38, 58, 78, 98, 118],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.50 }],
          distanceMultiplier: { min: 1, max: 5, defaultPct: 100, labelEn: 'Rocks (1-5)', labelJa: '岩数 (1-5)' },
        },
      ],
    },
  ],

  // ── Talon ──
  // W: Rake — outgoing + return
  Talon: [
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Rake (out)',
          nameJa: 'レイク (往路)',
          baseDamage: [50, 60, 70, 80, 90],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.40 }],
          comboLabel: '往',
        },
        {
          id: 'W2',
          nameEn: 'Rake (return)',
          nameJa: 'レイク (復路)',
          baseDamage: [60, 90, 120, 150, 180],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.90 }],
          comboLabel: '復',
        },
      ],
    },
  ],

  // ── Sylas ──
  // Q: initial lash + intersection detonation
  Sylas: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Chain Lash (initial)',
          nameJa: 'チェインラッシュ (通常)',
          baseDamage: [40, 60, 80, 100, 120],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.4 }],
        },
        {
          id: 'Q2',
          nameEn: 'Chain Lash (detonation)',
          nameJa: 'チェインラッシュ (爆発)',
          baseDamage: [60, 115, 170, 225, 280],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.9 }],
        },
      ],
    },
  ],

  // ── Hecarim ──
  // Q: Rampage with stacking bonus
  Hecarim: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Rampage',
          nameJa: 'ランページ',
          baseDamage: [60, 85, 110, 135, 160],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.95 }],
          distanceMultiplier: { min: 1.0, max: 1.6, defaultPct: 0, labelEn: 'Q Stacks (0-2)', labelJa: 'Qスタック (0-2)' },
        },
      ],
    },
  ],

  // ── Hwei ──
  // Each of Q/W/E has 3 sub-abilities (QQ/QW/QE, WQ/WW/WE, EQ/EW/EE)
  Hwei: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'QQ', nameEn: 'Devastating Fire (QQ)', nameJa: '破壊の炎 (QQ)', baseDamage: [60, 90, 120, 150, 180], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.65 }], comboLabel: 'QQ' },
        { id: 'QW', nameEn: 'Severing Bolt (QW)', nameJa: '断ち切りの落雷 (QW)', baseDamage: [60, 90, 120, 150, 180], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.5 }, { stat: 'targetMissingHp', ratio: 0.02 }], comboLabel: 'QW' },
        { id: 'QE', nameEn: 'Molten Fissure (QE)', nameJa: '溶岩の裂け目 (QE)', baseDamage: [60, 80, 100, 120, 140], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.5 }], comboLabel: 'QE' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'WQ', nameEn: 'Torrential Surge (WQ)', nameJa: '流転の奔流 (WQ)', baseDamage: [70, 105, 140, 175, 210], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.5 }], comboLabel: 'WQ' },
        { id: 'WW', nameEn: 'Pool of Reflection (WW)', nameJa: '鏡面の泉 (WW)', baseDamage: [0, 0, 0, 0, 0], damageType: 'magic', scalings: [], comboLabel: 'WW' },
        { id: 'WE', nameEn: 'Spiraling Despair (WE)', nameJa: '絶望の渦 (WE)', baseDamage: [50, 70, 90, 110, 130], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.35 }], comboLabel: 'WE' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'EQ', nameEn: 'Grim Visage (EQ)', nameJa: '戦慄の幻影 (EQ)', baseDamage: [70, 100, 130, 160, 190], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.55 }], comboLabel: 'EQ' },
        { id: 'EW', nameEn: 'Gaze of the Abyss (EW)', nameJa: '深淵の凝視 (EW)', baseDamage: [60, 85, 110, 135, 160], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.4 }], comboLabel: 'EW' },
        { id: 'EE', nameEn: 'Crushing Maw (EE)', nameJa: '破砕の顎 (EE)', baseDamage: [60, 95, 130, 165, 200], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.55 }], comboLabel: 'EE' },
      ],
    },
  ],

  // ── Kayn ──
  // Base / Shadow Assassin / Rhaast forms for Q/W
  Kayn: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Reaping Slash (Base)', nameJa: 'リーピングスラッシュ (通常)', baseDamage: [75, 105, 135, 165, 195], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.85 }], formGroup: 'base' },
        { id: 'Q2', nameEn: 'Reaping Slash (Shadow)', nameJa: 'リーピングスラッシュ (影)', baseDamage: [75, 105, 135, 165, 195], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.85 }], formGroup: 'shadow', image: 'https://raw.communitydragon.org/latest/game/assets/characters/kayn/hud/icons2d/kayn_q_ass.png' },
        { id: 'Q3', nameEn: 'Reaping Slash (Rhaast)', nameJa: 'リーピングスラッシュ (ラースト)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.65 }, { stat: 'targetMaxHp', ratio: 0.06 }], formGroup: 'rhaast', image: 'https://raw.communitydragon.org/latest/game/assets/characters/kayn/hud/icons2d/kayn_q_slay.png' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Blade\'s Reach (Base)', nameJa: 'ブレードリーチ (通常)', baseDamage: [85, 130, 175, 220, 265], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.1 }], formGroup: 'base' },
        { id: 'W2', nameEn: 'Blade\'s Reach (Shadow)', nameJa: 'ブレードリーチ (影)', baseDamage: [85, 130, 175, 220, 265], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.1 }], formGroup: 'shadow', image: 'https://raw.communitydragon.org/latest/game/assets/characters/kayn/hud/icons2d/kayn_w_ass.png' },
        { id: 'W3', nameEn: 'Blade\'s Reach (Rhaast)', nameJa: 'ブレードリーチ (ラースト)', baseDamage: [85, 130, 175, 220, 265], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.1 }], formGroup: 'rhaast', image: 'https://raw.communitydragon.org/latest/game/assets/characters/kayn/hud/icons2d/kayn_w_slay.png' },
      ],
    },
  ],

  // ── Vi ──
  // E: Relentless Force — enhanced AA (physical)
  Vi: [
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Relentless Force',
          nameJa: 'リレントレスフォース',
          baseDamage: [10, 30, 50, 70, 90],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 1.10 }, { stat: 'ap', ratio: 1.0 }],
        },
      ],
    },
  ],

  // ── Vladimir ──
  // Q: Transfusion — normal vs empowered (Crimson Rush, ~185% damage)
  // E: Tides of Blood — min charge vs max charge
  Vladimir: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Transfusion (normal)',
          nameJa: 'トランスフュージョン (通常)',
          baseDamage: [80, 100, 120, 140, 160],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.60 }],
        },
        {
          id: 'Q2',
          nameEn: 'Transfusion (Crimson Rush)',
          nameJa: 'トランスフュージョン (紅潮)',
          baseDamage: [148, 185, 222, 259, 296],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 1.11 }],
          comboLabel: '紅',
        },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Tides of Blood (min charge)',
          nameJa: 'タイズオブブラッド (最小)',
          baseDamage: [30, 45, 60, 75, 90],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.35 }, { stat: 'maxHp', ratio: 0.015 }],
          comboLabel: '小',
        },
        {
          id: 'E2',
          nameEn: 'Tides of Blood (max charge)',
          nameJa: 'タイズオブブラッド (最大)',
          baseDamage: [60, 90, 120, 150, 180],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.80 }, { stat: 'maxHp', ratio: 0.06 }],
          comboLabel: '大',
        },
      ],
    },
  ],

  // ── Volibear ──
  // W: Frenzied Maul — normal vs wounded (2nd hit on same target)
  Volibear: [
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Frenzied Maul (1st)',
          nameJa: 'フレンジードモール (初撃)',
          baseDamage: [5, 30, 55, 80, 105],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 1.0 }],
        },
        {
          id: 'W2',
          nameEn: 'Frenzied Maul (wounded)',
          nameJa: 'フレンジードモール (負傷時)',
          baseDamage: [10, 60, 110, 160, 210],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 1.0 }],
          comboLabel: '傷',
        },
      ],
    },
  ],

  // ── Wukong (DDragon ID: MonkeyKing) ──
  // R: Cyclone — can cast twice, each spin deals damage over 2s
  MonkeyKing: [
    {
      skillKey: 'R',
      subCasts: [
        {
          id: 'R1',
          nameEn: 'Cyclone (1st cast)',
          nameJa: 'サイクロン (1回目)',
          baseDamage: [90, 180, 270],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.10 }],
          comboLabel: '1',
        },
        {
          id: 'R2',
          nameEn: 'Cyclone (2nd cast)',
          nameJa: 'サイクロン (2回目)',
          baseDamage: [90, 180, 270],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.10 }],
          comboLabel: '2',
        },
      ],
    },
  ],

  // ── Zoe ──
  // Q: Paddle Star — damage scales with distance (1.0x to 2.5x)
  Zoe: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Paddle Star',
          nameJa: 'パドルスター',
          baseDamage: [50, 80, 110, 140, 170],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.60 }],
          distanceMultiplier: { min: 1.0, max: 2.5, defaultPct: 67, labelEn: 'Distance', labelJa: '飛距離' },
        },
      ],
    },
  ],

  // ── Warwick ──
  // Q: Jaws of the Beast — 10-50 + 100% AD + 90% AP + 6% target max HP magic damage
  Warwick: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Jaws of the Beast',
          nameJa: '顎の獣',
          baseDamage: [10, 20, 30, 40, 50],
          damageType: 'magic',
          scalings: [
            { stat: 'ad', ratio: 1.0 },
            { stat: 'ap', ratio: 0.9 },
            { stat: 'targetMaxHp', ratio: 0.06 },
          ],
        },
      ],
    },
  ],

  // ── Viego ──
  // R: Heartbreaker — 100/200/300 + 60% bonus AD + 12% target missing HP physical
  Viego: [
    {
      skillKey: 'R',
      subCasts: [
        {
          id: 'R1',
          nameEn: 'Heartbreaker',
          nameJa: 'ハートブレイカー',
          baseDamage: [100, 200, 300],
          damageType: 'physical',
          scalings: [
            { stat: 'bonusAd', ratio: 0.6 },
            { stat: 'targetMissingHp', ratio: 0.12 },
          ],
        },
      ],
    },
  ],

  // ── Qiyana ──
  // Q: Edge of Ixtal — base + wall element (60% more to <50% HP targets)
  Qiyana: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Edge of Ixtal (base)',
          nameJa: 'エッジオブイクスタル (通常)',
          baseDamage: [70, 100, 130, 160, 190],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.85 }],
        },
        {
          id: 'Q2',
          nameEn: 'Edge of Ixtal (Terrain, <50% HP)',
          nameJa: 'エッジオブイクスタル (岩, <50% HP)',
          baseDamage: [112, 160, 208, 256, 304],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.36 }],
          comboLabel: '岩',
        },
      ],
    },
  ],

  // ── Aurora ──
  // Q: Twofold Hex — outgoing + return
  Aurora: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Twofold Hex (out)',
          nameJa: 'ツーフォールドヘックス (往路)',
          baseDamage: [60, 90, 120, 150, 180],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.50 }],
          comboLabel: '往',
        },
        {
          id: 'Q2',
          nameEn: 'Twofold Hex (return)',
          nameJa: 'ツーフォールドヘックス (復路)',
          baseDamage: [40, 60, 80, 100, 120],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.35 }],
          comboLabel: '復',
        },
      ],
    },
  ],

  // ── Poppy ──
  // Q: Hammer Shock — initial hit + delayed rupture (same damage)
  Poppy: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Hammer Shock (hit)',
          nameJa: 'ハンマーショック (打撃)',
          baseDamage: [30, 55, 80, 105, 130],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.0 }, { stat: 'targetMaxHp', ratio: 0.09 }],
          comboLabel: '打',
        },
        {
          id: 'Q2',
          nameEn: 'Hammer Shock (rupture)',
          nameJa: 'ハンマーショック (破裂)',
          baseDamage: [30, 55, 80, 105, 130],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.0 }, { stat: 'targetMaxHp', ratio: 0.09 }],
          comboLabel: '裂',
        },
      ],
    },
  ],

  // ── RekSai ──
  // Q: Burrowed (Prey Seeker, magic) vs Unburrowed (Queen's Wrath, 3 hits physical)
  RekSai: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: "Queen's Wrath (×3)", nameJa: '女王の怒り (3回)', baseDamage: [63, 102, 141, 180, 219], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.50 }], formGroup: 'unburrowed' },
        { id: 'Q2', nameEn: 'Prey Seeker (Burrowed)', nameJa: 'プレイシーカー (地中)', baseDamage: [60, 90, 120, 150, 180], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.50 }, { stat: 'bonusAd', ratio: 0.70 }], formGroup: 'burrowed' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Furious Bite', nameJa: 'フューリアスバイト', baseDamage: [55, 60, 65, 70, 75], damageType: 'true', scalings: [{ stat: 'bonusAd', ratio: 0.85 }] },
      ],
    },
  ],

  // ── Renekton ──
  // Normal vs Fury (50+ fury) variants for Q/W/E — Hwei-style comboLabel
  Renekton: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Cull the Meek', nameJa: '断罪の鎌', baseDamage: [60, 90, 120, 150, 180], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.0 }] },
        { id: 'Q2', nameEn: 'Cull the Meek (Fury)', nameJa: '断罪の鎌 (フューリー)', baseDamage: [90, 135, 180, 225, 270], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.4 }], comboLabel: 'F' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Ruthless Predator (2 hits)', nameJa: '冷酷な追撃者 (2回)', baseDamage: [10, 40, 70, 100, 130], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.5 }] },
        { id: 'W2', nameEn: 'Ruthless Predator (Fury, 3 hits)', nameJa: '冷酷な追撃者 (フューリー, 3回)', baseDamage: [15, 60, 105, 150, 195], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 2.25 }], comboLabel: 'F' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Slice', nameJa: 'スライス', baseDamage: [40, 70, 100, 130, 160], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.9 }] },
        { id: 'E2', nameEn: 'Dice', nameJa: 'ダイス', baseDamage: [40, 70, 100, 130, 160], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.9 }] },
        { id: 'E3', nameEn: 'Dice (Fury)', nameJa: 'ダイス (フューリー)', baseDamage: [70, 115, 160, 205, 250], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.35 }], comboLabel: 'F' },
      ],
    },
  ],

  // ── Akali ──
  // E: Shuriken Flip — E1 (throw, magic) + E2 (dash, magic)
  Akali: [
    {
      skillKey: 'E',
      subCasts: [
        {
          id: 'E1',
          nameEn: 'Shuriken Flip (throw)',
          nameJa: '手裏剣フリップ (投擲)',
          baseDamage: [21, 42, 63, 84, 105],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 0.30 }, { stat: 'ap', ratio: 0.33 }],
          comboLabel: '投',
        },
        {
          id: 'E2',
          nameEn: 'Shuriken Flip (dash)',
          nameJa: '手裏剣フリップ (突進)',
          baseDamage: [49, 98, 147, 196, 245],
          damageType: 'magic',
          scalings: [{ stat: 'ad', ratio: 0.70 }, { stat: 'ap', ratio: 0.77 }],
          comboLabel: '突',
        },
      ],
    },
  ],

  // ── Camille ──
  // Q: Precision Protocol — Q1 physical, Q2 true damage (after delay)
  // Q1: +20/25/30/35/40% total AD bonus, Q2: +40/50/60/70/80% total AD (true dmg at lv16+)
  Camille: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Precision Protocol (Q1)',
          nameJa: 'プレシジョンプロトコル (Q1)',
          baseDamage: [0, 0, 0, 0, 0],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 0.30 }],
        },
        {
          id: 'Q2',
          nameEn: 'Precision Protocol (Q2, true)',
          nameJa: 'プレシジョンプロトコル (Q2, 確定)',
          baseDamage: [0, 0, 0, 0, 0],
          damageType: 'true',
          scalings: [{ stat: 'ad', ratio: 0.60 }],
        },
      ],
    },
  ],

  // ── Fizz ──
  // Q: Urchin Strike — magic + physical (100% AD) components
  // W: Seastone Trident — active empowered AA
  Fizz: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Urchin Strike (magic)',
          nameJa: 'ウニトゲストライク (魔法)',
          baseDamage: [10, 25, 40, 55, 70],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.55 }],
          comboLabel: '魔',
        },
        {
          id: 'Q2',
          nameEn: 'Urchin Strike (physical)',
          nameJa: 'ウニトゲストライク (物理)',
          baseDamage: [0, 0, 0, 0, 0],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 1.0 }],
          comboLabel: '物',
        },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Seastone Trident (active)',
          nameJa: 'シーストーントライデント (発動)',
          baseDamage: [50, 75, 100, 125, 150],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.45 }],
        },
      ],
    },
  ],

  // ── Galio ──
  // Q: Winds of War — gust (magic) + tornado (8% target max HP magic, 4 ticks)
  Galio: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Winds of War (gust)',
          nameJa: '正義の旋風 (突風)',
          baseDamage: [70, 105, 140, 175, 210],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.70 }],
          comboLabel: '風',
        },
        {
          id: 'Q2',
          nameEn: 'Winds of War (tornado)',
          nameJa: '正義の旋風 (竜巻)',
          baseDamage: [0, 0, 0, 0, 0],
          damageType: 'magic',
          scalings: [{ stat: 'targetMaxHp', ratio: 0.08 }],
          comboLabel: '竜',
        },
      ],
    },
  ],

  // ── Gragas ──
  // Q: Barrel Roll — uncharged vs fully charged (150% damage)
  Gragas: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Barrel Roll (uncharged)',
          nameJa: 'バレルロール (即時)',
          baseDamage: [80, 120, 160, 200, 240],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.80 }],
          comboLabel: '即',
        },
        {
          id: 'Q2',
          nameEn: 'Barrel Roll (full charge)',
          nameJa: 'バレルロール (最大)',
          baseDamage: [120, 180, 240, 300, 360],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 1.20 }],
          comboLabel: '満',
        },
      ],
    },
  ],

  // ── Graves ──
  // Q: End of the Line — initial hit + wall detonation
  Graves: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'End of the Line (initial)',
          nameJa: 'エンドオブザライン (初撃)',
          baseDamage: [50, 75, 100, 125, 150],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.65 }],
          comboLabel: '初',
        },
        {
          id: 'Q2',
          nameEn: 'End of the Line (detonation)',
          nameJa: 'エンドオブザライン (爆発)',
          baseDamage: [80, 125, 170, 215, 260],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 0.85 }],
          comboLabel: '爆',
        },
      ],
    },
  ],

  // ── Illaoi ──
  // W: Harsh Lesson — %maxHP bonus physical
  Illaoi: [
    {
      skillKey: 'W',
      subCasts: [
        {
          id: 'W1',
          nameEn: 'Harsh Lesson',
          nameJa: '過酷な教え',
          baseDamage: [0, 0, 0, 0, 0],
          damageType: 'physical',
          scalings: [{ stat: 'ad', ratio: 1.0 }, { stat: 'targetMaxHp', ratio: 0.03 }],
          distanceMultiplier: { min: 1.0, max: 1.8, defaultPct: 0, labelEn: '%maxHP rank (3-8%)', labelJa: '%maxHPランク' },
        },
      ],
    },
  ],

  // ── Katarina ──
  // Passive: Voracity — dagger pickup damage (handled as combo passive)
  // Q/E handled by Meraki, but passive dagger pickup is the key mechanic

  // ── Mordekaiser ──
  // Q: Obliterate — isolated bonus (30% more damage if hitting single target)
  Mordekaiser: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Obliterate (AoE)', nameJa: 'オブリタレイト (範囲)', baseDamage: [75, 95, 115, 135, 155], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.6 }], comboLabel: 'AoE' },
        { id: 'Q2', nameEn: 'Obliterate (Isolated)', nameJa: 'オブリタレイト (単体)', baseDamage: [97, 123, 149, 175, 201], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.78 }], comboLabel: 'Isolated' },
      ],
    },
  ],

  // ── Kled ──
  // Q: Bear Trap on a Rope / Pocket Pistol (mounted/dismounted)
  Kled: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Bear Trap (Hit)', nameJa: 'ベアトラップ (命中)', baseDamage: [30, 55, 80, 105, 130], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.65 }], formGroup: 'mounted' },
        { id: 'Q2', nameEn: 'Bear Trap (Pull)', nameJa: 'ベアトラップ (引き寄せ)', baseDamage: [60, 110, 160, 210, 260], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.3 }], formGroup: 'mounted' },
        { id: 'Q3', nameEn: 'Pocket Pistol', nameJa: 'ポケットピストル', baseDamage: [35, 52.5, 70, 87.5, 105], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.35 }], formGroup: 'dismounted' },
      ],
    },
  ],

  // ── Yone ──
  // Q3 tornado (same damage as Q but knockup), handled by Meraki
  // Key: mixed damage AA via passive — handled as combo passive

  // ── Zed ──
  // Q: Razor Shuriken — reduced damage through targets
  Zed: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Razor Shuriken (1st)', nameJa: '風魔手裏剣 (直撃)', baseDamage: [80, 115, 150, 185, 220], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.1 }] },
        { id: 'Q2', nameEn: 'Razor Shuriken (Through)', nameJa: '風魔手裏剣 (貫通)', baseDamage: [48, 69, 90, 111, 132], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.66 }] },
      ],
    },
  ],

  // ── Varus ──
  // Q: Piercing Arrow — charge increases damage up to 50% (1.0-1.5× at full)
  Varus: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Piercing Arrow (Min)', nameJa: 'ピアシングアロー (最小)', baseDamage: [10, 46.7, 83.3, 120, 156.7], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.83 }], comboLabel: 'Min' },
        { id: 'Q2', nameEn: 'Piercing Arrow (Max)', nameJa: 'ピアシングアロー (最大)', baseDamage: [15, 70, 125, 180, 235], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.25 }], comboLabel: 'Max' },
      ],
    },
  ],

  // ── Twitch ──
  // E: Contaminate — base 20-60 + per stack: 15-35 + 35% bonus AD physical + 35% AP magic
  Twitch: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Contaminate (1 stack)', nameJa: 'コンタミネイト (1スタック)', baseDamage: [35, 50, 65, 80, 95], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.35 }, { stat: 'ap', ratio: 0.35 }] },
        { id: 'E6', nameEn: 'Contaminate (6 stacks)', nameJa: 'コンタミネイト (6スタック)', baseDamage: [110, 210, 310, 410, 510], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 2.10 }, { stat: 'ap', ratio: 2.10 }], comboLabel: '6stk', distanceMultiplier: { labelEn: 'Stacks (1-6)', labelJa: 'スタック数 (1-6)', min: 1, max: 6, defaultPct: 100 } },
      ],
    },
  ],

  // ── Kai'Sa ──
  // Q: Icathian Rain — 6 missiles (55% bonus AD + 20% AP each). Isolated = all hit one target.
  // Q evolved (100+ bonus AD): 12 missiles.
  // W evolved (100+ AP): applies 3 plasma stacks instead of 2.
  // E evolved (100+ bonus AS): grants stealth during cast (no dmg change).
  Kaisa: [
    {
      skillKey: 'Q',
      evolution: true,
      subCasts: [
        { id: 'Q1', nameEn: 'Icathian Rain (1 missile)', nameJa: 'イカシアの雨 (1発)', baseDamage: [40, 55, 70, 85, 100], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.55 }, { stat: 'ap', ratio: 0.20 }] },
        { id: 'Q6', nameEn: 'Icathian Rain (Isolated 6)', nameJa: 'イカシアの雨 (単体6発)', baseDamage: [100, 138, 175, 213, 250], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.375 }, { stat: 'ap', ratio: 0.50 }], comboLabel: 'Isolated', evolutionGroup: 'normal' },
        { id: 'Q12', nameEn: 'Icathian Rain Evolved (Isolated 12)', nameJa: 'イカシアの雨 進化 (単体12発)', baseDamage: [175, 241, 306, 371, 438], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 2.475 }, { stat: 'ap', ratio: 0.90 }], comboLabel: 'Evolved Isolated', evolutionGroup: 'evolved' },
      ],
    },
    {
      skillKey: 'W',
      evolution: true,
      subCasts: [
        { id: 'W1', nameEn: 'Void Seeker', nameJa: 'ヴォイドシーカー', baseDamage: [30, 55, 80, 105, 130], damageType: 'magic', scalings: [{ stat: 'ad', ratio: 1.3 }, { stat: 'ap', ratio: 0.45 }], evolutionGroup: 'normal' },
        { id: 'W2', nameEn: 'Void Seeker Evolved (+3 Plasma)', nameJa: 'ヴォイドシーカー 進化 (+3プラズマ)', baseDamage: [30, 55, 80, 105, 130], damageType: 'magic', scalings: [{ stat: 'ad', ratio: 1.3 }, { stat: 'ap', ratio: 0.45 }], comboLabel: 'Evolved', evolutionGroup: 'evolved' },
      ],
    },
    {
      skillKey: 'E',
      evolution: true,
    },
  ],

  // ── Rumble ──
  // Q: Flamespitter — total over 3s: 75-200 + 100% AP. Danger Zone: +50%.
  Rumble: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Flamespitter (Normal)', nameJa: 'フレイムスピッター (通常)', baseDamage: [75, 106, 138, 169, 200], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.0 }], formGroup: 'normal' },
        { id: 'Q2', nameEn: 'Flamespitter (Danger Zone)', nameJa: 'フレイムスピッター (デンジャーゾーン)', baseDamage: [113, 159, 206, 253, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.5 }], formGroup: 'danger' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Electro Harpoon (Normal)', nameJa: 'エレクトロハープーン (通常)', baseDamage: [60, 85, 110, 135, 160], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.4 }], formGroup: 'normal' },
        { id: 'E2', nameEn: 'Electro Harpoon (Danger Zone)', nameJa: 'エレクトロハープーン (デンジャーゾーン)', baseDamage: [90, 128, 165, 203, 240], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.6 }], formGroup: 'danger' },
      ],
    },
  ],

  // ── Samira ──
  // Q: Flair — melee/ranged versions
  Samira: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Flair (Ranged)', nameJa: 'フレア (遠距離)', baseDamage: [0, 5, 10, 15, 20], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.85 }], formGroup: 'ranged' },
        { id: 'Q2', nameEn: 'Flair (Melee)', nameJa: 'フレア (近距離)', baseDamage: [0, 5, 10, 15, 20], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.1 }], formGroup: 'melee' },
      ],
    },
  ],

  // ── Kog'Maw ──
  // R: Living Artillery — increased damage on low HP targets (100/150/200% on <40% HP)
  KogMaw: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Living Artillery (Normal)', nameJa: 'リビングアーティラリー (通常)', baseDamage: [100, 140, 180], damageType: 'magic', scalings: [{ stat: 'ad', ratio: 0.65 }, { stat: 'ap', ratio: 0.35 }] },
        { id: 'R2', nameEn: 'Living Artillery (<40% HP)', nameJa: 'リビングアーティラリー (<40%HP)', baseDamage: [200, 280, 360], damageType: 'magic', scalings: [{ stat: 'ad', ratio: 1.3 }, { stat: 'ap', ratio: 0.7 }], comboLabel: '<40%HP' },
      ],
    },
  ],

  // ── Brand ──
  // E: Conflagration — spreads if Ablaze; R bounces
  Brand: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Conflagration', nameJa: 'コンフレグレイション', baseDamage: [70, 95, 120, 145, 170], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.45 }] },
        { id: 'E2', nameEn: 'Conflagration (Ablaze)', nameJa: 'コンフレグレイション (炎上時)', baseDamage: [70, 95, 120, 145, 170], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.45 }], comboLabel: 'Ablaze spread' },
      ],
    },
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Pyroclasm (1 bounce)', nameJa: 'パイロクラズム (1回)', baseDamage: [100, 200, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.25 }] },
        { id: 'R3', nameEn: 'Pyroclasm (3 bounces)', nameJa: 'パイロクラズム (3回)', baseDamage: [300, 600, 900], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.75 }], comboLabel: '3 bounces', distanceMultiplier: { labelEn: 'Bounces (1-5)', labelJa: 'バウンス回数 (1-5)', min: 1, max: 5, defaultPct: 40 } },
      ],
    },
  ],

  // ── Diana ──
  // R: Moonfall — damage scales with champions nearby
  Diana: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Moonfall (1 champ)', nameJa: 'ムーンフォール (1体)', baseDamage: [200, 300, 400], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.6 }] },
        { id: 'R5', nameEn: 'Moonfall (max)', nameJa: 'ムーンフォール (最大)', baseDamage: [600, 900, 1200], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.8 }], comboLabel: '5 champ', distanceMultiplier: { labelEn: 'Champs (1-5)', labelJa: 'チャンピオン数 (1-5)', min: 1, max: 5, defaultPct: 0 } },
      ],
    },
  ],

  // ── Thresh ──
  // Q: Death Sentence — 2 parts
  Thresh: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Death Sentence (Hook)', nameJa: 'デスセンテンス (フック)', baseDamage: [100, 150, 200, 250, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.5 }] },
      ],
    },
  ],

  // ── Kalista ──
  // E: Rend — first spear: 5-45 + 70% AD, per extra: 7-35 + 20-40% AD
  Kalista: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Rend (1 spear)', nameJa: 'レンド (1本)', baseDamage: [5, 15, 25, 35, 45], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.7 }] },
        { id: 'E10', nameEn: 'Rend (10 spears)', nameJa: 'レンド (10本)', baseDamage: [68, 141, 214, 287, 360], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 2.5 }], comboLabel: '10 spears', distanceMultiplier: { labelEn: 'Spears (1-20)', labelJa: '槍数 (1-20)', min: 1, max: 20, defaultPct: 47 } },
      ],
    },
  ],

  // ── Kog'Maw ──  (already above)

  // ── Bel'Veth ──
  // E: Royal Maelstrom — multi-hit
  BelVeth: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Royal Maelstrom (Total)', nameJa: 'ロイヤルメールストロム (合計)', baseDamage: [120, 150, 180, 210, 240], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 5.0 }] },
      ],
    },
  ],

  // ── Tahm Kench ──
  // Q: Tongue Lash — bonus if An Acquired Taste stacks
  TahmKench: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Tongue Lash', nameJa: 'タングラッシュ', baseDamage: [80, 130, 180, 230, 280], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.7 }, { stat: 'bonusHp', ratio: 0.03 }] },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Abyssal Dive', nameJa: 'アビサルダイブ', baseDamage: [100, 135, 170, 205, 240], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.5 }, { stat: 'bonusHp', ratio: 0.05 }] },
      ],
    },
  ],

  // ── Naafiri ──
  // Q: Darkin Daggers — 2 hits, packmates add extra hits
  Naafiri: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Darkin Daggers (Initial)', nameJa: 'ダーキンダガー (初撃)', baseDamage: [30, 45, 60, 75, 90], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.4 }] },
        { id: 'Q2', nameEn: 'Darkin Daggers (Return)', nameJa: 'ダーキンダガー (帰還)', baseDamage: [50, 75, 100, 125, 150], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.75 }] },
      ],
    },
  ],

  // ── Rell ──
  // W: Ferromancy — Crash Down / Mount Up forms
  Rell: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Crash Down', nameJa: 'クラッシュダウン', baseDamage: [70, 105, 140, 175, 210], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.6 }], formGroup: 'mounted' },
        { id: 'W2', nameEn: 'Mount Up', nameJa: 'マウントアップ', baseDamage: [15, 25, 35, 45, 55], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.3 }], formGroup: 'dismounted' },
      ],
    },
  ],

  // ── Briar ──
  // W: Blood Frenzy + Snack Attack — 2 casts
  Briar: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Blood Frenzy', nameJa: 'ブラッドフレンジー', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.05 }] },
        { id: 'W2', nameEn: 'Snack Attack', nameJa: 'スナックアタック', baseDamage: [60, 100, 140, 180, 220], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.1 }, { stat: 'bonusHp', ratio: 0.06 }] },
      ],
    },
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Head Rush', nameJa: 'ヘッドラッシュ', baseDamage: [60, 90, 120, 150, 180], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.8 }, { stat: 'bonusHp', ratio: 0.05 }] },
      ],
    },
  ],

  // ── Aphelios ──
  // Q abilities depend on weapon — most complex. Main gun: Calibrum (mark), Severum (heal), Gravitum (slow), Infernum (AoE), Crescendum (turret)
  // Simplified: model R damage which changes per weapon
  Aphelios: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-calibrum', nameEn: 'Moonlight Vigil (Calibrum)', nameJa: 'ムーンライトヴィジル (カリブルム)', baseDamage: [125, 175, 225], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.2 }, { stat: 'ap', ratio: 1.0 }], formGroup: 'calibrum' },
        { id: 'R-severum', nameEn: 'Moonlight Vigil (Severum)', nameJa: 'ムーンライトヴィジル (セヴェルム)', baseDamage: [125, 175, 225], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.2 }, { stat: 'ap', ratio: 1.0 }], formGroup: 'severum' },
        { id: 'R-infernum', nameEn: 'Moonlight Vigil (Infernum)', nameJa: 'ムーンライトヴィジル (インファーナム)', baseDamage: [125, 175, 225], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.2 }, { stat: 'ap', ratio: 1.0 }], formGroup: 'infernum' },
      ],
    },
  ],

  // ── Cho'Gath ──
  // R: Feast — true damage, scales with HP stacks
  Chogath: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Feast (Champion)', nameJa: 'フィースト (チャンピオン)', baseDamage: [300, 475, 650], damageType: 'true', scalings: [{ stat: 'ap', ratio: 0.5 }, { stat: 'bonusHp', ratio: 0.1 }] },
      ],
    },
  ],

  // ── Darius ──
  // Q: Decimate — blade (outer) vs handle (inner)
  Darius: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q-blade', nameEn: 'Decimate (Blade)', nameJa: 'デシメイト (刃)', baseDamage: [50, 80, 110, 140, 170], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.0 }], comboLabel: 'Blade' },
        { id: 'Q-handle', nameEn: 'Decimate (Handle)', nameJa: 'デシメイト (柄)', baseDamage: [17, 27, 37, 47, 57], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.35 }], comboLabel: 'Handle' },
      ],
    },
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R0', nameEn: 'Noxian Guillotine (0 stacks)', nameJa: 'ノクサスギロチン (0スタック)', baseDamage: [125, 250, 375], damageType: 'true', scalings: [{ stat: 'ad', ratio: 0.75 }], comboLabel: '0stk' },
        { id: 'R5', nameEn: 'Noxian Guillotine (5 stacks)', nameJa: 'ノクサスギロチン (5スタック)', baseDamage: [375, 750, 1125], damageType: 'true', scalings: [{ stat: 'ad', ratio: 2.25 }], comboLabel: '5stk' },
      ],
    },
  ],

  // ── Fiora ──
  // Q: Lunge — if hits Vital, separate calc. W: Riposte returns damage.
  // E: empowered AA (1st = slow, 2nd = crit for 170% AD)
  Fiora: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Bladework (1st AA)', nameJa: 'ブレードワーク (1撃目)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.0 }] },
        { id: 'E2', nameEn: 'Bladework (2nd Crit)', nameJa: 'ブレードワーク (2撃目クリ)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.7 }], comboLabel: 'Crit' },
      ],
    },
  ],

  // ── Gangplank ──
  // Q: Parrrley — applies on-hits, can crit. E: Powder Keg (chain explosion)
  Gangplank: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Powder Keg (Single)', nameJa: 'パウダーケグ (単発)', baseDamage: [60, 90, 120, 150, 180], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.0 }] },
        { id: 'E2', nameEn: 'Powder Keg (Chain x2)', nameJa: 'パウダーケグ (連鎖x2)', baseDamage: [120, 180, 240, 300, 360], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 2.0 }], comboLabel: 'Chain x2' },
      ],
    },
  ],

  // ── Irelia ──
  // Q: Bladesurge — resets on kill/mark. Standard Meraki handles it.
  // R: Vanguard's Edge (initial + wall detonation)
  Irelia: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: "Vanguard's Edge (Cast)", nameJa: 'ヴァンガーズエッジ (射出)', baseDamage: [125, 250, 375], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.7 }, { stat: 'ad', ratio: 0.7 }] },
        { id: 'R2', nameEn: "Vanguard's Edge (Wall)", nameJa: 'ヴァンガーズエッジ (壁)', baseDamage: [125, 250, 375], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.7 }, { stat: 'ad', ratio: 0.7 }] },
      ],
    },
  ],

  // ── Kindred ──
  // Q: Dance of Arrows — flat damage, scaling with marks
  // W: Wolf's Frenzy — wolf attacks; E: Mounting Dread — 3rd hit execute
  Kindred: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Mounting Dread (Slow)', nameJa: 'マウンティングドレッド (スロー)', baseDamage: [80, 100, 120, 140, 160], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.8 }] },
        { id: 'E2', nameEn: 'Mounting Dread (3rd Hit)', nameJa: 'マウンティングドレッド (3撃目)', baseDamage: [80, 100, 120, 140, 160], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.8 }, { stat: 'bonusHp', ratio: 0.08 }], comboLabel: '3rd hit' },
      ],
    },
  ],

  // ── Rengar ──
  // Q: Savagery — empowered Q deals more
  Rengar: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Savagery (Normal)', nameJa: 'サベイジリー (通常)', baseDamage: [30, 60, 90, 120, 150], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.15 }], formGroup: 'normal' },
        { id: 'Q2', nameEn: 'Savagery (Empowered)', nameJa: 'サベイジリー (強化)', baseDamage: [30, 60, 90, 120, 150], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.4 }], formGroup: 'empowered' },
      ],
    },
  ],

  // ── Swain ──
  // R: Demonic Ascension — DPS aura + Demonflare at end
  Swain: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-drain', nameEn: 'Demonic Ascension (Drain/s)', nameJa: 'デモニックアセンション (吸収/秒)', baseDamage: [20, 40, 60], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.10 }] },
        { id: 'R-flare', nameEn: 'Demonflare (Burst)', nameJa: 'デーモンフレア (バースト)', baseDamage: [150, 225, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.6 }], comboLabel: 'Flare' },
      ],
    },
  ],

  // ── Veigar ──
  // R: Primordial Burst — bonus damage on low HP targets (200% at <33% HP)
  Veigar: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-full', nameEn: 'Primordial Burst (100% HP)', nameJa: 'プライモーディアルバースト (100%HP)', baseDamage: [175, 250, 325], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.75 }] },
        { id: 'R-low', nameEn: 'Primordial Burst (<33% HP)', nameJa: 'プライモーディアルバースト (<33%HP)', baseDamage: [350, 500, 650], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.5 }], comboLabel: '<33%HP' },
      ],
    },
  ],

  // ── Orianna ──
  // R: Shockwave — guaranteed hit in combo. W: Command Dissonance
  // Q+W combo damage already handled by Meraki, but R's guaranteed combo is useful

  // ── Malzahar ──
  // R: Nether Grasp — channel damage + pool (W)
  Malzahar: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Nether Grasp (Total)', nameJa: 'ネザーグラスプ (合計)', baseDamage: [125, 200, 275], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.8 }] },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Void Swarm (Per Voidling)', nameJa: 'ヴォイドスウォーム (1体)', baseDamage: [12, 18, 24, 30, 36], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.12 }] },
      ],
    },
  ],

  // ── Syndra ──  (already exists above)

  // ── Kassadin ──
  // R: Riftwalk — stacking damage per consecutive cast
  Kassadin: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Riftwalk (1st)', nameJa: 'リフトウォーク (1回目)', baseDamage: [70, 100, 130], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.4 }] },
        { id: 'R2', nameEn: 'Riftwalk (2nd)', nameJa: 'リフトウォーク (2回目)', baseDamage: [140, 200, 260], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.8 }], comboLabel: '2nd' },
        { id: 'R4', nameEn: 'Riftwalk (4th+)', nameJa: 'リフトウォーク (4回目+)', baseDamage: [280, 400, 520], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.6 }], comboLabel: '4th+' },
      ],
    },
  ],

  // ── Nasus ──
  // R: Fury of the Sands — % maxHP magic DPS aura
  Nasus: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-tick', nameEn: 'Fury of the Sands (Per Second)', nameJa: 'サンドストーム (毎秒)', baseDamage: [20, 40, 60], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.1 }] },
      ],
    },
  ],

  // ── Yasuo ──
  // Q3: tornado (same damage as Q), E+Q combo (same damage), R has bonus armor pen
  Yasuo: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Last Breath', nameJa: 'ラストブレス', baseDamage: [200, 350, 500], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.5 }] },
      ],
    },
  ],

  // ── Jinx ──
  // Q: Switcheroo! — Pow-Pow (AS) vs Fishbones (AoE + bonus damage)
  Jinx: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q-pow', nameEn: 'Pow-Pow (Minigun)', nameJa: 'パウパウ (ミニガン)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.0 }], formGroup: 'minigun' },
        { id: 'Q-fish', nameEn: 'Fishbones (Rocket)', nameJa: 'フィッシュボーン (ロケット)', baseDamage: [0, 10, 20, 30, 40], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.1 }], formGroup: 'rocket' },
      ],
    },
  ],

  // ── Jhin ──  (P moved to champion-combo-effects.ts)

  // ── Draven ──
  // R: Whirling Death (out + return)
  Draven: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-out', nameEn: 'Whirling Death (Out)', nameJa: 'ワーリングデス (往路)', baseDamage: [175, 275, 375], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.1 }] },
        { id: 'R-return', nameEn: 'Whirling Death (Return)', nameJa: 'ワーリングデス (帰路)', baseDamage: [175, 275, 375], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.1 }] },
      ],
    },
  ],

  // ── Ezreal ──
  // Q: Mystic Shot — applies on-hits (key mechanic)
  // W: Essence Flux — detonated by abilities
  Ezreal: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Essence Flux (Detonate)', nameJa: 'エッセンスフラックス (起爆)', baseDamage: [80, 135, 190, 245, 300], damageType: 'magic', scalings: [{ stat: 'ad', ratio: 0.6 }, { stat: 'ap', ratio: 0.7 }] },
      ],
    },
  ],

  // ── Lux ──
  // R: Final Spark — refreshes Illumination mark
  // Standard Meraki handles this well

  // ── Orianna ──
  // Q+W+R combo — all standard. Add R:
  Orianna: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Shockwave', nameJa: 'ショックウェーブ', baseDamage: [200, 275, 350], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.9 }] },
      ],
    },
  ],

  // ── Zeri ──
  // Q: Burst Fire — charged AA + skill shot
  Zeri: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Burst Fire (Uncharged)', nameJa: 'バーストファイア (未チャージ)', baseDamage: [10, 15, 20, 25, 30], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.04 }] },
        { id: 'Q2', nameEn: 'Burst Fire (Charged)', nameJa: 'バーストファイア (チャージ)', baseDamage: [90, 135, 180, 225, 270], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.1 }, { stat: 'ap', ratio: 0.85 }], comboLabel: 'Charged' },
      ],
    },
  ],

  // ── Ashe ──
  // Passive: Frost Shot — slowed targets take bonus damage
  // Q: Ranger's Focus — enhanced AA burst (5 attacks in rapid succession)
  Ashe: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: "Ranger's Focus (Flurry)", nameJa: 'レンジャーフォーカス (連射)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.05 }] },
      ],
    },
  ],

  // ── Vayne ──
  // Q: Tumble — enhanced AA
  Vayne: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Tumble (Enhanced AA)', nameJa: 'タンブル (強化AA)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.6 }] },
      ],
    },
  ],

  // ── Caitlyn ──
  // R: Ace in the Hole — scales with crit
  Caitlyn: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Ace in the Hole', nameJa: 'エースインザホール', baseDamage: [300, 525, 750], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 2.0 }] },
      ],
    },
  ],

  // ── Kayn ──  (already exists above)

  // ── Urgot ──
  // W: Purge — rapid fire AAs at reduced damage. P moved to champion-combo-effects.ts
  Urgot: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Purge (Per Shot)', nameJa: 'パージ (1発)', baseDamage: [12, 20, 28, 36, 44], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.20 }] },
      ],
    },
  ],

  // ── Lulu ──
  // Passive: Pix on-hit magic damage
  // Q: Glitterlance (Lulu + Pix, 2 bolts)
  Lulu: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Glitterlance (1 bolt)', nameJa: 'グリッターランス (1本)', baseDamage: [70, 105, 140, 175, 210], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.5 }] },
        { id: 'Q2', nameEn: 'Glitterlance (2 bolts)', nameJa: 'グリッターランス (2本)', baseDamage: [95, 143, 190, 238, 285], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.68 }], comboLabel: '2 bolts' },
      ],
    },
  ],

  // ── Morgana ──
  // W: Tormented Shadow — DPS pool (increased damage on low HP targets)
  Morgana: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Tormented Shadow (Total)', nameJa: 'トーメンテッドシャドウ (合計)', baseDamage: [60, 95, 130, 165, 200], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.7 }] },
      ],
    },
  ],

  // ── Leona ──
  // Passive: Sunlight — allies detonate for bonus magic damage
  Leona: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-center', nameEn: 'Solar Flare (Center)', nameJa: 'ソーラーフレア (中央)', baseDamage: [100, 175, 250], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.8 }], comboLabel: 'Center' },
        { id: 'R-edge', nameEn: 'Solar Flare (Edge)', nameJa: 'ソーラーフレア (外周)', baseDamage: [75, 131, 188], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.6 }], comboLabel: 'Edge' },
      ],
    },
  ],

  // ── Nautilus ──
  // Standard Meraki handles well. Key: high base damages + CC.

  // ── Sona ──  (P moved to champion-combo-effects.ts)

  // ── Zyra ──  (P moved to champion-combo-effects.ts)

  // ── Xerath ──
  // Q: Arcanopulse — charge for range. R: Rite of the Arcane — 3-5 shots
  Xerath: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Rite of the Arcane (1 shot)', nameJa: 'アルケインライト (1発)', baseDamage: [200, 250, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.45 }] },
        { id: 'R3', nameEn: 'Rite of the Arcane (3 shots)', nameJa: 'アルケインライト (3発)', baseDamage: [600, 750, 900], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.35 }], comboLabel: '3 shots' },
      ],
    },
  ],

  // ── Vel'Koz ──
  // R: Lifeform Disintegration Ray — channeled damage
  Velkoz: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Lifeform Disintegration (Full)', nameJa: 'ライフフォームディスインテグレーション (全)', baseDamage: [450, 625, 800], damageType: 'true', scalings: [{ stat: 'ap', ratio: 1.25 }] },
      ],
    },
  ],

  // ── Ziggs ──
  // W: Satchel Charge — can execute turrets. R: Mega Inferno Bomb (center/edge)
  Ziggs: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-center', nameEn: 'Mega Inferno Bomb (Center)', nameJa: 'メガインフェルノボム (中央)', baseDamage: [200, 300, 400], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.7333 }] },
        { id: 'R-edge', nameEn: 'Mega Inferno Bomb (Edge)', nameJa: 'メガインフェルノボム (外周)', baseDamage: [150, 225, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.55 }], comboLabel: 'Edge' },
      ],
    },
  ],

  // ── Annie ──
  // Passive: Pyromania — every 4th spell stuns. R: Tibbers (initial + aura)
  Annie: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-initial', nameEn: 'Tibbers (Initial)', nameJa: 'ティバーズ (初撃)', baseDamage: [150, 275, 400], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.75 }] },
        { id: 'R-aura', nameEn: 'Tibbers (Aura/s)', nameJa: 'ティバーズ (オーラ/秒)', baseDamage: [20, 30, 40], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.12 }] },
      ],
    },
  ],

  // ── Fiddlesticks ──
  // R: Crowstorm — channeled AoE (total over 5s)
  Fiddlesticks: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-total', nameEn: 'Crowstorm (5s Total)', nameJa: 'クロウストーム (5秒合計)', baseDamage: [625, 1125, 1625], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.125 }] },
      ],
    },
  ],

  // ── Karthus ──
  // Q: Lay Waste — isolated deals double. R: Requiem (global)
  Karthus: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Lay Waste (AoE)', nameJa: 'レイウェイスト (範囲)', baseDamage: [45, 62.5, 80, 97.5, 115], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.35 }] },
        { id: 'Q2', nameEn: 'Lay Waste (Isolated)', nameJa: 'レイウェイスト (単体)', baseDamage: [90, 125, 160, 195, 230], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.7 }], comboLabel: 'Isolated' },
      ],
    },
  ],

  // ── Heimerdinger ──
  // R+Q: UPGRADE!!! turret; R+W: 5 rockets; R+E: bouncing grenade
  Heimerdinger: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Hextech Rockets (1 hit)', nameJa: 'ヘクステックロケット (1発)', baseDamage: [50, 75, 100, 125, 150], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.45 }] },
        { id: 'W5', nameEn: 'Hextech Rockets (5 hits)', nameJa: 'ヘクステックロケット (5発)', baseDamage: [250, 375, 500, 625, 750], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 2.25 }], comboLabel: '5 hits' },
      ],
    },
  ],

  // ── Teemo ──
  // R: Noxious Trap — mushroom damage
  Teemo: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Noxious Trap (Shroom)', nameJa: 'ノクシャストラップ (キノコ)', baseDamage: [200, 325, 450], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.55 }] },
      ],
    },
  ],

  // ── Malphite ──
  // R: Unstoppable Force — high base damage + AP ratio
  Malphite: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Unstoppable Force', nameJa: 'アンストッパブルフォース', baseDamage: [200, 300, 400], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.9 }] },
      ],
    },
  ],

  // ── Nunu ──
  // W: Biggest Snowball Ever! (scales with distance). R: Absolute Zero (channel)
  Nunu: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-max', nameEn: 'Absolute Zero (Full Channel)', nameJa: 'アブソリュートゼロ (フルチャネル)', baseDamage: [625, 950, 1275], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 3.0 }] },
        { id: 'R-half', nameEn: 'Absolute Zero (Half)', nameJa: 'アブソリュートゼロ (半分)', baseDamage: [312, 475, 637], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.5 }], comboLabel: 'Half' },
      ],
    },
  ],

  // ── Rammus ──
  // R: Soaring Slam — aftershocks
  Rammus: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-impact', nameEn: 'Soaring Slam (Impact)', nameJa: 'ソアリングスラム (衝撃)', baseDamage: [100, 175, 250], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.6 }] },
        { id: 'R-after', nameEn: 'Soaring Slam (Aftershocks)', nameJa: 'ソアリングスラム (余震)', baseDamage: [200, 350, 500], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.2 }], comboLabel: 'Full' },
      ],
    },
  ],

  // ── Skarner ──
  // Q: Shattered Earth / Upheaval — 2 casts
  Skarner: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Shattered Earth (Hit)', nameJa: 'シャタードアース (命中)', baseDamage: [10, 15, 20, 25, 30], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.4 }, { stat: 'bonusHp', ratio: 0.04 }] },
        { id: 'Q2', nameEn: 'Upheaval (Throw)', nameJa: 'アップヒーヴァル (投擲)', baseDamage: [40, 65, 90, 115, 140], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.6 }, { stat: 'bonusHp', ratio: 0.06 }] },
      ],
    },
  ],

  // ── Maokai ──
  // Passive: Sap Magic — empowered AA heal. E: Sapling Toss (empowered in brush)
  Maokai: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Sapling Toss (Normal)', nameJa: 'サップリングトス (通常)', baseDamage: [55, 80, 105, 130, 155], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.4 }, { stat: 'bonusHp', ratio: 0.01 }], formGroup: 'normal' },
        { id: 'E2', nameEn: 'Sapling Toss (Brush)', nameJa: 'サップリングトス (茂み)', baseDamage: [110, 160, 210, 260, 310], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.8 }, { stat: 'bonusHp', ratio: 0.02 }], formGroup: 'brush' },
      ],
    },
  ],

  // ── Senna ──
  // Q: Piercing Darkness — heals + damages. Standard. R: Dawning Shadow (center/edge)
  Senna: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R-center', nameEn: 'Dawning Shadow (Center)', nameJa: 'ドーニングシャドウ (中央)', baseDamage: [250, 400, 550], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.15 }, { stat: 'ap', ratio: 0.7 }] },
      ],
    },
  ],

  // ── Pyke ──
  // R: Death from Below — execute threshold scales with AD
  Pyke: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Death from Below (Execute)', nameJa: 'デスフロムビロウ (処刑)', baseDamage: [250, 400, 550], damageType: 'true', scalings: [{ stat: 'ad', ratio: 0.8 }] },
      ],
    },
  ],

  // ── Blitzcrank ──
  // R: Static Field — passive + active
  Blitzcrank: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Static Field (Active)', nameJa: 'スタティックフィールド (アクティブ)', baseDamage: [275, 400, 525], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.0 }] },
      ],
    },
  ],

  // ── Alistar ──
  // W+Q combo — both standard. E: Trample — stun proc after 5 stacks
  Alistar: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E-total', nameEn: 'Trample (5s Total)', nameJa: 'トランプル (5秒合計)', baseDamage: [80, 110, 140, 170, 200], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.4 }] },
      ],
    },
  ],

  // ── Amumu ──
  // W: Despair — %maxHP magic DPS. R: Curse of the Sad Mummy
  Amumu: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W-tick', nameEn: 'Despair (Per Second)', nameJa: 'ディスペア (毎秒)', baseDamage: [12, 16, 20, 24, 28], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.01 }] },
      ],
    },
  ],

  // ── Gragas ──  (already exists)

  // ── Sejuani ──
  // E: Permafrost — stun + damage. W: Winter's Wrath (2 swings)
  Sejuani: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: "Winter's Wrath (1st Swing)", nameJa: 'ウィンターズラス (1振り目)', baseDamage: [20, 25, 30, 35, 40], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.2 }, { stat: 'bonusHp', ratio: 0.02 }] },
        { id: 'W2', nameEn: "Winter's Wrath (2nd Swing)", nameJa: 'ウィンターズラス (2振り目)', baseDamage: [30, 70, 110, 150, 190], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.6 }, { stat: 'bonusHp', ratio: 0.06 }] },
      ],
    },
  ],

  // ── Zac ──
  // W: Unstable Matter — %maxHP magic
  Zac: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Unstable Matter', nameJa: 'アンステーブルマター', baseDamage: [35, 50, 65, 80, 95], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.04 }, { stat: 'bonusHp', ratio: 0.04 }] },
      ],
    },
  ],

  // ── Ornn ──
  // R: Call of the Forge God — 2 casts (1st = slow, 2nd = knockup + more damage)
  Ornn: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Call of the Forge God (1st)', nameJa: 'フォージゴッドの呼び声 (1段目)', baseDamage: [125, 175, 225], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.2 }] },
        { id: 'R2', nameEn: 'Call of the Forge God (2nd)', nameJa: 'フォージゴッドの呼び声 (2段目)', baseDamage: [125, 175, 225], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.2 }] },
      ],
    },
  ],

  // ── Volibear ──  (already exists)

  // ── Mundo ──
  // Q: Infected Bonesaw — %currentHP magic
  DrMundo: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Infected Bonesaw', nameJa: '感染式ボーンソー', baseDamage: [80, 130, 180, 230, 280], damageType: 'magic', scalings: [] },
      ],
    },
  ],

  // ── Yone ──  (already in list above as comment)

  // ── Trundle ──
  // Q: Chomp — AA reset + AD steal
  Trundle: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Chomp', nameJa: 'チョンプ', baseDamage: [20, 40, 60, 80, 100], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.15 }] },
      ],
    },
  ],

  // ── Tryndamere ──
  // Passive: crit scaling with fury. E: Spinning Slash scales with crit
  Tryndamere: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Spinning Slash', nameJa: 'スピニングスラッシュ', baseDamage: [70, 100, 130, 160, 190], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.3 }, { stat: 'ap', ratio: 0.8 }] },
      ],
    },
  ],

  // ── Ksante ──
  // Normal vs All Out forms for Q/W/E
  KSante: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Ntofo Strikes (Normal)', nameJa: 'ヌトフォストライク (通常)', baseDamage: [50, 75, 100, 125, 150], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.4 }], formGroup: 'normal' },
        { id: 'Q2', nameEn: 'Ntofo Strikes (All Out)', nameJa: 'ヌトフォストライク (オールアウト)', baseDamage: [35, 55, 75, 95, 115], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.7 }], formGroup: 'allout' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Path Maker (Normal)', nameJa: 'パスメーカー (通常)', baseDamage: [50, 80, 110, 140, 170], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.3 }, { stat: 'bonusHp', ratio: 0.02 }], formGroup: 'normal' },
        { id: 'W2', nameEn: 'Path Maker (All Out)', nameJa: 'パスメーカー (オールアウト)', baseDamage: [50, 80, 110, 140, 170], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.6 }], formGroup: 'allout' },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Footwork (Normal)', nameJa: 'フットワーク (通常)', baseDamage: [30, 55, 80, 105, 130], damageType: 'physical', scalings: [{ stat: 'bonusHp', ratio: 0.02 }], formGroup: 'normal' },
        { id: 'E2', nameEn: 'Footwork (All Out)', nameJa: 'フットワーク (オールアウト)', baseDamage: [30, 55, 80, 105, 130], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.5 }], formGroup: 'allout' },
      ],
    },
  ],
  // ── Garen ──
  // E: Judgment — spins 7 + 1 per 25% bonus AS. Per spin: 14/18/22/26/30 + 40-52% AD.
  // Nearest enemy takes 25% more. Can crit for 33% bonus damage.
  // R: Demacian Justice — true damage: 150/250/350 + 25/30/35% target missing HP
  Garen: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Judgment (per spin)', nameJa: 'ジャッジメント (1回転)', baseDamage: [14, 18, 22, 26, 30], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.40 }] },
        { id: 'E7', nameEn: 'Judgment (7 spins total)', nameJa: 'ジャッジメント (7回転合計)', baseDamage: [98, 126, 154, 182, 210], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 2.80 }], comboLabel: '7 spins' },
        { id: 'E8', nameEn: 'Judgment (8 spins total)', nameJa: 'ジャッジメント (8回転合計)', baseDamage: [112, 144, 176, 208, 240], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 3.20 }], comboLabel: '8 spins' },
        { id: 'E10', nameEn: 'Judgment (10 spins total)', nameJa: 'ジャッジメント (10回転合計)', baseDamage: [140, 180, 220, 260, 300], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 4.00 }], comboLabel: '10 spins' },
      ],
    },
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Demacian Justice', nameJa: 'デマーシアンジャスティス', baseDamage: [150, 250, 350], damageType: 'true', scalings: [{ stat: 'targetMissingHp', ratio: 0.25 }] },
      ],
    },
  ],

  // ── Corki ──
  // R: Missile Barrage — normal: 90/170/250 + 85% bonus AD (physical). Big One: 2x.
  Corki: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Missile Barrage (Normal)', nameJa: 'ミサイルバラージ (通常)', baseDamage: [90, 170, 250], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.85 }] },
        { id: 'R2', nameEn: 'Missile Barrage (Big One)', nameJa: 'ミサイルバラージ (ビッグワン)', baseDamage: [180, 340, 500], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.70 }], comboLabel: 'Big One' },
      ],
    },
  ],

  // ── Shen ──
  // Q: Spirit Blade — enhanced AAs: 5/5.5/6/6.5/7% target maxHP (+2% per 100 AP) magic
  // Not pulled: lower ratio (half)
  Shen: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Spirit Blade (enhanced AA)', nameJa: 'スピリットブレード (強化AA)', baseDamage: [0, 0, 0, 0, 0], damageType: 'magic', scalings: [{ stat: 'targetMaxHp', ratio: 0.025 }] },
        { id: 'Q2', nameEn: 'Spirit Blade (pulled through)', nameJa: 'スピリットブレード (引き抜き)', baseDamage: [0, 0, 0, 0, 0], damageType: 'magic', scalings: [{ stat: 'targetMaxHp', ratio: 0.05 }], comboLabel: 'Pull' },
      ],
    },
  ],

  // ── Udyr ──
  // Q: Wildfang — (awakened) 2 strikes: 3-59 + 120% AD + 80% AP per strike (physical)
  // R: Wingborne Storm — 20-220 + 80% AP initial + 10-115 + 30% AP per tick (magic)
  Udyr: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Wildfang (per strike)', nameJa: 'ワイルドファング (1撃)', baseDamage: [10, 30, 50, 70, 90, 110], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.2 }, { stat: 'ap', ratio: 0.8 }] },
        { id: 'Q2', nameEn: 'Wildfang Awakened (2 strikes)', nameJa: 'ワイルドファング 覚醒 (2撃)', baseDamage: [20, 60, 100, 140, 180, 220], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 2.4 }, { stat: 'ap', ratio: 1.6 }], comboLabel: 'Awakened' },
      ],
    },
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Wingborne Storm (initial)', nameJa: 'ウイングボーンストーム (初撃)', baseDamage: [20, 60, 100, 140, 180, 220], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.8 }] },
        { id: 'R2', nameEn: 'Wingborne Storm (per tick)', nameJa: 'ウイングボーンストーム (1ティック)', baseDamage: [10, 30, 50, 70, 90, 115], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.3 }] },
      ],
    },
  ],

  // ── Azir ──
  // W: Arise! — soldier AA damage: 0 + 50-150 based on level + 55% AP
  // Multiple soldiers hitting same target: 2nd+ deals 25% damage
  Azir: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Soldier Attack (1 soldier)', nameJa: '兵士の攻撃 (1体)', baseDamage: [0, 0, 0, 0, 0], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.55 }] },
        { id: 'W2', nameEn: 'Soldier Attack (2 soldiers)', nameJa: '兵士の攻撃 (2体)', baseDamage: [0, 0, 0, 0, 0], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.69 }], comboLabel: '2 soldiers' },
        { id: 'W3', nameEn: 'Soldier Attack (3 soldiers)', nameJa: '兵士の攻撃 (3体)', baseDamage: [0, 0, 0, 0, 0], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.83 }], comboLabel: '3 soldiers' },
      ],
    },
  ],

  // ── Xayah ──
  // E: Bladecaller — per feather: 50/65/80/95/110 + 40% bonus AD (physical)
  Xayah: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Bladecaller (1 feather)', nameJa: 'ブレードコーラー (1枚)', baseDamage: [50, 65, 80, 95, 110], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.40 }] },
        { id: 'E3', nameEn: 'Bladecaller (3 feathers)', nameJa: 'ブレードコーラー (3枚)', baseDamage: [150, 195, 240, 285, 330], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.20 }], comboLabel: '3 feathers' },
        { id: 'E5', nameEn: 'Bladecaller (5 feathers)', nameJa: 'ブレードコーラー (5枚)', baseDamage: [250, 325, 400, 475, 550], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 2.00 }], comboLabel: '5 feathers' },
      ],
    },
  ],

  // ── Singed ──
  // Q: Poison Trail — 20/30/40/50/60 + 42.5% AP per second (magic). 2s linger.
  Singed: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Poison Trail (per second)', nameJa: 'ポイズントレイル (毎秒)', baseDamage: [20, 30, 40, 50, 60], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.425 }] },
        { id: 'Q3', nameEn: 'Poison Trail (3s exposure)', nameJa: 'ポイズントレイル (3秒)', baseDamage: [60, 90, 120, 150, 180], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.275 }], comboLabel: '3s' },
      ],
    },
  ],

  // ── Ryze ──
  // Q: Overload — 70/90/110/130/150 + 45% AP + 3% bonus mana.
  // E→Q on marked: bonus damage scales with R rank: +25/50/75/100%.
  // E+Q at R1 (×1.25): 88/113/138/163/188. E+Q at R3 (×2.0): 140/180/220/260/300.
  Ryze: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Overload', nameJa: 'オーバーロード', baseDamage: [70, 90, 110, 130, 150], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.45 }, { stat: 'bonusMana', ratio: 0.03 }] },
        { id: 'Q2', nameEn: 'Overload (E+Q, R1 +25%)', nameJa: 'オーバーロード (E+Q, R1 +25%)', baseDamage: [88, 113, 138, 163, 188], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.5625 }, { stat: 'bonusMana', ratio: 0.0375 }], comboLabel: 'E+Q R1' },
        { id: 'Q3', nameEn: 'Overload (E+Q, R2 +50%)', nameJa: 'オーバーロード (E+Q, R2 +50%)', baseDamage: [105, 135, 165, 195, 225], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.675 }, { stat: 'bonusMana', ratio: 0.045 }], comboLabel: 'E+Q R2' },
        { id: 'Q4', nameEn: 'Overload (E+Q, R3 +100%)', nameJa: 'オーバーロード (E+Q, R3 +100%)', baseDamage: [140, 180, 220, 260, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.90 }, { stat: 'bonusMana', ratio: 0.06 }], comboLabel: 'E+Q R3' },
      ],
    },
  ],

  // ── Nami ──
  // W: Ebb and Flow — bounces 3 times. Damage: 70-190 + 50% AP. -15% per bounce after 1st.
  Nami: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Ebb and Flow (1st hit)', nameJa: 'うねる波 (1回目)', baseDamage: [70, 100, 130, 160, 190], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.50 }] },
        { id: 'W2', nameEn: 'Ebb and Flow (2nd hit, -15%)', nameJa: 'うねる波 (2回目, -15%)', baseDamage: [60, 85, 111, 136, 162], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.43 }], comboLabel: '2nd bounce' },
      ],
    },
  ],

  // ── Nilah ──
  // Q: Formless Blade — 5/10/15/20/25 + 90/100/110/120/130% AD. Enhanced AAs: +110% AD in cone.
  Nilah: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Formless Blade (cast)', nameJa: 'フォームレスブレード (発動)', baseDamage: [5, 10, 15, 20, 25], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.90 }] },
        { id: 'Q2', nameEn: 'Formless Blade (enhanced AA)', nameJa: 'フォームレスブレード (強化AA)', baseDamage: [0, 0, 0, 0, 0], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.10 }], comboLabel: 'AA' },
      ],
    },
  ],

  // ── Smolder ──
  // Q: Super Scorcher Breath — 15-75 + 100% AD (physical). Applies on-hit.
  // At 25 stacks: +15 (+8% AD) true damage
  // At 125 stacks: explosion for 30 (+3% maxHP target) magic
  // At 225 stacks: explosion burns for additional damage
  Smolder: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Super Scorcher Breath', nameJa: 'スーパースコーチャーブレス', baseDamage: [65, 80, 95, 110, 125], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 1.3 }] },
      ],
    },
  ],

  // ── Lissandra ──
  // R: Frozen Tomb — on enemy: 150/250/350 + 75% AP (magic). Self-cast: no damage.
  Lissandra: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Frozen Tomb (on enemy)', nameJa: 'フローズントゥーム (対象指定)', baseDamage: [150, 250, 350], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.75 }] },
      ],
    },
  ],

  // ── Soraka ──
  // Q: Starcall — 85/120/155/190/225 + 35% AP (magic)
  // E: Equinox — 70/95/120/145/170 + 40% AP (magic, zone + root detonation)
  Soraka: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Equinox (zone)', nameJa: 'イクイノックス (ゾーン)', baseDamage: [70, 95, 120, 145, 170], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.40 }] },
        { id: 'E2', nameEn: 'Equinox (root detonation)', nameJa: 'イクイノックス (ルート爆発)', baseDamage: [70, 95, 120, 145, 170], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.40 }], comboLabel: 'Root' },
      ],
    },
  ],

  // ── Janna ──
  // Q: Howling Gale — 60/85/110/135/160 + 35% AP (min) to 120/170/220/270/320 + 70% AP (max charge)
  Janna: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Howling Gale (minimum)', nameJa: 'ハウリングゲイル (最小)', baseDamage: [60, 85, 110, 135, 160], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.35 }] },
        { id: 'Q2', nameEn: 'Howling Gale (max charge)', nameJa: 'ハウリングゲイル (最大溜め)', baseDamage: [120, 170, 220, 270, 320], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.70 }], comboLabel: 'Max' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Zephyr', nameJa: 'ゼファー', baseDamage: [55, 85, 115, 145, 175], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.50 }] },
      ],
    },
  ],

  // ── Taric ──
  // E: Dazzle — 90/130/170/210/250 + 50% AP + 50% armor (magic)
  Taric: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Dazzle', nameJa: 'スタンライト', baseDamage: [90, 130, 170, 210, 250], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.50 }] },
      ],
    },
  ],

  // ── Yuumi ──
  // Q: Prowling Projectile — unempowered: 60/95/130/165/200/235 + 20% AP
  // Empowered (attached, max range): 100/175/250/325/400 + 60% AP
  Yuumi: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Prowling Projectile', nameJa: 'うろつく弾 (通常)', baseDamage: [60, 95, 130, 165, 200], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.20 }] },
        { id: 'Q2', nameEn: 'Prowling Projectile (empowered)', nameJa: 'うろつく弾 (強化)', baseDamage: [100, 175, 250, 325, 400], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.60 }], comboLabel: 'Empowered' },
      ],
    },
  ],

  // ── Milio ──
  // Q: Ultra Mega Fire Kick — 80/140/200/260/320 + 120% AP (magic)
  Milio: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Ultra Mega Fire Kick', nameJa: 'ウルトラメガファイアキック', baseDamage: [80, 140, 200, 260, 320], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.20 }] },
      ],
    },
  ],

  // ── Mel ──
  // Q: Luminous Barrage — fires 6-10 bolts (by rank), each 13/16/19/22/25 + 8.5% AP magic
  Mel: [
    {
      skillKey: 'Q',
      subCasts: [
        {
          id: 'Q1',
          nameEn: 'Luminous Barrage (per bolt)',
          nameJa: '輝きの連撃 (1発)',
          baseDamage: [13, 16, 19, 22, 25],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.085 }],
          distanceMultiplier: { min: 6, max: 10, defaultPct: 60, labelEn: 'Bolts Hit', labelJa: '命中弾数' },
        },
      ],
    },
  ],

  // ── Renata Glasc ──
  // Q: Handshake — 80/125/170/215/260 + 80% AP (magic)
  // E: Loyalty Program — 65/95/125/155/185 + 55% AP per wave (magic)
  RenataGlasc: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Handshake', nameJa: 'ハンドシェイク', baseDamage: [80, 125, 170, 215, 260], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.80 }] },
      ],
    },
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Loyalty Program (per wave)', nameJa: 'ロイヤルティプログラム (1波)', baseDamage: [65, 95, 125, 155, 185], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.55 }] },
        { id: 'E2', nameEn: 'Loyalty Program (2 waves)', nameJa: 'ロイヤルティプログラム (2波)', baseDamage: [130, 190, 250, 310, 370], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 1.10 }], comboLabel: '2 waves' },
      ],
    },
  ],

  // ── Ivern ──
  // E: Triggerseed — shield pops: 70/95/120/145/170 + 80% AP (magic)
  Ivern: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Triggerseed (pop)', nameJa: 'トリガーシード (爆発)', baseDamage: [60, 90, 120, 150, 180], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.70 }] },
      ],
    },
  ],

  // ── Nocturne ──
  // Q: Duskbringer — 65/110/155/200/245 + 85% bonus AD (physical)
  Nocturne: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Duskbringer', nameJa: 'ダスクブリンガー', baseDamage: [65, 110, 155, 200, 245], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.85 }] },
      ],
    },
  ],

  // ── Lilia ──  (note: already has entries above for Q outer/inner. Adding R)
  // R: Lilting Lullaby — 100/150/200 + 30% AP (magic) on sleep break

  // ── Kennen ──
  // R: Slicing Maelstrom — up to 3 bolts per target: 40/75/110 + 22.5% AP per bolt (magic)
  Kennen: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'Slicing Maelstrom (1 bolt)', nameJa: 'スライシングマエルストーム (1本)', baseDamage: [40, 75, 110], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.225 }] },
        { id: 'R3', nameEn: 'Slicing Maelstrom (3 bolts)', nameJa: 'スライシングマエルストーム (3本)', baseDamage: [120, 225, 330], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.675 }], comboLabel: '3 bolts' },
      ],
    },
  ],

  // ── Wukong ──  (already has Q/E above. Adding R)
  // R: Cyclone — spins twice: 50-275 + 110% bonus AD per spin over 2s (physical). 2nd cast = same.

  // ── Mordekaiser ──  (already has Q above. Adding passive)
  // P: Darkness Rise — 2-8 + 1/1.5/2/2.5/3% max HP + 30% AP per second (magic)

  // ── Lillia ──
  // R: Lilting Lullaby — applied on dreaming enemies
  // 100/150/200 + 30% AP magic damage when awoken

  // ── Jayce ──  (already has cannon/hammer Q/W/E above)

  // ── Lucian ──
  // R: The Culling — fires 22 + (4 × R rank) shots. Each: 15-45 + 25% AD + 15% AP
  Lucian: [
    {
      skillKey: 'R',
      subCasts: [
        { id: 'R1', nameEn: 'The Culling (per shot)', nameJa: 'ザ・カリング (1発)', baseDamage: [15, 30, 45], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.25 }, { stat: 'ap', ratio: 0.15 }] },
        { id: 'R22', nameEn: 'The Culling (22 shots)', nameJa: 'ザ・カリング (22発)', baseDamage: [330, 660, 990], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 5.50 }, { stat: 'ap', ratio: 3.30 }], comboLabel: '22 shots' },
      ],
    },
  ],

  // ── Twitch ──  (already has E above)
  // R: Spray and Pray — AAs gain +300 range and deal bonus AD. No override needed.

  // ── Quinn ──
  // Q: Blinding Assault — 20/45/70/95/120 + 80/90/100/110/120% AD + 50% AP (physical)
  // E: Vault — 40/70/100/130/160 + 20% bonus AD (physical)
  Quinn: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Blinding Assault', nameJa: 'ブラインドアサルト', baseDamage: [20, 45, 70, 95, 120], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.80 }, { stat: 'ap', ratio: 0.50 }] },
      ],
    },
  ],

  // ── Olaf ──
  // Q: Undertow — 65/115/165/215/265 + 100% bonus AD (physical). Pick up = reduced CD.
  // E: Reckless Swing — 70/115/160/205/250 + 50% AD (true damage)
  Olaf: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Reckless Swing', nameJa: 'レックレススウィング', baseDamage: [70, 115, 160, 205, 250], damageType: 'true', scalings: [{ stat: 'ad', ratio: 0.50 }] },
      ],
    },
  ],

  // ── Jarvan IV ──
  // Q: Dragon Strike — 80/120/160/200/240 + 140% bonus AD (physical)
  // E+Q combo: Q+E knock-up, combined damage
  JarvanIV: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Dragon Strike', nameJa: 'ドラゴンストライク', baseDamage: [80, 120, 160, 200, 240], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 1.40 }] },
      ],
    },
  ],

  // ── Vi ──  (already has Q/E above)
  // W: Denting Blows — 3rd hit: 4/5.5/7/8.5/10% target max HP (physical). Min 20-100.
  // Already tracked via combo passive.

  // ── Trundle ──  (already has Q above)
  // Q: Chomp — 20/40/60/80/100 + 15/25/35/45/55% AD. Already in overrides.

  // ── Shaco ──
  // E: Two-Shiv Poison — 70/95/120/145/170 + 80% bonus AD + 60% AP (magic)
  // Backstab passive: +130% damage from behind
  Shaco: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Two-Shiv Poison', nameJa: 'トゥーシブポイズン', baseDamage: [70, 95, 120, 145, 170], damageType: 'magic', scalings: [{ stat: 'bonusAd', ratio: 0.80 }, { stat: 'ap', ratio: 0.60 }] },
      ],
    },
  ],

  // ── Wukong ──  (already in list above)

  // ── Kha'Zix ──  (already has Q/W/E above with evolution)

  // ── Lee Sin ──  (already has Q/R above)

  // ── Elise ──  (already has human/spider forms above)

  // ── Nidalee ──  (already has human/cougar forms above)

  // ── Volibear ──  (already has Q/W/E above)

  // ── Evelynn ──  (already has Q/E/R above)

  // ── Sylas ──  (already has P/Q/E above)

  // ── Hecarim ──  (already has Q/E above)

  // ── Pantheon ──  (already has Q/W/E above)

  // ── Lillia ──  (already has Q above)

  // ── Graves ──  (already has Q/R above)

  // ── Kayn ──  (already has Q/W above with forms)

  // ── RekSai ──  (already has Q/W/E above)

  // ── Rengar ──  (already has Q above)

  // ── Master Yi ──  (already has Q/E above)

  // ── Camille ──  (already has Q/W above)

  // ── Fizz ──  (already has Q/W/E/R above)

  // ── Galio ──  (already has Q/W/E above)

  // ── Gragas ──  (already has Q/W/E above)

  // ── Mordekaiser ──  (already has Q above)
  // P: Darkness Rise — 2-8 + 1-3% maxHP + 30% AP per second (magic)
  // Already handled by existing entry. Adding R:
  // R: Realm of Death — 10% target max HP steal + 7% target stats

  // ── Cassiopeia ──
  // E: Twin Fang — 52-120 + 10% AP (base). On poisoned: +10-90 + 60% AP bonus.
  // Already has combo passive for poison bonus. Adding base override:
  Cassiopeia: [
    {
      skillKey: 'E',
      subCasts: [
        // Base damage scales with level (52-128), not by rank. Using rank 1-5 as approximation at levels 1/4/7/10/13.
        { id: 'E1', nameEn: 'Twin Fang (base)', nameJa: 'ツインファング (基本)', baseDamage: [52, 70, 88, 106, 128], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.10 }] },
      ],
    },
  ],

  // ── Aphelios ──  (already has E/R above)
  // Severum Q: Onslaught — 6 + (3 × AS) shots. 25% AD + 10% AP per shot (physical)
  // Crescendum Q: Sentry turret — 25-85 + 50% bonus AD + 50% AP per hit

  // ── Zyra ──  (already has Q/E/R above)
  // P plant damage already handled

  // ── Heimerdinger ──  (already has turret Q above)

  // ── Vel'Koz ──  (already has Q/W/R above)

  // ── Xerath ──  (already has Q/W/E/R above)

  // ── Brand ──  (already has Q/W/E/R above)

  // ── Annie ──  (already has Q/W/R above)

  // ── Karthus ──  (already has Q/R above)

  // ── Diana ──  (already has Q/W/R above)

  // ── Fiddlesticks ──  (already has W/R above)

  // ── Teemo ──  (already has E/R above)

  // ── Malphite ──  (already has Q/W/E/R above)

  // ── Skarner ──  (already has Q/E above)

  // ── Maokai ──  (already has Q/W/E above)

  // ── Sejuani ──  (already has Q/W/E above)

  // ── Zac ──  (already has Q/W/E above)

  // ── Ornn ──  (already has Q/W/E/R above)

  // ── Mundo ──  (already has Q/W/E above)

  // ── K'Sante ──  (already has Q/W/E above with forms)

  // ── Nunu ──  (already has Q/W/E above)

  // ── Amumu ──  (already has Q/W/E/R above)

  // ── Alistar ──  (already has Q/W above)

  // ── Blitzcrank ──  (already has Q/E/R above)

  // ── Pyke ──  (already has Q/R above)

  // ── Senna ──  (already has Q above)

  // ── Leona ──  (already has Q/W/E/R above)

  // ── Nautilus ──  (already has Q/R above)

  // ── Lulu ──  (already has Q/E above)

  // ── Morgana ──  (already has Q/W/R above)

  // ── Sona ──  (already has Q/W above)

  // ── Thresh ──  (already has Q/E above)

  // ── Braum ──
  // Q: Winter's Bite — 75/125/175/225/275 + 2.5% max HP (magic)
  Braum: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: "Winter's Bite", nameJa: 'ウィンターズバイト', baseDamage: [75, 125, 175, 225, 275], damageType: 'magic', scalings: [{ stat: 'maxHp', ratio: 0.025 }] },
      ],
    },
  ],

  // ── Poppy ──  (already has Q/E above)

  // ── Rek'Sai ──  (already has Q/W/E above)

  // ── Trundle ──  (already has Q above)

  // ── Tryndamere ──  (already has E above)
  // No new overrides needed

  // ── Viego ──  (already has Q/R above)

  // ── Warwick ──  (already has Q/R above)

  // ── Volibear ──  (already has Q/W/E above)

  // ── Renekton ──  (already has Q/W/E above)

  // ── Seraphine ──
  // Q: High Note — 55/70/85/100/115 + 45% AP magic (max 150% at low HP targets)
  // E: Beat Drop — 60/80/100/120/140 + 35% AP magic (roots if already slowed)
  Seraphine: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'High Note (standard)', nameJa: 'ハイノート (通常)', baseDamage: [55, 70, 85, 100, 115], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.45 }] },
        { id: 'Q2', nameEn: 'High Note (max, low HP)', nameJa: 'ハイノート (最大、低HP)', baseDamage: [82, 105, 127, 150, 172], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.675 }], comboLabel: '最大' },
      ],
    },
  ],

  // ── Vex ──
  // Q: Mistral Bolt — initial 60/105/150/195/240 + 60% AP, decelerated 30/52.5/75/97.5/120 + 30% AP
  Vex: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Mistral Bolt (initial)', nameJa: '無気力ショット (初速)', baseDamage: [60, 105, 150, 195, 240], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.60 }] },
        { id: 'Q2', nameEn: 'Mistral Bolt (decelerated)', nameJa: '無気力ショット (減速)', baseDamage: [30, 52, 75, 97, 120], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.30 }], comboLabel: '減' },
      ],
    },
  ],

  // ── Yorick ──
  // Q: Last Rites — enhanced AA: 30/55/80/105/130 + 40% AD physical
  // E: Mourning Mist — 70/105/140/175/210 + 70% AP magic (marks target)
  Yorick: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Last Rites (bonus)', nameJa: '葬送 (追加)', baseDamage: [30, 55, 80, 105, 130], damageType: 'physical', scalings: [{ stat: 'ad', ratio: 0.40 }] },
      ],
    },
  ],

  // ── Rakan ──
  // Q: Gleaming Quill — 70/115/160/205/250 + 70% AP magic
  // W: Grand Entrance — 70/120/170/220/270 + 70% AP magic
  Rakan: [
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Grand Entrance', nameJa: '華麗なる登場', baseDamage: [70, 120, 170, 220, 270], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.70 }] },
      ],
    },
  ],

  // ── Zilean ──
  // Q: Time Bomb — 75/115/165/230/300 + 90% AP magic (double bomb stun = 2x)
  Zilean: [
    {
      skillKey: 'Q',
      subCasts: [
        { id: 'Q1', nameEn: 'Time Bomb (single)', nameJa: 'タイムボム (単発)', baseDamage: [75, 115, 165, 230, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.90 }] },
        { id: 'Q2', nameEn: 'Time Bomb (double, stun)', nameJa: 'タイムボム (二重、スタン)', baseDamage: [75, 115, 165, 230, 300], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.90 }], comboLabel: '2重' },
      ],
    },
  ],

  // ── Zyra ──
  // E: Grasping Roots — 60/95/130/165/200 + 60% AP magic
  Zyra: [
    {
      skillKey: 'E',
      subCasts: [
        { id: 'E1', nameEn: 'Grasping Roots', nameJa: '捕縛の根', baseDamage: [60, 95, 130, 165, 200], damageType: 'magic', scalings: [{ stat: 'ap', ratio: 0.60 }] },
      ],
    },
  ],
};

/**
 * Get skill overrides for a champion.
 * Returns empty array if no overrides are defined.
 */
export function getSkillOverrides(championId: string): ChampionSkillOverride[] {
  return OVERRIDES[championId] ?? [];
}

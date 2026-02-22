import type { SkillSubCast } from '@/types';

// ===== Champion Skill Override Registry =====
// Defines multi-hit skills (sub-casts) for champions where the default
// Meraki single-damage model is insufficient.

export interface ChampionSkillOverride {
  skillKey: 'Q' | 'W' | 'E' | 'R' | 'P';
  subCasts: SkillSubCast[];
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
  // Q: initial hit (magic) + empowered auto (magic, with Lichbane-like proc)
  Viktor: [
    {
      skillKey: 'Q',
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
          scalings: [{ stat: 'ap', ratio: 0.6 }],
        },
      ],
    },
    {
      skillKey: 'E',
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
          nameEn: 'Death Ray (aftershock)',
          nameJa: 'デスレイ (余震)',
          baseDamage: [20, 50, 80, 110, 140],
          damageType: 'magic',
          scalings: [{ stat: 'ap', ratio: 0.6 }],
        },
      ],
    },
    {
      skillKey: 'R',
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
        {
          id: 'Q1',
          nameEn: 'Comet Spear (tap)',
          nameJa: 'コメットスピア (短押し)',
          baseDamage: [70, 100, 130, 160, 190],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.15 }],
        },
        {
          id: 'Q2',
          nameEn: 'Comet Spear (charge)',
          nameJa: 'コメットスピア (溜め)',
          baseDamage: [70, 115, 160, 205, 250],
          damageType: 'physical',
          scalings: [{ stat: 'bonusAd', ratio: 1.15 }],
        },
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
        { id: 'Q1', nameEn: 'Reaping Slash (Base)', nameJa: 'リーピングスラッシュ (通常)', baseDamage: [75, 95, 115, 135, 155], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.65 }], formGroup: 'base' },
        { id: 'Q2', nameEn: 'Reaping Slash (Shadow)', nameJa: 'リーピングスラッシュ (影)', baseDamage: [75, 95, 115, 135, 155], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.65 }], formGroup: 'shadow' },
        { id: 'Q3', nameEn: 'Reaping Slash (Rhaast)', nameJa: 'リーピングスラッシュ (ラースト)', baseDamage: [75, 95, 115, 135, 155], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.65 }, { stat: 'targetMaxHp', ratio: 0.05 }], formGroup: 'rhaast' },
      ],
    },
    {
      skillKey: 'W',
      subCasts: [
        { id: 'W1', nameEn: 'Blade\'s Reach (Base)', nameJa: 'ブレードリーチ (通常)', baseDamage: [90, 135, 180, 225, 270], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.6 }], formGroup: 'base' },
        { id: 'W2', nameEn: 'Blade\'s Reach (Shadow)', nameJa: 'ブレードリーチ (影)', baseDamage: [90, 135, 180, 225, 270], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.6 }], formGroup: 'shadow' },
        { id: 'W3', nameEn: 'Blade\'s Reach (Rhaast)', nameJa: 'ブレードリーチ (ラースト)', baseDamage: [90, 135, 180, 225, 270], damageType: 'physical', scalings: [{ stat: 'bonusAd', ratio: 0.6 }], formGroup: 'rhaast' },
      ],
    },
  ],

  // ── K'Sante ──
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
};

/**
 * Get skill overrides for a champion.
 * Returns empty array if no overrides are defined.
 */
export function getSkillOverrides(championId: string): ChampionSkillOverride[] {
  return OVERRIDES[championId] ?? [];
}

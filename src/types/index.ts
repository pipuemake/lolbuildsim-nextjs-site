// ===== Locale =====
export type Locale = 'ja' | 'en';

// ===== Champion =====
export interface ChampionStats {
  hp: number;
  hpPerLevel: number;
  mp: number;
  mpPerLevel: number;
  moveSpeed: number;
  armor: number;
  armorPerLevel: number;
  magicResist: number;
  magicResistPerLevel: number;
  attackRange: number;
  hpRegen: number;
  hpRegenPerLevel: number;
  mpRegen: number;
  mpRegenPerLevel: number;
  attackDamage: number;
  attackDamagePerLevel: number;
  attackSpeed: number;
  attackSpeedPerLevel: number;
  crit: number;
  critPerLevel: number;
}

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  maxrank: number;
  cooldown: number[];
  cost: number[];
  costType: string;
  image: string;
}

export interface ChampionPassive {
  name: string;
  description: string;
  image: string;
}

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[]; // Fighter, Mage, Assassin, etc.
  stats: ChampionStats;
  spells: ChampionSpell[];
  passive: ChampionPassive;
  image: string;
  splash: string;
}

// ===== Skill Scaling (from Meraki) =====
export type ScalingStat =
  | 'ad'
  | 'bonusAd'
  | 'ap'
  | 'hp'
  | 'bonusHp'
  | 'armor'
  | 'mr'
  | 'mana'
  | 'bonusMana'
  | 'attackSpeed'
  | 'maxHp'
  | 'targetMaxHp'
  | 'targetCurrentHp'
  | 'targetMissingHp';

export interface SkillScaling {
  stat: ScalingStat;
  ratio: number; // e.g., 0.6 = 60%
}

// Sub-cast definition for multi-hit skills (e.g. Aatrox Q1/Q2/Q3)
export interface SkillSubCast {
  id: string;              // 'Q1', 'Q2', 'Q3'
  nameEn: string;
  nameJa: string;
  baseDamage: number[];    // per rank
  damageType: 'physical' | 'magic' | 'true';
  scalings: SkillScaling[];
  /** Optional distance-based damage multiplier range (e.g. Nidalee Q: min 1.0, max 3.0) */
  distanceMultiplier?: { min: number; max: number; defaultPct: number; labelEn: string; labelJa: string };
  /** Override icon URL (e.g. Nidalee cougar form icons from CommunityDragon) */
  image?: string;
  /** Short label shown on combo bar (e.g. '往' / '復' for outgoing/returning) */
  comboLabel?: string;
  /** Form group for form-switching champions (e.g. 'base', 'shadow', 'rhaast'). Only shown when the matching form is selected. */
  formGroup?: string;
}

export interface SkillData {
  key: 'Q' | 'W' | 'E' | 'R' | 'P';
  name: string;
  maxRank: number;
  baseDamage: number[]; // per rank
  damageType: 'physical' | 'magic' | 'true';
  scalings: SkillScaling[];
  cooldown: number[]; // per rank
  cost: number[]; // per rank
  costType: string;
  subCasts?: SkillSubCast[];  // multi-hit skill sub-casts
}

// ===== Items =====
export interface ItemStats {
  ad?: number;
  ap?: number;
  hp?: number;
  mana?: number;
  armor?: number;
  mr?: number;
  attackSpeed?: number;
  critChance?: number;
  abilityHaste?: number;
  lethality?: number;
  flatMagicPen?: number;
  percentMagicPen?: number;
  percentArmorPen?: number;
  moveSpeed?: number;
  moveSpeedPercent?: number;
  hpRegen?: number;
  mpRegen?: number;
  lifeSteal?: number;
  omnivamp?: number;
  tenacity?: number;
  ultimateHaste?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  plaintext: string;
  stats: ItemStats;
  gold: {
    base: number;
    total: number;
    sell: number;
    purchasable: boolean;
  };
  from: string[]; // component item IDs
  into: string[]; // items this builds into
  tags: string[];
  image: string;
  depth?: number; // item tier (1=basic, 2=component, 3=completed)
}

// ===== Runes =====
export interface Rune {
  id: number;
  key: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  icon: string;
}

export interface RuneSlot {
  runes: Rune[];
}

export interface RunePath {
  id: number;
  key: string;
  name: string;
  icon: string;
  slots: RuneSlot[]; // [keystones, slot1, slot2, slot3]
}

export interface StatShard {
  id: string;
  name: string;
  description: string;
  value: Partial<ItemStats>;
}

export interface SelectedRunes {
  primaryPath: number; // RunePath id
  keystone: number; // Rune id
  primarySlot1: number;
  primarySlot2: number;
  primarySlot3: number;
  secondaryPath: number;
  secondarySlot1: number;
  secondarySlot2: number;
  statShard1: string;
  statShard2: string;
  statShard3: string;
}

// ===== Build Config =====
export interface BuildConfig {
  championId: string;
  level: number;
  items: (string | null)[]; // 6 item IDs or null for empty slot
  runes: SelectedRunes;
  skillRanks: {
    Q: number;
    W: number;
    E: number;
    R: number;
  };
}

export interface SimulationState {
  ally: BuildConfig;
  enemy: BuildConfig;
}

// ===== Bonus Stats (stacks, passives, runes) =====
export interface BonusStats {
  ad?: number;
  ap?: number;
  hp?: number;
  armor?: number;
  mr?: number;
  attackSpeed?: number;
  critChance?: number;
  attackRange?: number;
  moveSpeed?: number;
  lethality?: number;
  abilityHaste?: number;
  flatMagicPen?: number;
  percentMagicPen?: number;
  percentArmorPen?: number;
  lifeSteal?: number;
  omnivamp?: number;
  tenacity?: number;
  ultimateHaste?: number;
  // Special modifiers
  critMultiplier?: number; // e.g. Yasuo/Yone double crit chance
  critDamageModifier?: number; // e.g. -0.175 for Yasuo/Yone reduced crit damage
}

export type ChampionBonusType = 'stack' | 'passive' | 'rune' | 'item';

export interface ChampionBonusDefinition {
  id: string;
  championId?: string; // undefined = generic / rune
  itemId?: string; // if set, only shown when this item is equipped
  type: ChampionBonusType;
  nameEn: string;
  nameJa: string;
  descriptionEn: string;
  descriptionJa: string;
  inputType: 'number' | 'toggle';
  min?: number;
  max?: number;
  defaultValue: number;
  /** Given the input value (stack count / toggle 0|1) and level, return bonus stats */
  calc: (value: number, level: number) => BonusStats;
}

// ===== Computed Stats (after all modifiers) =====
export interface ComputedStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  ad: number;
  baseAd: number;
  ap: number;
  armor: number;
  mr: number;
  attackSpeed: number;
  critChance: number;
  critMultiplier: number;
  moveSpeed: number;
  attackRange: number;
  abilityHaste: number;
  ultimateHaste: number;
  lethality: number;
  flatMagicPen: number;
  percentMagicPen: number;
  percentArmorPen: number;
  lifeSteal: number;
  omnivamp: number;
  tenacity: number;
  hpRegen: number;
  mpRegen: number;
  baseHp: number;
  baseMp: number;
}

// ===== On-Hit Effects =====
export type OnHitTrigger = 'onhit' | 'spellblade';

export interface ItemOnHitEffect {
  itemId: string;
  nameEn: string;
  nameJa: string;
  trigger: OnHitTrigger;
  damageType: 'physical' | 'magic' | 'true';
  calc: (attacker: ComputedStats, target: ComputedStats, level: number) => number;
}

export interface OnHitDamageResult {
  itemId: string;
  itemName: string;
  itemNameJa?: string;
  damageType: 'physical' | 'magic' | 'true';
  rawDamage: number;
  effectiveDamage: number;
  trigger: OnHitTrigger;
}

// ===== Item Active Effects =====
export interface ItemActiveEffect {
  itemId: string;
  nameEn: string;
  nameJa: string;
  damageType: 'physical' | 'magic' | 'true';
  calc: (attacker: ComputedStats, target: ComputedStats, level: number) => number;
}

export interface ItemActiveDamageResult {
  itemId: string;
  itemName: string;
  itemNameJa?: string;
  damageType: 'physical' | 'magic' | 'true';
  rawDamage: number;
  effectiveDamage: number;
}

// ===== Damage Results =====
export interface DamageResult {
  physical: number;
  magical: number;
  trueDamage: number;
  total: number;
  onHitEffects?: OnHitDamageResult[];
}

export interface SkillDamageResult {
  skillKey: 'Q' | 'W' | 'E' | 'R' | 'P';
  skillName: string;
  skillNameJa?: string;
  baseDamage: number;
  scaledDamage: number;
  totalRaw: number;
  totalAfterResist: number;
  damageType: 'physical' | 'magic' | 'true';
  subCastId?: string;  // sub-cast identifier (e.g. 'Q1', 'Q2')
  /** If true, this skill scales with targetMissingHp and should be applied last in combo */
  hasMissingHpScaling?: boolean;
  /** The ratio for targetMissingHp scaling (used for combo reordering) */
  missingHpRatio?: number;
}

export interface ComboDamageResult {
  skills: SkillDamageResult[];
  autoAttacks: number; // number of AAs in combo
  aaDamage: number;
  totalDamage: number;
  overkill: number; // damage beyond target HP
  killable: boolean;
}

// ===== DPS =====
export interface DPSResult {
  dps: number;
  effectiveAD: number;
  attackSpeed: number;
  critRate: number;
  critMultiplier: number;
  onHitDpsContribution?: number;
}

// ===== Effective HP =====
export interface EffectiveHPResult {
  physicalEHP: number;
  magicEHP: number;
  physicalReduction: number; // 0-1
  magicReduction: number; // 0-1
}

// ===== Haste =====
export interface HasteInfo {
  abilityHaste: number;
  ultimateHaste: number;
  cooldownReduction: number; // equivalent CDR %
  skillCooldowns: {
    key: string;
    baseCooldown: number;
    actualCooldown: number;
  }[];
  tenacity: number;
  ccReduction: number; // 0-1
}

// ===== Minions =====
export type MinionType = 'melee' | 'ranged' | 'cannon' | 'super';

export interface MinionStats {
  type: MinionType;
  hp: number;
  ad: number;
  armor: number;
  mr: number;
  attackSpeed: number;
  goldValue: number;
}

export interface TowerStats {
  hp: number;
  ad: number;
  armor: number;
  mr: number;
  attackSpeed: number;
  shotDamageGrowth: number; // cumulative damage increase per shot to same target
}

// ===== Summoner Spells =====
export interface SummonerSpell {
  id: string;
  name: string;
  nameJa: string;
  image: string; // DDragon spell image filename
  cooldown: number;
  damage?: (level: number) => number;
  damageType?: 'physical' | 'magic' | 'true';
}

// ===== Champion Combo Passive Effects =====
export type ComboPassiveInputType = 'stack' | 'toggle';

export interface ComboPassiveOnHit {
  damageType: 'physical' | 'magic' | 'true';
  calc: (value: number, attacker: ComputedStats, target: ComputedStats, level: number) => number;
  /** If true, calc already returns total combo damage (value × per-proc); don't multiply by AA count */
  perCombo?: boolean;
}

export interface ComboPassiveSkillBonus {
  skillKey: 'Q' | 'W' | 'E' | 'R' | 'P';
  damageType: 'physical' | 'magic' | 'true';
  calc: (value: number, attacker: ComputedStats, target: ComputedStats, level: number) => number;
}

export interface ChampionComboPassive {
  id: string;
  championId: string;
  nameEn: string;
  nameJa: string;
  descriptionEn: string;
  descriptionJa: string;
  inputType: ComboPassiveInputType;
  min?: number;
  max?: number;
  defaultValue: number;
  /** Stat bonuses (e.g. AS from Irelia stacks) */
  statBonus?: (value: number, level: number) => BonusStats;
  /** On-hit damage added to each AA */
  onHit?: ComboPassiveOnHit;
  /** Flat damage bonus added to a specific skill */
  skillBonus?: ComboPassiveSkillBonus;
}

// ===== HP Bar visualization =====
export interface DamageSegment {
  source: 'Q' | 'W' | 'E' | 'R' | 'AA' | 'P' | 'SUM' | 'ITEM';
  amount: number;
  color: string;
}

// ===== Data Dragon API types =====
export interface DDragonChampionListData {
  [key: string]: {
    id: string;
    key: string;
    name: string;
    title: string;
    tags: string[];
    stats: Record<string, number>;
    image: { full: string };
  };
}

export interface DDragonChampionDetail {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  stats: Record<string, number>;
  spells: {
    id: string;
    name: string;
    description: string;
    tooltip: string;
    maxrank: number;
    cooldown: number[];
    cost: number[];
    costType: string;
    image: { full: string };
  }[];
  passive: {
    name: string;
    description: string;
    image: { full: string };
  };
  image: { full: string };
}

export interface DDragonItemData {
  [key: string]: {
    name: string;
    description: string;
    plaintext: string;
    stats: Record<string, number>;
    gold: { base: number; total: number; sell: number; purchasable: boolean };
    from?: string[];
    into?: string[];
    tags: string[];
    image: { full: string };
    depth?: number;
    maps?: Record<string, boolean>;
    inStore?: boolean;
    requiredAlly?: string;
  };
}

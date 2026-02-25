import type {
  Champion,
  Item,
  SelectedRunes,
  StatShard,
  ComputedStats,
  BonusStats,
} from '@/types';

function growthAmount(base: number, growth: number, level: number): number {
  if (level <= 1) return base;
  return base + growth * (level - 1) * (0.7025 + 0.0175 * (level - 1));
}

export function computeBaseStats(
  champion: Champion,
  level: number
): Partial<ComputedStats> {
  const s = champion.stats;

  const bonusASPercent =
    s.attackSpeedPerLevel * (level - 1) * (0.7025 + 0.0175 * (level - 1));
  const attackSpeed = s.attackSpeed * (1 + bonusASPercent / 100);

  const baseHp = growthAmount(s.hp, s.hpPerLevel, level);
  const baseAd = growthAmount(s.attackDamage, s.attackDamagePerLevel, level);
  const baseMp = growthAmount(s.mp, s.mpPerLevel, level);

  return {
    hp: baseHp,
    maxHp: baseHp,
    mp: baseMp,
    maxMp: baseMp,
    ad: baseAd,
    baseAd,
    ap: 0,
    armor: growthAmount(s.armor, s.armorPerLevel, level),
    mr: growthAmount(s.magicResist, s.magicResistPerLevel, level),
    attackSpeed,
    critChance: 0,
    critMultiplier: 1.75,
    moveSpeed: s.moveSpeed,
    attackRange: s.attackRange,
    abilityHaste: 0,
    ultimateHaste: 0,
    lethality: 0,
    flatMagicPen: 0,
    percentMagicPen: 0,
    percentArmorPen: 0,
    lifeSteal: 0,
    omnivamp: 0,
    tenacity: 0,
    hpRegen: growthAmount(s.hpRegen, s.hpRegenPerLevel, level),
    mpRegen: growthAmount(s.mpRegen, s.mpRegenPerLevel, level),
    baseHp,
    baseMp,
  };
}

export function computeItemStats(items: Item[]): Partial<ComputedStats> {
  const result: Partial<ComputedStats> = {};

  for (const item of items) {
    const st = item.stats;
    if (st.ad) result.ad = (result.ad ?? 0) + st.ad;
    if (st.ap) result.ap = (result.ap ?? 0) + st.ap;
    if (st.hp) {
      result.hp = (result.hp ?? 0) + st.hp;
      result.maxHp = (result.maxHp ?? 0) + st.hp;
    }
    if (st.mana) {
      result.mp = (result.mp ?? 0) + st.mana;
      result.maxMp = (result.maxMp ?? 0) + st.mana;
    }
    if (st.armor) result.armor = (result.armor ?? 0) + st.armor;
    if (st.mr) result.mr = (result.mr ?? 0) + st.mr;
    if (st.attackSpeed) result.attackSpeed = (result.attackSpeed ?? 0) + st.attackSpeed;
    if (st.critChance) result.critChance = (result.critChance ?? 0) + st.critChance;
    if (st.abilityHaste) result.abilityHaste = (result.abilityHaste ?? 0) + st.abilityHaste;
    if (st.ultimateHaste) result.ultimateHaste = (result.ultimateHaste ?? 0) + st.ultimateHaste;
    if (st.lethality) result.lethality = (result.lethality ?? 0) + st.lethality;
    if (st.flatMagicPen) result.flatMagicPen = (result.flatMagicPen ?? 0) + st.flatMagicPen;
    if (st.percentMagicPen) result.percentMagicPen = (result.percentMagicPen ?? 0) + st.percentMagicPen;
    if (st.percentArmorPen) result.percentArmorPen = (result.percentArmorPen ?? 0) + st.percentArmorPen;
    if (st.moveSpeed) result.moveSpeed = (result.moveSpeed ?? 0) + st.moveSpeed;
    if (st.hpRegen) result.hpRegen = (result.hpRegen ?? 0) + st.hpRegen;
    if (st.mpRegen) result.mpRegen = (result.mpRegen ?? 0) + st.mpRegen;
    if (st.lifeSteal) result.lifeSteal = (result.lifeSteal ?? 0) + st.lifeSteal;
    if (st.omnivamp) result.omnivamp = (result.omnivamp ?? 0) + st.omnivamp;
    if (st.tenacity) result.tenacity = (result.tenacity ?? 0) + st.tenacity;
  }

  return result;
}

export function computeRuneStats(
  _runes: SelectedRunes,
  statShards: StatShard[]
): Partial<ComputedStats> {
  const result: Partial<ComputedStats> = {};

  for (const shard of statShards) {
    const v = shard.value;
    if (v.ad) result.ad = (result.ad ?? 0) + v.ad;
    if (v.ap) result.ap = (result.ap ?? 0) + v.ap;
    if (v.hp) {
      result.hp = (result.hp ?? 0) + v.hp;
      result.maxHp = (result.maxHp ?? 0) + v.hp;
    }
    if (v.mana) {
      result.mp = (result.mp ?? 0) + v.mana;
      result.maxMp = (result.maxMp ?? 0) + v.mana;
    }
    if (v.armor) result.armor = (result.armor ?? 0) + v.armor;
    if (v.mr) result.mr = (result.mr ?? 0) + v.mr;
    if (v.attackSpeed) result.attackSpeed = (result.attackSpeed ?? 0) + v.attackSpeed;
    if (v.critChance) result.critChance = (result.critChance ?? 0) + v.critChance;
    if (v.abilityHaste) result.abilityHaste = (result.abilityHaste ?? 0) + v.abilityHaste;
    if (v.ultimateHaste) result.ultimateHaste = (result.ultimateHaste ?? 0) + v.ultimateHaste;
    if (v.lethality) result.lethality = (result.lethality ?? 0) + v.lethality;
    if (v.flatMagicPen) result.flatMagicPen = (result.flatMagicPen ?? 0) + v.flatMagicPen;
    if (v.percentMagicPen) result.percentMagicPen = (result.percentMagicPen ?? 0) + v.percentMagicPen;
    if (v.percentArmorPen) result.percentArmorPen = (result.percentArmorPen ?? 0) + v.percentArmorPen;
    if (v.moveSpeed) result.moveSpeed = (result.moveSpeed ?? 0) + v.moveSpeed;
    if (v.hpRegen) result.hpRegen = (result.hpRegen ?? 0) + v.hpRegen;
    if (v.mpRegen) result.mpRegen = (result.mpRegen ?? 0) + v.mpRegen;
    if (v.lifeSteal) result.lifeSteal = (result.lifeSteal ?? 0) + v.lifeSteal;
    if (v.omnivamp) result.omnivamp = (result.omnivamp ?? 0) + v.omnivamp;
    if (v.tenacity) result.tenacity = (result.tenacity ?? 0) + v.tenacity;
  }

  return result;
}

export function computeStats(
  champion: Champion,
  level: number,
  items: Item[],
  runes: SelectedRunes,
  statShards: StatShard[] = [],
  bonusStats?: BonusStats
): ComputedStats {
  const base = computeBaseStats(champion, level);
  const itemStats = computeItemStats(items);
  const runeStats = computeRuneStats(runes, statShards);

  function sum(key: keyof ComputedStats): number {
    return (
      ((base as Record<string, number>)[key] ?? 0) +
      ((itemStats as Record<string, number>)[key] ?? 0) +
      ((runeStats as Record<string, number>)[key] ?? 0)
    );
  }

  // Apply bonus stats from stacks/passives/runes
  const bonus = bonusStats ?? {};

  let critChance = Math.min(1.0, sum('critChance') + (bonus.critChance ?? 0));

  // Yasuo/Yone crit doubling via critMultiplier bonus
  // If bonus has critMultiplier, it's a multiplier on critChance (e.g. 2.0 = double)
  if (bonus.critMultiplier && bonus.critMultiplier > 0) {
    critChance = Math.min(1.0, critChance * bonus.critMultiplier);
  }

  // Infinity Edge: if crit >= 60%, critMultiplier becomes 2.25
  const hasIE = items.some(
    (item) => item.name === "Infinity Edge" || item.id === "3031"
  );
  const critMultiplier = (hasIE && critChance >= 0.6 ? 2.25 : 1.75) + (bonus.critDamageModifier ?? 0);

  const hp = sum('hp') + (bonus.hp ?? 0);
  const mp = sum('mp');
  const baseAd = base.baseAd ?? 0;
  const baseHp = base.baseHp ?? 0;

  return {
    hp,
    maxHp: (base.maxHp ?? 0) + (itemStats.maxHp ?? 0) + (runeStats.maxHp ?? 0) + (bonus.hp ?? 0),
    mp,
    maxMp: (base.maxMp ?? 0) + (itemStats.maxMp ?? 0) + (runeStats.maxMp ?? 0),
    ad: sum('ad') + (bonus.ad ?? 0),
    baseAd,
    ap: sum('ap') + (bonus.ap ?? 0),
    armor: sum('armor') + (bonus.armor ?? 0),
    mr: sum('mr') + (bonus.mr ?? 0),
    attackSpeed: Math.min(2.5, sum('attackSpeed') + (bonus.attackSpeed ?? 0)),
    critChance,
    critMultiplier,
    moveSpeed: sum('moveSpeed') + (bonus.moveSpeed ?? 0),
    attackRange: (base.attackRange ?? champion.stats.attackRange) + (bonus.attackRange ?? 0),
    abilityHaste: sum('abilityHaste') + (bonus.abilityHaste ?? 0),
    ultimateHaste: sum('ultimateHaste') + (bonus.ultimateHaste ?? 0),
    lethality: sum('lethality') + (bonus.lethality ?? 0),
    flatMagicPen: sum('flatMagicPen') + (bonus.flatMagicPen ?? 0),
    percentMagicPen: sum('percentMagicPen') + (bonus.percentMagicPen ?? 0),
    percentArmorPen: sum('percentArmorPen') + (bonus.percentArmorPen ?? 0),
    lifeSteal: sum('lifeSteal') + (bonus.lifeSteal ?? 0),
    omnivamp: sum('omnivamp') + (bonus.omnivamp ?? 0),
    tenacity: sum('tenacity') + (bonus.tenacity ?? 0),
    hpRegen: sum('hpRegen'),
    mpRegen: sum('mpRegen'),
    baseHp,
    baseMp: base.baseMp ?? 0,
  };
}

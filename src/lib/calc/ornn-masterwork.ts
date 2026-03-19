/**
 * Ornn's Master Craftsman (P) — Masterwork item upgrade calculation
 *
 * At level 13+, Ornn's first eligible Legendary item is automatically upgraded.
 * Upgrading adds 1000 gold worth of stats, distributed equally among upgradeable stats.
 *
 * Upgradeable stats and their gold values (from wiki):
 *   AD: 35g, AP: 20g, Armor: 20g, MR: 18g, AS: 30g per 1%, AH: 31.25g, HP: 2.6667g
 *
 * Boots and support items are excluded.
 *
 * Ornn also gains +10% bonus AR/MR/HP, increased by +4% per masterwork upgrade
 * (max 5 upgrades → 30%).
 */

import { Item, BonusStats } from "@/types";

/** Gold value per stat point, used for Ornn masterwork distribution */
const GOLD_PER_STAT = {
  ad: 35,
  ap: 20,
  hp: 2.6667,
  armor: 20,
  mr: 18,
  attackSpeed: 30, // per 1% (0.01)
  abilityHaste: 31.25,
} as const;

type UpgradeableStat = keyof typeof GOLD_PER_STAT;

const UPGRADEABLE_STATS: UpgradeableStat[] = [
  "ad",
  "ap",
  "hp",
  "armor",
  "mr",
  "attackSpeed",
  "abilityHaste",
];

const MASTERWORK_GOLD = 1000;

/** Check if an item is eligible for masterwork upgrade (Legendary only) */
export function isEligibleForMasterwork(item: Item): boolean {
  // Boots are excluded
  if (item.tags.includes("Boots")) return false;
  // Must be Legendary: depth >= 3, built from components, doesn't build into anything
  if (!item.depth || item.depth < 3) return false;
  if (!item.from || item.from.length === 0) return false;
  if (item.into && item.into.length > 0) return false;
  return true;
}

/** Calculate the masterwork bonus stats for a single item */
export function calculateMasterworkBonusForItem(item: Item): BonusStats {
  if (!isEligibleForMasterwork(item)) return {};

  // Find which upgradeable stats this item has
  const presentStats: UpgradeableStat[] = [];
  for (const stat of UPGRADEABLE_STATS) {
    const val = item.stats[stat];
    if (val !== undefined && val > 0) {
      presentStats.push(stat);
    }
  }

  // If no upgradeable stats, add HP worth 1000g
  if (presentStats.length === 0) {
    return { hp: Math.round(MASTERWORK_GOLD / GOLD_PER_STAT.hp) };
  }

  // Distribute 1000g equally among present stats
  const goldPerStat = MASTERWORK_GOLD / presentStats.length;
  const bonus: BonusStats = {};

  for (const stat of presentStats) {
    const goldValue = GOLD_PER_STAT[stat];
    const statBonus = goldPerStat / goldValue;

    if (stat === "attackSpeed") {
      // AS is stored as decimal (0.01 = 1%), gold value is per 1%
      bonus.attackSpeed = (bonus.attackSpeed ?? 0) + statBonus / 100;
    } else {
      (bonus as Record<string, number>)[stat] =
        ((bonus as Record<string, number>)[stat] ?? 0) + statBonus;
    }
  }

  return bonus;
}

/**
 * Calculate Ornn's percentage bonus on bonus AR/MR/HP.
 * Base: +10%, +4% per masterwork upgrade, max 30% (5 upgrades).
 *
 * @param upgradeCount Number of masterwork upgrades performed (0-5)
 * @param bonusArmor Total bonus armor from all sources (items + runes + bonuses)
 * @param bonusMr Total bonus MR from all sources
 * @param bonusHp Total bonus HP from all sources
 */
export function calculateOrnnPercentBonus(
  upgradeCount: number,
  bonusArmor: number,
  bonusMr: number,
  bonusHp: number,
): BonusStats {
  const pct = 0.10 + 0.04 * Math.min(5, upgradeCount);
  return {
    armor: Math.floor(bonusArmor * pct),
    mr: Math.floor(bonusMr * pct),
    hp: Math.floor(bonusHp * pct),
  };
}


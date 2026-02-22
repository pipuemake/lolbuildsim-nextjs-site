import type { Item, ItemStats, DDragonItemData } from '@/types';
// Image filenames are stored raw; construct full URLs at component level

// Map DDragon stat keys to our ItemStats keys
function mapDDragonStats(raw: Record<string, number>): ItemStats {
  const stats: ItemStats = {};

  const mapping: Record<string, keyof ItemStats> = {
    FlatPhysicalDamageMod: 'ad',
    FlatMagicDamageMod: 'ap',
    FlatHPPoolMod: 'hp',
    FlatMPPoolMod: 'mana',
    FlatArmorMod: 'armor',
    FlatSpellBlockMod: 'mr',
    PercentAttackSpeedMod: 'attackSpeed',
    FlatCritChanceMod: 'critChance',
    FlatMovementSpeedMod: 'moveSpeed',
    PercentMovementSpeedMod: 'moveSpeedPercent',
    FlatHPRegenMod: 'hpRegen',
    FlatMPRegenMod: 'mpRegen',
    PercentLifeStealMod: 'lifeSteal',
    // DDragon doesn't expose AH, lethality, magic pen, omnivamp directly — parsed from description
  };

  for (const [ddKey, statKey] of Object.entries(mapping)) {
    const value = raw[ddKey];
    if (value !== undefined && value !== 0) {
      (stats as Record<string, number>)[statKey] = value;
    }
  }

  return stats;
}

// Parse hidden stats from DDragon item description HTML
// DDragon (ja_JP) uses the format: LABEL<attention>VALUE</attention>
// DDragon (en_US) uses the format: <attention>VALUE</attention> LABEL
function parseDescriptionStats(description: string): Partial<ItemStats> {
  const stats: Partial<ItemStats> = {};

  // Japanese format: LABEL<attention>VALUE</attention>
  const jaPattern = /([^<>\n]+)<attention>([\d.]+%?)<\/attention>/gi;
  let match: RegExpExecArray | null;

  while ((match = jaPattern.exec(description)) !== null) {
    const label = match[1].trim();
    const rawValue = match[2];
    const isPercent = rawValue.endsWith('%');
    const value = parseFloat(rawValue);

    if (isNaN(value)) continue;

    // スキルヘイスト (Ability Haste)
    if (label === 'スキルヘイスト') {
      stats.abilityHaste = (stats.abilityHaste ?? 0) + value;
    }
    // 脅威 (Lethality)
    else if (label === '脅威') {
      stats.lethality = (stats.lethality ?? 0) + value;
    }
    // 魔法防御貫通 (Magic Penetration) — flat or %
    else if (label === '魔法防御貫通' || label.endsWith('魔法防御貫通')) {
      if (isPercent) {
        stats.percentMagicPen = (stats.percentMagicPen ?? 0) + value / 100;
      } else {
        stats.flatMagicPen = (stats.flatMagicPen ?? 0) + value;
      }
    }
    // 物理防御貫通 (Armor Penetration) — always %
    else if (label === '物理防御貫通' || label.endsWith('物理防御貫通')) {
      stats.percentArmorPen = (stats.percentArmorPen ?? 0) + value / 100;
    }
    // オムニヴァンプ (Omnivamp)
    else if (label === 'オムニヴァンプ') {
      stats.omnivamp = (stats.omnivamp ?? 0) + value / 100;
    }
    // 行動妨害耐性 (Tenacity)
    else if (label === '行動妨害耐性') {
      stats.tenacity = (stats.tenacity ?? 0) + value / 100;
    }
  }

  // Also try English format for compatibility: <attention>VALUE</attention> LABEL
  const enPattern = /<attention>([\d.]+)<\/attention>\s*([^<\r\n]+)/gi;
  while ((match = enPattern.exec(description)) !== null) {
    const value = parseFloat(match[1]);
    const label = match[2].trim().toLowerCase();

    if (isNaN(value)) continue;

    if (label.startsWith('ability haste') && stats.abilityHaste === undefined) {
      stats.abilityHaste = (stats.abilityHaste ?? 0) + value;
    } else if (label.startsWith('lethality') && stats.lethality === undefined) {
      stats.lethality = (stats.lethality ?? 0) + value;
    } else if (label.startsWith('magic penetration') && !label.includes('%') && stats.flatMagicPen === undefined) {
      stats.flatMagicPen = (stats.flatMagicPen ?? 0) + value;
    } else if ((label.startsWith('% magic penetration') || (label.startsWith('magic penetration') && label.includes('%'))) && stats.percentMagicPen === undefined) {
      stats.percentMagicPen = (stats.percentMagicPen ?? 0) + value / 100;
    } else if ((label.startsWith('armor penetration') || label.startsWith('% armor penetration')) && stats.percentArmorPen === undefined) {
      stats.percentArmorPen = (stats.percentArmorPen ?? 0) + value / 100;
    } else if (label.startsWith('omnivamp') && stats.omnivamp === undefined) {
      stats.omnivamp = (stats.omnivamp ?? 0) + value / 100;
    } else if (label.startsWith('tenacity') && stats.tenacity === undefined) {
      stats.tenacity = (stats.tenacity ?? 0) + value / 100;
    }
  }

  return stats;
}

const SUMMONERS_RIFT_MAP_ID = '11';

// Items that should be included despite failing normal filters
// (transformed items, support quest upgrades, trinkets, wardstones, rune items)
const WHITELISTED_ITEM_IDS = new Set([
  // Transformed items (inStore=false, not purchasable but have real stats)
  '3040',   // セラフ エンブレイス (Seraph's Embrace)
  '3042',   // ムラマナ (Muramana)
  '3121',   // フィンブルウィンター (Fimbulwinter)
  '323040', // セラフ エンブレイス (support variant)
  '323042', // ムラマナ (support variant)
  '323121', // フィンブルウィンター (support variant)
  // Support quest upgrades
  '3866',   // ルーニック コンパス (Runic Compass)
  '3867',   // 世界の恵み (Bounty of Worlds)
  // Trinkets (gold=0 but standard items)
  '3330',   // 身代わり人形 (Scarecrow Effigy)
  '3340',   // ステルス ワード (Stealth Ward)
  '3363',   // ファーサイト オルタレーション (Farsight Alteration)
  '3364',   // オラクル レンズ (Oracle Lens)
  // Wardstones (marked not on SR in DDragon but used in game)
  '4638',   // ウォッチフル ワードストーン (Watchful Wardstone)
  '4643',   // ビジラント ワードストーン (Vigilant Wardstone)
  // Rune-generated boots
  '2422',   // ちょっとだけ魔法がかった靴 (Slightly Magical Footwear)
]);

export function parseItems(data: DDragonItemData): Item[] {
  const items: Item[] = [];

  for (const [id, raw] of Object.entries(data)) {
    const isWhitelisted = WHITELISTED_ITEM_IDS.has(id);

    if (!isWhitelisted) {
      // Only purchasable items
      if (!raw.gold.purchasable) continue;

      // Exclude items not available in store (e.g. Kalista's Black Spear component)
      if (raw.inStore === false) continue;

      // Exclude items requiring an ally (e.g. Kalista's Oathsworn bond item)
      if (raw.requiredAlly) continue;

      // Only include items available on Summoner's Rift (map 11)
      if (raw.maps && !raw.maps[SUMMONERS_RIFT_MAP_ID]) continue;
    }

    const baseStats = mapDDragonStats(raw.stats);
    const descStats = parseDescriptionStats(raw.description);

    // Merge description-parsed stats into base stats (description wins for hidden stats)
    const mergedStats: ItemStats = { ...baseStats };
    for (const [key, value] of Object.entries(descStats)) {
      if (value !== undefined && value !== 0) {
        (mergedStats as Record<string, number>)[key] = value as number;
      }
    }

    items.push({
      id,
      name: raw.name,
      description: raw.description,
      plaintext: raw.plaintext,
      stats: mergedStats,
      gold: {
        base: raw.gold.base,
        total: raw.gold.total,
        sell: raw.gold.sell,
        purchasable: raw.gold.purchasable,
      },
      from: raw.from ?? [],
      into: raw.into ?? [],
      tags: raw.tags,
      image: raw.image.full,
      depth: raw.depth,
    });
  }

  return items;
}

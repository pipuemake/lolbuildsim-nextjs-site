"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Item } from "@/types";

/** Stats-based category filters */
const ITEM_CATEGORIES = [
  { key: "all", ja: "全て", en: "All", stat: null },
  { key: "ad", ja: "AD", en: "AD", stat: "ad" },
  { key: "ap", ja: "AP", en: "AP", stat: "ap" },
  { key: "hp", ja: "HP", en: "HP", stat: "hp" },
  { key: "armor", ja: "物防", en: "Armor", stat: "armor" },
  { key: "mr", ja: "魔防", en: "MR", stat: "mr" },
  { key: "as", ja: "AS", en: "AS", stat: "attackSpeed" },
  { key: "crit", ja: "クリ", en: "Crit", stat: "critChance" },
  { key: "ls", ja: "LS", en: "LS", stat: "lifeSteal" },
  { key: "ah", ja: "AH", en: "AH", stat: "abilityHaste" },
  { key: "mana", ja: "マナ", en: "Mana", stat: "mana" },
  { key: "lethality", ja: "脅威", en: "Leth", stat: "lethality" },
  { key: "magicPen", ja: "魔貫", en: "MPen", stat: "flatMagicPen" },
  { key: "ms", ja: "MS", en: "MS", stat: "moveSpeed" },
  { key: "boots", ja: "ブーツ", en: "Boots", stat: null, tag: "Boots" },
] as const;

/** Parse DDragon item description HTML into structured parts */
function parseItemDescription(html: string): {
  stats: string;
  passive: string;
} {
  const statsMatch = html.match(/<stats>([\s\S]*?)<\/stats>/i);
  let stats = "";
  if (statsMatch) {
    stats = statsMatch[1]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<attention>(.*?)<\/attention>/gi, "$1")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  let passive = html
    .replace(/<mainText>/gi, "")
    .replace(/<\/mainText>/gi, "")
    .replace(/<stats>[\s\S]*?<\/stats>/gi, "")
    .replace(/<passive>(.*?)<\/passive>/gi, "【$1】")
    .replace(/<active>(.*?)<\/active>/gi, "【$1】")
    .replace(/<rarityMythic>(.*?)<\/rarityMythic>/gi, "$1")
    .replace(/<rarityLegendary>(.*?)<\/rarityLegendary>/gi, "$1")
    .replace(/<scaleAP>(.*?)<\/scaleAP>/gi, "$1")
    .replace(/<scaleAD>(.*?)<\/scaleAD>/gi, "$1")
    .replace(/<scaleMana>(.*?)<\/scaleMana>/gi, "$1")
    .replace(/<scaleHealth>(.*?)<\/scaleHealth>/gi, "$1")
    .replace(/<scaleArmor>(.*?)<\/scaleArmor>/gi, "$1")
    .replace(/<scaleMR>(.*?)<\/scaleMR>/gi, "$1")
    .replace(/<scaleLethality>(.*?)<\/scaleLethality>/gi, "$1")
    .replace(/<physicalDamage>(.*?)<\/physicalDamage>/gi, "$1")
    .replace(/<magicDamage>(.*?)<\/magicDamage>/gi, "$1")
    .replace(/<trueDamage>(.*?)<\/trueDamage>/gi, "$1")
    .replace(/<healing>(.*?)<\/healing>/gi, "$1")
    .replace(/<shield>(.*?)<\/shield>/gi, "$1")
    .replace(/<speed>(.*?)<\/speed>/gi, "$1")
    .replace(/<status>(.*?)<\/status>/gi, "$1")
    .replace(/<keywordStealth>(.*?)<\/keywordStealth>/gi, "$1")
    .replace(/<keywordMajor>(.*?)<\/keywordMajor>/gi, "$1")
    .replace(/<OnHit>(.*?)<\/OnHit>/gi, "$1")
    .replace(/<li>/gi, "")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { stats, passive };
}

function ItemTooltipContent({ item }: { item: Item }) {
  const { stats, passive } = useMemo(
    () => parseItemDescription(item.description),
    [item.description],
  );

  return (
    <div className="min-w-[200px] max-w-[280px]">
      <p className="font-bold text-amber-300 text-sm mb-1">{item.name}</p>
      {stats && (
        <div className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line mb-1.5 pb-1.5 border-b border-zinc-700/60">
          {stats}
        </div>
      )}
      {passive && (
        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line line-clamp-6">
          {passive}
        </p>
      )}
      <div className="flex items-center gap-1 mt-1.5 pt-1 border-t border-zinc-700/60">
        <span className="text-[11px] text-yellow-500 font-bold">
          {item.gold.total}g
        </span>
      </div>
    </div>
  );
}

/** Detailed preview panel for the hovered item */
function ItemPreview({ item }: { item: Item }) {
  const { stats, passive } = useMemo(
    () => parseItemDescription(item.description),
    [item.description],
  );

  return (
    <div className="p-3 space-y-2">
      <p className="font-bold text-amber-300 text-sm">{item.name}</p>
      {stats && (
        <div className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line pb-2 border-b border-zinc-700/60">
          {stats}
        </div>
      )}
      {passive && (
        <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line">
          {passive}
        </p>
      )}
      <div className="flex items-center gap-1 pt-1 border-t border-zinc-700/60">
        <span className="text-[11px] text-yellow-500 font-bold">
          {item.gold.total}g
        </span>
      </div>
    </div>
  );
}

interface ItemShopProps {
  items: Item[];
  selectedItems: (string | null)[];
  onItemChange: (slotIndex: number, itemId: string | null) => void;
  locale?: string;
  version: string;
}

export function ItemShop({
  items,
  selectedItems,
  onItemChange,
  locale = "ja",
  version,
}: ItemShopProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);

  const shopItems = useMemo(() => {
    return items.filter((item) => {
      // Exclude 0-gold items (internal items, etc.)
      if (item.gold.total === 0) return false;
      return true;
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    return shopItems.filter((item) => {
      const matchesSearch =
        search === "" || item.name.toLowerCase().includes(search.toLowerCase());

      if (category === "all") return matchesSearch;

      const cat = ITEM_CATEGORIES.find((c) => c.key === category);
      if (!cat) return matchesSearch;

      // Tag-based filter (boots)
      if ("tag" in cat && cat.tag) {
        return matchesSearch && item.tags.includes(cat.tag);
      }

      // Stat-based filter
      if (cat.stat) {
        const statKey = cat.stat as keyof typeof item.stats;
        const val = item.stats[statKey];
        // Also check moveSpeedPercent for MS category
        if (cat.key === "ms") {
          return (
            matchesSearch &&
            ((val !== undefined && val > 0) ||
              (item.stats.moveSpeedPercent !== undefined &&
                item.stats.moveSpeedPercent > 0))
          );
        }
        // Also check percentMagicPen for magic pen category
        if (cat.key === "magicPen") {
          return (
            matchesSearch &&
            ((val !== undefined && val > 0) ||
              (item.stats.percentMagicPen !== undefined &&
                item.stats.percentMagicPen > 0))
          );
        }
        return matchesSearch && val !== undefined && val > 0;
      }

      return matchesSearch;
    });
  }, [shopItems, search, category]);

  const itemByIdMap = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);
  const getItemById = (id: string | null): Item | undefined => {
    if (!id) return undefined;
    return itemByIdMap.get(id);
  };

  const totalCost = selectedItems.reduce((sum, id) => {
    const item = getItemById(id);
    return sum + (item?.gold.total ?? 0);
  }, 0);

  const filledCount = selectedItems.filter(Boolean).length;
  const shopOpen = activeSlot !== null;

  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          {locale === "ja" ? "アイテム" : "Items"}
        </span>
        {totalCost > 0 && (
          <span className="text-[11px] text-zinc-400">
            <span className="text-yellow-500 font-medium">{totalCost}g</span>
            <span className="text-zinc-500 ml-1">({filledCount}/6)</span>
          </span>
        )}
      </div>

      {/* 6 item slots */}
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => {
          const item = getItemById(selectedItems[i]);
          const isActive = activeSlot === i;
          return (
            <Tooltip key={i} delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (isActive) {
                      setActiveSlot(null);
                    } else {
                      setActiveSlot(i);
                      setSearch("");
                      setCategory("all");
                      setHoveredItem(null);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (selectedItems[i]) {
                      onItemChange(i, null);
                    }
                  }}
                  className={`w-11 h-11 rounded relative overflow-hidden transition-all duration-150 group ${
                    isActive
                      ? "border-2 border-amber-400"
                      : item
                        ? "border border-zinc-600 hover:border-zinc-500"
                        : "border-2 border-border bg-card hover:border-zinc-600"
                  }`}
                >
                  {item ? (
                    <>
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image}`}
                        alt={item.name}
                        width={44}
                        height={44}
                        className="rounded block"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded" />
                    </>
                  ) : (
                    <span className="text-border text-lg group-hover:text-zinc-500 transition-colors">
                      +
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {item && !isActive && (
                <TooltipContent
                  side="bottom"
                  className="bg-popover border-border p-2.5 pointer-events-none"
                >
                  <ItemTooltipContent item={item} />
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>

      {/* Inline shop panel */}
      {shopOpen && (
        <div className="lol-card border border-border overflow-hidden">
          <div className="flex h-[420px] sm:h-[460px]">
            {/* Category sidebar */}
            <div className="w-16 sm:w-20 shrink-0 border-r border-border flex flex-col gap-0.5 p-1.5 overflow-y-auto">
              {ITEM_CATEGORIES.map((cat) => {
                const active = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`px-1.5 py-1 rounded text-[10px] sm:text-xs font-medium text-center transition-all duration-150 ${
                      active
                        ? "bg-secondary text-foreground border border-zinc-600 dark:border-zinc-600"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                    }`}
                  >
                    {locale === "ja" ? cat.ja : cat.en}
                  </button>
                );
              })}

              {/* Remove button */}
              {selectedItems[activeSlot ?? 0] && (
                <button
                  className="px-1.5 py-1 rounded text-[10px] sm:text-xs font-medium text-center border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-all mt-auto"
                  onClick={() => {
                    if (activeSlot !== null) {
                      onItemChange(activeSlot, null);
                      setActiveSlot(null);
                    }
                  }}
                >
                  {locale === "ja" ? "削除" : "Remove"}
                </button>
              )}
            </div>

            {/* Item grid */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              <div className="px-2 py-1.5 shrink-0">
                <Input
                  placeholder={
                    locale === "ja" ? "アイテムを検索..." : "Search items..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#C89B3C]/30 h-7 text-xs"
                />
                <div className="text-[9px] text-zinc-500 mt-0.5">
                  {filteredItems.length}{" "}
                  {locale === "ja" ? "アイテム" : "items"}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2">
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (activeSlot !== null) {
                          onItemChange(activeSlot, item.id);
                          setActiveSlot(null);
                        }
                      }}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative group rounded overflow-hidden border border-transparent hover:border-zinc-500 transition-all duration-150"
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image}`}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="rounded block w-full h-auto"
                        unoptimized
                      />
                      <span className="absolute bottom-0 right-0 text-[7px] bg-black/80 text-yellow-400 px-0.5 rounded-tl leading-tight">
                        {item.gold.total}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail preview (desktop only) */}
            <div className="hidden md:block w-52 shrink-0 border-l border-border overflow-y-auto">
              {hoveredItem ? (
                <ItemPreview item={hoveredItem} />
              ) : (
                <div className="p-3 text-[11px] text-zinc-600 text-center mt-12">
                  {locale === "ja"
                    ? "アイテムにカーソルを合わせると\n詳細が表示されます"
                    : "Hover over an item\nto see details"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { LocaleProvider, useLocale } from "@/lib/i18n";
import { ChampionSelect } from "@/components/champion-select";
import { LevelSlider } from "@/components/level-slider";
import { ItemShop } from "@/components/item-shop";
import { RuneSelector } from "@/components/rune-selector";
import { StatsPanel } from "@/components/stats-panel";
import { CollapsibleSection } from "@/components/collapsible-section";
import { computeStats } from "@/lib/calc/stats";
import { encodeBuild, decodeBuild, type SavedBuild } from "@/lib/build-codec";
import { STAT_SHARDS } from "@/lib/data/runes";
import {
  getSavedBuilds,
  saveBuild,
  deleteSavedBuild,
  setLoadBuildInstruction,
  type StoredBuild,
} from "@/lib/simulator-storage";
import type {
  Champion,
  Item,
  RunePath,
  SelectedRunes,
  ComputedStats,
  StatShard,
} from "@/types";

function BuildsThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-xs px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? "\u2600" : "\u263E"}
    </button>
  );
}

const HP_SCALING_SHARD_IDS = new Set(["shard_hp_scaling", "shard_hp_scaling2"]);

function resolveStatShards(runes: SelectedRunes, level: number): StatShard[] {
  const shards: StatShard[] = [];
  const fields = ["statShard1", "statShard2", "statShard3"] as const;
  for (let i = 0; i < fields.length; i++) {
    const id = runes[fields[i]];
    if (!id) continue;
    const found = STAT_SHARDS[i]?.find((s) => s.id === id);
    if (!found) continue;
    if (HP_SCALING_SHARD_IDS.has(found.id)) {
      shards.push({ ...found, value: { hp: 10 * level } });
    } else {
      shards.push(found);
    }
  }
  return shards;
}

const DEFAULT_COMPUTED_STATS: ComputedStats = {
  hp: 0,
  maxHp: 0,
  mp: 0,
  maxMp: 0,
  ad: 0,
  baseAd: 0,
  ap: 0,
  armor: 0,
  mr: 0,
  attackSpeed: 0,
  critChance: 0,
  critMultiplier: 1.75,
  moveSpeed: 0,
  attackRange: 0,
  abilityHaste: 0,
  lethality: 0,
  flatMagicPen: 0,
  percentMagicPen: 0,
  percentArmorPen: 0,
  lifeSteal: 0,
  omnivamp: 0,
  tenacity: 0,
  hpRegen: 0,
  mpRegen: 0,
  baseHp: 0,
  baseMp: 0,
};

interface BuildsClientProps {
  version: string;
  champions: Champion[];
  items: Item[];
  runePaths: RunePath[];
  error: string | null;
}

export function BuildsClient(props: BuildsClientProps) {
  return (
    <LocaleProvider>
      <TooltipProvider>
        <Suspense>
          <BuildsInner {...props} />
        </Suspense>
      </TooltipProvider>
    </LocaleProvider>
  );
}

function BuildsInner({
  version,
  champions,
  items,
  runePaths,
  error,
}: BuildsClientProps) {
  const { locale, setLocale, t } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  const defaultRunes: SelectedRunes = {
    primaryPath: runePaths[0]?.id ?? 0,
    keystone: runePaths[0]?.slots[0]?.runes[0]?.id ?? 0,
    primarySlot1: runePaths[0]?.slots[1]?.runes[0]?.id ?? 0,
    primarySlot2: runePaths[0]?.slots[2]?.runes[0]?.id ?? 0,
    primarySlot3: runePaths[0]?.slots[3]?.runes[0]?.id ?? 0,
    secondaryPath: runePaths[1]?.id ?? 0,
    secondarySlot1: runePaths[1]?.slots[1]?.runes[0]?.id ?? 0,
    secondarySlot2: runePaths[1]?.slots[2]?.runes[0]?.id ?? 0,
    statShard1: STAT_SHARDS[0][0].id,
    statShard2: STAT_SHARDS[1][0].id,
    statShard3: STAT_SHARDS[2][0].id,
  };

  const [champion, setChampion] = useState<Champion | null>(null);
  const [level, setLevel] = useState(1);
  const [selectedItems, setSelectedItems] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [runes, setRunes] = useState<SelectedRunes>(defaultRunes);
  const [copied, setCopied] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<StoredBuild[]>([]);
  const [buildName, setBuildName] = useState("");

  // Load saved builds from localStorage
  useEffect(() => {
    setSavedBuilds(getSavedBuilds());
  }, []);

  // Restore build from URL on mount
  useEffect(() => {
    const b = searchParams.get("b");
    if (!b) return;
    const build = decodeBuild(b);
    if (!build) return;
    const champ = champions.find((c) => c.id === build.championId);
    if (champ) setChampion(champ);
    setLevel(build.level);
    setSelectedItems(build.items);
    setRunes(build.runes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute stats
  const resolveItemObjects = useMemo(() => {
    return selectedItems
      .filter((id): id is string => id !== null)
      .map((id) => items.find((i) => i.id === id))
      .filter((i): i is Item => i !== undefined);
  }, [selectedItems, items]);

  const shards = useMemo(() => resolveStatShards(runes, level), [runes, level]);

  const stats = useMemo<ComputedStats>(() => {
    if (!champion) return DEFAULT_COMPUTED_STATS;
    return computeStats(champion, level, resolveItemObjects, runes, shards);
  }, [champion, level, resolveItemObjects, runes, shards]);

  const currentBuild = useMemo<SavedBuild | null>(() => {
    if (!champion) return null;
    return { championId: champion.id, level, items: selectedItems, runes };
  }, [champion, level, selectedItems, runes]);

  const buildUrl = useMemo(() => {
    if (!currentBuild) return "";
    const encoded = encodeBuild(currentBuild);
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/builds?b=${encoded}`;
  }, [currentBuild]);

  const handleCopyUrl = async () => {
    if (!buildUrl) return;
    try {
      await navigator.clipboard.writeText(buildUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = buildUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadToSimulator = (
    side: "ally" | "enemy",
    build?: SavedBuild,
  ) => {
    const b = build ?? currentBuild;
    if (!b) return;
    setLoadBuildInstruction({
      side,
      championId: b.championId,
      level: b.level,
      items: b.items,
      runes: b.runes,
    });
    router.push("/");
  };

  const handleSaveBuild = () => {
    if (!champion) return;
    const name = buildName.trim() || `${champion.name} Lv${level}`;
    const updated = saveBuild({
      name,
      championId: champion.id,
      level,
      items: selectedItems,
      runes,
    });
    setSavedBuilds(updated);
    setBuildName("");
  };

  const handleDeleteBuild = (id: string) => {
    const updated = deleteSavedBuild(id);
    setSavedBuilds(updated);
  };

  const handleLoadSavedBuild = (stored: StoredBuild) => {
    const champ = champions.find((c) => c.id === stored.championId);
    if (champ) setChampion(champ);
    setLevel(stored.level);
    setSelectedItems(stored.items);
    setRunes(stored.runes);
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-28 sm:h-32 overflow-hidden bg-muted border-b border-border">
        <Image
          src="/banner.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-60"
          unoptimized
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative max-w-[1600px] mx-auto px-4 h-full flex items-end pb-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#C89B3C] tracking-tight drop-shadow-lg font-[family-name:var(--font-playfair)]">
            LoL Build Sim
          </h1>
        </div>
      </div>

      {/* Navigation bar */}
      <header className="sticky top-0 z-50 bg-background border-b border-border font-[family-name:var(--font-space-grotesk)]">
        <div className="max-w-[1600px] mx-auto px-4 h-10 flex items-center justify-between">
          <nav className="flex gap-1">
            <Link
              href="/"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {t("nav.home")}
            </Link>
            <span className="text-sm px-2.5 py-1 rounded bg-secondary/70 text-foreground font-medium border border-border">
              {t("nav.builds")}
            </span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/50 font-mono">v{version}</span>
            <button
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              className="text-xs px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
            >
              {locale === "ja" ? "EN" : "JP"}
            </button>
            <BuildsThemeToggle />
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-[1600px] mx-auto px-4 pt-2">
          <div className="bg-red-900/20 border border-red-700/50 text-red-300 p-3 rounded text-sm">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* Saved Builds Section */}
        {savedBuilds.length > 0 && (
          <div className="lol-card overflow-hidden">
            <div className="px-4 py-2.5">
              <span className="lol-section-title">
                {locale === "ja" ? "保存済みビルド" : "Saved Builds"}
              </span>
              <span className="text-xs text-zinc-500 ml-2">
                ({savedBuilds.length}/10)
              </span>
            </div>
            <div className="px-4 pb-3 space-y-1.5">
              {savedBuilds.map((stored) => {
                const champ = champions.find((c) => c.id === stored.championId);
                const itemCount = stored.items.filter(
                  (id) => id !== null,
                ).length;
                return (
                  <div
                    key={stored.id}
                    className="flex items-center gap-2 px-2.5 py-2 rounded border border-border/60 bg-card/50 hover:bg-card transition-colors"
                  >
                    {champ && (
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image}`}
                        alt={champ.name}
                        width={28}
                        height={28}
                        className="rounded border border-black/40"
                        unoptimized
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleLoadSavedBuild(stored)}
                        className="text-sm text-zinc-200 font-medium truncate block text-left hover:text-[#E8C96C] transition-colors"
                      >
                        {stored.name}
                      </button>
                      <span className="text-[10px] text-zinc-600">
                        Lv{stored.level} · {itemCount}{" "}
                        {locale === "ja" ? "アイテム" : "items"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleLoadToSimulator("ally", {
                            championId: stored.championId,
                            level: stored.level,
                            items: stored.items,
                            runes: stored.runes,
                          })
                        }
                        className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
                      >
                        {locale === "ja" ? "青側" : "Blue"}
                      </button>
                      <button
                        onClick={() =>
                          handleLoadToSimulator("enemy", {
                            championId: stored.championId,
                            level: stored.level,
                            items: stored.items,
                            runes: stored.runes,
                          })
                        }
                        className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                      >
                        {locale === "ja" ? "赤側" : "Red"}
                      </button>
                      <button
                        onClick={() => handleDeleteBuild(stored.id)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/30 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Champion + Level */}
        <div className="flex items-center gap-3 px-1">
          {champion ? (
            <div className="relative flex-shrink-0">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image}`}
                alt={champion.name}
                width={48}
                height={48}
                className=" border border-zinc-600"
                unoptimized
              />
            </div>
          ) : null}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-300">
              {locale === "ja" ? "ビルド作成" : "Build Creator"}
            </span>
            {champion && (
              <span className="text-xs text-zinc-400">{champion.name}</span>
            )}
          </div>
        </div>

        <ChampionSelect
          champions={champions}
          selectedId={champion?.id ?? null}
          onSelect={setChampion}
          locale={locale}
          version={version}
        />

        <LevelSlider level={level} onLevelChange={setLevel} locale={locale} />

        <ItemShop
          items={items}
          selectedItems={selectedItems}
          onItemChange={(slot, id) => {
            const next = [...selectedItems];
            next[slot] = id;
            setSelectedItems(next);
          }}
          locale={locale}
          version={version}
        />

        <CollapsibleSection title={locale === "ja" ? "ルーン" : "Runes"}>
          <RuneSelector
            runePaths={runePaths}
            selectedRunes={runes}
            onRuneChange={setRunes}
            locale={locale}
          />
        </CollapsibleSection>

        <StatsPanel stats={stats} locale={locale} />

        {/* Action buttons */}
        {champion && (
          <div className="space-y-2 pt-2">
            {/* Save build */}
            <div className="flex gap-2">
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder={
                  locale === "ja"
                    ? "ビルド名 (省略可)"
                    : "Build name (optional)"
                }
                className="flex-1 px-2.5 py-1.5 rounded text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#C89B3C]/50"
              />
              <button
                onClick={handleSaveBuild}
                disabled={savedBuilds.length >= 10}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {locale === "ja" ? "保存" : "Save"}
                {savedBuilds.length >= 10 &&
                  ` (${locale === "ja" ? "上限" : "max"})`}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-[#C89B3C]/15 text-[#E8C96C] border border-[#C89B3C]/30 hover:bg-[#C89B3C]/25 transition-colors"
              >
                {copied
                  ? locale === "ja"
                    ? "コピーしました!"
                    : "Copied!"
                  : locale === "ja"
                    ? "URLをコピー"
                    : "Copy URL"}
              </button>
              <button
                onClick={() => handleLoadToSimulator("ally")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
              >
                {locale === "ja" ? "青側にロード" : "Load as Blue"}
              </button>
              <button
                onClick={() => handleLoadToSimulator("enemy")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                {locale === "ja" ? "赤側にロード" : "Load as Red"}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-8">
        <div className="max-w-[1600px] mx-auto px-4 py-4 text-center text-xs text-muted-foreground/50">
          LoL Build Simulator is not endorsed by Riot Games and does not reflect
          the views or opinions of Riot Games. League of Legends and Riot Games
          are trademarks of Riot Games, Inc.
        </div>
      </footer>
    </div>
  );
}

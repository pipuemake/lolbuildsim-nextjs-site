"use client";

import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider, useLocale } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChampionSelect } from "@/components/champion-select";
import { LevelSlider } from "@/components/level-slider";
import { ItemShop } from "@/components/item-shop";
import { RuneSelector } from "@/components/rune-selector";
import { StatsPanel } from "@/components/stats-panel";
import { CollapsibleSection } from "@/components/collapsible-section";
import { computeStats } from "@/lib/calc/stats";
import { encodeBuild, decodeBuild, type SavedBuild } from "@/lib/build-codec";
import { STAT_SHARDS } from "@/lib/data/runes";
import { SUMMONER_SPELLS } from "@/lib/data/summoner-spells";
import {
  getSavedBuilds,
  saveBuild,
  updateBuild,
  deleteSavedBuild,
  setLoadBuildInstruction,
  type StoredBuild,
} from "@/lib/simulator-storage";
import { AuthButton, useUser } from "@/components/auth-button";
import { MobileMenu } from "@/components/mobile-menu";
import { createClient } from "@/lib/supabase/client";
import { fetchProfileMap } from "@/lib/supabase/profiles";
import type { PublishedBuild } from "@/lib/supabase/bookmarks";
import type {
  Champion,
  Item,
  RunePath,
  SelectedRunes,
  ComputedStats,
  StatShard,
} from "@/types";

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
  ultimateHaste: 0,
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

const LANES = ["top", "jg", "mid", "bot", "sup"] as const;
const ROLES = [
  "warden", "vanguard", "juggernaut", "diver", "skirmisher",
  "assassin", "marksman", "battlemage", "burstmage", "artillery",
  "enchanter", "catcher", "specialist",
] as const;

function SpellSelector({
  spells,
  onChange,
  locale,
  version,
}: {
  spells: [string | null, string | null];
  onChange: (spells: [string | null, string | null]) => void;
  locale: string;
  version: string;
}) {
  const [openIdx, setOpenIdx] = useState<0 | 1 | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openIdx === null) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpenIdx(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openIdx]);

  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1.5 block">
        {locale === "ja" ? "サモナースペル" : "Summoner Spells"}
      </label>
      <div className="flex gap-2" ref={containerRef}>
        {([0, 1] as const).map((idx) => {
          const selectedId = spells[idx];
          const otherId = spells[idx === 0 ? 1 : 0];
          const available = SUMMONER_SPELLS.filter((s) => s.id !== otherId);
          const selected = selectedId ? SUMMONER_SPELLS.find((s) => s.id === selectedId) : null;
          return (
            <div key={idx} className="relative">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const next = [...spells] as [string | null, string | null];
                  next[idx] = null;
                  onChange(next);
                }}
                className={`w-10 h-10 rounded border overflow-hidden flex items-center justify-center transition-colors ${
                  selected
                    ? "border-border hover:border-[#C89B3C]/50"
                    : "border-border border-dashed bg-card hover:border-[#C89B3C]/50"
                }`}
                title={
                  selected
                    ? locale === "ja" ? `${selected.nameJa} (右クリックで解除)` : `${selected.name} (right-click to remove)`
                    : locale === "ja" ? "スペル選択" : "Select Spell"
                }
              >
                {selected ? (
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${selected.image}`}
                    alt={locale === "ja" ? selected.nameJa : selected.name}
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">+</span>
                )}
              </button>
              {openIdx === idx && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded shadow-xl p-1.5 min-w-[180px]">
                  {available.map((spell) => (
                    <button
                      key={spell.id}
                      onClick={() => {
                        const next = [...spells] as [string | null, string | null];
                        next[idx] = spell.id;
                        onChange(next);
                        setOpenIdx(null);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary/50 transition-colors"
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image}`}
                        alt={spell.name}
                        width={24}
                        height={24}
                        className="rounded border border-black/40"
                        unoptimized
                      />
                      <span className="text-xs text-foreground">
                        {locale === "ja" ? spell.nameJa : spell.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);
  const [lane, setLane] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [spells, setSpells] = useState<[string | null, string | null]>([null, null]);
  const [publishing, setPublishing] = useState(false);
  const [publishedNames, setPublishedNames] = useState<Set<string>>(new Set());
  const [bookmarkedBuilds, setBookmarkedBuilds] = useState<PublishedBuild[]>([]);
  const { user, loading: userLoading } = useUser();
  const [publishedLoading, setPublishedLoading] = useState(true);

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
    build?: SavedBuild & { spells?: [string | null, string | null] },
  ) => {
    const b = build ?? currentBuild;
    if (!b) return;
    setLoadBuildInstruction({
      side,
      championId: b.championId,
      level: b.level,
      items: b.items,
      runes: b.runes,
      spells: (build as { spells?: [string | null, string | null] })?.spells ?? spells,
    });
    window.location.href = "/";
  };

  const handleSaveBuild = () => {
    if (!champion) return;
    const name = buildName.trim() || `${champion.name} Lv${level}`;

    if (editingBuildId) {
      // Update existing build
      const updated = updateBuild(editingBuildId, {
        name,
        championId: champion.id,
        level,
        items: selectedItems,
        runes,
        lane,
        role,
        spells,
      });
      setSavedBuilds(updated);
      setEditingBuildId(null);
    } else {
      // Create new build
      const updated = saveBuild({
        name,
        championId: champion.id,
        level,
        items: selectedItems,
        runes,
        lane,
        role,
        spells,
      });
      setSavedBuilds(updated);
    }
    setBuildName("");
  };

  const handleCancelEdit = () => {
    setEditingBuildId(null);
    setBuildName("");
    setChampion(null);
    setLevel(1);
    setSelectedItems([null, null, null, null, null, null]);
    setRunes(defaultRunes);
    setLane(null);
    setRole(null);
    setSpells([null, null]);
  };

  // Load user's published build names to prevent duplicates
  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setPublishedNames(new Set());
      setPublishedLoading(false);
      return;
    }
    let cancelled = false;
    setPublishedLoading(true);
    const supabase = createClient();
    supabase
      .from("published_builds")
      .select("champion_id, build_name")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load published names:", error.message);
        } else if (data) {
          setPublishedNames(
            new Set(data.map((b) => `${b.champion_id}::${b.build_name}`)),
          );
        }
        setPublishedLoading(false);
      });
    return () => { cancelled = true; };
  }, [user, userLoading]);

  const isAlreadyPublished = (stored: StoredBuild) =>
    publishedNames.has(`${stored.championId}::${stored.name}`);

  const handlePublishBuild = async (stored: StoredBuild) => {
    if (!user || publishing || isAlreadyPublished(stored)) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          champion_id: stored.championId,
          build_name: stored.name,
          level: stored.level,
          items: stored.items,
          runes: stored.runes,
          lane: stored.lane ?? null,
          role: stored.role ?? null,
          spells: stored.spells ?? null,
        }),
      });
      if (res.ok) {
        setPublishedNames((prev) =>
          new Set(prev).add(`${stored.championId}::${stored.name}`),
        );
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Failed to publish build:", data.error ?? res.status);
        if (data.max) {
          alert(locale === "ja"
            ? `ビルド公開上限（${data.max}件）に達しています`
            : `Build publish limit (${data.max}) reached`);
        }
      }
    } catch (err) {
      console.error("Failed to publish build:", err);
    }
    setPublishing(false);
  };

  // Load bookmarked builds
  useEffect(() => {
    if (!user) {
      setBookmarkedBuilds([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data: bookmarks, error: bmError } = await supabase
          .from("bookmarks")
          .select("build_id")
          .eq("user_id", user.id);
        if (cancelled) return;
        if (bmError) {
          console.error("Failed to load bookmarks:", bmError.message);
          return;
        }
        if (!bookmarks || bookmarks.length === 0) return;

        const buildIds = bookmarks.map((b: { build_id: string }) => b.build_id);
        const { data: builds, error: buildsError } = await supabase
          .from("published_builds")
          .select("*")
          .in("id", buildIds);
        if (cancelled) return;
        if (buildsError || !builds) {
          if (buildsError) console.error("Failed to load builds:", buildsError.message);
          return;
        }

        const userIds = [...new Set(builds.map((b) => b.user_id))];
        const profileMap = await fetchProfileMap(supabase, userIds);
        if (cancelled) return;

        setBookmarkedBuilds(
          builds.map((b) => ({ ...b, profiles: profileMap[b.user_id] ?? null })) as PublishedBuild[],
        );
      } catch (err) {
        if (!cancelled) console.error("Failed to load bookmarked builds:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleDeleteBuild = (id: string) => {
    const updated = deleteSavedBuild(id);
    setSavedBuilds(updated);
    if (editingBuildId === id) {
      setEditingBuildId(null);
      setBuildName("");
    }
  };

  const handleLoadSavedBuild = (stored: StoredBuild) => {
    const champ = champions.find((c) => c.id === stored.championId);
    if (champ) setChampion(champ);
    setLevel(stored.level);
    setSelectedItems(stored.items);
    setRunes(stored.runes);
    setLane(stored.lane ?? null);
    setRole(stored.role ?? null);
    setSpells(stored.spells ?? [null, null]);
    setBuildName(stored.name);
    setEditingBuildId(stored.id);
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
            {locale === "ja" ? "LoLビルドシミュ(β版)" : "LoL Build Sim(Beta)"}
          </h1>
        </div>
      </div>

      {/* Navigation bar */}
      <header className="sticky top-0 z-50 bg-background border-b border-border font-[family-name:var(--font-space-grotesk)]">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 h-10 flex items-center justify-between">
          <nav className="hidden sm:flex gap-1">
            <Link
              href="/"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {t("nav.home")}
            </Link>
            <span className="text-sm px-2.5 py-1 rounded bg-secondary/70 text-foreground font-medium border border-border">
              {t("nav.builds")}
            </span>
            <Link
              href="/champion-builds"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {t("nav.championBuilds")}
            </Link>
          </nav>
          <div className="flex sm:hidden items-center gap-1">
            <MobileMenu currentPage="builds" locale={locale} />
            <span className="text-xs font-medium text-foreground">{t("nav.builds")}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-muted-foreground/50 font-mono hidden sm:inline">v{version}</span>
            <button
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              className="text-xs px-1.5 sm:px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
            >
              {locale === "ja" ? "EN" : "JP"}
            </button>
            <ThemeToggle />
            <AuthButton locale={locale} />
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
          <div className="lol-card overflow-hidden font-[family-name:Arial,sans-serif]">
            <div className="px-4 py-2.5">
              <span className="lol-section-title font-[family-name:Arial,sans-serif]">
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
                const isEditing = editingBuildId === stored.id;
                return (
                  <div
                    key={stored.id}
                    onClick={() => handleLoadSavedBuild(stored)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded border transition-colors cursor-pointer ${
                      isEditing
                        ? "border-[#C89B3C]/50 bg-[#C89B3C]/5"
                        : "border-border/60 bg-card/50 hover:bg-card"
                    }`}
                  >
                    {champ && (
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image}`}
                        alt={champ.name}
                        width={40}
                        height={40}
                        className="rounded border border-black/40"
                        unoptimized
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm font-medium truncate block text-left transition-colors ${
                          isEditing ? "text-[#E8C96C]" : "text-zinc-200 group-hover:text-[#E8C96C]"
                        }`}
                      >
                        {stored.edited && <span className="mr-1" title={locale === "ja" ? "編集済み" : "Edited"}>🔒</span>}
                        {stored.name}
                      </span>
                      <span className="text-xs text-zinc-600">
                        Lv{stored.level} · {itemCount}{" "}
                        {locale === "ja" ? "アイテム" : "items"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {user && !publishedLoading && !isAlreadyPublished(stored) && (
                        <button
                          onClick={() => handlePublishBuild(stored)}
                          disabled={publishing}
                          className="text-xs px-2.5 py-1.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/25 hover:bg-purple-500/25 transition-colors disabled:opacity-40"
                        >
                          {t("championBuilds.publish")}
                        </button>
                      )}
                      {user && !publishedLoading && isAlreadyPublished(stored) && (
                        <span className="text-xs px-2.5 py-1.5 text-emerald-400">
                          {t("championBuilds.published")}
                        </span>
                      )}
                      <button
                        onClick={() =>
                          handleLoadToSimulator("ally", {
                            championId: stored.championId,
                            level: stored.level,
                            items: stored.items,
                            runes: stored.runes,
                            spells: stored.spells,
                          })
                        }
                        className="text-xs px-2.5 py-1.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
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
                            spells: stored.spells,
                          })
                        }
                        className="text-xs px-2.5 py-1.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                      >
                        {locale === "ja" ? "赤側" : "Red"}
                      </button>
                      <button
                        onClick={() => handleDeleteBuild(stored.id)}
                        className="text-xs px-2 py-1.5 rounded bg-zinc-700/30 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-0.5"
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

        {/* Bookmarked Builds Section */}
        {bookmarkedBuilds.length > 0 && (
          <div className="lol-card overflow-hidden font-[family-name:Arial,sans-serif]">
            <div className="px-4 py-2.5">
              <span className="lol-section-title font-[family-name:Arial,sans-serif]">
                {t("championBuilds.bookmarked")}
              </span>
              <span className="text-xs text-zinc-500 ml-2">
                ({bookmarkedBuilds.length})
              </span>
            </div>
            <div className="px-4 pb-3 space-y-1.5">
              {bookmarkedBuilds.map((pb) => {
                const champ = champions.find((c) => c.id === pb.champion_id);
                const pbItems = (pb.items as (string | null)[]) ?? [];
                return (
                  <div
                    key={pb.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded border border-border/60 bg-card/50 hover:bg-card transition-colors"
                  >
                    {champ && (
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image}`}
                        alt={champ.name}
                        width={40}
                        height={40}
                        className="rounded border border-black/40"
                        unoptimized
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-zinc-200 font-medium truncate block">
                        {pb.build_name}
                      </span>
                      <span className="text-xs text-zinc-600">
                        Lv{pb.level}
                        {pb.lane && ` · ${t(`lane.${pb.lane}`)}`}
                        {pb.profiles?.display_name && ` · ${pb.profiles.display_name}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleLoadToSimulator("ally", {
                            championId: pb.champion_id,
                            level: pb.level,
                            items: pbItems,
                            runes: pb.runes as SelectedRunes,
                            spells: (pb.spells as [string | null, string | null]) ?? undefined,
                          })
                        }
                        className="text-xs px-2.5 py-1.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
                      >
                        {locale === "ja" ? "青側" : "Blue"}
                      </button>
                      <button
                        onClick={() =>
                          handleLoadToSimulator("enemy", {
                            championId: pb.champion_id,
                            level: pb.level,
                            items: pbItems,
                            runes: pb.runes as SelectedRunes,
                            spells: (pb.spells as [string | null, string | null]) ?? undefined,
                          })
                        }
                        className="text-xs px-2.5 py-1.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                      >
                        {locale === "ja" ? "赤側" : "Red"}
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

        {/* Lane / Role selectors */}
        {champion && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("championBuilds.lane")}
              </label>
              <select
                value={lane ?? ""}
                onChange={(e) => setLane(e.target.value || null)}
                className="w-full px-2 py-1.5 rounded text-sm bg-card border border-border text-foreground"
              >
                <option value="">{t("lane.none")}</option>
                {LANES.map((l) => (
                  <option key={l} value={l}>{t(`lane.${l}`)}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("championBuilds.role")}
              </label>
              <select
                value={role ?? ""}
                onChange={(e) => setRole(e.target.value || null)}
                className="w-full px-2 py-1.5 rounded text-sm bg-card border border-border text-foreground"
              >
                <option value="">{t("role.none")}</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{t(`role.${r}`)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Summoner Spells */}
        {champion && (
          <SpellSelector
            spells={spells}
            onChange={setSpells}
            locale={locale}
            version={version}
          />
        )}

        {/* Action buttons */}
        {champion && (
          <div className="space-y-2 pt-2">
            {/* Save / Update build */}
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
              {editingBuildId ? (
                <>
                  <button
                    onClick={handleSaveBuild}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                  >
                    {locale === "ja" ? "更新" : "Update"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-zinc-700/30 text-zinc-400 border border-zinc-600/30 hover:bg-zinc-700/50 transition-colors"
                  >
                    {locale === "ja" ? "キャンセル" : "Cancel"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSaveBuild}
                  disabled={savedBuilds.length >= 10}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {locale === "ja" ? "保存" : "Save"}
                  {savedBuilds.length >= 10 &&
                    ` (${locale === "ja" ? "上限" : "max"})`}
                </button>
              )}
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
          LoL Build Simulator was created under Riot Games&apos; &quot;Legal Jibber Jabber&quot; policy
          using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
          League of Legends and Riot Games are trademarks of Riot Games, Inc.
        </div>
      </footer>
    </div>
  );
}

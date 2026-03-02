"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider, useLocale } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButton, useUser } from "@/components/auth-button";
import { MobileMenu } from "@/components/mobile-menu";
import { createClient } from "@/lib/supabase/client";
import { setLoadBuildInstruction } from "@/lib/simulator-storage";
import { SUMMONER_SPELLS } from "@/lib/data/summoner-spells";
import { championMatchesLane, type Lane } from "@/lib/data/champion-lanes";
import { getSplashPosition } from "@/lib/data/splash-positions";
import type { PublishedBuild } from "@/lib/supabase/bookmarks";
import { MAX_BOOKMARKS } from "@/lib/supabase/bookmarks";
import type { Champion, Item, RunePath, SelectedRunes } from "@/types";

const LANES = ["top", "jg", "mid", "bot", "sup"] as const;
const ROLES = [
  "warden", "vanguard", "juggernaut", "diver", "skirmisher",
  "assassin", "marksman", "battlemage", "burstmage", "artillery",
  "enchanter", "catcher", "specialist",
] as const;

const CHAMP_LANE_FILTERS = ["all", "TOP", "JG", "MID", "BOT", "SUP"] as const;

const CHAMP_LANE_ICONS: Record<string, string | null> = {
  all: null,
  TOP: "/lanes/position-top.svg",
  JG: "/lanes/position-jungle.svg",
  MID: "/lanes/position-middle.svg",
  BOT: "/lanes/position-bottom.svg",
  SUP: "/lanes/position-utility.svg",
};

const CHAMP_LANE_LABELS: Record<string, Record<string, string>> = {
  ja: { all: "全て", TOP: "TOP", JG: "JG", MID: "MID", BOT: "BOT", SUP: "SUP" },
  en: { all: "All", TOP: "TOP", JG: "JG", MID: "MID", BOT: "BOT", SUP: "SUP" },
};

interface ChampionBuildsClientProps {
  version: string;
  champions: Champion[];
  items: Item[];
  runePaths: RunePath[];
  enChampionNames: Record<string, string>;
  error: string | null;
}

export function ChampionBuildsClient(props: ChampionBuildsClientProps) {
  return (
    <LocaleProvider>
      <TooltipProvider>
        <ChampionBuildsInner {...props} />
      </TooltipProvider>
    </LocaleProvider>
  );
}

function ChampionBuildsInner({
  version,
  champions,
  items,
  runePaths,
  enChampionNames,
  error,
}: ChampionBuildsClientProps) {
  const { locale, setLocale, t } = useLocale();
  const { user } = useUser();

  const getChampName = (champ: Champion | null): string => {
    if (!champ) return "";
    if (locale === "en" && enChampionNames[champ.id]) return enChampionNames[champ.id];
    return champ.name;
  };

  const [builds, setBuilds] = useState<PublishedBuild[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedChampion, setSelectedChampion] = useState<string | null>(null);
  const [selectedLane, setSelectedLane] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [champLaneFilter, setChampLaneFilter] = useState<string>("all");

  // Tabs
  const [activeTab, setActiveTab] = useState<"all" | "my" | "bookmarked">("all");

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const pendingBookmarks = useRef(new Set<string>());

  // Champion filtering for the champion grid (by lane)
  const filteredChampions = useMemo(() => {
    if (champLaneFilter === "all") return champions;
    return champions.filter((c) =>
      championMatchesLane(c.id, champLaneFilter as Lane),
    );
  }, [champions, champLaneFilter]);

  // Keep user ref to avoid re-fetching when user object reference changes
  const userRef = useRef(user);
  userRef.current = user;

  // Fetch builds directly from Supabase (faster than API route round-trip)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const supabase = createClient();
    let query = supabase
      .from("published_builds")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, 49);

    if (selectedChampion) query = query.eq("champion_id", selectedChampion);
    if (selectedLane) query = query.eq("lane", selectedLane);
    if (selectedRole) query = query.eq("role", selectedRole);
    if (searchText.trim()) {
      const escaped = searchText.trim().replace(/[%_\\]/g, "\\$&");
      query = query.ilike("build_name", `%${escaped}%`);
    }
    if (activeTab === "my" && userRef.current) query = query.eq("user_id", userRef.current.id);

    query.then(({ data, count, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("Failed to fetch builds:", error.message);
        setBuilds([]);
        setLoading(false);
        return;
      }
      setBuilds((data ?? []) as PublishedBuild[]);
      setTotal(count ?? 0);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedChampion, selectedLane, selectedRole, searchText, activeTab]);

  // Load bookmarks
  useEffect(() => {
    if (!user) {
      setBookmarkedIds(new Set());
      setBookmarkCount(0);
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("bookmarks")
      .select("build_id")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load bookmarks:", error.message);
          return;
        }
        if (data) {
          setBookmarkedIds(new Set(data.map((b: { build_id: string }) => b.build_id)));
          setBookmarkCount(data.length);
        }
      });
    return () => { cancelled = true; };
  }, [user]);

  const toggleBookmark = (buildId: string) => {
    if (!user) return;
    if (pendingBookmarks.current.has(buildId)) return; // Prevent double-click
    const isBookmarked = bookmarkedIds.has(buildId);

    if (!isBookmarked && bookmarkCount >= MAX_BOOKMARKS) return;

    pendingBookmarks.current.add(buildId);

    // Optimistic update — update UI immediately
    if (isBookmarked) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(buildId);
        return next;
      });
      setBookmarkCount((c) => c - 1);
    } else {
      setBookmarkedIds((prev) => new Set(prev).add(buildId));
      setBookmarkCount((c) => c + 1);
    }

    // Fire API call in background, rollback on failure
    fetch("/api/bookmarks", {
      method: isBookmarked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ build_id: buildId }),
    }).then((res) => {
      if (!res.ok) throw new Error(`${res.status}`);
    }).catch((err) => {
      console.error("Failed to toggle bookmark:", err);
      // Rollback
      if (isBookmarked) {
        setBookmarkedIds((prev) => new Set(prev).add(buildId));
        setBookmarkCount((c) => c + 1);
      } else {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(buildId);
          return next;
        });
        setBookmarkCount((c) => c - 1);
      }
    }).finally(() => {
      pendingBookmarks.current.delete(buildId);
    });
  };

  const handleDeleteBuild = (buildId: string) => {
    if (!window.confirm(locale === "ja" ? "このビルドを削除しますか？" : "Delete this build?")) return;
    // Optimistic update — remove from UI immediately
    const previousBuilds = builds;
    setBuilds((prev) => prev.filter((b) => b.id !== buildId));

    // Fire API call in background, rollback on failure
    fetch(`/api/builds/${buildId}`, { method: "DELETE" }).then((res) => {
      if (!res.ok) throw new Error(`${res.status}`);
    }).catch((err) => {
      console.error("Failed to delete build:", err);
      setBuilds(previousBuilds);
    });
  };

  const handleLoadToSimulator = (
    side: "ally" | "enemy",
    build: PublishedBuild,
  ) => {
    setLoadBuildInstruction({
      side,
      championId: build.champion_id,
      level: build.level,
      items: (build.items as (string | null)[]) ?? [],
      runes: build.runes as SelectedRunes,
      spells: (build.spells as [string | null, string | null]) ?? undefined,
    });
    window.location.href = "/";
  };

  // Filter builds for bookmarked tab
  const displayBuilds = useMemo(() => {
    if (activeTab === "bookmarked") {
      return builds.filter((b) => bookmarkedIds.has(b.id));
    }
    return builds;
  }, [builds, activeTab, bookmarkedIds]);

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
            <Link
              href="/builds"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {t("nav.builds")}
            </Link>
            <span className="text-sm px-2.5 py-1 rounded bg-secondary/70 text-foreground font-medium border border-border">
              {t("nav.championBuilds")}
            </span>
          </nav>
          <div className="flex sm:hidden items-center gap-1">
            <MobileMenu currentPage="championBuilds" locale={locale} />
            <span className="text-xs font-medium text-foreground">{t("nav.championBuilds")}</span>
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

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border pb-2">
          {(["all", "my", "bookmarked"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-3 py-1.5 rounded-t transition-colors ${
                activeTab === tab
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              }`}
            >
              {tab === "all"
                ? t("championBuilds.allBuilds")
                : tab === "my"
                  ? t("championBuilds.myBuilds")
                  : t("championBuilds.bookmarked")}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("championBuilds.search")}
            className="w-full px-3 py-2 rounded text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#C89B3C]/50"
          />

          {/* Lane filter */}
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setSelectedLane(null)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                !selectedLane
                  ? "bg-[#C89B3C]/20 text-[#E8C96C] border-[#C89B3C]/40"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("champion.all")}
            </button>
            {LANES.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLane(selectedLane === l ? null : l)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  selectedLane === l
                    ? "bg-[#C89B3C]/20 text-[#E8C96C] border-[#C89B3C]/40"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`lane.${l}`)}
              </button>
            ))}
          </div>

          {/* Role filter */}
          <div className="flex gap-1 flex-wrap">
            <select
              value={selectedRole ?? ""}
              onChange={(e) => setSelectedRole(e.target.value || null)}
              className="text-xs px-2 py-1 rounded bg-card border border-border text-foreground"
            >
              <option value="">
                {t("championBuilds.role")}: {t("champion.all")}
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`role.${r}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Champion grid */}
          <div className="space-y-2">
            <div className="flex gap-1 flex-wrap">
              {CHAMP_LANE_FILTERS.map((lane) => {
                const active = champLaneFilter === lane;
                const icon = CHAMP_LANE_ICONS[lane];
                const labels = CHAMP_LANE_LABELS[locale] || CHAMP_LANE_LABELS.en;
                return (
                  <button
                    key={lane}
                    onClick={() => setChampLaneFilter(lane)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-150 flex items-center justify-center ${
                      active
                        ? "bg-zinc-600 text-white shadow-sm"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                    }`}
                  >
                    {icon ? (
                      <img
                        src={icon}
                        alt={labels[lane]}
                        className={`w-5 h-5 transition-all ${active ? "brightness-200" : "brightness-0 hover:brightness-50 dark:brightness-75 dark:hover:brightness-150"}`}
                      />
                    ) : (
                      labels[lane]
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto">
              {filteredChampions.map((champ) => (
                <button
                  key={champ.id}
                  onClick={() =>
                    setSelectedChampion(
                      selectedChampion === champ.id ? null : champ.id,
                    )
                  }
                  className={`relative w-8 h-8 rounded overflow-hidden border transition-all ${
                    selectedChampion === champ.id
                      ? "border-[#C89B3C] ring-1 ring-[#C89B3C]/50 scale-110"
                      : "border-border/40 hover:border-border opacity-70 hover:opacity-100"
                  }`}
                  title={champ.name}
                >
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image}`}
                    alt={champ.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Build cards */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t("loading")}
          </div>
        ) : displayBuilds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t("championBuilds.noResults")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {displayBuilds.map((build) => {
              const champ = champions.find((c) => c.id === build.champion_id);
              const buildItems = (build.items as (string | null)[]) ?? [];
              const isBookmarked = bookmarkedIds.has(build.id);
              const isOwner = user?.id === build.user_id;
              const buildRunes = build.runes as SelectedRunes | null;
              const primaryPath = buildRunes ? runePaths.find((p) => p.id === buildRunes.primaryPath) : null;
              const secondaryPath = buildRunes ? runePaths.find((p) => p.id === buildRunes.secondaryPath) : null;
              const keystone = primaryPath?.slots[0]?.runes.find((r) => r.id === buildRunes?.keystone);
              const champKey = champ?.image?.replace(".png", "") ?? build.champion_id;
              const buildSpells = (build.spells as [string | null, string | null]) ?? [null, null];

              return (
                <div
                  key={build.id}
                  className="relative rounded-lg overflow-hidden border border-border/60 h-[160px] group"
                >
                  {/* Splash art background */}
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champKey}_0.jpg`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: getSplashPosition(champKey) }}
                  />
                  {/* Dark gradient overlay — left side darker for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/20" />

                  {/* Content overlay */}
                  <div className="relative h-full flex flex-col justify-between p-3 z-10">
                    {/* Top section */}
                    <div className="space-y-1">
                      {/* Lane/Role badge row */}
                      <div className="flex items-center gap-1.5">
                        {/* Champion icon */}
                        {champ && (
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image}`}
                            alt={getChampName(champ)}
                            width={28}
                            height={28}
                            className="rounded border border-white/20"
                            unoptimized
                          />
                        )}
                        {/* Lane / Role */}
                        <div className="flex gap-1 ml-auto">
                          {build.lane && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/80 backdrop-blur-sm">
                              {t(`lane.${build.lane}`)}
                            </span>
                          )}
                          {build.role && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/80 backdrop-blur-sm">
                              {t(`role.${build.role}`)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Champion name — large bold */}
                      <div className="leading-tight">
                        <div className="text-lg font-bold text-white tracking-wide drop-shadow-md truncate">
                          {build.build_name}
                        </div>
                        <div className="text-[11px] text-white/60 truncate">
                          {getChampName(champ ?? null) || build.champion_id} Lv{build.level}
                          {build.profiles?.display_name &&
                            ` · ${build.profiles.display_name}`}
                        </div>
                      </div>
                    </div>

                    {/* Bottom section */}
                    <div className="space-y-1.5">
                      {/* Items row */}
                      <div className="flex items-center gap-2">
                        {/* Level */}
                        <span className="text-xs font-bold text-[#C89B3C] tabular-nums">
                          {build.level}
                        </span>
                        {/* Items */}
                        <div className="flex gap-0.5">
                          {Array.from({ length: 6 }).map((_, i) => {
                            const itemId = buildItems[i];
                            const item = itemId
                              ? items.find((it) => it.id === itemId)
                              : null;
                            return (
                              <div
                                key={i}
                                className="w-7 h-7 rounded border border-white/15 bg-black/40 overflow-hidden"
                              >
                                {item && (
                                  <Image
                                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.image}`}
                                    alt={item.name}
                                    width={28}
                                    height={28}
                                    className="object-cover"
                                    unoptimized
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {/* Bookmark */}
                        {user && (
                          <button
                            onClick={() => toggleBookmark(build.id)}
                            disabled={
                              !isBookmarked && bookmarkCount >= MAX_BOOKMARKS
                            }
                            className={`text-sm w-8 h-7 flex items-center justify-center rounded transition-colors ${
                              isBookmarked
                                ? "bg-white/20 text-white"
                                : "bg-white/10 text-white/50 hover:text-white hover:bg-white/20 disabled:opacity-30"
                            }`}
                            title={
                              !isBookmarked && bookmarkCount >= MAX_BOOKMARKS
                                ? t("championBuilds.bookmarkFull")
                                : t("championBuilds.bookmark")
                            }
                          >
                            {isBookmarked ? <span className="text-base leading-none">&#x2665;</span> : <span className="text-sm leading-none">&#x2661;</span>}
                          </button>
                        )}

                        <button
                          onClick={() => handleLoadToSimulator("ally", build)}
                          className="text-[11px] font-medium px-2 py-1 rounded bg-blue-500/30 text-blue-200 hover:bg-blue-500/50 transition-colors backdrop-blur-sm"
                        >
                          {locale === "ja" ? "青側" : "Blue"}
                        </button>
                        <button
                          onClick={() => handleLoadToSimulator("enemy", build)}
                          className="text-[11px] font-medium px-2 py-1 rounded bg-red-500/30 text-red-200 hover:bg-red-500/50 transition-colors backdrop-blur-sm"
                        >
                          {locale === "ja" ? "赤側" : "Red"}
                        </button>

                        {/* Summoner Spells */}
                        {(buildSpells[0] || buildSpells[1]) && (
                          <div className="flex gap-0.5 ml-1">
                            {buildSpells.map((spellId, i) => {
                              const spell = spellId ? SUMMONER_SPELLS.find((s) => s.id === spellId) : null;
                              return spell ? (
                                <img
                                  key={i}
                                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image}`}
                                  alt={locale === "ja" ? spell.nameJa : spell.name}
                                  title={locale === "ja" ? spell.nameJa : spell.name}
                                  className="w-6 h-6 rounded border border-white/15"
                                />
                              ) : null;
                            })}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Delete button — above runes */}
                  {isOwner && activeTab === "my" && (
                    <button
                      onClick={() => handleDeleteBuild(build.id)}
                      className="absolute bottom-3 right-3 z-30 text-[11px] px-2 py-1 rounded bg-black/60 text-white/50 hover:text-red-300 hover:bg-red-500/30 transition-colors backdrop-blur-sm"
                    >
                      {t("championBuilds.delete")}
                    </button>
                  )}

                  {/* Runes — bottom right corner */}
                  {(keystone || secondaryPath) && (
                    <div className="absolute bottom-2 right-2 z-20 flex items-end gap-1 pointer-events-none">
                      {keystone && (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${keystone.icon}`}
                          alt={keystone.name}
                          title={keystone.name}
                          className="w-[67px] h-[67px] rounded-full drop-shadow-lg"
                        />
                      )}
                      {secondaryPath && (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${secondaryPath.icon}`}
                          alt={secondaryPath.name}
                          title={secondaryPath.name}
                          className="w-6 h-6 brightness-125 saturate-150 mb-1 drop-shadow-md"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Results count */}
        {!loading && total > 0 && (
          <div className="text-center text-xs text-muted-foreground pt-2">
            {total} {locale === "ja" ? "件" : "builds"}
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

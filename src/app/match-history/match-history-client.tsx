"use client";
import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { LocaleProvider, useLocale } from "@/lib/i18n";
import { MobileMenu } from "@/components/mobile-menu";
import { SiteFooter } from "@/components/site-footer";
import { useDragonData } from "@/lib/data/use-dragon-data";
import { setLoadBuildInstruction } from "@/lib/simulator-storage";
import { SUMMONER_SPELL_ID_MAP, mapStatPerks, normalizeChampionName } from "@/lib/riot/mappings";
import { REGIONS, QUEUE_TYPES } from "@/types/riot-api";
import type { MatchDto, MatchParticipant, ProcessedFrame } from "@/types/riot-api";
import type { SelectedRunes } from "@/types";

const SESSION_KEY = "lol-match-history:v1";

const TRINKET_IDS = [3340, 3363, 3364] as const;
const SKILL_KEYS = ["Q", "W", "E", "R"] as const;
const TEAM_IDS = [100, 200] as const;
const EMPTY_ITEMS_6 = Array.from({ length: 6 }, () => 0);

interface MatchHistoryState {
  region: string;
  gameName: string;
  tagLine: string;
  puuid: string | null;
  matches: MatchDto[];
  selectedMatchId: string | null;
  timelineData: { frames: ProcessedFrame[]; participants: MatchParticipant[] } | null;
  selectedMinute: number;
}

function saveSession(state: MatchHistoryState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

function loadSession(): MatchHistoryState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Format seconds as "Xm Ys" */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

/** Pad an item array to exactly 6 slots, filling with 0 */
function padItemSlots(items: number[], count: number = 6): number[] {
  const sliced = items.slice(0, count);
  if (sliced.length >= count) return sliced;
  return [...sliced, ...EMPTY_ITEMS_6.slice(sliced.length)];
}

/**
 * Estimate a stacked rune bonus at a given point in the game.
 * Uses end-of-game stacks scaled by time ratio, capped at maxStacks.
 */
function estimateScaledStacks(
  endValue: number,
  timeRatio: number,
  maxStacks: number,
  extraCap?: number,
): number {
  const endStacks = Math.min(endValue, maxStacks);
  const estimated = Math.round(endStacks * timeRatio);
  const capped = Math.min(estimated, maxStacks);
  return extraCap !== undefined ? Math.min(capped, extraCap) : capped;
}

// ─── Shared sub-components ───────────────────────────────────────────

/** Renders a fixed-width grid of item icon slots */
function ItemSlotGrid({ items, version }: { items: number[]; version: string }) {
  return (
    <div className="flex gap-0.5">
      {items.map((itemId, idx) => (
        <div
          key={idx}
          className="w-7 h-7 rounded border border-border bg-secondary/30 overflow-hidden"
        >
          {itemId > 0 && (
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`}
              alt=""
              className="w-full h-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────

function MatchHistoryInner() {
  const { locale, setLocale, t } = useLocale();
  const { version, champions, loading: dragonLoading } = useDragonData();

  // Restore from session
  const saved = useRef(loadSession());

  // Search state
  const [region, setRegion] = useState(saved.current?.region ?? "jp1");
  const [gameName, setGameName] = useState(saved.current?.gameName ?? "");
  const [tagLine, setTagLine] = useState(saved.current?.tagLine ?? "");
  const [puuid, setPuuid] = useState<string | null>(saved.current?.puuid ?? null);
  const [matches, setMatches] = useState<MatchDto[]>(saved.current?.matches ?? []);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timeline state
  const restoredMatch = useMemo(() => {
    const s = saved.current;
    if (!s?.selectedMatchId) return null;
    return s.matches.find(m => m.metadata.matchId === s.selectedMatchId) ?? null;
  }, []);
  const [selectedMatch, setSelectedMatch] = useState<MatchDto | null>(restoredMatch);
  const [timelineData, setTimelineData] = useState<{
    frames: ProcessedFrame[];
    participants: MatchParticipant[];
  } | null>(saved.current?.timelineData ?? null);
  const [selectedMinute, setSelectedMinute] = useState(saved.current?.selectedMinute ?? 0);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Import feedback
  const [importedMsg, setImportedMsg] = useState<string | null>(null);

  // Persist state to sessionStorage on change
  useEffect(() => {
    saveSession({
      region,
      gameName,
      tagLine,
      puuid,
      matches,
      selectedMatchId: selectedMatch?.metadata.matchId ?? null,
      timelineData,
      selectedMinute,
    });
  }, [region, gameName, tagLine, puuid, matches, selectedMatch, timelineData, selectedMinute]);

  // Champion lookup helper shared by image and display name functions
  const findChampion = useCallback(
    (championName: string) => {
      const normalized = normalizeChampionName(championName);
      return champions.find((c) => c.id === normalized) ?? null;
    },
    [champions],
  );

  const getChampionImage = useCallback(
    (championName: string) => {
      const champ = findChampion(championName);
      const imageFile = champ ? champ.image : `${championName}.png`;
      return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${imageFile}`;
    },
    [findChampion, version],
  );

  const getChampionDisplayName = useCallback(
    (championName: string) => {
      const champ = findChampion(championName);
      if (champ) return locale === "ja" ? champ.name : champ.id;
      return championName;
    },
    [findChampion, locale],
  );

  const getQueueLabel = useCallback(
    (queueId: number) => {
      const q = QUEUE_TYPES[queueId];
      if (!q) return `Queue ${queueId}`;
      return locale === "ja" ? q.ja : q.en;
    },
    [locale],
  );

  const handleSearch = useCallback(async () => {
    let name = gameName.trim();
    let tag = tagLine.trim();
    if (name.includes("#")) {
      const parts = name.split("#");
      name = parts[0].trim();
      tag = parts[1]?.trim() ?? tag;
    }
    if (!name || !tag) {
      setError(t("match.enterNameTag"));
      return;
    }

    setSearching(true);
    setError(null);
    setMatches([]);
    setPuuid(null);
    setSelectedMatch(null);
    setTimelineData(null);

    try {
      // Step 1: Get puuid
      const acctRes = await fetch(
        `/api/riot/account?gameName=${encodeURIComponent(name)}&tagLine=${encodeURIComponent(tag)}&region=${region}`,
      );
      if (!acctRes.ok) {
        const errorKey = acctRes.status === 404 ? "match.notFound"
          : acctRes.status === 429 ? "match.rateLimited"
          : "match.searchError";
        setError(t(errorKey));
        return;
      }
      const acctData = await acctRes.json();
      const foundPuuid = acctData.puuid as string;
      setPuuid(foundPuuid);

      // Step 2: Get match IDs
      const matchListRes = await fetch(
        `/api/riot/matches?puuid=${foundPuuid}&region=${region}&count=10`,
      );
      if (!matchListRes.ok) {
        const errorKey = matchListRes.status === 429 ? "match.rateLimited" : "match.searchError";
        setError(t(errorKey));
        return;
      }
      const { matchIds } = (await matchListRes.json()) as { matchIds: string[] };

      // Step 3: Fetch match details in batches of 2
      const fetchedMatches: MatchDto[] = [];
      for (let i = 0; i < matchIds.length; i += 2) {
        const batch = matchIds.slice(i, i + 2);
        const results = await Promise.all(
          batch.map(async (matchId) => {
            const res = await fetch(`/api/riot/matches/${matchId}?region=${region}`);
            if (!res.ok) return null;
            return (await res.json()) as MatchDto;
          }),
        );
        for (const m of results) {
          if (m) fetchedMatches.push(m);
        }
      }
      setMatches(fetchedMatches);
    } catch {
      setError(t("match.searchError"));
    } finally {
      setSearching(false);
    }
  }, [gameName, tagLine, region, t]);

  const handleViewTimeline = useCallback(
    async (match: MatchDto) => {
      setSelectedMatch(match);
      setSelectedMinute(0);
      setLoadingTimeline(true);
      setTimelineData(null);
      try {
        const res = await fetch(
          `/api/riot/matches/${match.metadata.matchId}/timeline?region=${region}`,
        );
        if (!res.ok) {
          setError(t("match.timelineError"));
          return;
        }
        const data = await res.json();
        setTimelineData(data);
      } catch {
        setError(t("match.timelineError"));
      } finally {
        setLoadingTimeline(false);
      }
    },
    [region, t],
  );

  const handleImport = useCallback(
    (participantId: number, side: "ally" | "enemy") => {
      if (!timelineData || !selectedMatch) return;

      // Clamp selectedMinute to valid range to prevent out-of-bounds access
      const clampedMinute = Math.min(selectedMinute, timelineData.frames.length - 1);
      const frame = timelineData.frames[clampedMinute];
      if (!frame) return;

      const snapshot = frame.participants[participantId];
      const participant = timelineData.participants.find(
        (p) => p.participantId === participantId,
      );
      if (!snapshot || !participant) return;

      const championId = normalizeChampionName(snapshot.championName);

      const items: (string | null)[] = snapshot.items
        .filter((id) => id > 0 && !(TRINKET_IDS as readonly number[]).includes(id))
        .slice(0, 6)
        .map(String);
      while (items.length < 6) items.push(null);

      const perks = participant.perks;
      const statShards = mapStatPerks(perks.statPerks);
      const runes: SelectedRunes = {
        primaryPath: perks.styles[0]?.style ?? 0,
        keystone: perks.styles[0]?.selections[0]?.perk ?? 0,
        primarySlot1: perks.styles[0]?.selections[1]?.perk ?? 0,
        primarySlot2: perks.styles[0]?.selections[2]?.perk ?? 0,
        primarySlot3: perks.styles[0]?.selections[3]?.perk ?? 0,
        secondaryPath: perks.styles[1]?.style ?? 0,
        secondarySlot1: perks.styles[1]?.selections[0]?.perk ?? 0,
        secondarySlot2: perks.styles[1]?.selections[1]?.perk ?? 0,
        statShard1: statShards.offense ?? "shard_adaptive",
        statShard2: statShards.flex ?? "shard_adaptive2",
        statShard3: statShards.defense ?? "shard_hp_flat",
      };

      const spell1 = SUMMONER_SPELL_ID_MAP[participant.summoner1Id] ?? null;
      const spell2 = SUMMONER_SPELL_ID_MAP[participant.summoner2Id] ?? null;

      // Ensure skill ranks have at least 1 in each slot (simulator minimum)
      const skillRanks: Record<string, number> = { Q: 1, W: 1, E: 1, R: 1 };
      if (snapshot.skillRanks) {
        for (const key of SKILL_KEYS) {
          if (snapshot.skillRanks[key] > 0) {
            skillRanks[key] = snapshot.skillRanks[key];
          }
        }
      }

      // Estimate stack-based bonuses from timeline data + end-of-game rune stats
      const bonusValues: Record<string, number> = {};
      const minute = frame.minute ?? 0;
      const totalMinutes = Math.max(1, Math.floor(selectedMatch.info.gameDuration / 60));
      const timeRatio = Math.min(1, minute / totalMinutes); // 0..1 progress through game
      const takedowns = snapshot.kills + snapshot.assists;

      // Build a map of perkId -> { var1, var2, var3 } from end-of-game data
      const primarySelections = perks.styles[0]?.selections ?? [];
      const secondarySelections = perks.styles[1]?.selections ?? [];
      const perkVars: Record<number, { var1: number; var2: number; var3: number }> = {};
      for (const sel of primarySelections) {
        perkVars[sel.perk] = { var1: sel.var1, var2: sel.var2, var3: sel.var3 };
      }
      for (const sel of secondarySelections) {
        perkVars[sel.perk] = { var1: sel.var1, var2: sel.var2, var3: sel.var3 };
      }
      const hasPerk = (id: number) => id in perkVars;

      // Gathering Storm: input = game minute (exact, no estimation needed)
      if (hasPerk(8236)) {
        bonusValues['gathering-storm-ad'] = minute;
        bonusValues['gathering-storm-ap'] = minute;
      }
      // Conditioning: toggle ON if >= 12 min
      if (hasPerk(8429) && minute >= 12) {
        bonusValues['conditioning'] = 1;
      }
      // Overgrowth: var1 = bonus max HP gained. Convert back to stacks (3 HP per stack)
      if (hasPerk(8451)) {
        const endStacks = Math.round((perkVars[8451].var1 ?? 0) / 3);
        bonusValues['overgrowth'] = Math.round(endStacks * timeRatio);
      }
      // Eyeball Collection: var1 = stacks at end of game
      if (hasPerk(8138)) {
        bonusValues['eyeball-collection-ad'] = estimateScaledStacks(perkVars[8138].var1 ?? 0, timeRatio, 10, takedowns);
        bonusValues['eyeball-collection-ap'] = bonusValues['eyeball-collection-ad'];
      }
      // Legend runes: var1 = stacks at end of game, max 10
      if (hasPerk(9104)) {
        bonusValues['legend-alacrity'] = estimateScaledStacks(perkVars[9104].var1 ?? 0, timeRatio, 10);
      }
      if (hasPerk(9103)) {
        bonusValues['legend-bloodline'] = estimateScaledStacks(perkVars[9103].var1 ?? 0, timeRatio, 10);
      }
      if (hasPerk(9105)) {
        bonusValues['legend-haste'] = estimateScaledStacks(perkVars[9105].var1 ?? 0, timeRatio, 10);
      }
      // Absolute Focus: toggle ON (assume full HP at import)
      if (hasPerk(8233)) {
        bonusValues['absolute-focus-ad'] = 1;
        bonusValues['absolute-focus-ap'] = 1;
      }
      // Transcendence: toggle ON
      if (hasPerk(8210)) {
        bonusValues['transcendence'] = 1;
      }
      // Dark Harvest: var2 = soul stacks at end of game
      if (hasPerk(8128)) {
        const endSouls = perkVars[8128].var2 ?? 0;
        bonusValues['dark-harvest'] = Math.round(endSouls * timeRatio);
      }
      // Magical Footwear: toggle ON if >= 12 min (or earlier with takedowns)
      if (hasPerk(8304) && minute >= Math.max(12 - takedowns * 0.75, 0)) {
        bonusValues['magical-footwear'] = 1;
      }

      setLoadBuildInstruction({
        side,
        championId,
        level: snapshot.level,
        items,
        runes,
        spells: [spell1, spell2],
        skillRanks,
        bonusValues,
      });

      setImportedMsg(t("match.imported"));
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    [timelineData, selectedMatch, selectedMinute, t],
  );

  // Content: Timeline view or Match list
  const content = selectedMatch ? (
    <div className="space-y-4">
      <button
        onClick={() => {
          setSelectedMatch(null);
          setTimelineData(null);
        }}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; {t("match.backToList")}
      </button>

      {loadingTimeline && (
        <p className="text-muted-foreground text-sm">{t("match.loadingTimeline")}</p>
      )}

      {timelineData && (
        <div className="space-y-4">
          {/* Minute slider */}
          <div className="space-y-1">
            <label className="text-sm font-semibold">
              {timelineData.frames[selectedMinute]?.minute ?? 0}
              {t("match.minute")}
            </label>
            <input
              type="range"
              min={0}
              max={timelineData.frames.length - 1}
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Teams */}
          {TEAM_IDS.map((teamId) => {
            const teamParticipants = timelineData.participants.filter(
              (p) => p.teamId === teamId,
            );
            return (
              <div key={teamId} className="space-y-2">
                <h3
                  className={`text-sm font-semibold ${teamId === 100 ? "text-blue-500" : "text-red-500"}`}
                >
                  {teamId === 100 ? t("match.blueTeam") : t("match.redTeam")}
                </h3>
                {teamParticipants.map((participant) => {
                  const frame = timelineData.frames[selectedMinute];
                  const snapshot = frame?.participants[participant.participantId];
                  if (!snapshot) return null;

                  const itemSlots = padItemSlots(snapshot.items.slice(0, 6));

                  return (
                    <div
                      key={participant.participantId}
                      className="bg-card border border-border rounded-lg p-2 flex items-center gap-2 flex-wrap"
                    >
                      {/* Champion icon */}
                      <img
                        src={getChampionImage(snapshot.championName)}
                        alt={snapshot.championName}
                        className="w-8 h-8 rounded"
                      />
                      {/* Name + level */}
                      <div className="min-w-[80px]">
                        <div className="text-xs font-medium truncate max-w-[100px]">
                          {getChampionDisplayName(snapshot.championName)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Lv.{snapshot.level}
                        </div>
                      </div>
                      {/* Items */}
                      <ItemSlotGrid items={itemSlots} version={version} />
                      {/* Gold + KDA */}
                      <div className="text-xs text-muted-foreground ml-auto flex gap-3 items-center">
                        <span>
                          {snapshot.kills}/{snapshot.deaths}/{snapshot.assists}
                        </span>
                        <span>{snapshot.totalGold.toLocaleString()}g</span>
                      </div>
                      {/* Import buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            handleImport(participant.participantId, "ally")
                          }
                          className="px-2 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        >
                          {t("match.importAlly")}
                        </button>
                        <button
                          onClick={() =>
                            handleImport(participant.participantId, "enemy")
                          }
                          className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          {t("match.importEnemy")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {importedMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm z-50">
          {importedMsg}
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-6">
      {/* API key under review notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 text-sm text-amber-800 dark:text-amber-200">
        {t("match.unavailable")}
      </div>

      {/* Search form */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 opacity-50 pointer-events-none">
        <div className="flex gap-2 flex-wrap">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="text-sm px-2 py-1.5 rounded bg-secondary/60 border border-border"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder={t("match.gameNamePlaceholder")}
            className="text-sm px-2 py-1.5 rounded border border-border bg-background flex-1 min-w-[120px]"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <input
            type="text"
            value={tagLine}
            onChange={(e) => setTagLine(e.target.value)}
            placeholder={t("match.tagPlaceholder")}
            className="text-sm px-2 py-1.5 rounded border border-border bg-background w-20"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searching || dragonLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded text-sm disabled:opacity-50 transition-colors"
          >
            {searching ? t("match.searching") : t("match.search")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t("match.searchHint")}</p>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded p-3">
          {error}
        </div>
      )}

      {/* Match list */}
      {matches.length > 0 && (
        <div className="space-y-2">
          {matches.map((match) => {
            const participant = match.info.participants.find(
              (p) => p.puuid === puuid,
            );
            if (!participant) return null;

            const isWin = participant.win;
            const finalItems = [
              participant.item0,
              participant.item1,
              participant.item2,
              participant.item3,
              participant.item4,
              participant.item5,
            ];

            return (
              <div
                key={match.metadata.matchId}
                className={`bg-card border border-border rounded-lg p-3 flex items-center gap-3 flex-wrap ${
                  isWin
                    ? "border-l-4 border-l-green-500"
                    : "border-l-4 border-l-red-500"
                }`}
              >
                {/* Champion icon */}
                <img
                  src={getChampionImage(participant.championName)}
                  alt={participant.championName}
                  className="w-10 h-10 rounded"
                />
                {/* Info */}
                <div className="min-w-[100px]">
                  <div className="text-sm font-medium">
                    {isWin ? t("match.win") : t("match.loss")} -{" "}
                    {getQueueLabel(match.info.queueId)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {participant.kills}/{participant.deaths}/{participant.assists}{" "}
                    &middot; {formatDuration(match.info.gameDuration)} &middot;{" "}
                    {new Date(match.info.gameCreation).toLocaleDateString()}
                  </div>
                </div>
                {/* Items */}
                <ItemSlotGrid items={finalItems} version={version} />
                {/* Timeline button */}
                <button
                  onClick={() => handleViewTimeline(match)}
                  className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded text-sm transition-colors"
                >
                  {t("match.viewTimeline")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!searching && puuid && matches.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("match.noMatches")}</p>
      )}

      <p className="text-xs text-muted-foreground mt-8 text-center">
        {t("match.disclaimer")}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
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
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 h-10 flex items-center justify-between">
          <nav className="hidden sm:flex gap-1 items-center">
            <img src="/logo.png" alt="LoL Build Sim" className="w-6 h-6 rounded" />
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
            <Link
              href="/champion-builds"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {t("nav.championBuilds")}
            </Link>
            <span className="text-sm px-2.5 py-1 rounded bg-secondary/70 text-foreground font-medium border border-border">
              {t("nav.matchHistory")}
            </span>
          </nav>
          <div className="flex sm:hidden items-center gap-1">
            <MobileMenu currentPage="matchHistory" locale={locale} />
            <img src="/logo.png" alt="" className="w-5 h-5 rounded" />
            <span className="text-xs font-medium text-foreground">{t("nav.matchHistory")}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-muted-foreground/50 font-mono hidden sm:inline">v{version}</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "ja")}
              className="text-xs px-1 sm:px-1.5 py-1 rounded bg-secondary/60 text-muted-foreground border border-border transition-colors cursor-pointer focus:outline-none"
            >
              <option value="en" className="bg-white text-black dark:bg-zinc-800 dark:text-zinc-200">EN (English)</option>
              <option value="ja" className="bg-white text-black dark:bg-zinc-800 dark:text-zinc-200">JP (日本語)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-5 w-full">
        {content}
      </main>

      <SiteFooter />
    </div>
  );
}

export function MatchHistoryClient() {
  return (
    <LocaleProvider>
      <MatchHistoryInner />
    </LocaleProvider>
  );
}

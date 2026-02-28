"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Suspense,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { LocaleProvider, useLocale } from "@/lib/i18n";
import { SiteFooter } from "@/components/site-footer";
import { ChampionSelect } from "@/components/champion-select";
import { LevelSlider } from "@/components/level-slider";
import { ItemShop } from "@/components/item-shop";
import { RuneSelector } from "@/components/rune-selector";
import { StatsPanel } from "@/components/stats-panel";
import { DamageResultPanel } from "@/components/damage-result";
import { HPBar } from "@/components/hp-bar";
import { SkillDamagePanel } from "@/components/skill-damage";
import { SkillComboBar } from "@/components/skill-combo-bar";
import { HasteDisplay } from "@/components/haste-display";
import { MinionInfo } from "@/components/minion-info";
import {
  BonusStatsPanel,
  computeBonusStats,
} from "@/components/bonus-stats-panel";
import { CollapsibleSection } from "@/components/collapsible-section";
import { computeStats } from "@/lib/calc/stats";
import {
  calcAutoAttackDamage,
  calcSkillDamage,
  calcSubCastDamage,
  calcOnHitDamage,
  calcItemActiveDamage,
  calcFullCombo,
  calcComboPassiveOnHitDamage,
  calcComboPassiveSkillBonus,
  recalcMissingHpSkillDamage,
} from "@/lib/calc/damage";
import { calcDPS } from "@/lib/calc/dps";
import { calcEffectiveHP } from "@/lib/calc/effective-hp";
import { getHasteInfo } from "@/lib/calc/haste";
import {
  getMinionStats,
  calcDamageToMinion,
  calcDamageFromMinion,
  getTowerStats,
  calcTowerDamageToChampion,
} from "@/lib/calc/minions";
import { fetchMerakiChampion, applySkillOverrides } from "@/lib/data/meraki";
import { getChampionDetail } from "@/lib/data/dragon";
import { parseChampionDetail } from "@/lib/data/champions";
import {
  getChampionBonuses,
  getRuneBonuses,
  getItemBonuses,
} from "@/lib/data/champion-bonuses";
import {
  getItemOnHitEffects,
  getItemActiveEffects,
  getItemStackBonuses,
  getItemHealEffects,
  getLifelineShield,
  type ItemStackBonus,
  type ItemHealEffect,
} from "@/lib/data/item-effects";
import { getChampionComboPassives } from "@/lib/data/champion-combo-effects";
import { STAT_SHARDS } from "@/lib/data/runes";
import { decodeBuild } from "@/lib/build-codec";
import {
  saveSimulatorState,
  loadSimulatorState,
  clearSimulatorState,
  consumeLoadBuildInstruction,
  type SideState,
  type SimulatorPersistedState,
} from "@/lib/simulator-storage";
import type {
  Champion,
  Item,
  ItemOnHitEffect,
  RunePath,
  SelectedRunes,
  StatShard,
  ComputedStats,
  SkillData,
  DamageResult,
  SkillDamageResult,
  DPSResult,
  HasteInfo,
  DamageSegment,
  MinionType,
  BonusStats,
  ChampionBonusDefinition,
  SummonerSpell,
  OnHitDamageResult,
  ItemActiveEffect,
  ItemActiveDamageResult,
  ChampionComboPassive,
} from "@/types";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <button
        className="text-xs px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
        title="Toggle theme"
      >
        {"\u263E"}
      </button>
    );
  }
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

/** HP scaling shard IDs — these scale 10 per level (10 at lv1, 180 at lv18) */
const HP_SCALING_SHARD_IDS = new Set(["shard_hp_scaling", "shard_hp_scaling2"]);

/** Resolve selected shard IDs to StatShard objects, applying level scaling */
function resolveStatShards(runes: SelectedRunes, level: number): StatShard[] {
  const shards: StatShard[] = [];
  const fields = ["statShard1", "statShard2", "statShard3"] as const;
  for (let i = 0; i < fields.length; i++) {
    const id = runes[fields[i]];
    if (!id) continue;
    const found = STAT_SHARDS[i]?.find((s) => s.id === id);
    if (!found) continue;
    if (HP_SCALING_SHARD_IDS.has(found.id)) {
      // 10 HP per level: lv1=10, lv2=20, ... lv18=180
      shards.push({ ...found, value: { hp: 10 * level } });
    } else {
      shards.push(found);
    }
  }
  return shards;
}

const DEFAULT_RUNES: SelectedRunes = {
  primaryPath: 0,
  keystone: 0,
  primarySlot1: 0,
  primarySlot2: 0,
  primarySlot3: 0,
  secondaryPath: 0,
  secondarySlot1: 0,
  secondarySlot2: 0,
  statShard1: STAT_SHARDS[0][0].id,
  statShard2: STAT_SHARDS[1][0].id,
  statShard3: STAT_SHARDS[2][0].id,
};

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

const EMPTY_DAMAGE: DamageResult = {
  physical: 0,
  magical: 0,
  trueDamage: 0,
  total: 0,
};
const EMPTY_DPS: DPSResult = {
  dps: 0,
  effectiveAD: 0,
  attackSpeed: 0,
  critRate: 0,
  critMultiplier: 1.75,
};

const DEFAULT_GENERIC_BONUSES = { ad: 0, ap: 0, hp: 0, armor: 0, mr: 0 };

interface SimulatorClientProps {
  version: string;
  champions: Champion[];
  items: Item[];
  runePaths: RunePath[];
  enChampionNames: Record<string, string>;
  enItemData: Record<string, { name: string; description: string }>;
  error: string | null;
}

export function SimulatorClient({
  version,
  champions,
  items,
  runePaths,
  enChampionNames,
  enItemData,
  error,
}: SimulatorClientProps) {
  return (
    <LocaleProvider>
      <TooltipProvider>
        <Suspense>
          <SimulatorInner
            version={version}
            champions={champions}
            items={items}
            runePaths={runePaths}
            enChampionNames={enChampionNames}
            enItemData={enItemData}
            error={error}
          />
        </Suspense>
      </TooltipProvider>
    </LocaleProvider>
  );
}

// Guard for init-once pattern (prevents double-init in React Strict Mode)
let didInit = false;

// Hoisted static JSX (rendering-hoist-jsx)
const VS_BADGE = (
  <div className="flex items-center gap-3 my-1 w-full">
    <div className="flex-1 h-px bg-border" />
    <div className="text-lg font-bold text-muted-foreground">VS</div>
    <div className="flex-1 h-px bg-border" />
  </div>
);

function SimulatorInner({
  version,
  champions,
  items,
  runePaths,
  enChampionNames,
  enItemData,
  error,
}: SimulatorClientProps) {
  const { locale, setLocale, t } = useLocale();

  /** Get display name for a champion respecting locale */
  const getChampionDisplayName = useCallback((champ: Champion | null): string => {
    if (!champ) return "";
    if (locale === "en" && enChampionNames[champ.id]) return enChampionNames[champ.id];
    return champ.name;
  }, [locale, enChampionNames]);

  // Ally state
  const [allyChampion, setAllyChampion] = useState<Champion | null>(null);
  const [allyLevel, setAllyLevel] = useState(1);
  const [allyItems, setAllyItems] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [allyRunes, setAllyRunes] = useState<SelectedRunes>({
    ...DEFAULT_RUNES,
    primaryPath: runePaths[0]?.id ?? 0,
    keystone: runePaths[0]?.slots[0]?.runes[0]?.id ?? 0,
    primarySlot1: runePaths[0]?.slots[1]?.runes[0]?.id ?? 0,
    primarySlot2: runePaths[0]?.slots[2]?.runes[0]?.id ?? 0,
    primarySlot3: runePaths[0]?.slots[3]?.runes[0]?.id ?? 0,
    secondaryPath: runePaths[1]?.id ?? 0,
    secondarySlot1: runePaths[1]?.slots[1]?.runes[0]?.id ?? 0,
    secondarySlot2: runePaths[1]?.slots[2]?.runes[0]?.id ?? 0,
  });
  const [allySkillRanks, setAllySkillRanks] = useState<Record<string, number>>({
    Q: 1,
    W: 1,
    E: 1,
    R: 1,
  });
  const [allySkills, setAllySkills] = useState<SkillData[]>([]);
  const [allyDistanceMultipliers, setAllyDistanceMultipliers] = useState<
    Record<string, number>
  >({});
  const [allyBonusValues, setAllyBonusValues] = useState<
    Record<string, number>
  >({});
  const [allyGenericBonuses, setAllyGenericBonuses] = useState(
    DEFAULT_GENERIC_BONUSES,
  );
  const [allyComboCounts, setAllyComboCounts] = useState<
    Record<string, number>
  >({ P: 0, Q: 1, W: 1, E: 1, R: 1 });
  const [allyAACounts, setAllyAACounts] = useState(1);
  const [allyCritCount, setAllyCritCount] = useState(0);
  const [allySummoners, setAllySummoners] = useState<
    [SummonerSpell | null, SummonerSpell | null]
  >([null, null]);
  const [allySummonerActive, setAllySummonerActive] = useState<
    [boolean, boolean]
  >([false, false]);
  const [allyItemActiveToggles, setAllyItemActiveToggles] = useState<
    Record<string, number>
  >({});
  const [allyOnHitToggles, setAllyOnHitToggles] = useState<
    Record<string, boolean>
  >({});
  const [allyItemStacks, setAllyItemStacks] = useState<Record<string, number>>({});
  const [allyHealCharges, setAllyHealCharges] = useState<Record<string, number>>({});
  const [allyComboPassiveValues, setAllyComboPassiveValues] = useState<
    Record<string, number>
  >({});
  const [allyFormGroup, setAllyFormGroup] = useState<string>('');
  const [allySylasRChampId, setAllySylasRChampId] = useState<string | null>(null);
  const [allySylasRSkill, setAllySylasRSkill] = useState<SkillData | null>(null);

  // Target HP % for skill damage display (affects targetCurrentHp / targetMissingHp scaling)
  const [allyTargetHpPercent, setAllyTargetHpPercent] = useState(100);
  const [enemyTargetHpPercent, setEnemyTargetHpPercent] = useState(100);

  // Enemy state
  const [enemyChampion, setEnemyChampion] = useState<Champion | null>(null);
  const [enemyLevel, setEnemyLevel] = useState(1);
  const [enemyItems, setEnemyItems] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [enemyRunes, setEnemyRunes] = useState<SelectedRunes>({
    ...DEFAULT_RUNES,
    primaryPath: runePaths[0]?.id ?? 0,
    keystone: runePaths[0]?.slots[0]?.runes[0]?.id ?? 0,
    primarySlot1: runePaths[0]?.slots[1]?.runes[0]?.id ?? 0,
    primarySlot2: runePaths[0]?.slots[2]?.runes[0]?.id ?? 0,
    primarySlot3: runePaths[0]?.slots[3]?.runes[0]?.id ?? 0,
    secondaryPath: runePaths[1]?.id ?? 0,
    secondarySlot1: runePaths[1]?.slots[1]?.runes[0]?.id ?? 0,
    secondarySlot2: runePaths[1]?.slots[2]?.runes[0]?.id ?? 0,
  });
  const [enemySkillRanks, setEnemySkillRanks] = useState<
    Record<string, number>
  >({ Q: 1, W: 1, E: 1, R: 1 });
  const [enemySkills, setEnemySkills] = useState<SkillData[]>([]);
  const [enemyDistanceMultipliers, setEnemyDistanceMultipliers] = useState<
    Record<string, number>
  >({});
  const [enemyBonusValues, setEnemyBonusValues] = useState<
    Record<string, number>
  >({});
  const [enemyGenericBonuses, setEnemyGenericBonuses] = useState(
    DEFAULT_GENERIC_BONUSES,
  );
  const [enemyComboCounts, setEnemyComboCounts] = useState<
    Record<string, number>
  >({ P: 0, Q: 1, W: 1, E: 1, R: 1 });
  const [enemyAACounts, setEnemyAACounts] = useState(1);
  const [enemyCritCount, setEnemyCritCount] = useState(0);
  const [enemySummoners, setEnemySummoners] = useState<
    [SummonerSpell | null, SummonerSpell | null]
  >([null, null]);
  const [enemySummonerActive, setEnemySummonerActive] = useState<
    [boolean, boolean]
  >([false, false]);
  const [enemyItemActiveToggles, setEnemyItemActiveToggles] = useState<
    Record<string, number>
  >({});
  const [enemyOnHitToggles, setEnemyOnHitToggles] = useState<
    Record<string, boolean>
  >({});
  const [enemyItemStacks, setEnemyItemStacks] = useState<Record<string, number>>({});
  const [enemyHealCharges, setEnemyHealCharges] = useState<Record<string, number>>({});
  const [enemyComboPassiveValues, setEnemyComboPassiveValues] = useState<
    Record<string, number>
  >({});
  const [enemyFormGroup, setEnemyFormGroup] = useState<string>('');
  const [enemySylasRChampId, setEnemySylasRChampId] = useState<string | null>(null);
  const [enemySylasRSkill, setEnemySylasRSkill] = useState<SkillData | null>(null);

  const [gameMinute, setGameMinute] = useState(0);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<"ally" | "vs" | "enemy">("ally");

  // Restore state: URL params > load-build instruction > localStorage
  useEffect(() => {
    if (didInit) return;
    didInit = true;
    const params = new URLSearchParams(window.location.search);
    const allyParam = params.get("ally");
    const enemyParam = params.get("enemy");
    let hasUrlParams = false;

    if (allyParam) {
      const build = decodeBuild(allyParam);
      if (build) {
        hasUrlParams = true;
        const champ = champions.find((c) => c.id === build.championId);
        if (champ) setAllyChampion(champ);
        setAllyLevel(build.level);
        setAllyItems(build.items);
        setAllyRunes(build.runes);
      }
    }
    if (enemyParam) {
      const build = decodeBuild(enemyParam);
      if (build) {
        hasUrlParams = true;
        const champ = champions.find((c) => c.id === build.championId);
        if (champ) setEnemyChampion(champ);
        setEnemyLevel(build.level);
        setEnemyItems(build.items);
        setEnemyRunes(build.runes);
      }
    }

    // Helper to restore one side from localStorage
    const restoreSide = (
      side: SideState,
      setChamp: typeof setAllyChampion,
      setLvl: typeof setAllyLevel,
      setItm: typeof setAllyItems,
      setRn: typeof setAllyRunes,
      setSkR: typeof setAllySkillRanks,
    ) => {
      if (side.championId) {
        const champ = champions.find((c) => c.id === side.championId);
        if (champ) setChamp(champ);
      }
      setLvl(side.level);
      setItm(side.items);
      setRn(side.runes);
      if (side.skillRanks) setSkR(side.skillRanks);
    };

    // Check for load-build instruction from builds page
    const loadInstruction = consumeLoadBuildInstruction();
    if (loadInstruction) {
      const champ = champions.find((c) => c.id === loadInstruction.championId);
      if (champ) {
        if (loadInstruction.side === "ally") {
          setAllyChampion(champ);
          setAllyLevel(loadInstruction.level);
          setAllyItems(loadInstruction.items);
          setAllyRunes(loadInstruction.runes);
        } else {
          setEnemyChampion(champ);
          setEnemyLevel(loadInstruction.level);
          setEnemyItems(loadInstruction.items);
          setEnemyRunes(loadInstruction.runes);
        }
      }
      // Restore the OTHER side from localStorage so it doesn't reset
      const saved = loadSimulatorState();
      if (saved) {
        if (loadInstruction.side === "ally") {
          restoreSide(
            saved.enemy,
            setEnemyChampion,
            setEnemyLevel,
            setEnemyItems,
            setEnemyRunes,
            setEnemySkillRanks,
          );
        } else {
          restoreSide(
            saved.ally,
            setAllyChampion,
            setAllyLevel,
            setAllyItems,
            setAllyRunes,
            setAllySkillRanks,
          );
        }
      }
      return;
    }

    // If no URL params and no load instruction, restore both sides from localStorage
    if (!hasUrlParams) {
      const saved = loadSimulatorState();
      if (saved) {
        restoreSide(
          saved.ally,
          setAllyChampion,
          setAllyLevel,
          setAllyItems,
          setAllyRunes,
          setAllySkillRanks,
        );
        restoreSide(
          saved.enemy,
          setEnemyChampion,
          setEnemyLevel,
          setEnemyItems,
          setEnemyRunes,
          setEnemySkillRanks,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state to localStorage on change
  useEffect(() => {
    const state: SimulatorPersistedState = {
      ally: {
        championId: allyChampion?.id ?? null,
        level: allyLevel,
        items: allyItems,
        runes: allyRunes,
        skillRanks: allySkillRanks,
      },
      enemy: {
        championId: enemyChampion?.id ?? null,
        level: enemyLevel,
        items: enemyItems,
        runes: enemyRunes,
        skillRanks: enemySkillRanks,
      },
    };
    saveSimulatorState(state);
  }, [
    allyChampion?.id,
    allyLevel,
    allyItems,
    allyRunes,
    allySkillRanks,
    enemyChampion?.id,
    enemyLevel,
    enemyItems,
    enemyRunes,
    enemySkillRanks,
  ]);

  // Reset all state
  const handleReset = useCallback(() => {
    const defaultRuneValues: SelectedRunes = {
      ...DEFAULT_RUNES,
      primaryPath: runePaths[0]?.id ?? 0,
      keystone: runePaths[0]?.slots[0]?.runes[0]?.id ?? 0,
      primarySlot1: runePaths[0]?.slots[1]?.runes[0]?.id ?? 0,
      primarySlot2: runePaths[0]?.slots[2]?.runes[0]?.id ?? 0,
      primarySlot3: runePaths[0]?.slots[3]?.runes[0]?.id ?? 0,
      secondaryPath: runePaths[1]?.id ?? 0,
      secondarySlot1: runePaths[1]?.slots[1]?.runes[0]?.id ?? 0,
      secondarySlot2: runePaths[1]?.slots[2]?.runes[0]?.id ?? 0,
    };
    setAllyChampion(null);
    setAllyLevel(1);
    setAllyItems([null, null, null, null, null, null]);
    setAllyRunes(defaultRuneValues);
    setAllySkillRanks({ Q: 1, W: 1, E: 1, R: 1 });
    setAllySkills([]);
    setAllyBonusValues({});
    setAllyGenericBonuses(DEFAULT_GENERIC_BONUSES);
    setAllyComboCounts({ P: 0, Q: 1, W: 1, E: 1, R: 1 });
    setAllyAACounts(1);
    setAllyCritCount(0);
    setAllySummoners([null, null]);
    setAllySummonerActive([false, false]);
    setAllyItemActiveToggles({});
    setAllyOnHitToggles({});
    setAllyComboPassiveValues({});
    setAllyDistanceMultipliers({});
    setAllyFormGroup('');
    setAllySylasRChampId(null);
    setAllySylasRSkill(null);
    setEnemyChampion(null);
    setEnemyLevel(1);
    setEnemyItems([null, null, null, null, null, null]);
    setEnemyRunes(defaultRuneValues);
    setEnemySkillRanks({ Q: 1, W: 1, E: 1, R: 1 });
    setEnemySkills([]);
    setEnemyBonusValues({});
    setEnemyGenericBonuses(DEFAULT_GENERIC_BONUSES);
    setEnemyComboCounts({ P: 0, Q: 1, W: 1, E: 1, R: 1 });
    setEnemyAACounts(1);
    setEnemyCritCount(0);
    setEnemySummoners([null, null]);
    setEnemySummonerActive([false, false]);
    setEnemyItemActiveToggles({});
    setEnemyOnHitToggles({});
    setEnemyComboPassiveValues({});
    setEnemyDistanceMultipliers({});
    setEnemyFormGroup('');
    setEnemySylasRChampId(null);
    setEnemySylasRSkill(null);
    setGameMinute(0);
    clearSimulatorState();
  }, [runePaths]);

  // Fetch Meraki skill data when champion changes, then apply overrides
  useEffect(() => {
    if (!allyChampion) {
      setAllySkills([]);
      return;
    }
    let cancelled = false;
    fetchMerakiChampion(allyChampion.id).then((skills) => {
      if (!cancelled)
        setAllySkills(applySkillOverrides(allyChampion.id, skills));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allyChampion?.id]);

  useEffect(() => {
    if (!enemyChampion) {
      setEnemySkills([]);
      return;
    }
    let cancelled = false;
    fetchMerakiChampion(enemyChampion.id).then((skills) => {
      if (!cancelled)
        setEnemySkills(applySkillOverrides(enemyChampion.id, skills));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyChampion?.id]);

  // Fetch DDragon champion detail for spell/passive images (refetch when locale changes)
  useEffect(() => {
    if (!allyChampion) return;
    let cancelled = false;
    const ddLocale = locale === "ja" ? "ja_JP" : "en_US";
    getChampionDetail(version, allyChampion.id, ddLocale)
      .then((detail) => {
        if (!cancelled) {
          const parsed = parseChampionDetail(detail);
          setAllyChampion((prev) => {
            if (!prev || prev.id !== parsed.id) return prev;
            return { ...prev, spells: parsed.spells, passive: parsed.passive };
          });
        }
      })
      .catch(console.warn);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allyChampion?.id, version, locale]);

  useEffect(() => {
    if (!enemyChampion) return;
    let cancelled = false;
    const ddLocale = locale === "ja" ? "ja_JP" : "en_US";
    getChampionDetail(version, enemyChampion.id, ddLocale)
      .then((detail) => {
        if (!cancelled) {
          const parsed = parseChampionDetail(detail);
          setEnemyChampion((prev) => {
            if (!prev || prev.id !== parsed.id) return prev;
            return { ...prev, spells: parsed.spells, passive: parsed.passive };
          });
        }
      })
      .catch(console.warn);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyChampion?.id, version, locale]);

  // Reset bonus values when champion changes
  useEffect(() => {
    setAllyBonusValues({});
    setAllyGenericBonuses(DEFAULT_GENERIC_BONUSES);
    setAllyComboPassiveValues({});
    setAllyFormGroup('');
    setAllySylasRChampId(null);
    setAllySylasRSkill(null);
  }, [allyChampion?.id]);

  useEffect(() => {
    setEnemyBonusValues({});
    setEnemyGenericBonuses(DEFAULT_GENERIC_BONUSES);
    setEnemyComboPassiveValues({});
    setEnemyFormGroup('');
    setEnemySylasRChampId(null);
    setEnemySylasRSkill(null);
  }, [enemyChampion?.id]);

  // Fetch Sylas R skill data when target champion changes
  useEffect(() => {
    if (!allySylasRChampId) { setAllySylasRSkill(null); return; }
    let cancelled = false;
    fetchMerakiChampion(allySylasRChampId).then((skills) => {
      if (!cancelled) {
        const overridden = applySkillOverrides(allySylasRChampId, skills);
        const rSkill = overridden.find(s => s.key === 'R');
        setAllySylasRSkill(rSkill ?? null);
      }
    });
    return () => { cancelled = true; };
  }, [allySylasRChampId]);

  useEffect(() => {
    if (!enemySylasRChampId) { setEnemySylasRSkill(null); return; }
    let cancelled = false;
    fetchMerakiChampion(enemySylasRChampId).then((skills) => {
      if (!cancelled) {
        const overridden = applySkillOverrides(enemySylasRChampId, skills);
        const rSkill = overridden.find(s => s.key === 'R');
        setEnemySylasRSkill(rSkill ?? null);
      }
    });
    return () => { cancelled = true; };
  }, [enemySylasRChampId]);

  // Champions list for Sylas R selector
  const championsForSylasR = useMemo(() => {
    return champions.map(c => ({ id: c.id, name: getChampionDisplayName(c), image: c.image }));
  }, [champions, getChampionDisplayName]);

  // Effective skills with Sylas R replacement
  const allyEffectiveSkills = useMemo(() => {
    if (allyChampion?.id !== 'Sylas' || !allySylasRSkill) return allySkills;
    return allySkills.map(s => s.key === 'R' ? allySylasRSkill : s);
  }, [allyChampion?.id, allySkills, allySylasRSkill]);

  const enemyEffectiveSkills = useMemo(() => {
    if (enemyChampion?.id !== 'Sylas' || !enemySylasRSkill) return enemySkills;
    return enemySkills.map(s => s.key === 'R' ? enemySylasRSkill : s);
  }, [enemyChampion?.id, enemySkills, enemySylasRSkill]);

  // Get champion bonuses
  const allyChampionBonuses = useMemo<ChampionBonusDefinition[]>(() => {
    if (!allyChampion) return [];
    return getChampionBonuses(allyChampion.id);
  }, [allyChampion]);

  const enemyChampionBonuses = useMemo<ChampionBonusDefinition[]>(() => {
    if (!enemyChampion) return [];
    return getChampionBonuses(enemyChampion.id);
  }, [enemyChampion]);

  const runeBonusList = useMemo(() => getRuneBonuses(), []);

  // Item-based bonuses (Heartsteel, Hubris, etc.)
  const allyItemBonuses = useMemo<ChampionBonusDefinition[]>(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getItemBonuses(ids);
  }, [allyItems]);

  const enemyItemBonuses = useMemo<ChampionBonusDefinition[]>(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getItemBonuses(ids);
  }, [enemyItems]);

  // Combo passives
  const allyComboPassives = useMemo<ChampionComboPassive[]>(() => {
    if (!allyChampion) return [];
    return getChampionComboPassives(allyChampion.id);
  }, [allyChampion]);

  const enemyComboPassives = useMemo<ChampionComboPassive[]>(() => {
    if (!enemyChampion) return [];
    return getChampionComboPassives(enemyChampion.id);
  }, [enemyChampion]);

  // Compute combo passive stat bonuses
  const allyComboPassiveStatBonus = useMemo<BonusStats>(() => {
    const result: BonusStats = {};
    for (const p of allyComboPassives) {
      if (!p.statBonus) continue;
      const val = allyComboPassiveValues[p.id] ?? p.defaultValue;
      const bonus = p.statBonus(val, allyLevel);
      for (const [k, v] of Object.entries(bonus)) {
        if (v)
          (result as Record<string, number>)[k] =
            ((result as Record<string, number>)[k] ?? 0) + (v as number);
      }
    }
    return result;
  }, [allyComboPassives, allyComboPassiveValues, allyLevel]);

  const enemyComboPassiveStatBonus = useMemo<BonusStats>(() => {
    const result: BonusStats = {};
    for (const p of enemyComboPassives) {
      if (!p.statBonus) continue;
      const val = enemyComboPassiveValues[p.id] ?? p.defaultValue;
      const bonus = p.statBonus(val, enemyLevel);
      for (const [k, v] of Object.entries(bonus)) {
        if (v)
          (result as Record<string, number>)[k] =
            ((result as Record<string, number>)[k] ?? 0) + (v as number);
      }
    }
    return result;
  }, [enemyComboPassives, enemyComboPassiveValues, enemyLevel]);

  // Stable callback handlers (functional setState to avoid closure over stale state)
  const handleAllySummonerChange = useCallback((idx: number, spell: SummonerSpell | null) => {
    setAllySummoners(prev => {
      const next = [...prev] as [SummonerSpell | null, SummonerSpell | null];
      next[idx] = spell;
      return next;
    });
  }, []);
  const handleAllySummonerActiveChange = useCallback((idx: number, active: boolean) => {
    setAllySummonerActive(prev => {
      const next = [...prev] as [boolean, boolean];
      next[idx] = active;
      return next;
    });
  }, []);
  const handleAllyItemActiveToggle = useCallback((itemId: string, count: number) => {
    setAllyItemActiveToggles(prev => ({ ...prev, [itemId]: count }));
  }, []);
  const handleAllyOnHitToggle = useCallback((itemId: string, active: boolean) => {
    setAllyOnHitToggles(prev => ({ ...prev, [itemId]: active }));
  }, []);
  const handleAllyComboPassiveChange = useCallback((id: string, val: number) => {
    setAllyComboPassiveValues(prev => ({ ...prev, [id]: val }));
  }, []);
  const handleAllyItemChange = useCallback((slot: number, id: string | null) => {
    setAllyItems(prev => {
      const next = [...prev];
      next[slot] = id;
      return next;
    });
  }, []);
  const handleAllyBonusChange = useCallback((id: string, val: number) => {
    setAllyBonusValues(prev => ({ ...prev, [id]: val }));
  }, []);
  const handleAllyGenericChange = useCallback((stat: string, val: number) => {
    setAllyGenericBonuses(prev => ({ ...prev, [stat]: val }));
  }, []);

  const handleEnemySummonerChange = useCallback((idx: number, spell: SummonerSpell | null) => {
    setEnemySummoners(prev => {
      const next = [...prev] as [SummonerSpell | null, SummonerSpell | null];
      next[idx] = spell;
      return next;
    });
  }, []);
  const handleEnemySummonerActiveChange = useCallback((idx: number, active: boolean) => {
    setEnemySummonerActive(prev => {
      const next = [...prev] as [boolean, boolean];
      next[idx] = active;
      return next;
    });
  }, []);
  const handleEnemyItemActiveToggle = useCallback((itemId: string, count: number) => {
    setEnemyItemActiveToggles(prev => ({ ...prev, [itemId]: count }));
  }, []);
  const handleEnemyOnHitToggle = useCallback((itemId: string, active: boolean) => {
    setEnemyOnHitToggles(prev => ({ ...prev, [itemId]: active }));
  }, []);
  const handleEnemyComboPassiveChange = useCallback((id: string, val: number) => {
    setEnemyComboPassiveValues(prev => ({ ...prev, [id]: val }));
  }, []);
  const handleEnemyItemChange = useCallback((slot: number, id: string | null) => {
    setEnemyItems(prev => {
      const next = [...prev];
      next[slot] = id;
      return next;
    });
  }, []);
  const handleEnemyBonusChange = useCallback((id: string, val: number) => {
    setEnemyBonusValues(prev => ({ ...prev, [id]: val }));
  }, []);
  const handleEnemyGenericChange = useCallback((stat: string, val: number) => {
    setEnemyGenericBonuses(prev => ({ ...prev, [stat]: val }));
  }, []);

  // Build item index Map for O(1) lookups
  const itemById = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);

  // Resolve items
  const resolveItems = useCallback(
    (itemIds: (string | null)[]): Item[] => {
      return itemIds
        .filter((id): id is string => id !== null)
        .map((id) => itemById.get(id))
        .filter((i): i is Item => i !== undefined);
    },
    [itemById],
  );

  // On-hit effects from items
  const allyOnHitEffects = useMemo<ItemOnHitEffect[]>(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getItemOnHitEffects(ids);
  }, [allyItems]);

  const enemyOnHitEffects = useMemo<ItemOnHitEffect[]>(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getItemOnHitEffects(ids);
  }, [enemyItems]);

  // Item active effects
  const allyItemActives = useMemo<ItemActiveEffect[]>(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getItemActiveEffects(ids);
  }, [allyItems]);

  const enemyItemActives = useMemo<ItemActiveEffect[]>(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getItemActiveEffects(ids);
  }, [enemyItems]);

  // Stackable items (Dark Seal, Mejai's, Yuntal)
  const allyStackableItems = useMemo(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getItemStackBonuses(ids);
  }, [allyItems]);

  const enemyStackableItems = useMemo(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getItemStackBonuses(ids);
  }, [enemyItems]);

  // Heal effects (potions)
  const allyHealEffects = useMemo(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getItemHealEffects(ids);
  }, [allyItems]);

  const enemyHealEffects = useMemo(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getItemHealEffects(ids);
  }, [enemyItems]);

  // Compute item stack stat bonuses
  const allyItemStackStatBonus = useMemo<BonusStats>(() => {
    const result: BonusStats = {};
    for (const sb of allyStackableItems) {
      const stacks = allyItemStacks[sb.itemId] ?? 0;
      if (stacks <= 0) continue;
      const bonus = sb.statBonus(stacks);
      for (const [k, v] of Object.entries(bonus)) {
        if (v) (result as Record<string, number>)[k] = ((result as Record<string, number>)[k] ?? 0) + v;
      }
    }
    return result;
  }, [allyStackableItems, allyItemStacks]);

  const enemyItemStackStatBonus = useMemo<BonusStats>(() => {
    const result: BonusStats = {};
    for (const sb of enemyStackableItems) {
      const stacks = enemyItemStacks[sb.itemId] ?? 0;
      if (stacks <= 0) continue;
      const bonus = sb.statBonus(stacks);
      for (const [k, v] of Object.entries(bonus)) {
        if (v) (result as Record<string, number>)[k] = ((result as Record<string, number>)[k] ?? 0) + v;
      }
    }
    return result;
  }, [enemyStackableItems, enemyItemStacks]);

  // Compute merged bonus stats (includes combo passive stat bonuses + item stack bonuses)
  const allyMergedBonusStats = useMemo<BonusStats>(() => {
    const allBonuses = [...allyChampionBonuses, ...runeBonusList, ...allyItemBonuses];
    const base = computeBonusStats(
      allBonuses,
      allyBonusValues,
      allyGenericBonuses,
      allyLevel,
    );
    for (const [k, v] of Object.entries(allyComboPassiveStatBonus)) {
      if (v)
        (base as Record<string, number>)[k] =
          ((base as Record<string, number>)[k] ?? 0) + (v as number);
    }
    for (const [k, v] of Object.entries(allyItemStackStatBonus)) {
      if (v)
        (base as Record<string, number>)[k] =
          ((base as Record<string, number>)[k] ?? 0) + (v as number);
    }
    return base;
  }, [
    allyChampionBonuses,
    runeBonusList,
    allyItemBonuses,
    allyBonusValues,
    allyGenericBonuses,
    allyLevel,
    allyComboPassiveStatBonus,
    allyItemStackStatBonus,
  ]);

  const enemyMergedBonusStats = useMemo<BonusStats>(() => {
    const allBonuses = [...enemyChampionBonuses, ...runeBonusList, ...enemyItemBonuses];
    const base = computeBonusStats(
      allBonuses,
      enemyBonusValues,
      enemyGenericBonuses,
      enemyLevel,
    );
    for (const [k, v] of Object.entries(enemyComboPassiveStatBonus)) {
      if (v)
        (base as Record<string, number>)[k] =
          ((base as Record<string, number>)[k] ?? 0) + (v as number);
    }
    for (const [k, v] of Object.entries(enemyItemStackStatBonus)) {
      if (v)
        (base as Record<string, number>)[k] =
          ((base as Record<string, number>)[k] ?? 0) + (v as number);
    }
    return base;
  }, [
    enemyChampionBonuses,
    runeBonusList,
    enemyItemBonuses,
    enemyBonusValues,
    enemyGenericBonuses,
    enemyLevel,
    enemyComboPassiveStatBonus,
    enemyItemStackStatBonus,
  ]);

  // Compute stats
  const allyShards = useMemo(
    () => resolveStatShards(allyRunes, allyLevel),
    [allyRunes, allyLevel],
  );
  const enemyShards = useMemo(
    () => resolveStatShards(enemyRunes, enemyLevel),
    [enemyRunes, enemyLevel],
  );

  const allyStats = useMemo<ComputedStats>(() => {
    if (!allyChampion) return DEFAULT_COMPUTED_STATS;
    return computeStats(
      allyChampion,
      allyLevel,
      resolveItems(allyItems),
      allyRunes,
      allyShards,
      allyMergedBonusStats,
    );
  }, [
    allyChampion,
    allyLevel,
    allyItems,
    allyRunes,
    allyShards,
    resolveItems,
    allyMergedBonusStats,
  ]);

  const enemyStats = useMemo<ComputedStats>(() => {
    if (!enemyChampion) return DEFAULT_COMPUTED_STATS;
    return computeStats(
      enemyChampion,
      enemyLevel,
      resolveItems(enemyItems),
      enemyRunes,
      enemyShards,
      enemyMergedBonusStats,
    );
  }, [
    enemyChampion,
    enemyLevel,
    enemyItems,
    enemyRunes,
    enemyShards,
    resolveItems,
    enemyMergedBonusStats,
  ]);

  // Lifeline shields (Maw, Sterak's, Shieldbow)
  const allyLifelineShield = useMemo(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getLifelineShield(ids, allyStats, allyLevel)?.shield ?? 0;
  }, [allyItems, allyStats, allyLevel]);

  const enemyLifelineShield = useMemo(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getLifelineShield(ids, enemyStats, enemyLevel)?.shield ?? 0;
  }, [enemyItems, enemyStats, enemyLevel]);

  // On-hit effects filtered by toggle state (only enabled on-hit items are used in damage calc)
  const allyEnabledOnHitEffects = useMemo(() => {
    return allyOnHitEffects.filter((e) => allyOnHitToggles[e.itemId] ?? false);
  }, [allyOnHitEffects, allyOnHitToggles]);

  const enemyEnabledOnHitEffects = useMemo(() => {
    return enemyOnHitEffects.filter(
      (e) => enemyOnHitToggles[e.itemId] ?? false,
    );
  }, [enemyOnHitEffects, enemyOnHitToggles]);

  // On-hit effects for AA: only 'onhit' trigger (not spellblade)
  const allyAAOnHitEffects = useMemo(() => {
    return allyEnabledOnHitEffects.filter((e) => e.trigger === "onhit");
  }, [allyEnabledOnHitEffects]);

  const enemyAAOnHitEffects = useMemo(() => {
    return enemyEnabledOnHitEffects.filter((e) => e.trigger === "onhit");
  }, [enemyEnabledOnHitEffects]);

  // Damage calculations: ally -> enemy
  const allyAADamage = useMemo<DamageResult>(() => {
    if (!allyChampion || !enemyChampion) return EMPTY_DAMAGE;
    return calcAutoAttackDamage(
      allyStats,
      enemyStats,
      allyLevel,
      allyAAOnHitEffects,
      allyCritCount > 0 ? allyCritCount : undefined,
      allyCritCount > 0 ? allyAACounts : undefined,
    );
  }, [
    allyChampion,
    enemyChampion,
    allyStats,
    enemyStats,
    allyLevel,
    allyAAOnHitEffects,
    allyCritCount,
    allyAACounts,
  ]);

  // Damage calculations: enemy -> ally
  const enemyAADamage = useMemo<DamageResult>(() => {
    if (!allyChampion || !enemyChampion) return EMPTY_DAMAGE;
    return calcAutoAttackDamage(
      enemyStats,
      allyStats,
      enemyLevel,
      enemyAAOnHitEffects,
      enemyCritCount > 0 ? enemyCritCount : undefined,
      enemyCritCount > 0 ? enemyAACounts : undefined,
    );
  }, [
    allyChampion,
    enemyChampion,
    allyStats,
    enemyStats,
    enemyLevel,
    enemyAAOnHitEffects,
    enemyCritCount,
    enemyAACounts,
  ]);

  // DPS
  const allyDps = useMemo<DPSResult>(() => {
    if (!allyChampion || !enemyChampion) return EMPTY_DPS;
    return calcDPS(allyStats, enemyStats, allyLevel, allyEnabledOnHitEffects);
  }, [
    allyChampion,
    enemyChampion,
    allyStats,
    enemyStats,
    allyLevel,
    allyEnabledOnHitEffects,
  ]);

  const enemyDps = useMemo<DPSResult>(() => {
    if (!allyChampion || !enemyChampion) return EMPTY_DPS;
    return calcDPS(enemyStats, allyStats, enemyLevel, enemyEnabledOnHitEffects);
  }, [
    allyChampion,
    enemyChampion,
    allyStats,
    enemyStats,
    enemyLevel,
    enemyEnabledOnHitEffects,
  ]);

  // Helper: get DDragon Japanese spell name for a skill key
  const getSpellNameJa = useCallback(
    (champion: Champion, key: string): string | undefined => {
      const idx = ["Q", "W", "E", "R"].indexOf(key);
      if (idx >= 0 && champion.spells[idx]) return champion.spells[idx].name;
      return undefined;
    },
    [],
  );

  // Skill damages: ally -> enemy (including sub-casts, filtered by formGroup)
  const allySkillDamages = useMemo<SkillDamageResult[]>(() => {
    if (!allyChampion || !enemyChampion || allyEffectiveSkills.length === 0) return [];
    // Adjust target HP for skill damage display (affects targetCurrentHp / targetMissingHp scaling)
    const adjustedEnemyStats = allyTargetHpPercent < 100
      ? { ...enemyStats, hp: enemyStats.maxHp * (allyTargetHpPercent / 100) }
      : enemyStats;
    const results: SkillDamageResult[] = [];
    for (const skill of allyEffectiveSkills) {
      if (skill.key === "P") continue;
      const rank = allySkillRanks[skill.key] ?? 1;
      if (skill.subCasts && skill.subCasts.length > 0) {
        // Filter by formGroup
        const visibleSubCasts = skill.subCasts.filter((sc) => {
          if (!sc.formGroup) return true;
          const hasFormGroups = skill.subCasts!.some(s => s.formGroup);
          if (!hasFormGroups) return true;
          return sc.formGroup === (allyFormGroup || skill.subCasts!.find(s => s.formGroup)?.formGroup);
        });
        for (const sc of visibleSubCasts) {
          let distMult: number | undefined;
          if (sc.distanceMultiplier) {
            const pct =
              allyDistanceMultipliers[sc.id] ??
              sc.distanceMultiplier.defaultPct;
            const { min, max } = sc.distanceMultiplier;
            distMult = min + (max - min) * (pct / 100);
          }
          results.push(
            calcSubCastDamage(
              sc,
              skill.key,
              rank,
              skill.maxRank,
              allyStats,
              adjustedEnemyStats,
              allyLevel,
              distMult,
            ),
          );
        }
      } else {
        const result = calcSkillDamage(
          skill,
          rank,
          allyStats,
          adjustedEnemyStats,
          allyLevel,
        );
        result.skillNameJa = getSpellNameJa(allyChampion, skill.key);
        results.push(result);
      }
    }
    return results;
  }, [
    allyChampion,
    enemyChampion,
    allyEffectiveSkills,
    allySkillRanks,
    allyStats,
    enemyStats,
    allyLevel,
    allyDistanceMultipliers,
    allyFormGroup,
    allyTargetHpPercent,
    getSpellNameJa,
  ]);

  // Skill damages: enemy -> ally (including sub-casts)
  const enemySkillDamages = useMemo<SkillDamageResult[]>(() => {
    if (!allyChampion || !enemyChampion || enemyEffectiveSkills.length === 0) return [];
    // Adjust target HP for skill damage display
    const adjustedAllyStats = enemyTargetHpPercent < 100
      ? { ...allyStats, hp: allyStats.maxHp * (enemyTargetHpPercent / 100) }
      : allyStats;
    const results: SkillDamageResult[] = [];
    for (const skill of enemyEffectiveSkills) {
      if (skill.key === "P") continue;
      const rank = enemySkillRanks[skill.key] ?? 1;
      if (skill.subCasts && skill.subCasts.length > 0) {
        const visibleSubCasts = skill.subCasts.filter((sc) => {
          if (!sc.formGroup) return true;
          const hasFormGroups = skill.subCasts!.some(s => s.formGroup);
          if (!hasFormGroups) return true;
          return sc.formGroup === (enemyFormGroup || skill.subCasts!.find(s => s.formGroup)?.formGroup);
        });
        for (const sc of visibleSubCasts) {
          let distMult: number | undefined;
          if (sc.distanceMultiplier) {
            const pct =
              enemyDistanceMultipliers[sc.id] ??
              sc.distanceMultiplier.defaultPct;
            const { min, max } = sc.distanceMultiplier;
            distMult = min + (max - min) * (pct / 100);
          }
          results.push(
            calcSubCastDamage(
              sc,
              skill.key,
              rank,
              skill.maxRank,
              enemyStats,
              adjustedAllyStats,
              enemyLevel,
              distMult,
            ),
          );
        }
      } else {
        const result = calcSkillDamage(
          skill,
          rank,
          enemyStats,
          adjustedAllyStats,
          enemyLevel,
        );
        result.skillNameJa = getSpellNameJa(enemyChampion, skill.key);
        results.push(result);
      }
    }
    return results;
  }, [
    allyChampion,
    enemyChampion,
    enemyEffectiveSkills,
    enemySkillRanks,
    enemyStats,
    allyStats,
    enemyLevel,
    enemyDistanceMultipliers,
    enemyFormGroup,
    enemyTargetHpPercent,
  ]);

  // Passive damage: ally -> enemy
  const allyPassiveDamage = useMemo<SkillDamageResult | null>(() => {
    if (!allyChampion || !enemyChampion) return null;
    const passive = allyEffectiveSkills.find((s) => s.key === "P");
    if (!passive || passive.baseDamage.length === 0) return null;
    return calcSkillDamage(passive, 1, allyStats, enemyStats, allyLevel);
  }, [
    allyChampion,
    enemyChampion,
    allyEffectiveSkills,
    allyStats,
    enemyStats,
    allyLevel,
  ]);

  // Passive damage: enemy -> ally
  const enemyPassiveDamage = useMemo<SkillDamageResult | null>(() => {
    if (!allyChampion || !enemyChampion) return null;
    const passive = enemyEffectiveSkills.find((s) => s.key === "P");
    if (!passive || passive.baseDamage.length === 0) return null;
    return calcSkillDamage(passive, 1, enemyStats, allyStats, enemyLevel);
  }, [
    allyChampion,
    enemyChampion,
    enemyEffectiveSkills,
    allyStats,
    enemyStats,
    enemyLevel,
  ]);

  // Summoner spell damage
  const allySummonerDamage = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 2; i++) {
      if (allySummonerActive[i] && allySummoners[i]?.damage) {
        total += allySummoners[i]!.damage!(allyLevel);
      }
    }
    return total;
  }, [allySummoners, allySummonerActive, allyLevel]);

  const enemySummonerDamage = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 2; i++) {
      if (enemySummonerActive[i] && enemySummoners[i]?.damage) {
        total += enemySummoners[i]!.damage!(enemyLevel);
      }
    }
    return total;
  }, [enemySummoners, enemySummonerActive, enemyLevel]);

  // Item active damages
  const allyItemActiveDamage = useMemo(() => {
    if (!allyChampion || !enemyChampion) return 0;
    let total = 0;
    for (const effect of allyItemActives) {
      const count = allyItemActiveToggles[effect.itemId] ?? 0;
      if (count > 0) {
        const result = calcItemActiveDamage(
          effect,
          allyStats,
          enemyStats,
          allyLevel,
        );
        total += result.effectiveDamage * count;
      }
    }
    return total;
  }, [
    allyChampion,
    enemyChampion,
    allyItemActives,
    allyItemActiveToggles,
    allyStats,
    enemyStats,
    allyLevel,
  ]);

  const enemyItemActiveDamage = useMemo(() => {
    if (!allyChampion || !enemyChampion) return 0;
    let total = 0;
    for (const effect of enemyItemActives) {
      const count = enemyItemActiveToggles[effect.itemId] ?? 0;
      if (count > 0) {
        const result = calcItemActiveDamage(
          effect,
          enemyStats,
          allyStats,
          enemyLevel,
        );
        total += result.effectiveDamage * count;
      }
    }
    return total;
  }, [
    allyChampion,
    enemyChampion,
    enemyItemActives,
    enemyItemActiveToggles,
    enemyStats,
    allyStats,
    enemyLevel,
  ]);

  // Potion healing totals
  const allyHealTotal = useMemo(() => {
    let total = 0;
    for (const effect of allyHealEffects) {
      const charges = allyHealCharges[effect.itemId] ?? 0;
      total += charges * effect.healPerCharge;
    }
    return total;
  }, [allyHealEffects, allyHealCharges]);

  const enemyHealTotal = useMemo(() => {
    let total = 0;
    for (const effect of enemyHealEffects) {
      const charges = enemyHealCharges[effect.itemId] ?? 0;
      total += charges * effect.healPerCharge;
    }
    return total;
  }, [enemyHealEffects, enemyHealCharges]);

  // Spellblade damage per proc (computed once for combo calculations)
  const allySpellbladeProc = useMemo(() => {
    const sb = allyEnabledOnHitEffects.find((e) => e.trigger === "spellblade");
    if (!sb || !allyChampion || !enemyChampion) return 0;
    const results = calcOnHitDamage([sb], allyStats, enemyStats, allyLevel);
    return results[0]?.effectiveDamage ?? 0;
  }, [
    allyEnabledOnHitEffects,
    allyChampion,
    enemyChampion,
    allyStats,
    enemyStats,
    allyLevel,
  ]);

  const enemySpellbladeProc = useMemo(() => {
    const sb = enemyEnabledOnHitEffects.find((e) => e.trigger === "spellblade");
    if (!sb || !allyChampion || !enemyChampion) return 0;
    const results = calcOnHitDamage([sb], enemyStats, allyStats, enemyLevel);
    return results[0]?.effectiveDamage ?? 0;
  }, [
    enemyEnabledOnHitEffects,
    allyChampion,
    enemyChampion,
    enemyStats,
    allyStats,
    enemyLevel,
  ]);

  // Combo passive on-hit damage per AA (e.g. Irelia P) and per-combo flat (e.g. Jax R passive)
  const { allyComboPassiveOnHitPerAA, allyComboPassiveOnHitPerCombo } =
    useMemo(() => {
      if (!allyChampion || !enemyChampion)
        return {
          allyComboPassiveOnHitPerAA: 0,
          allyComboPassiveOnHitPerCombo: 0,
        };
      let perAA = 0;
      let perCombo = 0;
      for (const p of allyComboPassives) {
        if (!p.onHit) continue;
        const val = allyComboPassiveValues[p.id] ?? p.defaultValue;
        const dmg = calcComboPassiveOnHitDamage(
          p,
          val,
          allyStats,
          enemyStats,
          allyLevel,
        );
        if (p.onHit.perCombo) {
          perCombo += dmg;
        } else {
          perAA += dmg;
        }
      }
      return {
        allyComboPassiveOnHitPerAA: perAA,
        allyComboPassiveOnHitPerCombo: perCombo,
      };
    }, [
      allyChampion,
      enemyChampion,
      allyComboPassives,
      allyComboPassiveValues,
      allyStats,
      enemyStats,
      allyLevel,
    ]);

  const { enemyComboPassiveOnHitPerAA, enemyComboPassiveOnHitPerCombo } =
    useMemo(() => {
      if (!allyChampion || !enemyChampion)
        return {
          enemyComboPassiveOnHitPerAA: 0,
          enemyComboPassiveOnHitPerCombo: 0,
        };
      let perAA = 0;
      let perCombo = 0;
      for (const p of enemyComboPassives) {
        if (!p.onHit) continue;
        const val = enemyComboPassiveValues[p.id] ?? p.defaultValue;
        const dmg = calcComboPassiveOnHitDamage(
          p,
          val,
          enemyStats,
          allyStats,
          enemyLevel,
        );
        if (p.onHit.perCombo) {
          perCombo += dmg;
        } else {
          perAA += dmg;
        }
      }
      return {
        enemyComboPassiveOnHitPerAA: perAA,
        enemyComboPassiveOnHitPerCombo: perCombo,
      };
    }, [
      allyChampion,
      enemyChampion,
      enemyComboPassives,
      enemyComboPassiveValues,
      enemyStats,
      allyStats,
      enemyLevel,
    ]);

  // Combo passive skill bonus damage (e.g. Nasus Q stacks)
  const allyComboPassiveSkillBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};
    if (!allyChampion || !enemyChampion) return bonuses;
    for (const p of allyComboPassives) {
      if (!p.skillBonus) continue;
      const val = allyComboPassiveValues[p.id] ?? p.defaultValue;
      const dmg = calcComboPassiveSkillBonus(
        p,
        val,
        allyStats,
        enemyStats,
        allyLevel,
      );
      if (dmg > 0) {
        bonuses[p.skillBonus.skillKey] =
          (bonuses[p.skillBonus.skillKey] ?? 0) + dmg;
      }
    }
    return bonuses;
  }, [
    allyChampion,
    enemyChampion,
    allyComboPassives,
    allyComboPassiveValues,
    allyStats,
    enemyStats,
    allyLevel,
  ]);

  const enemyComboPassiveSkillBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};
    if (!allyChampion || !enemyChampion) return bonuses;
    for (const p of enemyComboPassives) {
      if (!p.skillBonus) continue;
      const val = enemyComboPassiveValues[p.id] ?? p.defaultValue;
      const dmg = calcComboPassiveSkillBonus(
        p,
        val,
        enemyStats,
        allyStats,
        enemyLevel,
      );
      if (dmg > 0) {
        bonuses[p.skillBonus.skillKey] =
          (bonuses[p.skillBonus.skillKey] ?? 0) + dmg;
      }
    }
    return bonuses;
  }, [
    allyChampion,
    enemyChampion,
    enemyComboPassives,
    enemyComboPassiveValues,
    enemyStats,
    allyStats,
    enemyLevel,
  ]);

  // Combo damage (combo counts * each skill + AA * count + spellblade procs + summoners + passives)
  const allyComboDamage = useMemo(() => {
    let total =
      (allyAADamage.total + allyComboPassiveOnHitPerAA) * allyAACounts;
    total += allyComboPassiveOnHitPerCombo;
    let skillUses = 0;
    // Phase 1: non-missing-HP skills
    const missingHpSkills: { sd: SkillDamageResult; count: number }[] = [];
    for (const sd of allySkillDamages) {
      const comboKey = sd.subCastId ?? sd.skillKey;
      const count = allyComboCounts[comboKey] ?? 0;
      skillUses += count;
      if (sd.hasMissingHpScaling && count > 0) {
        missingHpSkills.push({ sd, count });
        continue;
      }
      let skillDmg = sd.totalAfterResist;
      if (allyComboPassiveSkillBonuses[sd.skillKey]) {
        skillDmg += allyComboPassiveSkillBonuses[sd.skillKey];
      }
      total += skillDmg * count;
    }
    if (allyPassiveDamage) {
      total += allyPassiveDamage.totalAfterResist * (allyComboCounts["P"] ?? 0);
    }
    if (allySpellbladeProc > 0) {
      total += allySpellbladeProc * Math.min(skillUses, allyAACounts);
    }
    total += allySummonerDamage;
    total += allyItemActiveDamage;
    // Phase 2: missing-HP skills (calculated with prior damage reducing target HP)
    for (const { sd, count } of missingHpSkills) {
      let skillDmg = recalcMissingHpSkillDamage(
        sd, total, enemyStats.maxHp, enemyStats.hp, allyStats, enemyStats, allyLevel,
      );
      if (allyComboPassiveSkillBonuses[sd.skillKey]) {
        skillDmg += allyComboPassiveSkillBonuses[sd.skillKey];
      }
      total += skillDmg * count;
    }
    return total;
  }, [
    allyAADamage,
    allyAACounts,
    allySkillDamages,
    allyComboCounts,
    allyPassiveDamage,
    allySummonerDamage,
    allySpellbladeProc,
    allyItemActiveDamage,
    allyComboPassiveOnHitPerAA,
    allyComboPassiveOnHitPerCombo,
    allyComboPassiveSkillBonuses,
    allyStats,
    enemyStats,
    allyLevel,
  ]);

  const enemyComboDamage = useMemo(() => {
    let total =
      (enemyAADamage.total + enemyComboPassiveOnHitPerAA) * enemyAACounts;
    total += enemyComboPassiveOnHitPerCombo;
    let skillUses = 0;
    const missingHpSkills: { sd: SkillDamageResult; count: number }[] = [];
    for (const sd of enemySkillDamages) {
      const comboKey = sd.subCastId ?? sd.skillKey;
      const count = enemyComboCounts[comboKey] ?? 0;
      skillUses += count;
      if (sd.hasMissingHpScaling && count > 0) {
        missingHpSkills.push({ sd, count });
        continue;
      }
      let skillDmg = sd.totalAfterResist;
      if (enemyComboPassiveSkillBonuses[sd.skillKey]) {
        skillDmg += enemyComboPassiveSkillBonuses[sd.skillKey];
      }
      total += skillDmg * count;
    }
    if (enemyPassiveDamage) {
      total += enemyPassiveDamage.totalAfterResist * (enemyComboCounts["P"] ?? 0);
    }
    if (enemySpellbladeProc > 0) {
      total += enemySpellbladeProc * Math.min(skillUses, enemyAACounts);
    }
    total += enemySummonerDamage;
    total += enemyItemActiveDamage;
    for (const { sd, count } of missingHpSkills) {
      let skillDmg = recalcMissingHpSkillDamage(
        sd, total, allyStats.maxHp, allyStats.hp, enemyStats, allyStats, enemyLevel,
      );
      if (enemyComboPassiveSkillBonuses[sd.skillKey]) {
        skillDmg += enemyComboPassiveSkillBonuses[sd.skillKey];
      }
      total += skillDmg * count;
    }
    return total;
  }, [
    enemyAADamage,
    enemyAACounts,
    enemySkillDamages,
    enemyComboCounts,
    enemyPassiveDamage,
    enemySummonerDamage,
    enemySpellbladeProc,
    enemyItemActiveDamage,
    enemyComboPassiveOnHitPerAA,
    enemyComboPassiveOnHitPerCombo,
    enemyComboPassiveSkillBonuses,
    enemyStats,
    allyStats,
    enemyLevel,
  ]);

  // HP bar damage segments (combo-count-based)
  const allyDamageToEnemy = useMemo<DamageSegment[]>(() => {
    const segs: DamageSegment[] = [];
    if (allyPassiveDamage && (allyComboCounts["P"] ?? 0) > 0) {
      segs.push({
        source: "P",
        amount: allyPassiveDamage.totalAfterResist * allyComboCounts["P"],
        color: "",
      });
    }
    for (const sd of allySkillDamages) {
      const comboKey = sd.subCastId ?? sd.skillKey;
      const count = allyComboCounts[comboKey] ?? 0;
      if (count > 0) {
        let skillDmg = sd.totalAfterResist;
        if (allyComboPassiveSkillBonuses[sd.skillKey]) {
          skillDmg += allyComboPassiveSkillBonuses[sd.skillKey];
        }
        segs.push({ source: sd.skillKey, amount: skillDmg * count, color: "" });
      }
    }
    if (allyAACounts > 0 || allyComboPassiveOnHitPerCombo > 0) {
      let aaTotal =
        (allyAADamage.total + allyComboPassiveOnHitPerAA) * allyAACounts;
      aaTotal += allyComboPassiveOnHitPerCombo;
      if (allySpellbladeProc > 0) {
        let skillUses = 0;
        for (const sd of allySkillDamages) {
          const comboKey = sd.subCastId ?? sd.skillKey;
          skillUses += allyComboCounts[comboKey] ?? 0;
        }
        aaTotal += allySpellbladeProc * Math.min(skillUses, allyAACounts);
      }
      segs.push({ source: "AA", amount: aaTotal, color: "" });
    }
    if (allySummonerDamage > 0) {
      segs.push({ source: "SUM", amount: allySummonerDamage, color: "" });
    }
    if (allyItemActiveDamage > 0) {
      segs.push({ source: "ITEM", amount: allyItemActiveDamage, color: "" });
    }
    return segs;
  }, [
    allyAADamage,
    allyAACounts,
    allySkillDamages,
    allyComboCounts,
    allyPassiveDamage,
    allySummonerDamage,
    allySpellbladeProc,
    allyItemActiveDamage,
    allyComboPassiveOnHitPerAA,
    allyComboPassiveOnHitPerCombo,
    allyComboPassiveSkillBonuses,
  ]);

  const enemyDamageToAlly = useMemo<DamageSegment[]>(() => {
    const segs: DamageSegment[] = [];
    if (enemyPassiveDamage && (enemyComboCounts["P"] ?? 0) > 0) {
      segs.push({
        source: "P",
        amount: enemyPassiveDamage.totalAfterResist * enemyComboCounts["P"],
        color: "",
      });
    }
    for (const sd of enemySkillDamages) {
      const comboKey = sd.subCastId ?? sd.skillKey;
      const count = enemyComboCounts[comboKey] ?? 0;
      if (count > 0) {
        let skillDmg = sd.totalAfterResist;
        if (enemyComboPassiveSkillBonuses[sd.skillKey]) {
          skillDmg += enemyComboPassiveSkillBonuses[sd.skillKey];
        }
        segs.push({ source: sd.skillKey, amount: skillDmg * count, color: "" });
      }
    }
    if (enemyAACounts > 0 || enemyComboPassiveOnHitPerCombo > 0) {
      let aaTotal =
        (enemyAADamage.total + enemyComboPassiveOnHitPerAA) * enemyAACounts;
      aaTotal += enemyComboPassiveOnHitPerCombo;
      if (enemySpellbladeProc > 0) {
        let skillUses = 0;
        for (const sd of enemySkillDamages) {
          const comboKey = sd.subCastId ?? sd.skillKey;
          skillUses += enemyComboCounts[comboKey] ?? 0;
        }
        aaTotal += enemySpellbladeProc * Math.min(skillUses, enemyAACounts);
      }
      segs.push({ source: "AA", amount: aaTotal, color: "" });
    }
    if (enemySummonerDamage > 0) {
      segs.push({ source: "SUM", amount: enemySummonerDamage, color: "" });
    }
    if (enemyItemActiveDamage > 0) {
      segs.push({ source: "ITEM", amount: enemyItemActiveDamage, color: "" });
    }
    return segs;
  }, [
    enemyAADamage,
    enemyAACounts,
    enemySkillDamages,
    enemyComboCounts,
    enemyPassiveDamage,
    enemySummonerDamage,
    enemySpellbladeProc,
    enemyItemActiveDamage,
    enemyComboPassiveOnHitPerAA,
    enemyComboPassiveOnHitPerCombo,
    enemyComboPassiveSkillBonuses,
  ]);

  // Haste info with skill cooldowns
  const allyHasteInfo = useMemo<HasteInfo>(() => {
    if (allyEffectiveSkills.length > 0) {
      return getHasteInfo(allyStats, allyEffectiveSkills, allySkillRanks);
    }
    return {
      abilityHaste: allyStats.abilityHaste,
      ultimateHaste: allyStats.ultimateHaste ?? 0,
      cooldownReduction: 1 - 100 / (100 + allyStats.abilityHaste),
      skillCooldowns: [],
      tenacity: allyStats.tenacity,
      ccReduction: allyStats.tenacity / 100,
    };
  }, [allyStats, allyEffectiveSkills, allySkillRanks]);

  // (spellImages removed — SkillDamagePanel now uses champion prop directly)

  // Minion data
  const minionTypes: MinionType[] = ["melee", "ranged", "cannon", "super"];
  const minionData = useMemo(() => {
    return minionTypes.map((type) => {
      const stats = getMinionStats(type, gameMinute);
      const damageToMinion = calcDamageToMinion(allyStats, stats);
      const hitsToKill =
        damageToMinion > 0 ? Math.ceil(stats.hp / damageToMinion) : Infinity;
      const damageFromMinion = calcDamageFromMinion(stats, allyStats);
      return { type, stats, damageToMinion, hitsToKill, damageFromMinion };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allyStats, gameMinute]);

  const towerData = useMemo(() => {
    const stats = getTowerStats("outer", gameMinute);
    const shots = Array.from({ length: 5 }, (_, i) =>
      calcTowerDamageToChampion(stats, i + 1, allyStats),
    );
    return { stats, damageToYou: shots };
  }, [allyStats, gameMinute]);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-28 sm:h-32 overflow-hidden bg-muted border-b border-border">
        {/* Banner illustration – place an image at /public/banner.webp to display */}
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
        <div className="max-w-[1600px] mx-auto px-4 h-10 flex items-center justify-between">
          <nav className="flex gap-1">
            <span className="text-sm px-2.5 py-1 rounded bg-secondary text-foreground font-medium">
              {t("nav.home")}
            </span>
            <Link
              href="/builds"
              className="text-sm px-2.5 py-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {t("nav.builds")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs px-2.5 py-1 rounded bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {t("reset")}
            </button>
            <span className="text-xs text-muted-foreground/50">v{version}</span>
            <button
              onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
              className="text-xs px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
            >
              {locale === "ja" ? "EN" : "JP"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="max-w-[1600px] mx-auto px-4 pt-2">
          <div className="bg-red-900/20 border border-red-700/50 text-red-300 p-3 rounded text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Mobile tab navigation */}
      <div className="lg:hidden sticky top-10 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex">
          {(["ally", "vs", "enemy"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
                mobileTab === tab
                  ? tab === "ally"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : tab === "enemy"
                      ? "text-red-400 border-b-2 border-red-400"
                      : "text-[#C89B3C] border-b-2 border-[#C89B3C]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "ally"
                ? locale === "ja"
                  ? "青側"
                  : "Blue"
                : tab === "enemy"
                  ? locale === "ja"
                    ? "赤側"
                    : "Red"
                  : "VS"}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
          {/* Ally column */}
          <div
            className={`space-y-3 animate-fade-up stagger-1 min-w-0 ${mobileTab !== "ally" ? "hidden lg:block" : ""}`}
          >
            <div className="flex items-center gap-3 px-1">
              {allyChampion ? (
                <div
                  className="relative flex-shrink-0 cursor-pointer"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setAllyChampion(null);
                  }}
                  title={
                    locale === "ja"
                      ? "右クリックで選択解除"
                      : "Right-click to deselect"
                  }
                >
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${allyChampion.image}`}
                    alt={getChampionDisplayName(allyChampion)}
                    width={48}
                    height={48}
                    className=" border border-blue-500/50"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-blue-400 text-xs">
                  {t("ally")}
                </span>
                {allyChampion && (
                  <span className="text-xs text-zinc-400">
                    {getChampionDisplayName(allyChampion)}
                  </span>
                )}
              </div>
            </div>

            <ChampionSelect
              champions={champions}
              selectedId={allyChampion?.id ?? null}
              onSelect={setAllyChampion}
              onDeselect={() => setAllyChampion(null)}
              locale={locale}
              version={version}
              enChampionNames={enChampionNames}
            />
            <LevelSlider
              level={allyLevel}
              onLevelChange={setAllyLevel}
              locale={locale}
            />
            {allyChampion && (
              <SkillComboBar
                champion={allyChampion}
                skills={allyEffectiveSkills}
                version={version}
                locale={locale}
                comboCounts={allyComboCounts}
                aaCounts={allyAACounts}
                summonerSpells={allySummoners}
                summonerActive={allySummonerActive}
                itemActiveEffects={allyItemActives}
                itemActiveToggles={allyItemActiveToggles}
                onHitEffects={allyOnHitEffects}
                onHitToggles={allyOnHitToggles}
                comboPassives={allyComboPassives}
                comboPassiveValues={allyComboPassiveValues}
                selectedFormGroup={allyFormGroup}
                onFormGroupChange={setAllyFormGroup}
                isSylas={allyChampion.id === 'Sylas'}
                sylasRChampionId={allySylasRChampId}
                onSylasRChange={setAllySylasRChampId}
                championsForSylasR={championsForSylasR}
                onComboChange={setAllyComboCounts}
                onAAChange={setAllyAACounts}
                onSummonerChange={handleAllySummonerChange}
                onSummonerActiveChange={handleAllySummonerActiveChange}
                onItemActiveToggle={handleAllyItemActiveToggle}
                onOnHitToggle={handleAllyOnHitToggle}
                onComboPassiveChange={handleAllyComboPassiveChange}
                itemStackBonuses={allyStackableItems}
                itemStacks={allyItemStacks}
                onItemStackChange={(itemId, stacks) => setAllyItemStacks(prev => ({ ...prev, [itemId]: stacks }))}
                itemHealEffects={allyHealEffects}
                itemHealCharges={allyHealCharges}
                onItemHealToggle={(itemId, charges) => setAllyHealCharges(prev => ({ ...prev, [itemId]: charges }))}
              />
            )}
            <ItemShop
              items={items}
              selectedItems={allyItems}
              onItemChange={handleAllyItemChange}
              locale={locale}
              version={version}
              enItemData={enItemData}
            />
            <CollapsibleSection title={locale === "ja" ? "ルーン" : "Runes"}>
              <RuneSelector
                runePaths={runePaths}
                selectedRunes={allyRunes}
                onRuneChange={setAllyRunes}
                locale={locale}
              />
            </CollapsibleSection>

            {allyChampion && (
              <BonusStatsPanel
                championBonuses={allyChampionBonuses}
                runeBonuses={runeBonusList}
                itemBonuses={allyItemBonuses}
                bonusValues={allyBonusValues}
                genericBonuses={allyGenericBonuses}
                onBonusChange={handleAllyBonusChange}
                onGenericChange={handleAllyGenericChange}
                locale={locale}
              />
            )}

            <StatsPanel stats={allyStats} locale={locale} aaCounts={allyAACounts} critHitCount={allyCritCount} onCritHitCountChange={setAllyCritCount} />

            {allyChampion && allyEffectiveSkills.length > 0 && enemyChampion && (
              <CollapsibleSection
                title={locale === "ja" ? "スキルダメージ" : "Skill Damage"}
                defaultOpen
              >
                <SkillDamagePanel
                  champion={allyChampion}
                  skills={allyEffectiveSkills}
                  skillDamages={allySkillDamages}
                  skillRanks={allySkillRanks}
                  distanceMultipliers={allyDistanceMultipliers}
                  onSkillRankChange={(key, rank) =>
                    setAllySkillRanks((prev) => ({ ...prev, [key]: rank }))
                  }
                  onDistanceMultiplierChange={(id, pct) =>
                    setAllyDistanceMultipliers((prev) => ({
                      ...prev,
                      [id]: pct,
                    }))
                  }
                  version={version}
                  locale={locale}
                  targetHpPercent={allyTargetHpPercent}
                  onTargetHpPercentChange={setAllyTargetHpPercent}
                />
              </CollapsibleSection>
            )}
          </div>

          {/* Center: VS + Damage display */}
          <div
            className={`flex flex-col items-center gap-3 lg:min-w-[340px] lg:max-w-[400px] w-full animate-fade-up stagger-2 ${mobileTab !== "vs" ? "hidden lg:flex" : ""}`}
          >
            {/* VS badge */}
            {VS_BADGE}

            {allyChampion && enemyChampion ? (
              <>
                {/* Ally -> Enemy */}
                <div className="w-full lol-card p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="text-blue-400 font-medium">
                      {getChampionDisplayName(allyChampion)}
                    </span>
                    <span>→</span>
                    <span className="text-red-400 font-medium">
                      {getChampionDisplayName(enemyChampion)}
                    </span>
                  </div>
                  <HPBar
                    maxHP={enemyStats.maxHp}
                    damageSegments={allyDamageToEnemy}
                    shieldAmount={enemyLifelineShield}
                    healAmount={enemyHealTotal}
                    label={`${getChampionDisplayName(enemyChampion)} HP`}
                    locale={locale}
                  />
                </div>

                <DamageResultPanel
                  aaDamage={allyAADamage}
                  skillDamages={allySkillDamages}
                  comboDamage={allyComboDamage}
                  dps={allyDps}
                  targetHP={enemyStats.maxHp}
                  locale={locale}
                />

                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Enemy -> Ally */}
                <div className="w-full lol-card p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="text-red-400 font-medium">
                      {getChampionDisplayName(enemyChampion)}
                    </span>
                    <span>→</span>
                    <span className="text-blue-400 font-medium">
                      {getChampionDisplayName(allyChampion)}
                    </span>
                  </div>
                  <HPBar
                    maxHP={allyStats.maxHp}
                    damageSegments={enemyDamageToAlly}
                    shieldAmount={allyLifelineShield}
                    healAmount={allyHealTotal}
                    label={`${getChampionDisplayName(allyChampion)} HP`}
                    locale={locale}
                  />
                </div>

                <DamageResultPanel
                  aaDamage={enemyAADamage}
                  skillDamages={enemySkillDamages}
                  comboDamage={enemyComboDamage}
                  dps={enemyDps}
                  targetHP={allyStats.maxHp}
                  locale={locale}
                />
              </>
            ) : (
              <div className="lol-card px-6 py-10 text-center w-full">
                <div className="text-3xl mb-3 opacity-15">⚔</div>
                <p className="text-zinc-500 text-sm">
                  {locale === "ja"
                    ? "両サイドのチャンピオンを\n選択してください"
                    : "Select champions on both sides\nto see damage calculations"}
                </p>
              </div>
            )}

            {allyChampion && (
              <HasteDisplay hasteInfo={allyHasteInfo} locale={locale} />
            )}

            {allyChampion && (
              <MinionInfo
                attackerStats={allyStats}
                minionData={minionData}
                towerData={towerData}
                gameMinute={gameMinute}
                onGameMinuteChange={setGameMinute}
                locale={locale}
              />
            )}
          </div>

          {/* Enemy column */}
          <div
            className={`space-y-3 animate-fade-up stagger-3 min-w-0 ${mobileTab !== "enemy" ? "hidden lg:block" : ""}`}
          >
            <div className="flex items-center gap-3 px-1">
              {enemyChampion ? (
                <div
                  className="relative flex-shrink-0 cursor-pointer"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setEnemyChampion(null);
                  }}
                  title={
                    locale === "ja"
                      ? "右クリックで選択解除"
                      : "Right-click to deselect"
                  }
                >
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${enemyChampion.image}`}
                    alt={getChampionDisplayName(enemyChampion)}
                    width={48}
                    height={48}
                    className=" border border-red-500/50"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-red-400 text-xs">
                  {t("enemy")}
                </span>
                {enemyChampion && (
                  <span className="text-xs text-zinc-400">
                    {getChampionDisplayName(enemyChampion)}
                  </span>
                )}
              </div>
            </div>

            <ChampionSelect
              champions={champions}
              selectedId={enemyChampion?.id ?? null}
              onSelect={setEnemyChampion}
              onDeselect={() => setEnemyChampion(null)}
              locale={locale}
              version={version}
              enChampionNames={enChampionNames}
            />
            <LevelSlider
              level={enemyLevel}
              onLevelChange={setEnemyLevel}
              locale={locale}
            />
            {enemyChampion && (
              <SkillComboBar
                champion={enemyChampion}
                skills={enemyEffectiveSkills}
                version={version}
                locale={locale}
                comboCounts={enemyComboCounts}
                aaCounts={enemyAACounts}
                summonerSpells={enemySummoners}
                summonerActive={enemySummonerActive}
                itemActiveEffects={enemyItemActives}
                itemActiveToggles={enemyItemActiveToggles}
                onHitEffects={enemyOnHitEffects}
                onHitToggles={enemyOnHitToggles}
                comboPassives={enemyComboPassives}
                comboPassiveValues={enemyComboPassiveValues}
                selectedFormGroup={enemyFormGroup}
                onFormGroupChange={setEnemyFormGroup}
                isSylas={enemyChampion.id === 'Sylas'}
                sylasRChampionId={enemySylasRChampId}
                onSylasRChange={setEnemySylasRChampId}
                championsForSylasR={championsForSylasR}
                onComboChange={setEnemyComboCounts}
                onAAChange={setEnemyAACounts}
                onSummonerChange={handleEnemySummonerChange}
                onSummonerActiveChange={handleEnemySummonerActiveChange}
                onItemActiveToggle={handleEnemyItemActiveToggle}
                onOnHitToggle={handleEnemyOnHitToggle}
                onComboPassiveChange={handleEnemyComboPassiveChange}
                itemStackBonuses={enemyStackableItems}
                itemStacks={enemyItemStacks}
                onItemStackChange={(itemId, stacks) => setEnemyItemStacks(prev => ({ ...prev, [itemId]: stacks }))}
                itemHealEffects={enemyHealEffects}
                itemHealCharges={enemyHealCharges}
                onItemHealToggle={(itemId, charges) => setEnemyHealCharges(prev => ({ ...prev, [itemId]: charges }))}
              />
            )}
            <ItemShop
              items={items}
              selectedItems={enemyItems}
              onItemChange={handleEnemyItemChange}
              locale={locale}
              version={version}
              enItemData={enItemData}
            />
            <CollapsibleSection title={locale === "ja" ? "ルーン" : "Runes"}>
              <RuneSelector
                runePaths={runePaths}
                selectedRunes={enemyRunes}
                onRuneChange={setEnemyRunes}
                locale={locale}
              />
            </CollapsibleSection>

            {enemyChampion && (
              <BonusStatsPanel
                championBonuses={enemyChampionBonuses}
                runeBonuses={runeBonusList}
                itemBonuses={enemyItemBonuses}
                bonusValues={enemyBonusValues}
                genericBonuses={enemyGenericBonuses}
                onBonusChange={handleEnemyBonusChange}
                onGenericChange={handleEnemyGenericChange}
                locale={locale}
              />
            )}

            <StatsPanel stats={enemyStats} locale={locale} aaCounts={enemyAACounts} critHitCount={enemyCritCount} onCritHitCountChange={setEnemyCritCount} />

            {enemyChampion && enemyEffectiveSkills.length > 0 && allyChampion && (
              <CollapsibleSection
                title={locale === "ja" ? "スキルダメージ" : "Skill Damage"}
                defaultOpen
              >
                <SkillDamagePanel
                  champion={enemyChampion}
                  skills={enemyEffectiveSkills}
                  skillDamages={enemySkillDamages}
                  skillRanks={enemySkillRanks}
                  distanceMultipliers={enemyDistanceMultipliers}
                  onSkillRankChange={(key, rank) =>
                    setEnemySkillRanks((prev) => ({ ...prev, [key]: rank }))
                  }
                  onDistanceMultiplierChange={(id, pct) =>
                    setEnemyDistanceMultipliers((prev) => ({
                      ...prev,
                      [id]: pct,
                    }))
                  }
                  version={version}
                  locale={locale}
                  targetHpPercent={enemyTargetHpPercent}
                  onTargetHpPercentChange={setEnemyTargetHpPercent}
                />
              </CollapsibleSection>
            )}
          </div>
        </div>
      </main>

      {/* About section */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-lg font-bold text-[#C89B3C] mb-4 font-[family-name:var(--font-playfair)]">
          {t("home.aboutTitle")}
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>{t("home.aboutBody1")}</p>
          <p>{t("home.aboutBody2")}</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>{t("home.aboutList1")}</li>
            <li>{t("home.aboutList2")}</li>
            <li>{t("home.aboutList3")}</li>
          </ul>
          <p>{t("home.aboutBody3")}</p>
          <p>{t("home.aboutBody4")}</p>
          <p>{t("home.aboutBody5")}</p>
          <p>{t("home.aboutBody6")}</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

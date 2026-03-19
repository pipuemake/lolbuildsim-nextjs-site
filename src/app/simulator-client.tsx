"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
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
import { MobileMenu } from "@/components/mobile-menu";
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
  calcAdaptiveDamage,
  calcEffectiveMR,
  calcMagicDamage,
  calcPhysicalDamage,
  calcLethality,
  calcEffectiveArmor,
} from "@/lib/calc/damage";
import {
  KEYSTONE_IDS,
  SUBRUNE_IDS,
  isMelee as checkIsMelee,
  hasSubRune,
  calcPtaDamage,
  PTA_AMP,
  LETHAL_TEMPO_MAX_STACKS,
  calcLethalTempoOnHit,
  calcFleetHeal,
  calcElectrocuteDamage,
  calcDarkHarvestDamage,
  calcAeryDamage,
  calcCometDamage,
  calcGraspDamage,
  calcGraspHeal,
  calcAftershockDamage,
  FIRST_STRIKE_AMP,
  calcCheapShotDamage,
  calcSuddenImpactDamage,
  calcScorchDamage,
  calcTasteOfBloodHeal,
  COUP_DE_GRACE_AMP,
  COUP_DE_GRACE_THRESHOLD,
  CUT_DOWN_AMP,
  CUT_DOWN_THRESHOLD,
  calcLastStandAmp,
  CHARGE_SUBRUNE_IDS,
  countJackStacks,
  calcJackBonus,
  calcBonePlatingReduction,
  BONE_PLATING_HITS,
  calcSecondWindHeal,
  BISCUIT_MAX_HP_PER_USE,
  BISCUIT_MAX_COUNT,
  calcShieldBashDamage,
  calcRevitalizeMultiplier,
  calcAeryShield,
} from "@/lib/data/keystone-effects";
import {
  calculateMasterworkBonusForItem,
  calculateOrnnPercentBonus,
} from "@/lib/calc/ornn-masterwork";
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
import { useDragonData } from "@/lib/data/use-dragon-data";
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
  getConditionalShields,
  type ItemStackBonus,
  type ItemHealEffect,
  type ItemConditionalShield,
} from "@/lib/data/item-effects";
import { getChampionComboPassives } from "@/lib/data/champion-combo-effects";
import { STAT_SHARDS } from "@/lib/data/runes";
import { SUMMONER_SPELLS } from "@/lib/data/summoner-spells";
import { getSplashPosition } from "@/lib/data/splash-positions";
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

/** Splash art URL with Community Dragon CDN override for champions with outdated DDragon splash */
const SPLASH_OVERRIDES: Record<string, string> = {
  Fiddlesticks: "https://cdn.communitydragon.org/latest/champion/9/splash-art",
};

function getSplashUrl(imageFileName: string, championId: string): string {
  if (SPLASH_OVERRIDES[championId]) return SPLASH_OVERRIDES[championId];
  if (imageFileName.startsWith('_profileicon_')) {
    return `https://ddragon.leagueoflegends.com/cdn/15.5.1/img/profileicon/${imageFileName.replace('_profileicon_', '')}.png`;
  }
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${imageFileName.replace(".png", "")}_0.jpg`;
}

/** Resolve champion icon URL (handles profileicon for dummy). */
function getChampionIconUrl(version: string, imageFileName: string): string {
  if (imageFileName.startsWith('_profileicon_')) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${imageFileName.replace('_profileicon_', '')}.png`;
  }
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${imageFileName}`;
}

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
  percentArmorReduction: 0,
  critDamageReduction: 0,
  healShieldPower: 0,
  grievousWounds: 0,
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

export function SimulatorClient() {
  return (
    <LocaleProvider>
      <TooltipProvider>
        <Suspense>
          <SimulatorInner />
        </Suspense>
      </TooltipProvider>
    </LocaleProvider>
  );
}

// Guard for init-once pattern removed — now uses useRef inside component

// Hoisted static JSX (rendering-hoist-jsx)
const VS_BADGE = (
  <div className="flex items-center gap-3 my-1 w-full">
    <div className="flex-1 h-px bg-border" />
    <div className="text-lg font-bold text-muted-foreground">VS</div>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const DUMMY_CHAMPION: Champion = {
  id: '_Dummy',
  key: '0',
  name: 'ダミー人形',
  title: 'Training Dummy',
  tags: [],
  stats: {
    hp: 1000, hpPerLevel: 0, mp: 0, mpPerLevel: 0,
    moveSpeed: 0, armor: 0, armorPerLevel: 0,
    magicResist: 0, magicResistPerLevel: 0,
    attackRange: 0, hpRegen: 0, hpRegenPerLevel: 0,
    mpRegen: 0, mpRegenPerLevel: 0,
    attackDamage: 0, attackDamagePerLevel: 0,
    attackSpeed: 0, attackSpeedPerLevel: 0,
    crit: 0, critPerLevel: 0,
  },
  spells: [],
  passive: { name: '', description: '', image: '' },
  image: '_profileicon_29',
  splash: '',
};

function SimulatorInner() {
  const didInitRef = useRef(false);
  const { version, champions: rawChampions, items, runePaths, enRunePaths, enChampionNames, enItemData, loading: dragonLoading, error } = useDragonData();
  const champions = useMemo(() => [...rawChampions, DUMMY_CHAMPION], [rawChampions]);
  const { locale, setLocale, t } = useLocale();

  /** Get display name for a champion respecting locale */
  const getChampionDisplayName = useCallback((champ: Champion | null): string => {
    if (!champ) return "";
    if (champ.id === '_Dummy') return locale === "en" ? "Training Dummy" : "ダミー人形";
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
  const [allyLifelineActive, setAllyLifelineActive] = useState(false);
  const [allyConditionalShieldToggles, setAllyConditionalShieldToggles] = useState<Record<string, number>>({});
  const [allyComboPassiveValues, setAllyComboPassiveValues] = useState<
    Record<string, number>
  >({});
  const [allyFormGroup, setAllyFormGroup] = useState<string>('');
  const [allySkillEvolutions, setAllySkillEvolutions] = useState<Record<string, string>>({});
  const [allySylasRChampId, setAllySylasRChampId] = useState<string | null>(null);
  const [allySylasRSkill, setAllySylasRSkill] = useState<SkillData | null>(null);

  // Rune combo charges (number of procs in combo, keyed by rune ID string)
  const [allyRuneCharges, setAllyRuneCharges] = useState<Record<string, number>>({});
  const [enemyRuneCharges, setEnemyRuneCharges] = useState<Record<string, number>>({});
  const [allyRuneItemCharges, setAllyRuneItemCharges] = useState<Record<string, number>>({});
  const [enemyRuneItemCharges, setEnemyRuneItemCharges] = useState<Record<string, number>>({});

  // Role quest state
  const [allyTopQuest, setAllyTopQuest] = useState(false);
  const [allyBotQuest, setAllyBotQuest] = useState(false);
  const [enemyTopQuest, setEnemyTopQuest] = useState(false);
  const [enemyBotQuest, setEnemyBotQuest] = useState(false);

  // Masterwork slot: which item slot (0-5) has Ornn masterwork upgrade, or null
  const [allyMasterworkSlot, setAllyMasterworkSlot] = useState<number | null>(null);
  const [enemyMasterworkSlot, setEnemyMasterworkSlot] = useState<number | null>(null);

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
  const [enemyLifelineActive, setEnemyLifelineActive] = useState(false);
  const [enemyConditionalShieldToggles, setEnemyConditionalShieldToggles] = useState<Record<string, number>>({});
  const [enemyComboPassiveValues, setEnemyComboPassiveValues] = useState<
    Record<string, number>
  >({});
  const [enemyFormGroup, setEnemyFormGroup] = useState<string>('');
  const [enemySkillEvolutions, setEnemySkillEvolutions] = useState<Record<string, string>>({});
  const [enemySylasRChampId, setEnemySylasRChampId] = useState<string | null>(null);
  const [enemySylasRSkill, setEnemySylasRSkill] = useState<SkillData | null>(null);

  const [gameMinute, setGameMinute] = useState(0);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<"ally" | "vs" | "enemy">("ally");

  // Restore state: URL params > load-build instruction > localStorage
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
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
        const resolvedSpells: [SummonerSpell | null, SummonerSpell | null] = [
          loadInstruction.spells?.[0] ? SUMMONER_SPELLS.find((s) => s.id === loadInstruction.spells![0]) ?? null : null,
          loadInstruction.spells?.[1] ? SUMMONER_SPELLS.find((s) => s.id === loadInstruction.spells![1]) ?? null : null,
        ];
        if (loadInstruction.side === "ally") {
          setAllyChampion(champ);
          setAllyLevel(loadInstruction.level);
          setAllyItems(loadInstruction.items);
          setAllyRunes(loadInstruction.runes);
          if (loadInstruction.spells) setAllySummoners(resolvedSpells);
        } else {
          setEnemyChampion(champ);
          setEnemyLevel(loadInstruction.level);
          setEnemyItems(loadInstruction.items);
          setEnemyRunes(loadInstruction.runes);
          if (loadInstruction.spells) setEnemySummoners(resolvedSpells);
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

  // Auto-sync Aftershock AR/MR toggle with charges
  useEffect(() => {
    const charges = allyRuneCharges[String(KEYSTONE_IDS.AFTERSHOCK)] ?? 0;
    if (allyRunes.keystone === KEYSTONE_IDS.AFTERSHOCK) {
      setAllyBonusValues((prev) => {
        const cur = prev["aftershock-resist"] ?? 0;
        const next = charges > 0 ? 1 : 0;
        return cur === next ? prev : { ...prev, "aftershock-resist": next };
      });
    }
  }, [allyRuneCharges, allyRunes.keystone]);

  useEffect(() => {
    const charges = enemyRuneCharges[String(KEYSTONE_IDS.AFTERSHOCK)] ?? 0;
    if (enemyRunes.keystone === KEYSTONE_IDS.AFTERSHOCK) {
      setEnemyBonusValues((prev) => {
        const cur = prev["aftershock-resist"] ?? 0;
        const next = charges > 0 ? 1 : 0;
        return cur === next ? prev : { ...prev, "aftershock-resist": next };
      });
    }
  }, [enemyRuneCharges, enemyRunes.keystone]);

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

  // TOP quest: clamp level to 18 when disabled
  useEffect(() => {
    if (!allyTopQuest && allyLevel > 18) setAllyLevel(18);
  }, [allyTopQuest, allyLevel]);
  useEffect(() => {
    if (!enemyTopQuest && enemyLevel > 18) setEnemyLevel(18);
  }, [enemyTopQuest, enemyLevel]);

  // BOT quest: expand/shrink items array
  useEffect(() => {
    if (allyBotQuest && allyItems.length < 7) {
      setAllyItems(prev => [...prev, null]);
    } else if (!allyBotQuest && allyItems.length > 6) {
      setAllyItems(prev => prev.slice(0, 6));
    }
  }, [allyBotQuest, allyItems.length]);
  useEffect(() => {
    if (enemyBotQuest && enemyItems.length < 7) {
      setEnemyItems(prev => [...prev, null]);
    } else if (!enemyBotQuest && enemyItems.length > 6) {
      setEnemyItems(prev => prev.slice(0, 6));
    }
  }, [enemyBotQuest, enemyItems.length]);

  // Clear masterwork if the slot's item is removed
  useEffect(() => {
    if (allyMasterworkSlot !== null && !allyItems[allyMasterworkSlot]) {
      setAllyMasterworkSlot(null);
    }
  }, [allyMasterworkSlot, allyItems]);
  useEffect(() => {
    if (enemyMasterworkSlot !== null && !enemyItems[enemyMasterworkSlot]) {
      setEnemyMasterworkSlot(null);
    }
  }, [enemyMasterworkSlot, enemyItems]);

  // Reset ally side
  const handleResetAlly = useCallback(() => {
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
    setAllySkillEvolutions({});
    setAllySylasRChampId(null);
    setAllySylasRSkill(null);
    setAllyRuneCharges({});
    setAllyRuneItemCharges({});
    setAllyTopQuest(false);
    setAllyBotQuest(false);
    setAllyMasterworkSlot(null);
  }, [runePaths]);

  // Reset enemy side
  const handleResetEnemy = useCallback(() => {
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
    setEnemySkillEvolutions({});
    setEnemySylasRChampId(null);
    setEnemySylasRSkill(null);
    setEnemyRuneCharges({});
    setEnemyRuneItemCharges({});
    setEnemyTopQuest(false);
    setEnemyBotQuest(false);
    setEnemyMasterworkSlot(null);
  }, [runePaths]);

  // Reset all state
  const handleReset = useCallback(() => {
    handleResetAlly();
    handleResetEnemy();
    setGameMinute(0);
    clearSimulatorState();
  }, [handleResetAlly, handleResetEnemy]);

  // Swap ally and enemy sides
  const handleSwapSides = useCallback(() => {
    const tmpChamp = allyChampion;
    const tmpLevel = allyLevel;
    const tmpItems = allyItems;
    const tmpRunes = allyRunes;
    const tmpSkillRanks = allySkillRanks;
    const tmpSkills = allySkills;
    const tmpBonusValues = allyBonusValues;
    const tmpGenericBonuses = allyGenericBonuses;
    const tmpComboCounts = allyComboCounts;
    const tmpAACounts = allyAACounts;
    const tmpCritCount = allyCritCount;
    const tmpSummoners = allySummoners;
    const tmpSummonerActive = allySummonerActive;
    const tmpItemActiveToggles = allyItemActiveToggles;
    const tmpOnHitToggles = allyOnHitToggles;
    const tmpItemStacks = allyItemStacks;
    const tmpHealCharges = allyHealCharges;
    const tmpComboPassiveValues = allyComboPassiveValues;
    const tmpDistanceMultipliers = allyDistanceMultipliers;
    const tmpFormGroup = allyFormGroup;
    const tmpSkillEvolutions = allySkillEvolutions;
    const tmpSylasRChampId = allySylasRChampId;
    const tmpSylasRSkill = allySylasRSkill;
    const tmpRuneCharges = allyRuneCharges;
    const tmpRuneItemCharges = allyRuneItemCharges;
    const tmpTopQuest = allyTopQuest;
    const tmpBotQuest = allyBotQuest;
    const tmpMasterworkSlot = allyMasterworkSlot;

    setAllyChampion(enemyChampion);
    setAllyLevel(enemyLevel);
    setAllyItems(enemyItems);
    setAllyRunes(enemyRunes);
    setAllySkillRanks(enemySkillRanks);
    setAllySkills(enemySkills);
    setAllyBonusValues(enemyBonusValues);
    setAllyGenericBonuses(enemyGenericBonuses);
    setAllyComboCounts(enemyComboCounts);
    setAllyAACounts(enemyAACounts);
    setAllyCritCount(enemyCritCount);
    setAllySummoners(enemySummoners);
    setAllySummonerActive(enemySummonerActive);
    setAllyItemActiveToggles(enemyItemActiveToggles);
    setAllyOnHitToggles(enemyOnHitToggles);
    setAllyItemStacks(enemyItemStacks);
    setAllyHealCharges(enemyHealCharges);
    setAllyComboPassiveValues(enemyComboPassiveValues);
    setAllyDistanceMultipliers(enemyDistanceMultipliers);
    setAllyFormGroup(enemyFormGroup);
    setAllySkillEvolutions(enemySkillEvolutions);
    setAllySylasRChampId(enemySylasRChampId);
    setAllySylasRSkill(enemySylasRSkill);
    setAllyRuneCharges(enemyRuneCharges);
    setAllyRuneItemCharges(enemyRuneItemCharges);
    setAllyTopQuest(enemyTopQuest);
    setAllyBotQuest(enemyBotQuest);
    setAllyMasterworkSlot(enemyMasterworkSlot);

    setEnemyChampion(tmpChamp);
    setEnemyLevel(tmpLevel);
    setEnemyItems(tmpItems);
    setEnemyRunes(tmpRunes);
    setEnemySkillRanks(tmpSkillRanks);
    setEnemySkills(tmpSkills);
    setEnemyBonusValues(tmpBonusValues);
    setEnemyGenericBonuses(tmpGenericBonuses);
    setEnemyComboCounts(tmpComboCounts);
    setEnemyAACounts(tmpAACounts);
    setEnemyCritCount(tmpCritCount);
    setEnemySummoners(tmpSummoners);
    setEnemySummonerActive(tmpSummonerActive);
    setEnemyItemActiveToggles(tmpItemActiveToggles);
    setEnemyOnHitToggles(tmpOnHitToggles);
    setEnemyItemStacks(tmpItemStacks);
    setEnemyHealCharges(tmpHealCharges);
    setEnemyComboPassiveValues(tmpComboPassiveValues);
    setEnemyDistanceMultipliers(tmpDistanceMultipliers);
    setEnemyFormGroup(tmpFormGroup);
    setEnemySkillEvolutions(tmpSkillEvolutions);
    setEnemySylasRChampId(tmpSylasRChampId);
    setEnemySylasRSkill(tmpSylasRSkill);
    setEnemyRuneCharges(tmpRuneCharges);
    setEnemyRuneItemCharges(tmpRuneItemCharges);
    setEnemyTopQuest(tmpTopQuest);
    setEnemyBotQuest(tmpBotQuest);
    setEnemyMasterworkSlot(tmpMasterworkSlot);
  }, [
    allyChampion, allyLevel, allyItems, allyRunes, allySkillRanks, allySkills,
    allyBonusValues, allyGenericBonuses, allyComboCounts, allyAACounts, allyCritCount,
    allySummoners, allySummonerActive, allyItemActiveToggles, allyOnHitToggles,
    allyItemStacks, allyHealCharges, allyComboPassiveValues, allyDistanceMultipliers,
    allyFormGroup, allySylasRChampId, allySylasRSkill, allyRuneCharges,
    allyTopQuest, allyBotQuest, allyMasterworkSlot,
    enemyChampion, enemyLevel, enemyItems, enemyRunes, enemySkillRanks, enemySkills,
    enemyBonusValues, enemyGenericBonuses, enemyComboCounts, enemyAACounts, enemyCritCount,
    enemySummoners, enemySummonerActive, enemyItemActiveToggles, enemyOnHitToggles,
    enemyItemStacks, enemyHealCharges, enemyComboPassiveValues, enemyDistanceMultipliers,
    enemyFormGroup, enemySylasRChampId, enemySylasRSkill, enemyRuneCharges,
    enemyTopQuest, enemyBotQuest, enemyMasterworkSlot,
  ]);

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
    setAllySkillEvolutions({});
    setAllySylasRChampId(null);
    setAllySylasRSkill(null);
  }, [allyChampion?.id]);

  useEffect(() => {
    setEnemyBonusValues({});
    setEnemyGenericBonuses(DEFAULT_GENERIC_BONUSES);
    setEnemyComboPassiveValues({});
    setEnemyFormGroup('');
    setEnemySkillEvolutions({});
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

  // Helper: clamp aaLinked passive values to current AA count, auto-resolve critLinked
  const getPassiveVal = useCallback((p: ChampionComboPassive, values: Record<string, number>, aaCounts: number) => {
    if (p.critLinked) return values[p.id] ?? 0;
    const raw = values[p.id] ?? p.defaultValue;
    if (p.aaLinked) return Math.min(raw, aaCounts);
    return raw;
  }, []);

  // Auto-sync critLinked passive values with crit count
  useEffect(() => {
    for (const p of allyComboPassives) {
      if (p.critLinked) {
        setAllyComboPassiveValues((prev) => {
          if (prev[p.id] === allyCritCount) return prev;
          return { ...prev, [p.id]: allyCritCount };
        });
      }
    }
  }, [allyCritCount, allyComboPassives]);

  useEffect(() => {
    for (const p of enemyComboPassives) {
      if (p.critLinked) {
        setEnemyComboPassiveValues((prev) => {
          if (prev[p.id] === enemyCritCount) return prev;
          return { ...prev, [p.id]: enemyCritCount };
        });
      }
    }
  }, [enemyCritCount, enemyComboPassives]);

  // Compute combo passive stat bonuses
  const allyComboPassiveStatBonus = useMemo<BonusStats>(() => {
    const result: BonusStats = {};
    for (const p of allyComboPassives) {
      if (!p.statBonus) continue;
      const val = getPassiveVal(p, allyComboPassiveValues, allyAACounts);
      const bonus = p.statBonus(val, allyLevel);
      for (const [k, v] of Object.entries(bonus)) {
        if (v)
          (result as Record<string, number>)[k] =
            ((result as Record<string, number>)[k] ?? 0) + (v as number);
      }
    }
    return result;
  }, [allyComboPassives, allyComboPassiveValues, allyLevel, allyAACounts, getPassiveVal]);

  const enemyComboPassiveStatBonus = useMemo<BonusStats>(() => {
    const result: BonusStats = {};
    for (const p of enemyComboPassives) {
      if (!p.statBonus) continue;
      const val = getPassiveVal(p, enemyComboPassiveValues, enemyAACounts);
      const bonus = p.statBonus(val, enemyLevel);
      for (const [k, v] of Object.entries(bonus)) {
        if (v)
          (result as Record<string, number>)[k] =
            ((result as Record<string, number>)[k] ?? 0) + (v as number);
      }
    }
    return result;
  }, [enemyComboPassives, enemyComboPassiveValues, enemyLevel, enemyAACounts, getPassiveVal]);

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

  // Filter rune bonuses by selected runes (only include bonuses for runes actually selected)
  const allyFilteredRuneBonuses = useMemo(() => {
    const ids = new Set([
      allyRunes.keystone, allyRunes.primarySlot1, allyRunes.primarySlot2,
      allyRunes.primarySlot3, allyRunes.secondarySlot1, allyRunes.secondarySlot2,
    ]);
    return runeBonusList.filter((b) => !b.runeId || ids.has(b.runeId));
  }, [runeBonusList, allyRunes]);

  const enemyFilteredRuneBonuses = useMemo(() => {
    const ids = new Set([
      enemyRunes.keystone, enemyRunes.primarySlot1, enemyRunes.primarySlot2,
      enemyRunes.primarySlot3, enemyRunes.secondarySlot1, enemyRunes.secondarySlot2,
    ]);
    return runeBonusList.filter((b) => !b.runeId || ids.has(b.runeId));
  }, [runeBonusList, enemyRunes]);

  // Compute merged bonus stats (includes combo passive stat bonuses + item stack bonuses)
  const allyMergedBonusStats = useMemo<BonusStats>(() => {
    const allBonuses = [...allyChampionBonuses, ...allyFilteredRuneBonuses, ...allyItemBonuses];
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
    // Rune item bonuses (Biscuit: +30 HP per charge, Triple Tonic Force: +15AD or +25AP)
    {
      const biscuitCount = allyRuneItemCharges['biscuit'] ?? 0;
      if (biscuitCount > 0) {
        base.hp = (base.hp ?? 0) + biscuitCount * BISCUIT_MAX_HP_PER_USE;
      }
      const forceActive = allyRuneItemCharges['tonic-force'] ?? 0;
      if (forceActive > 0) {
        if ((base.ad ?? 0) >= (base.ap ?? 0)) {
          base.ad = (base.ad ?? 0) + 15;
        } else {
          base.ap = (base.ap ?? 0) + 25;
        }
      }
    }
    // Jack of All Trades: auto-count unique item stats
    if (hasSubRune(allyRunes, SUBRUNE_IDS.JACK_OF_ALL_TRADES)) {
      const stacks = countJackStacks(resolveItems(allyItems));
      if (stacks > 0) {
        const isAD = (base.ad ?? 0) >= (base.ap ?? 0);
        const bonus = calcJackBonus(stacks, isAD);
        base.abilityHaste = (base.abilityHaste ?? 0) + bonus.abilityHaste;
        if (bonus.ad > 0) base.ad = (base.ad ?? 0) + bonus.ad;
        if (bonus.ap > 0) base.ap = (base.ap ?? 0) + bonus.ap;
      }
    }
    // Masterwork: apply +1000g stats to the selected masterwork item
    if (allyMasterworkSlot !== null && allyItems[allyMasterworkSlot]) {
      const mwItem = itemById.get(allyItems[allyMasterworkSlot]!);
      if (mwItem) {
        const mwBonus = calculateMasterworkBonusForItem(mwItem);
        for (const [k, v] of Object.entries(mwBonus)) {
          if (v) (base as Record<string, number>)[k] = ((base as Record<string, number>)[k] ?? 0) + (v as number);
        }
      }
    }
    // Ornn-only: percentage bonus on ALL bonus AR/MR/HP (10% + 4% per upgrade)
    if (allyChampion?.id === 'Ornn' && allyLevel >= 13) {
      const equippedItems = resolveItems(allyItems);
      // upgradeCount = 1 for self in 1v1 context
      const upgradeCount = allyMasterworkSlot !== null ? 1 : 0;
      let itemAr = 0, itemMr = 0, itemHp = 0;
      for (const item of equippedItems) {
        itemAr += item.stats.armor ?? 0;
        itemMr += item.stats.mr ?? 0;
        itemHp += item.stats.hp ?? 0;
      }
      const pctBonus = calculateOrnnPercentBonus(
        upgradeCount,
        (base.armor ?? 0) + itemAr,
        (base.mr ?? 0) + itemMr,
        (base.hp ?? 0) + itemHp,
      );
      base.armor = (base.armor ?? 0) + (pctBonus.armor ?? 0);
      base.mr = (base.mr ?? 0) + (pctBonus.mr ?? 0);
      base.hp = (base.hp ?? 0) + (pctBonus.hp ?? 0);
    }
    return base;
  }, [
    allyChampionBonuses,
    allyFilteredRuneBonuses,
    allyItemBonuses,
    allyBonusValues,
    allyGenericBonuses,
    allyLevel,
    allyComboPassiveStatBonus,
    allyItemStackStatBonus,
    allyRuneItemCharges,
    allyRunes,
    allyItems,
    allyChampion,
    allyMasterworkSlot,
    itemById,
    resolveItems,
  ]);

  const enemyMergedBonusStats = useMemo<BonusStats>(() => {
    const allBonuses = [...enemyChampionBonuses, ...enemyFilteredRuneBonuses, ...enemyItemBonuses];
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
    // Rune item bonuses
    {
      const biscuitCount = enemyRuneItemCharges['biscuit'] ?? 0;
      if (biscuitCount > 0) {
        base.hp = (base.hp ?? 0) + biscuitCount * BISCUIT_MAX_HP_PER_USE;
      }
      const forceActive = enemyRuneItemCharges['tonic-force'] ?? 0;
      if (forceActive > 0) {
        if ((base.ad ?? 0) >= (base.ap ?? 0)) {
          base.ad = (base.ad ?? 0) + 15;
        } else {
          base.ap = (base.ap ?? 0) + 25;
        }
      }
    }
    // Jack of All Trades: auto-count unique item stats
    if (hasSubRune(enemyRunes, SUBRUNE_IDS.JACK_OF_ALL_TRADES)) {
      const stacks = countJackStacks(resolveItems(enemyItems));
      if (stacks > 0) {
        const isAD = (base.ad ?? 0) >= (base.ap ?? 0);
        const bonus = calcJackBonus(stacks, isAD);
        base.abilityHaste = (base.abilityHaste ?? 0) + bonus.abilityHaste;
        if (bonus.ad > 0) base.ad = (base.ad ?? 0) + bonus.ad;
        if (bonus.ap > 0) base.ap = (base.ap ?? 0) + bonus.ap;
      }
    }
    // Masterwork: apply +1000g stats to the selected masterwork item
    if (enemyMasterworkSlot !== null && enemyItems[enemyMasterworkSlot]) {
      const mwItem = itemById.get(enemyItems[enemyMasterworkSlot]!);
      if (mwItem) {
        const mwBonus = calculateMasterworkBonusForItem(mwItem);
        for (const [k, v] of Object.entries(mwBonus)) {
          if (v) (base as Record<string, number>)[k] = ((base as Record<string, number>)[k] ?? 0) + (v as number);
        }
      }
    }
    // Ornn-only: percentage bonus on ALL bonus AR/MR/HP
    if (enemyChampion?.id === 'Ornn' && enemyLevel >= 13) {
      const equippedItems = resolveItems(enemyItems);
      const upgradeCount = enemyMasterworkSlot !== null ? 1 : 0;
      let itemAr = 0, itemMr = 0, itemHp = 0;
      for (const item of equippedItems) {
        itemAr += item.stats.armor ?? 0;
        itemMr += item.stats.mr ?? 0;
        itemHp += item.stats.hp ?? 0;
      }
      const pctBonus = calculateOrnnPercentBonus(
        upgradeCount,
        (base.armor ?? 0) + itemAr,
        (base.mr ?? 0) + itemMr,
        (base.hp ?? 0) + itemHp,
      );
      base.armor = (base.armor ?? 0) + (pctBonus.armor ?? 0);
      base.mr = (base.mr ?? 0) + (pctBonus.mr ?? 0);
      base.hp = (base.hp ?? 0) + (pctBonus.hp ?? 0);
    }
    return base;
  }, [
    enemyChampionBonuses,
    enemyFilteredRuneBonuses,
    enemyItemBonuses,
    enemyBonusValues,
    enemyGenericBonuses,
    enemyLevel,
    enemyComboPassiveStatBonus,
    enemyItemStackStatBonus,
    enemyRuneItemCharges,
    enemyRunes,
    enemyItems,
    enemyChampion,
    enemyMasterworkSlot,
    itemById,
    resolveItems,
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

  // Lifeline shields (Maw, Sterak's, Shieldbow) — toggle-based
  const allyLifelineInfo = useMemo(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getLifelineShield(ids, allyStats, allyLevel);
  }, [allyItems, allyStats, allyLevel]);

  const allyLifelineShield = allyLifelineActive ? (allyLifelineInfo?.shield ?? 0) : 0;
  const allyLifelineShieldType = allyLifelineInfo?.item?.shieldType ?? 'all';

  const enemyLifelineInfo = useMemo(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getLifelineShield(ids, enemyStats, enemyLevel);
  }, [enemyItems, enemyStats, enemyLevel]);

  const enemyLifelineShield = enemyLifelineActive ? (enemyLifelineInfo?.shield ?? 0) : 0;
  const enemyLifelineShieldType = enemyLifelineInfo?.item?.shieldType ?? 'all';

  // Conditional shields (non-lifeline, stackable)
  const allyConditionalShields = useMemo(() => {
    const ids = allyItems.filter((id): id is string => id !== null);
    return getConditionalShields(ids);
  }, [allyItems]);

  const allyConditionalShieldsByType = useMemo(() => {
    const shields = { physical: 0, magic: 0, all: 0 };
    for (const s of allyConditionalShields) {
      const charges = allyConditionalShieldToggles[s.itemId] ?? 0;
      if (charges > 0) {
        shields[s.shieldType] += s.calc(allyStats, allyLevel) * charges;
      }
    }
    return shields;
  }, [allyConditionalShields, allyConditionalShieldToggles, allyStats, allyLevel]);
  const allyConditionalShieldTotal = allyConditionalShieldsByType.physical + allyConditionalShieldsByType.magic + allyConditionalShieldsByType.all;

  const enemyConditionalShields = useMemo(() => {
    const ids = enemyItems.filter((id): id is string => id !== null);
    return getConditionalShields(ids);
  }, [enemyItems]);

  const enemyConditionalShieldsByType = useMemo(() => {
    const shields = { physical: 0, magic: 0, all: 0 };
    for (const s of enemyConditionalShields) {
      const charges = enemyConditionalShieldToggles[s.itemId] ?? 0;
      if (charges > 0) {
        shields[s.shieldType] += s.calc(enemyStats, enemyLevel) * charges;
      }
    }
    return shields;
  }, [enemyConditionalShields, enemyConditionalShieldToggles, enemyStats, enemyLevel]);
  const enemyConditionalShieldTotal = enemyConditionalShieldsByType.physical + enemyConditionalShieldsByType.magic + enemyConditionalShieldsByType.all;

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
    const results: SkillDamageResult[] = [];
    for (const skill of allyEffectiveSkills) {
      if (skill.key === "P") continue;
      const rank = allySkillRanks[skill.key] ?? 1;
      if (skill.subCasts && skill.subCasts.length > 0) {
        // Filter by formGroup and evolutionGroup
        const visibleSubCasts = skill.subCasts.filter((sc) => {
          // formGroup filter (global)
          if (sc.formGroup) {
            const hasFormGroups = skill.subCasts!.some(s => s.formGroup);
            if (hasFormGroups) {
              if (sc.formGroup !== (allyFormGroup || skill.subCasts!.find(s => s.formGroup)?.formGroup)) return false;
            }
          }
          // evolutionGroup filter (per-skill)
          if (sc.evolutionGroup) {
            const activeEvo = allySkillEvolutions[skill.key];
            if (!activeEvo) {
              // Default: show 'normal' group, hide 'evolved' unless explicitly toggled
              return sc.evolutionGroup === 'normal';
            }
            return sc.evolutionGroup === activeEvo;
          }
          return true;
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
              enemyStats,
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
          enemyStats,
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
    allySkillEvolutions,
    getSpellNameJa,
  ]);

  // Skill damages: enemy -> ally (including sub-casts)
  const enemySkillDamages = useMemo<SkillDamageResult[]>(() => {
    if (!allyChampion || !enemyChampion || enemyEffectiveSkills.length === 0) return [];
    const results: SkillDamageResult[] = [];
    for (const skill of enemyEffectiveSkills) {
      if (skill.key === "P") continue;
      const rank = enemySkillRanks[skill.key] ?? 1;
      if (skill.subCasts && skill.subCasts.length > 0) {
        const visibleSubCasts = skill.subCasts.filter((sc) => {
          if (sc.formGroup) {
            const hasFormGroups = skill.subCasts!.some(s => s.formGroup);
            if (hasFormGroups) {
              if (sc.formGroup !== (enemyFormGroup || skill.subCasts!.find(s => s.formGroup)?.formGroup)) return false;
            }
          }
          if (sc.evolutionGroup) {
            const activeEvo = enemySkillEvolutions[skill.key];
            if (!activeEvo) return sc.evolutionGroup === 'normal';
            return sc.evolutionGroup === activeEvo;
          }
          return true;
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
              allyStats,
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
          allyStats,
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
    enemySkillEvolutions,
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

  // Potion + Fleet Footwork healing totals
  const allyHealTotal = useMemo(() => {
    let total = 0;
    for (const effect of allyHealEffects) {
      const charges = allyHealCharges[effect.itemId] ?? 0;
      total += charges * effect.healPerCharge;
    }
    // Fleet Footwork heal
    const allyFleetProcs = allyRuneCharges[String(KEYSTONE_IDS.FLEET_FOOTWORK)] ?? 0;
    if (allyRunes.keystone === KEYSTONE_IDS.FLEET_FOOTWORK && allyFleetProcs > 0 && allyChampion) {
      const melee = checkIsMelee(allyStats.attackRange);
      const bonusAD = allyStats.ad - allyStats.baseAd;
      total += allyFleetProcs * calcFleetHeal(allyLevel, melee, bonusAD, allyStats.ap);
    }
    // Grasp of the Undying heal
    const allyGraspProcs = allyRuneCharges[String(KEYSTONE_IDS.GRASP_OF_THE_UNDYING)] ?? 0;
    if (allyRunes.keystone === KEYSTONE_IDS.GRASP_OF_THE_UNDYING && allyGraspProcs > 0 && allyChampion) {
      const melee = checkIsMelee(allyStats.attackRange);
      total += allyGraspProcs * calcGraspHeal(allyStats.maxHp, melee);
    }
    // Taste of Blood heal (charge-based)
    {
      const tobProcs = allyRuneCharges[String(SUBRUNE_IDS.TASTE_OF_BLOOD)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.TASTE_OF_BLOOD) && tobProcs > 0 && allyChampion) {
        const bonusAD = allyStats.ad - allyStats.baseAd;
        total += tobProcs * calcTasteOfBloodHeal(allyLevel, bonusAD, allyStats.ap);
      }
    }
    // Second Wind heal (charge-based, defender heals after taking damage)
    {
      const swProcs = allyRuneCharges[String(SUBRUNE_IDS.SECOND_WIND)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.SECOND_WIND) && swProcs > 0 && allyChampion) {
        // Estimate missing HP as 50% of max HP for a reasonable default
        total += swProcs * calcSecondWindHeal(allyStats.maxHp, allyStats.maxHp * 0.5);
      }
    }
    // Revitalize: +5% heal/shield power, +10% more below 40% HP
    if (hasSubRune(allyRunes, SUBRUNE_IDS.REVITALIZE)) {
      const hpPct = allyStats.hp / allyStats.maxHp;
      total *= calcRevitalizeMultiplier(hpPct);
    }
    // Spirit Visage / healShieldPower
    if (allyStats.healShieldPower > 0) {
      total *= (1 + allyStats.healShieldPower);
    }
    // Grievous Wounds from enemy reduces ally healing
    if (enemyStats.grievousWounds > 0) {
      total *= (1 - enemyStats.grievousWounds);
    }
    return total;
  }, [allyHealEffects, allyHealCharges, allyRunes, allyRuneCharges, allyChampion, allyStats, allyLevel, enemyStats]);

  const enemyHealTotal = useMemo(() => {
    let total = 0;
    for (const effect of enemyHealEffects) {
      const charges = enemyHealCharges[effect.itemId] ?? 0;
      total += charges * effect.healPerCharge;
    }
    // Fleet Footwork heal
    const enemyFleetProcs = enemyRuneCharges[String(KEYSTONE_IDS.FLEET_FOOTWORK)] ?? 0;
    if (enemyRunes.keystone === KEYSTONE_IDS.FLEET_FOOTWORK && enemyFleetProcs > 0 && enemyChampion) {
      const melee = checkIsMelee(enemyStats.attackRange);
      const bonusAD = enemyStats.ad - enemyStats.baseAd;
      total += enemyFleetProcs * calcFleetHeal(enemyLevel, melee, bonusAD, enemyStats.ap);
    }
    // Grasp of the Undying heal
    const enemyGraspProcs = enemyRuneCharges[String(KEYSTONE_IDS.GRASP_OF_THE_UNDYING)] ?? 0;
    if (enemyRunes.keystone === KEYSTONE_IDS.GRASP_OF_THE_UNDYING && enemyGraspProcs > 0 && enemyChampion) {
      const melee = checkIsMelee(enemyStats.attackRange);
      total += enemyGraspProcs * calcGraspHeal(enemyStats.maxHp, melee);
    }
    // Taste of Blood heal (charge-based)
    {
      const tobProcs = enemyRuneCharges[String(SUBRUNE_IDS.TASTE_OF_BLOOD)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.TASTE_OF_BLOOD) && tobProcs > 0 && enemyChampion) {
        const bonusAD = enemyStats.ad - enemyStats.baseAd;
        total += tobProcs * calcTasteOfBloodHeal(enemyLevel, bonusAD, enemyStats.ap);
      }
    }
    // Second Wind heal (charge-based, defender heals after taking damage)
    {
      const swProcs = enemyRuneCharges[String(SUBRUNE_IDS.SECOND_WIND)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.SECOND_WIND) && swProcs > 0 && enemyChampion) {
        total += swProcs * calcSecondWindHeal(enemyStats.maxHp, enemyStats.maxHp * 0.5);
      }
    }
    // Revitalize: +5% heal/shield power, +10% more below 40% HP
    if (hasSubRune(enemyRunes, SUBRUNE_IDS.REVITALIZE)) {
      const hpPct = enemyStats.hp / enemyStats.maxHp;
      total *= calcRevitalizeMultiplier(hpPct);
    }
    // Spirit Visage / healShieldPower
    if (enemyStats.healShieldPower > 0) {
      total *= (1 + enemyStats.healShieldPower);
    }
    // Grievous Wounds from ally reduces enemy healing
    if (allyStats.grievousWounds > 0) {
      total *= (1 - allyStats.grievousWounds);
    }
    return total;
  }, [enemyHealEffects, enemyHealCharges, enemyRunes, enemyRuneCharges, enemyChampion, enemyStats, enemyLevel, allyStats]);

  // Champion combo passive shields + Barrier summoner spell (split by shield type)
  const allyComboShields = useMemo(() => {
    const shields = { physical: 0, magic: 0, all: 0 };
    for (const p of allyComboPassives) {
      if (!p.shieldCalc) continue;
      const val = getPassiveVal(p, allyComboPassiveValues, allyAACounts);
      if (val <= 0) continue;
      const amount = p.shieldCalc(val, allyStats, allyLevel);
      const type = p.shieldType ?? 'all';
      shields[type] += amount;
    }
    // Barrier summoner spell shield (all type)
    for (let i = 0; i < 2; i++) {
      if (allySummonerActive[i] && allySummoners[i]?.shield) {
        shields.all += allySummoners[i]!.shield!(allyLevel);
      }
    }
    // Aery shield (charge-based, all type)
    const aeryShieldCharges = allyRuneCharges['aery-shield'] ?? 0;
    if (allyRunes.keystone === KEYSTONE_IDS.SUMMON_AERY && aeryShieldCharges > 0) {
      const bonusAD = allyStats.ad - allyStats.baseAd;
      shields.all += aeryShieldCharges * calcAeryShield(allyLevel, bonusAD, allyStats.ap);
    }
    // Revitalize & healShieldPower multiply all shield types
    let mult = 1;
    if (hasSubRune(allyRunes, SUBRUNE_IDS.REVITALIZE)) {
      const hpPct = allyStats.hp / allyStats.maxHp;
      mult *= calcRevitalizeMultiplier(hpPct);
    }
    if (allyStats.healShieldPower > 0) {
      mult *= (1 + allyStats.healShieldPower);
    }
    if (mult !== 1) {
      shields.physical *= mult;
      shields.magic *= mult;
      shields.all *= mult;
    }
    return shields;
  }, [allyComboPassives, allyComboPassiveValues, allyStats, allyLevel, allyAACounts, getPassiveVal, allySummoners, allySummonerActive, allyRunes, allyRuneCharges]);

  const enemyComboShields = useMemo(() => {
    const shields = { physical: 0, magic: 0, all: 0 };
    for (const p of enemyComboPassives) {
      if (!p.shieldCalc) continue;
      const val = getPassiveVal(p, enemyComboPassiveValues, enemyAACounts);
      if (val <= 0) continue;
      const amount = p.shieldCalc(val, enemyStats, enemyLevel);
      const type = p.shieldType ?? 'all';
      shields[type] += amount;
    }
    // Barrier summoner spell shield (all type)
    for (let i = 0; i < 2; i++) {
      if (enemySummonerActive[i] && enemySummoners[i]?.shield) {
        shields.all += enemySummoners[i]!.shield!(enemyLevel);
      }
    }
    // Aery shield (charge-based, all type)
    const aeryShieldCharges = enemyRuneCharges['aery-shield'] ?? 0;
    if (enemyRunes.keystone === KEYSTONE_IDS.SUMMON_AERY && aeryShieldCharges > 0) {
      const bonusAD = enemyStats.ad - enemyStats.baseAd;
      shields.all += aeryShieldCharges * calcAeryShield(enemyLevel, bonusAD, enemyStats.ap);
    }
    // Revitalize & healShieldPower multiply all shield types
    let mult = 1;
    if (hasSubRune(enemyRunes, SUBRUNE_IDS.REVITALIZE)) {
      const hpPct = enemyStats.hp / enemyStats.maxHp;
      mult *= calcRevitalizeMultiplier(hpPct);
    }
    if (enemyStats.healShieldPower > 0) {
      mult *= (1 + enemyStats.healShieldPower);
    }
    if (mult !== 1) {
      shields.physical *= mult;
      shields.magic *= mult;
      shields.all *= mult;
    }
    return shields;
  }, [enemyComboPassives, enemyComboPassiveValues, enemyStats, enemyLevel, enemyAACounts, getPassiveVal, enemySummoners, enemySummonerActive, enemyRunes, enemyRuneCharges]);

  // Legacy totals for backward compat in combo/kill calculations
  const allyComboShield = allyComboShields.physical + allyComboShields.magic + allyComboShields.all;
  const enemyComboShield = enemyComboShields.physical + enemyComboShields.magic + enemyComboShields.all;

  // Merged shields by type (lifeline + combo + conditional)
  const allyShieldsByType = useMemo(() => ({
    physical: allyComboShields.physical + allyConditionalShieldsByType.physical + (allyLifelineShieldType === 'physical' ? allyLifelineShield : 0),
    magic: allyComboShields.magic + allyConditionalShieldsByType.magic + (allyLifelineShieldType === 'magic' ? allyLifelineShield : 0),
    all: allyComboShields.all + allyConditionalShieldsByType.all + (allyLifelineShieldType === 'all' ? allyLifelineShield : 0),
  }), [allyComboShields, allyConditionalShieldsByType, allyLifelineShield, allyLifelineShieldType]);

  const enemyShieldsByType = useMemo(() => ({
    physical: enemyComboShields.physical + enemyConditionalShieldsByType.physical + (enemyLifelineShieldType === 'physical' ? enemyLifelineShield : 0),
    magic: enemyComboShields.magic + enemyConditionalShieldsByType.magic + (enemyLifelineShieldType === 'magic' ? enemyLifelineShield : 0),
    all: enemyComboShields.all + enemyConditionalShieldsByType.all + (enemyLifelineShieldType === 'all' ? enemyLifelineShield : 0),
  }), [enemyComboShields, enemyConditionalShieldsByType, enemyLifelineShield, enemyLifelineShieldType]);

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
  // NOTE: missingHpScaling passives are excluded here — they are calculated last in combo damage
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
        if (!p.onHit || p.onHit.missingHpScaling) continue;
        const val = getPassiveVal(p, allyComboPassiveValues, allyAACounts);
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
      allyAACounts,
      getPassiveVal,
    ]);

  // NOTE: missingHpScaling passives are excluded here — they are calculated last in combo damage
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
        if (!p.onHit || p.onHit.missingHpScaling) continue;
        const val = getPassiveVal(p, enemyComboPassiveValues, enemyAACounts);
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
      enemyAACounts,
      getPassiveVal,
    ]);

  // Combo passive skill bonus damage (e.g. Nasus Q stacks)
  const allyComboPassiveSkillBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};
    if (!allyChampion || !enemyChampion) return bonuses;
    for (const p of allyComboPassives) {
      if (!p.skillBonus) continue;
      const val = getPassiveVal(p, allyComboPassiveValues, allyAACounts);
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
    allyAACounts,
    getPassiveVal,
  ]);

  const enemyComboPassiveSkillBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};
    if (!allyChampion || !enemyChampion) return bonuses;
    for (const p of enemyComboPassives) {
      if (!p.skillBonus) continue;
      const val = getPassiveVal(p, enemyComboPassiveValues, enemyAACounts);
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
    enemyAACounts,
    getPassiveVal,
  ]);

  // Combo damage (combo counts * each skill + AA * count + spellblade procs + summoners + passives + keystones)
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

    // Keystone: Press the Attack
    const allyKeystoneId = allyRunes.keystone;
    if (allyKeystoneId === KEYSTONE_IDS.PRESS_THE_ATTACK && allyAACounts >= 3) {
      // 3rd AA proc: adaptive damage
      const ptaRaw = calcPtaDamage(allyLevel);
      const ptaDmg = calcAdaptiveDamage(ptaRaw, allyStats, enemyStats, allyLevel);
      total += ptaDmg;
      // Remaining AAs (after 3rd) and all skill damage amplified by 8%
      const preAmpTotal = total;
      // Amplify: AAs after the 3rd + all skill/passive/summoner/active damage
      const aaBeforeProc = 3;
      const aaDmgBeforeProc = (allyAADamage.total + allyComboPassiveOnHitPerAA) * aaBeforeProc;
      const aaDmgAfterProc = (allyAADamage.total + allyComboPassiveOnHitPerAA) * Math.max(0, allyAACounts - aaBeforeProc);
      // Everything except the first 3 AAs gets amplified
      const ampBase = preAmpTotal - aaDmgBeforeProc - ptaDmg;
      total = aaDmgBeforeProc + ptaDmg + ampBase * (1 + PTA_AMP);
    }

    // Keystone: Lethal Tempo (on-hit after 6 stacks)
    if (allyKeystoneId === KEYSTONE_IDS.LETHAL_TEMPO && allyAACounts > LETHAL_TEMPO_MAX_STACKS) {
      const melee = checkIsMelee(allyStats.attackRange);
      const bonusASPercent = Math.max(0, (allyStats.attackSpeed - 0.625) / 0.625 * 100);
      const ltOnHitRaw = calcLethalTempoOnHit(allyLevel, melee, bonusASPercent);
      const ltOnHitDmg = calcAdaptiveDamage(ltOnHitRaw, allyStats, enemyStats, allyLevel);
      const ltHits = allyAACounts - LETHAL_TEMPO_MAX_STACKS;
      total += ltOnHitDmg * ltHits;
    }

    // Keystone: Electrocute (charge-based)
    {
      const elecProcs = allyRuneCharges[String(KEYSTONE_IDS.ELECTROCUTE)] ?? 0;
      if (allyKeystoneId === KEYSTONE_IDS.ELECTROCUTE && elecProcs > 0) {
        const bonusAD = allyStats.ad - allyStats.baseAd;
        const raw = calcElectrocuteDamage(allyLevel, bonusAD, allyStats.ap);
        total += calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel) * elecProcs;
      }
    }

    // Keystone: Dark Harvest (1 proc, target below 50% HP assumed)
    if (allyKeystoneId === KEYSTONE_IDS.DARK_HARVEST) {
      const dhStacks = allyBonusValues['dark-harvest'] ?? 0;
      const bonusAD = allyStats.ad - allyStats.baseAd;
      const raw = calcDarkHarvestDamage(dhStacks, bonusAD, allyStats.ap);
      total += calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel);
    }

    // Keystone: Summon Aery (charge-based)
    {
      const aeryProcs = allyRuneCharges[String(KEYSTONE_IDS.SUMMON_AERY)] ?? 0;
      if (allyKeystoneId === KEYSTONE_IDS.SUMMON_AERY && aeryProcs > 0) {
        const bonusAD = allyStats.ad - allyStats.baseAd;
        const raw = calcAeryDamage(allyLevel, bonusAD, allyStats.ap);
        total += calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel) * aeryProcs;
      }
    }

    // Keystone: Arcane Comet (charge-based)
    {
      const cometProcs = allyRuneCharges[String(KEYSTONE_IDS.ARCANE_COMET)] ?? 0;
      if (allyKeystoneId === KEYSTONE_IDS.ARCANE_COMET && cometProcs > 0) {
        const bonusAD = allyStats.ad - allyStats.baseAd;
        const raw = calcCometDamage(allyLevel, bonusAD, allyStats.ap);
        total += calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel) * cometProcs;
      }
    }

    // Keystone: Grasp of the Undying (charge-based)
    {
      const graspProcs = allyRuneCharges[String(KEYSTONE_IDS.GRASP_OF_THE_UNDYING)] ?? 0;
      if (allyKeystoneId === KEYSTONE_IDS.GRASP_OF_THE_UNDYING && graspProcs > 0) {
        const melee = checkIsMelee(allyStats.attackRange);
        const raw = calcGraspDamage(allyStats.maxHp, melee);
        const effectiveMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        total += calcMagicDamage(raw, effectiveMR) * graspProcs;
      }
    }

    // Keystone: Aftershock (charge-based)
    {
      const afterProcs = allyRuneCharges[String(KEYSTONE_IDS.AFTERSHOCK)] ?? 0;
      if (allyKeystoneId === KEYSTONE_IDS.AFTERSHOCK && afterProcs > 0) {
        const bonusHp = allyStats.maxHp - allyStats.baseHp;
        const raw = calcAftershockDamage(allyLevel, bonusHp);
        const effectiveMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        total += calcMagicDamage(raw, effectiveMR) * afterProcs;
      }
    }

    // Sub-rune: Cheap Shot (charge-based true damage)
    {
      const csProcs = allyRuneCharges[String(SUBRUNE_IDS.CHEAP_SHOT)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.CHEAP_SHOT) && csProcs > 0) {
        total += calcCheapShotDamage(allyLevel) * csProcs;
      }
    }

    // Sub-rune: Sudden Impact (charge-based true damage)
    {
      const siProcs = allyRuneCharges[String(SUBRUNE_IDS.SUDDEN_IMPACT)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.SUDDEN_IMPACT) && siProcs > 0) {
        total += calcSuddenImpactDamage(allyLevel) * siProcs;
      }
    }

    // Sub-rune: Scorch (charge-based magic damage)
    {
      const scProcs = allyRuneCharges[String(SUBRUNE_IDS.SCORCH)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.SCORCH) && scProcs > 0) {
        const raw = calcScorchDamage(allyLevel);
        const effectiveMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        total += calcMagicDamage(raw, effectiveMR) * scProcs;
      }
    }

    // Sub-rune: Shield Bash (charge-based adaptive damage)
    {
      const sbProcs = allyRuneCharges[String(SUBRUNE_IDS.SHIELD_BASH)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.SHIELD_BASH) && sbProcs > 0) {
        const bonusHp = allyStats.maxHp - allyStats.baseHp;
        const totalShield = allyLifelineShield + allyComboShield + allyConditionalShieldTotal;
        const raw = calcShieldBashDamage(allyLevel, bonusHp, totalShield);
        // Adaptive: physical if AD > AP, else magic
        if (allyStats.ad - allyStats.baseAd > allyStats.ap) {
          const flatArmorPen = calcLethality(allyStats.lethality, allyLevel);
          const effectiveArmor = calcEffectiveArmor(enemyStats.armor, 0, allyStats.percentArmorReduction, allyStats.percentArmorPen, flatArmorPen);
          total += calcPhysicalDamage(raw, effectiveArmor) * sbProcs;
        } else {
          const effectiveMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
          total += calcMagicDamage(raw, effectiveMR) * sbProcs;
        }
      }
    }

    // Precision slot 3: Coup de Grace / Cut Down / Last Stand (damage amplification)
    {
      let ampPercent = 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.COUP_DE_GRACE)) {
        // 8% bonus damage to targets below 40% max HP
        // In a combo context, we apply it as a flat multiplier (simplified)
        const targetHpAfterDmg = Math.max(0, enemyStats.hp - total);
        if (targetHpAfterDmg / enemyStats.maxHp < COUP_DE_GRACE_THRESHOLD) {
          ampPercent = COUP_DE_GRACE_AMP;
        }
      } else if (hasSubRune(allyRunes, SUBRUNE_IDS.CUT_DOWN)) {
        // 8% bonus damage to targets above 60% max HP
        if (enemyStats.hp / enemyStats.maxHp >= CUT_DOWN_THRESHOLD) {
          ampPercent = CUT_DOWN_AMP;
        }
      } else if (hasSubRune(allyRunes, SUBRUNE_IDS.LAST_STAND)) {
        // 5-11% bonus damage based on own missing HP (uses target HP % slider concept)
        // Default: assume attacker is at full HP (no bonus), user can set via bonus
        const ownHpPercent = allyStats.hp / allyStats.maxHp;
        ampPercent = calcLastStandAmp(ownHpPercent);
      }
      if (ampPercent > 0) {
        total *= (1 + ampPercent);
      }
    }

    // Keystone: First Strike (charge-based, 7% bonus true damage)
    {
      const fsProcs = allyRuneCharges[String(KEYSTONE_IDS.FIRST_STRIKE)] ?? 0;
      if (allyKeystoneId === KEYSTONE_IDS.FIRST_STRIKE && fsProcs > 0) {
        total *= (1 + FIRST_STRIKE_AMP);
      }
    }

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

    // Defender's Bone Plating: enemy has Bone Plating → reduce incoming damage
    {
      const bpProcs = enemyRuneCharges[String(SUBRUNE_IDS.BONE_PLATING)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.BONE_PLATING) && bpProcs > 0) {
        const reductionPerHit = calcBonePlatingReduction(enemyLevel);
        total = Math.max(0, total - reductionPerHit * Math.min(bpProcs, BONE_PLATING_HITS));
      }
    }

    // Kayn Shadow Assassin passive: bonus magic damage = 20-42.35% of post-mitigation damage
    {
      const shadowVal = allyComboPassiveValues['kayn-shadow-assassin'] ?? 0;
      if (shadowVal > 0) {
        const pct = 0.20 + (0.2235 / 17) * (allyLevel - 1); // 20% → 42.35%
        const bonusRaw = total * pct;
        const effMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        total += calcMagicDamage(bonusRaw, effMR);
      }
    }

    // Yone E: Soul Unbound — repeats 25-35% of all damage dealt as true damage
    {
      const yoneEVal = allyComboPassiveValues['yone-e-amplify'] ?? 0;
      if (yoneEVal > 0) {
        const pct = 0.25 + (0.10 / 17) * (allyLevel - 1); // 25% → 35%
        total += total * pct;
      }
    }

    // Syndra P: Transcendent — +15% total damage at 120 splinters
    {
      const syndraVal = allyComboPassiveValues['syndra-passive'] ?? 0;
      if (syndraVal > 0) {
        total += total * 0.15;
      }
    }

    // Phase 3: missing-HP combo passives (e.g. Jhin 4th Shot) — calculated last with accumulated damage
    for (const p of allyComboPassives) {
      if (!p.onHit?.missingHpScaling) continue;
      const val = getPassiveVal(p, allyComboPassiveValues, allyAACounts);
      if (val <= 0) continue;
      // Target HP reduced by all prior damage
      const adjustedTarget = { ...enemyStats, hp: Math.max(0, enemyStats.hp - total) };
      const dmg = calcComboPassiveOnHitDamage(p, val, allyStats, adjustedTarget, allyLevel);
      total += dmg;
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
    allyComboPassives,
    allyComboPassiveValues,
    allyStats,
    enemyStats,
    allyLevel,
    enemyLevel,
    allyRunes,
    enemyRunes,
    allyRuneCharges,
    enemyRuneCharges,
    allyBonusValues,
    getPassiveVal,
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

    // Keystone: Press the Attack
    const enemyKeystoneId = enemyRunes.keystone;
    if (enemyKeystoneId === KEYSTONE_IDS.PRESS_THE_ATTACK && enemyAACounts >= 3) {
      const ptaRaw = calcPtaDamage(enemyLevel);
      const ptaDmg = calcAdaptiveDamage(ptaRaw, enemyStats, allyStats, enemyLevel);
      total += ptaDmg;
      const preAmpTotal = total;
      const aaBeforeProc = 3;
      const aaDmgBeforeProc = (enemyAADamage.total + enemyComboPassiveOnHitPerAA) * aaBeforeProc;
      const ampBase = preAmpTotal - aaDmgBeforeProc - ptaDmg;
      total = aaDmgBeforeProc + ptaDmg + ampBase * (1 + PTA_AMP);
    }

    // Keystone: Lethal Tempo (on-hit after 6 stacks)
    if (enemyKeystoneId === KEYSTONE_IDS.LETHAL_TEMPO && enemyAACounts > LETHAL_TEMPO_MAX_STACKS) {
      const melee = checkIsMelee(enemyStats.attackRange);
      const bonusASPercent = Math.max(0, (enemyStats.attackSpeed - 0.625) / 0.625 * 100);
      const ltOnHitRaw = calcLethalTempoOnHit(enemyLevel, melee, bonusASPercent);
      const ltOnHitDmg = calcAdaptiveDamage(ltOnHitRaw, enemyStats, allyStats, enemyLevel);
      const ltHits = enemyAACounts - LETHAL_TEMPO_MAX_STACKS;
      total += ltOnHitDmg * ltHits;
    }

    // Keystone: Electrocute (charge-based)
    {
      const elecProcs = enemyRuneCharges[String(KEYSTONE_IDS.ELECTROCUTE)] ?? 0;
      if (enemyKeystoneId === KEYSTONE_IDS.ELECTROCUTE && elecProcs > 0) {
        const bonusAD = enemyStats.ad - enemyStats.baseAd;
        const raw = calcElectrocuteDamage(enemyLevel, bonusAD, enemyStats.ap);
        total += calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel) * elecProcs;
      }
    }

    // Keystone: Dark Harvest (1 proc)
    if (enemyKeystoneId === KEYSTONE_IDS.DARK_HARVEST) {
      const dhStacks = enemyBonusValues['dark-harvest'] ?? 0;
      const bonusAD = enemyStats.ad - enemyStats.baseAd;
      const raw = calcDarkHarvestDamage(dhStacks, bonusAD, enemyStats.ap);
      total += calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel);
    }

    // Keystone: Summon Aery (charge-based)
    {
      const aeryProcs = enemyRuneCharges[String(KEYSTONE_IDS.SUMMON_AERY)] ?? 0;
      if (enemyKeystoneId === KEYSTONE_IDS.SUMMON_AERY && aeryProcs > 0) {
        const bonusAD = enemyStats.ad - enemyStats.baseAd;
        const raw = calcAeryDamage(enemyLevel, bonusAD, enemyStats.ap);
        total += calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel) * aeryProcs;
      }
    }

    // Keystone: Arcane Comet (charge-based)
    {
      const cometProcs = enemyRuneCharges[String(KEYSTONE_IDS.ARCANE_COMET)] ?? 0;
      if (enemyKeystoneId === KEYSTONE_IDS.ARCANE_COMET && cometProcs > 0) {
        const bonusAD = enemyStats.ad - enemyStats.baseAd;
        const raw = calcCometDamage(enemyLevel, bonusAD, enemyStats.ap);
        total += calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel) * cometProcs;
      }
    }

    // Keystone: Grasp of the Undying (charge-based)
    {
      const graspProcs = enemyRuneCharges[String(KEYSTONE_IDS.GRASP_OF_THE_UNDYING)] ?? 0;
      if (enemyKeystoneId === KEYSTONE_IDS.GRASP_OF_THE_UNDYING && graspProcs > 0) {
        const melee = checkIsMelee(enemyStats.attackRange);
        const raw = calcGraspDamage(enemyStats.maxHp, melee);
        const effectiveMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        total += calcMagicDamage(raw, effectiveMR) * graspProcs;
      }
    }

    // Keystone: Aftershock (charge-based)
    {
      const afterProcs = enemyRuneCharges[String(KEYSTONE_IDS.AFTERSHOCK)] ?? 0;
      if (enemyKeystoneId === KEYSTONE_IDS.AFTERSHOCK && afterProcs > 0) {
        const bonusHp = enemyStats.maxHp - enemyStats.baseHp;
        const raw = calcAftershockDamage(enemyLevel, bonusHp);
        const effectiveMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        total += calcMagicDamage(raw, effectiveMR) * afterProcs;
      }
    }

    // Sub-rune: Cheap Shot (charge-based true damage)
    {
      const csProcs = enemyRuneCharges[String(SUBRUNE_IDS.CHEAP_SHOT)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.CHEAP_SHOT) && csProcs > 0) {
        total += calcCheapShotDamage(enemyLevel) * csProcs;
      }
    }

    // Sub-rune: Sudden Impact (charge-based true damage)
    {
      const siProcs = enemyRuneCharges[String(SUBRUNE_IDS.SUDDEN_IMPACT)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.SUDDEN_IMPACT) && siProcs > 0) {
        total += calcSuddenImpactDamage(enemyLevel) * siProcs;
      }
    }

    // Sub-rune: Scorch (charge-based magic damage)
    {
      const scProcs = enemyRuneCharges[String(SUBRUNE_IDS.SCORCH)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.SCORCH) && scProcs > 0) {
        const raw = calcScorchDamage(enemyLevel);
        const effectiveMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        total += calcMagicDamage(raw, effectiveMR) * scProcs;
      }
    }

    // Sub-rune: Shield Bash (charge-based adaptive damage)
    {
      const sbProcs = enemyRuneCharges[String(SUBRUNE_IDS.SHIELD_BASH)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.SHIELD_BASH) && sbProcs > 0) {
        const bonusHp = enemyStats.maxHp - enemyStats.baseHp;
        const totalShield = enemyLifelineShield + enemyComboShield + enemyConditionalShieldTotal;
        const raw = calcShieldBashDamage(enemyLevel, bonusHp, totalShield);
        if (enemyStats.ad - enemyStats.baseAd > enemyStats.ap) {
          const flatArmorPen = calcLethality(enemyStats.lethality, enemyLevel);
          const effectiveArmor = calcEffectiveArmor(allyStats.armor, 0, enemyStats.percentArmorReduction, enemyStats.percentArmorPen, flatArmorPen);
          total += calcPhysicalDamage(raw, effectiveArmor) * sbProcs;
        } else {
          const effectiveMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
          total += calcMagicDamage(raw, effectiveMR) * sbProcs;
        }
      }
    }

    // Precision slot 3: Coup de Grace / Cut Down / Last Stand (damage amplification)
    {
      let ampPercent = 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.COUP_DE_GRACE)) {
        const targetHpAfterDmg = Math.max(0, allyStats.hp - total);
        if (targetHpAfterDmg / allyStats.maxHp < COUP_DE_GRACE_THRESHOLD) {
          ampPercent = COUP_DE_GRACE_AMP;
        }
      } else if (hasSubRune(enemyRunes, SUBRUNE_IDS.CUT_DOWN)) {
        if (allyStats.hp / allyStats.maxHp >= CUT_DOWN_THRESHOLD) {
          ampPercent = CUT_DOWN_AMP;
        }
      } else if (hasSubRune(enemyRunes, SUBRUNE_IDS.LAST_STAND)) {
        const ownHpPercent = enemyStats.hp / enemyStats.maxHp;
        ampPercent = calcLastStandAmp(ownHpPercent);
      }
      if (ampPercent > 0) {
        total *= (1 + ampPercent);
      }
    }

    // Keystone: First Strike (charge-based, 7% bonus true damage)
    {
      const fsProcs = enemyRuneCharges[String(KEYSTONE_IDS.FIRST_STRIKE)] ?? 0;
      if (enemyKeystoneId === KEYSTONE_IDS.FIRST_STRIKE && fsProcs > 0) {
        total *= (1 + FIRST_STRIKE_AMP);
      }
    }

    for (const { sd, count } of missingHpSkills) {
      let skillDmg = recalcMissingHpSkillDamage(
        sd, total, allyStats.maxHp, allyStats.hp, enemyStats, allyStats, enemyLevel,
      );
      if (enemyComboPassiveSkillBonuses[sd.skillKey]) {
        skillDmg += enemyComboPassiveSkillBonuses[sd.skillKey];
      }
      total += skillDmg * count;
    }

    // Defender's Bone Plating: ally has Bone Plating → reduce incoming damage
    {
      const bpProcs = allyRuneCharges[String(SUBRUNE_IDS.BONE_PLATING)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.BONE_PLATING) && bpProcs > 0) {
        const reductionPerHit = calcBonePlatingReduction(allyLevel);
        total = Math.max(0, total - reductionPerHit * Math.min(bpProcs, BONE_PLATING_HITS));
      }
    }

    // Kayn Shadow Assassin passive: bonus magic damage = 20-42.35% of post-mitigation damage
    {
      const shadowVal = enemyComboPassiveValues['kayn-shadow-assassin'] ?? 0;
      if (shadowVal > 0) {
        const pct = 0.20 + (0.2235 / 17) * (enemyLevel - 1); // 20% → 42.35%
        const bonusRaw = total * pct;
        const effMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        total += calcMagicDamage(bonusRaw, effMR);
      }
    }

    // Yone E: Soul Unbound — repeats 25-35% of all damage dealt as true damage
    {
      const yoneEVal = enemyComboPassiveValues['yone-e-amplify'] ?? 0;
      if (yoneEVal > 0) {
        const pct = 0.25 + (0.10 / 17) * (enemyLevel - 1); // 25% → 35%
        total += total * pct;
      }
    }

    // Syndra P: Transcendent — +15% total damage at 120 splinters
    {
      const syndraVal = enemyComboPassiveValues['syndra-passive'] ?? 0;
      if (syndraVal > 0) {
        total += total * 0.15;
      }
    }

    // Phase 3: missing-HP combo passives — calculated last with accumulated damage
    for (const p of enemyComboPassives) {
      if (!p.onHit?.missingHpScaling) continue;
      const val = getPassiveVal(p, enemyComboPassiveValues, enemyAACounts);
      if (val <= 0) continue;
      const adjustedTarget = { ...allyStats, hp: Math.max(0, allyStats.hp - total) };
      const dmg = calcComboPassiveOnHitDamage(p, val, enemyStats, adjustedTarget, enemyLevel);
      total += dmg;
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
    enemyComboPassives,
    enemyComboPassiveValues,
    enemyStats,
    allyStats,
    enemyLevel,
    allyLevel,
    enemyRunes,
    allyRunes,
    enemyRuneCharges,
    allyRuneCharges,
    enemyBonusValues,
    getPassiveVal,
  ]);

  // HP bar damage segments (combo-count-based)
  const allyDamageToEnemy = useMemo<DamageSegment[]>(() => {
    const segs: DamageSegment[] = [];
    if (allyPassiveDamage && (allyComboCounts["P"] ?? 0) > 0) {
      segs.push({
        source: "P",
        amount: allyPassiveDamage.totalAfterResist * allyComboCounts["P"],
        color: "",
        damageType: allyPassiveDamage.damageType,
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
        segs.push({ source: sd.skillKey, amount: skillDmg * count, color: "", damageType: sd.damageType });
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
      segs.push({ source: "AA", amount: aaTotal, color: "", damageType: 'physical' });
    }
    if (allySummonerDamage > 0) {
      segs.push({ source: "SUM", amount: allySummonerDamage, color: "" });
    }
    if (allyItemActiveDamage > 0) {
      segs.push({ source: "ITEM", amount: allyItemActiveDamage, color: "" });
    }
    // Keystone & sub-rune damage segments
    const allyKs = allyRunes.keystone;
    let skillUses = 0;
    for (const sd of allySkillDamages) {
      const comboKey = sd.subCastId ?? sd.skillKey;
      skillUses += allyComboCounts[comboKey] ?? 0;
    }
    const allyBonusAD = allyStats.ad - allyStats.baseAd;

    if (allyKs === KEYSTONE_IDS.PRESS_THE_ATTACK && allyAACounts >= 3) {
      const ptaRaw = calcPtaDamage(allyLevel);
      const ptaDmg = calcAdaptiveDamage(ptaRaw, allyStats, enemyStats, allyLevel);
      segs.push({ source: "PtA", amount: ptaDmg, color: "" });
    }
    if (allyKs === KEYSTONE_IDS.LETHAL_TEMPO && allyAACounts > LETHAL_TEMPO_MAX_STACKS) {
      const melee = checkIsMelee(allyStats.attackRange);
      const bonusASPercent = Math.max(0, (allyStats.attackSpeed - 0.625) / 0.625 * 100);
      const ltOnHitRaw = calcLethalTempoOnHit(allyLevel, melee, bonusASPercent);
      const ltOnHitDmg = calcAdaptiveDamage(ltOnHitRaw, allyStats, enemyStats, allyLevel);
      const ltHits = allyAACounts - LETHAL_TEMPO_MAX_STACKS;
      segs.push({ source: "LT", amount: ltOnHitDmg * ltHits, color: "" });
    }
    {
      const elecProcs = allyRuneCharges[String(KEYSTONE_IDS.ELECTROCUTE)] ?? 0;
      if (allyKs === KEYSTONE_IDS.ELECTROCUTE && elecProcs > 0) {
        const raw = calcElectrocuteDamage(allyLevel, allyBonusAD, allyStats.ap);
        segs.push({ source: "ELEC", amount: calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel) * elecProcs, color: "" });
      }
    }
    if (allyKs === KEYSTONE_IDS.DARK_HARVEST) {
      const dhStacks = allyBonusValues['dark-harvest'] ?? 0;
      const raw = calcDarkHarvestDamage(dhStacks, allyBonusAD, allyStats.ap);
      segs.push({ source: "DH", amount: calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel), color: "" });
    }
    {
      const aeryProcs = allyRuneCharges[String(KEYSTONE_IDS.SUMMON_AERY)] ?? 0;
      if (allyKs === KEYSTONE_IDS.SUMMON_AERY && aeryProcs > 0) {
        const raw = calcAeryDamage(allyLevel, allyBonusAD, allyStats.ap);
        segs.push({ source: "AERY", amount: calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel) * aeryProcs, color: "" });
      }
    }
    {
      const cometProcs = allyRuneCharges[String(KEYSTONE_IDS.ARCANE_COMET)] ?? 0;
      if (allyKs === KEYSTONE_IDS.ARCANE_COMET && cometProcs > 0) {
        const raw = calcCometDamage(allyLevel, allyBonusAD, allyStats.ap);
        segs.push({ source: "COMET", amount: calcAdaptiveDamage(raw, allyStats, enemyStats, allyLevel) * cometProcs, color: "" });
      }
    }
    {
      const graspProcs = allyRuneCharges[String(KEYSTONE_IDS.GRASP_OF_THE_UNDYING)] ?? 0;
      if (allyKs === KEYSTONE_IDS.GRASP_OF_THE_UNDYING && graspProcs > 0) {
        const melee = checkIsMelee(allyStats.attackRange);
        const raw = calcGraspDamage(allyStats.maxHp, melee);
        const effMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        segs.push({ source: "GRASP", amount: calcMagicDamage(raw, effMR) * graspProcs, color: "" });
      }
    }
    {
      const afterProcs = allyRuneCharges[String(KEYSTONE_IDS.AFTERSHOCK)] ?? 0;
      if (allyKs === KEYSTONE_IDS.AFTERSHOCK && afterProcs > 0) {
        const bonusHp = allyStats.maxHp - allyStats.baseHp;
        const raw = calcAftershockDamage(allyLevel, bonusHp);
        const effMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        segs.push({ source: "AFTER", amount: calcMagicDamage(raw, effMR) * afterProcs, color: "" });
      }
    }
    // Sub-rune damage segments (combined as "RUNE", charge-based)
    {
      let runeDmg = 0;
      const csProcs = allyRuneCharges[String(SUBRUNE_IDS.CHEAP_SHOT)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.CHEAP_SHOT) && csProcs > 0) {
        runeDmg += calcCheapShotDamage(allyLevel) * csProcs;
      }
      const siProcs = allyRuneCharges[String(SUBRUNE_IDS.SUDDEN_IMPACT)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.SUDDEN_IMPACT) && siProcs > 0) {
        runeDmg += calcSuddenImpactDamage(allyLevel) * siProcs;
      }
      const scProcs = allyRuneCharges[String(SUBRUNE_IDS.SCORCH)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.SCORCH) && scProcs > 0) {
        const raw = calcScorchDamage(allyLevel);
        const effMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        runeDmg += calcMagicDamage(raw, effMR) * scProcs;
      }
      // Shield Bash
      const sbProcs = allyRuneCharges[String(SUBRUNE_IDS.SHIELD_BASH)] ?? 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.SHIELD_BASH) && sbProcs > 0) {
        const bonusHp = allyStats.maxHp - allyStats.baseHp;
        const totalShield = allyLifelineShield + allyComboShield + allyConditionalShieldTotal;
        const raw = calcShieldBashDamage(allyLevel, bonusHp, totalShield);
        if (allyStats.ad - allyStats.baseAd > allyStats.ap) {
          const flatArmorPen = calcLethality(allyStats.lethality, allyLevel);
          const effArmor = calcEffectiveArmor(enemyStats.armor, 0, allyStats.percentArmorReduction, allyStats.percentArmorPen, flatArmorPen);
          runeDmg += calcPhysicalDamage(raw, effArmor) * sbProcs;
        } else {
          const effMR2 = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
          runeDmg += calcMagicDamage(raw, effMR2) * sbProcs;
        }
      }
      if (runeDmg > 0) {
        segs.push({ source: "RUNE", amount: runeDmg, color: "" });
      }
    }
    // Precision slot 3 amplification applied to all segments
    {
      let ampPercent = 0;
      if (hasSubRune(allyRunes, SUBRUNE_IDS.COUP_DE_GRACE)) {
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        const targetHpAfterDmg = Math.max(0, enemyStats.hp - preTotal);
        if (targetHpAfterDmg / enemyStats.maxHp < COUP_DE_GRACE_THRESHOLD) {
          ampPercent = COUP_DE_GRACE_AMP;
        }
      } else if (hasSubRune(allyRunes, SUBRUNE_IDS.CUT_DOWN)) {
        if (enemyStats.hp / enemyStats.maxHp >= CUT_DOWN_THRESHOLD) {
          ampPercent = CUT_DOWN_AMP;
        }
      } else if (hasSubRune(allyRunes, SUBRUNE_IDS.LAST_STAND)) {
        const ownHpPercent = allyStats.hp / allyStats.maxHp;
        ampPercent = calcLastStandAmp(ownHpPercent);
      }
      if (ampPercent > 0) {
        for (const seg of segs) {
          seg.amount *= (1 + ampPercent);
        }
      }
    }
    // First Strike amplification shown as separate segment
    {
      const fsProcs = allyRuneCharges[String(KEYSTONE_IDS.FIRST_STRIKE)] ?? 0;
      if (allyKs === KEYSTONE_IDS.FIRST_STRIKE && fsProcs > 0) {
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        segs.push({ source: "FS", amount: preTotal * FIRST_STRIKE_AMP, color: "" });
      }
    }
    // Kayn Shadow Assassin passive: bonus magic damage segment
    {
      const shadowVal = allyComboPassiveValues['kayn-shadow-assassin'] ?? 0;
      if (shadowVal > 0) {
        const pct = 0.20 + (0.2235 / 17) * (allyLevel - 1);
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        const bonusRaw = preTotal * pct;
        const effMR = calcEffectiveMR(enemyStats.mr, allyStats.flatMagicPen, allyStats.percentMagicPen);
        segs.push({ source: "影P", amount: calcMagicDamage(bonusRaw, effMR), color: "#a855f7" });
      }
    }
    // Yone E: Soul Unbound amplification segment
    {
      const yoneEVal = allyComboPassiveValues['yone-e-amplify'] ?? 0;
      if (yoneEVal > 0) {
        const pct = 0.25 + (0.10 / 17) * (allyLevel - 1);
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        segs.push({ source: "E増", amount: preTotal * pct, color: "#60a5fa" });
      }
    }
    // Syndra P: Transcendent amplification segment
    {
      const syndraVal = allyComboPassiveValues['syndra-passive'] ?? 0;
      if (syndraVal > 0) {
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        segs.push({ source: "P増", amount: preTotal * 0.15, color: "#c084fc" });
      }
    }
    // Phase 3: missing-HP combo passive segments (e.g. Jhin 4th Shot)
    for (const p of allyComboPassives) {
      if (!p.onHit?.missingHpScaling) continue;
      const val = getPassiveVal(p, allyComboPassiveValues, allyAACounts);
      if (val <= 0) continue;
      const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
      const adjustedTarget = { ...enemyStats, hp: Math.max(0, enemyStats.hp - preTotal) };
      const dmg = calcComboPassiveOnHitDamage(p, val, allyStats, adjustedTarget, allyLevel);
      if (dmg > 0) {
        segs.push({ source: "P", amount: dmg, color: "#f59e0b" });
      }
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
    allyComboPassives,
    allyComboPassiveValues,
    allyRunes,
    allyRuneCharges,
    allyBonusValues,
    allyStats,
    enemyStats,
    allyLevel,
    getPassiveVal,
  ]);

  const enemyDamageToAlly = useMemo<DamageSegment[]>(() => {
    const segs: DamageSegment[] = [];
    if (enemyPassiveDamage && (enemyComboCounts["P"] ?? 0) > 0) {
      segs.push({
        source: "P",
        amount: enemyPassiveDamage.totalAfterResist * enemyComboCounts["P"],
        color: "",
        damageType: enemyPassiveDamage.damageType,
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
        segs.push({ source: sd.skillKey, amount: skillDmg * count, color: "", damageType: sd.damageType });
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
      segs.push({ source: "AA", amount: aaTotal, color: "", damageType: 'physical' });
    }
    if (enemySummonerDamage > 0) {
      segs.push({ source: "SUM", amount: enemySummonerDamage, color: "" });
    }
    if (enemyItemActiveDamage > 0) {
      segs.push({ source: "ITEM", amount: enemyItemActiveDamage, color: "" });
    }
    // Keystone & sub-rune damage segments
    const enemyKs = enemyRunes.keystone;
    let skillUses = 0;
    for (const sd of enemySkillDamages) {
      const comboKey = sd.subCastId ?? sd.skillKey;
      skillUses += enemyComboCounts[comboKey] ?? 0;
    }
    const enemyBonusAD = enemyStats.ad - enemyStats.baseAd;

    if (enemyKs === KEYSTONE_IDS.PRESS_THE_ATTACK && enemyAACounts >= 3) {
      const ptaRaw = calcPtaDamage(enemyLevel);
      const ptaDmg = calcAdaptiveDamage(ptaRaw, enemyStats, allyStats, enemyLevel);
      segs.push({ source: "PtA", amount: ptaDmg, color: "" });
    }
    if (enemyKs === KEYSTONE_IDS.LETHAL_TEMPO && enemyAACounts > LETHAL_TEMPO_MAX_STACKS) {
      const melee = checkIsMelee(enemyStats.attackRange);
      const bonusASPercent = Math.max(0, (enemyStats.attackSpeed - 0.625) / 0.625 * 100);
      const ltOnHitRaw = calcLethalTempoOnHit(enemyLevel, melee, bonusASPercent);
      const ltOnHitDmg = calcAdaptiveDamage(ltOnHitRaw, enemyStats, allyStats, enemyLevel);
      const ltHits = enemyAACounts - LETHAL_TEMPO_MAX_STACKS;
      segs.push({ source: "LT", amount: ltOnHitDmg * ltHits, color: "" });
    }
    {
      const elecProcs = enemyRuneCharges[String(KEYSTONE_IDS.ELECTROCUTE)] ?? 0;
      if (enemyKs === KEYSTONE_IDS.ELECTROCUTE && elecProcs > 0) {
        const raw = calcElectrocuteDamage(enemyLevel, enemyBonusAD, enemyStats.ap);
        segs.push({ source: "ELEC", amount: calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel) * elecProcs, color: "" });
      }
    }
    if (enemyKs === KEYSTONE_IDS.DARK_HARVEST) {
      const dhStacks = enemyBonusValues['dark-harvest'] ?? 0;
      const raw = calcDarkHarvestDamage(dhStacks, enemyBonusAD, enemyStats.ap);
      segs.push({ source: "DH", amount: calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel), color: "" });
    }
    {
      const aeryProcs = enemyRuneCharges[String(KEYSTONE_IDS.SUMMON_AERY)] ?? 0;
      if (enemyKs === KEYSTONE_IDS.SUMMON_AERY && aeryProcs > 0) {
        const raw = calcAeryDamage(enemyLevel, enemyBonusAD, enemyStats.ap);
        segs.push({ source: "AERY", amount: calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel) * aeryProcs, color: "" });
      }
    }
    {
      const cometProcs = enemyRuneCharges[String(KEYSTONE_IDS.ARCANE_COMET)] ?? 0;
      if (enemyKs === KEYSTONE_IDS.ARCANE_COMET && cometProcs > 0) {
        const raw = calcCometDamage(enemyLevel, enemyBonusAD, enemyStats.ap);
        segs.push({ source: "COMET", amount: calcAdaptiveDamage(raw, enemyStats, allyStats, enemyLevel) * cometProcs, color: "" });
      }
    }
    {
      const graspProcs = enemyRuneCharges[String(KEYSTONE_IDS.GRASP_OF_THE_UNDYING)] ?? 0;
      if (enemyKs === KEYSTONE_IDS.GRASP_OF_THE_UNDYING && graspProcs > 0) {
        const melee = checkIsMelee(enemyStats.attackRange);
        const raw = calcGraspDamage(enemyStats.maxHp, melee);
        const effMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        segs.push({ source: "GRASP", amount: calcMagicDamage(raw, effMR) * graspProcs, color: "" });
      }
    }
    {
      const afterProcs = enemyRuneCharges[String(KEYSTONE_IDS.AFTERSHOCK)] ?? 0;
      if (enemyKs === KEYSTONE_IDS.AFTERSHOCK && afterProcs > 0) {
        const bonusHp = enemyStats.maxHp - enemyStats.baseHp;
        const raw = calcAftershockDamage(enemyLevel, bonusHp);
        const effMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        segs.push({ source: "AFTER", amount: calcMagicDamage(raw, effMR) * afterProcs, color: "" });
      }
    }
    // Sub-rune damage segments (combined as "RUNE", charge-based)
    {
      let runeDmg = 0;
      const csProcs = enemyRuneCharges[String(SUBRUNE_IDS.CHEAP_SHOT)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.CHEAP_SHOT) && csProcs > 0) {
        runeDmg += calcCheapShotDamage(enemyLevel) * csProcs;
      }
      const siProcs = enemyRuneCharges[String(SUBRUNE_IDS.SUDDEN_IMPACT)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.SUDDEN_IMPACT) && siProcs > 0) {
        runeDmg += calcSuddenImpactDamage(enemyLevel) * siProcs;
      }
      const scProcs = enemyRuneCharges[String(SUBRUNE_IDS.SCORCH)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.SCORCH) && scProcs > 0) {
        const raw = calcScorchDamage(enemyLevel);
        const effMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        runeDmg += calcMagicDamage(raw, effMR) * scProcs;
      }
      // Shield Bash
      const sbProcs = enemyRuneCharges[String(SUBRUNE_IDS.SHIELD_BASH)] ?? 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.SHIELD_BASH) && sbProcs > 0) {
        const bonusHp = enemyStats.maxHp - enemyStats.baseHp;
        const totalShield = enemyLifelineShield + enemyComboShield + enemyConditionalShieldTotal;
        const raw = calcShieldBashDamage(enemyLevel, bonusHp, totalShield);
        if (enemyStats.ad - enemyStats.baseAd > enemyStats.ap) {
          const flatArmorPen = calcLethality(enemyStats.lethality, enemyLevel);
          const effArmor = calcEffectiveArmor(allyStats.armor, 0, enemyStats.percentArmorReduction, enemyStats.percentArmorPen, flatArmorPen);
          runeDmg += calcPhysicalDamage(raw, effArmor) * sbProcs;
        } else {
          const effMR2 = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
          runeDmg += calcMagicDamage(raw, effMR2) * sbProcs;
        }
      }
      if (runeDmg > 0) {
        segs.push({ source: "RUNE", amount: runeDmg, color: "" });
      }
    }
    // Precision slot 3 amplification applied to all segments
    {
      let ampPercent = 0;
      if (hasSubRune(enemyRunes, SUBRUNE_IDS.COUP_DE_GRACE)) {
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        const targetHpAfterDmg = Math.max(0, allyStats.hp - preTotal);
        if (targetHpAfterDmg / allyStats.maxHp < COUP_DE_GRACE_THRESHOLD) {
          ampPercent = COUP_DE_GRACE_AMP;
        }
      } else if (hasSubRune(enemyRunes, SUBRUNE_IDS.CUT_DOWN)) {
        if (allyStats.hp / allyStats.maxHp >= CUT_DOWN_THRESHOLD) {
          ampPercent = CUT_DOWN_AMP;
        }
      } else if (hasSubRune(enemyRunes, SUBRUNE_IDS.LAST_STAND)) {
        const ownHpPercent = enemyStats.hp / enemyStats.maxHp;
        ampPercent = calcLastStandAmp(ownHpPercent);
      }
      if (ampPercent > 0) {
        for (const seg of segs) {
          seg.amount *= (1 + ampPercent);
        }
      }
    }
    // First Strike amplification shown as separate segment
    {
      const fsProcs = enemyRuneCharges[String(KEYSTONE_IDS.FIRST_STRIKE)] ?? 0;
      if (enemyKs === KEYSTONE_IDS.FIRST_STRIKE && fsProcs > 0) {
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        segs.push({ source: "FS", amount: preTotal * FIRST_STRIKE_AMP, color: "" });
      }
    }
    // Kayn Shadow Assassin passive: bonus magic damage segment
    {
      const shadowVal = enemyComboPassiveValues['kayn-shadow-assassin'] ?? 0;
      if (shadowVal > 0) {
        const pct = 0.20 + (0.2235 / 17) * (enemyLevel - 1);
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        const bonusRaw = preTotal * pct;
        const effMR = calcEffectiveMR(allyStats.mr, enemyStats.flatMagicPen, enemyStats.percentMagicPen);
        segs.push({ source: "影P", amount: calcMagicDamage(bonusRaw, effMR), color: "#a855f7" });
      }
    }
    // Yone E: Soul Unbound amplification segment
    {
      const yoneEVal = enemyComboPassiveValues['yone-e-amplify'] ?? 0;
      if (yoneEVal > 0) {
        const pct = 0.25 + (0.10 / 17) * (enemyLevel - 1);
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        segs.push({ source: "E増", amount: preTotal * pct, color: "#60a5fa" });
      }
    }
    // Syndra P: Transcendent amplification segment
    {
      const syndraVal = enemyComboPassiveValues['syndra-passive'] ?? 0;
      if (syndraVal > 0) {
        const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
        segs.push({ source: "P増", amount: preTotal * 0.15, color: "#c084fc" });
      }
    }
    // Phase 3: missing-HP combo passive segments
    for (const p of enemyComboPassives) {
      if (!p.onHit?.missingHpScaling) continue;
      const val = getPassiveVal(p, enemyComboPassiveValues, enemyAACounts);
      if (val <= 0) continue;
      const preTotal = segs.reduce((s, seg) => s + seg.amount, 0);
      const adjustedTarget = { ...allyStats, hp: Math.max(0, allyStats.hp - preTotal) };
      const dmg = calcComboPassiveOnHitDamage(p, val, enemyStats, adjustedTarget, enemyLevel);
      if (dmg > 0) {
        segs.push({ source: "P", amount: dmg, color: "#f59e0b" });
      }
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
    enemyComboPassives,
    enemyComboPassiveValues,
    enemyRunes,
    enemyRuneCharges,
    enemyBonusValues,
    enemyStats,
    allyStats,
    enemyLevel,
    enemyLifelineShield,
    enemyComboShield,
    getPassiveVal,
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

  // Rune combo entries for combo bar (keystones with charge-based procs)
  const CHARGE_KEYSTONES: number[] = [
    KEYSTONE_IDS.FLEET_FOOTWORK,
    KEYSTONE_IDS.ELECTROCUTE,
    KEYSTONE_IDS.SUMMON_AERY,
    KEYSTONE_IDS.ARCANE_COMET,
    KEYSTONE_IDS.GRASP_OF_THE_UNDYING,
    KEYSTONE_IDS.FIRST_STRIKE,
    KEYSTONE_IDS.AFTERSHOCK,
  ];

  const allyRuneComboEntries = useMemo(() => {
    const entries: { id: string; icon: string; name: string }[] = [];
    // Collect all selected rune IDs that are charge-managed
    const selectedIds: number[] = [];
    if (CHARGE_KEYSTONES.includes(allyRunes.keystone)) selectedIds.push(allyRunes.keystone);
    for (const subId of CHARGE_SUBRUNE_IDS) {
      if (hasSubRune(allyRunes, subId)) selectedIds.push(subId);
    }
    if (selectedIds.length === 0 && allyRunes.keystone !== KEYSTONE_IDS.SUMMON_AERY) return [];
    for (const path of runePaths) {
      for (const slot of path.slots) {
        for (const rune of slot.runes) {
          if (selectedIds.includes(rune.id)) {
            entries.push({ id: String(rune.id), icon: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`, name: rune.name });
          }
          // Aery shield: separate entry with distinct ID
          if (rune.id === KEYSTONE_IDS.SUMMON_AERY && allyRunes.keystone === KEYSTONE_IDS.SUMMON_AERY) {
            entries.push({ id: 'aery-shield', icon: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`, name: locale === 'ja' ? 'エアリー (シールド)' : 'Aery (Shield)' });
          }
        }
      }
    }
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allyRunes.keystone, allyRunes.primarySlot1, allyRunes.primarySlot2, allyRunes.primarySlot3, allyRunes.secondarySlot1, allyRunes.secondarySlot2, runePaths, locale]);

  const enemyRuneComboEntries = useMemo(() => {
    const entries: { id: string; icon: string; name: string }[] = [];
    const selectedIds: number[] = [];
    if (CHARGE_KEYSTONES.includes(enemyRunes.keystone)) selectedIds.push(enemyRunes.keystone);
    for (const subId of CHARGE_SUBRUNE_IDS) {
      if (hasSubRune(enemyRunes, subId)) selectedIds.push(subId);
    }
    if (selectedIds.length === 0 && enemyRunes.keystone !== KEYSTONE_IDS.SUMMON_AERY) return [];
    for (const path of runePaths) {
      for (const slot of path.slots) {
        for (const rune of slot.runes) {
          if (selectedIds.includes(rune.id)) {
            entries.push({ id: String(rune.id), icon: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`, name: rune.name });
          }
          if (rune.id === KEYSTONE_IDS.SUMMON_AERY && enemyRunes.keystone === KEYSTONE_IDS.SUMMON_AERY) {
            entries.push({ id: 'aery-shield', icon: `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`, name: locale === 'ja' ? 'エアリー (シールド)' : 'Aery (Shield)' });
          }
        }
      }
    }
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyRunes.keystone, enemyRunes.primarySlot1, enemyRunes.primarySlot2, enemyRunes.primarySlot3, enemyRunes.secondarySlot1, enemyRunes.secondarySlot2, runePaths, locale]);

  // Rune item entries (Biscuit Delivery, Triple Tonic elixirs)
  const allyRuneItemEntries = useMemo(() => {
    const entries: { id: string; itemId: string; name: string; desc: string; maxCharges: number }[] = [];
    if (hasSubRune(allyRunes, SUBRUNE_IDS.BISCUIT_DELIVERY)) {
      entries.push({
        id: 'biscuit',
        itemId: '2010',
        name: locale === 'ja' ? '英気満点ビスケット' : 'Total Biscuit',
        desc: locale === 'ja' ? '+30 最大HP (最大3個)' : '+30 Max HP (max 3)',
        maxCharges: BISCUIT_MAX_COUNT,
      });
    }
    if (hasSubRune(allyRunes, SUBRUNE_IDS.TRIPLE_TONIC)) {
      entries.push({
        id: 'tonic-avarice',
        itemId: '2151',
        name: locale === 'ja' ? '強欲のエリクサー' : 'Elixir of Avarice',
        desc: locale === 'ja' ? '60G (Lv3)' : '60G (Lv3)',
        maxCharges: 1,
      });
      entries.push({
        id: 'tonic-force',
        itemId: '2152',
        name: locale === 'ja' ? '力のエリクサー' : 'Elixir of Force',
        desc: locale === 'ja' ? '15AD / 25AP (Lv6)' : '15AD / 25AP (Lv6)',
        maxCharges: 1,
      });
      entries.push({
        id: 'tonic-skill',
        itemId: '2150',
        name: locale === 'ja' ? 'スキル エリクサー' : 'Elixir of Skill',
        desc: locale === 'ja' ? '+1 スキルポイント (Lv9)' : '+1 Skill Point (Lv9)',
        maxCharges: 1,
      });
    }
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allyRunes.primarySlot1, allyRunes.primarySlot2, allyRunes.primarySlot3, allyRunes.secondarySlot1, allyRunes.secondarySlot2, locale]);

  const enemyRuneItemEntries = useMemo(() => {
    const entries: { id: string; itemId: string; name: string; desc: string; maxCharges: number }[] = [];
    if (hasSubRune(enemyRunes, SUBRUNE_IDS.BISCUIT_DELIVERY)) {
      entries.push({
        id: 'biscuit',
        itemId: '2010',
        name: locale === 'ja' ? '英気満点ビスケット' : 'Total Biscuit',
        desc: locale === 'ja' ? '+30 最大HP (最大3個)' : '+30 Max HP (max 3)',
        maxCharges: BISCUIT_MAX_COUNT,
      });
    }
    if (hasSubRune(enemyRunes, SUBRUNE_IDS.TRIPLE_TONIC)) {
      entries.push({
        id: 'tonic-avarice',
        itemId: '2151',
        name: locale === 'ja' ? '強欲のエリクサー' : 'Elixir of Avarice',
        desc: locale === 'ja' ? '60G (Lv3)' : '60G (Lv3)',
        maxCharges: 1,
      });
      entries.push({
        id: 'tonic-force',
        itemId: '2152',
        name: locale === 'ja' ? '力のエリクサー' : 'Elixir of Force',
        desc: locale === 'ja' ? '15AD / 25AP (Lv6)' : '15AD / 25AP (Lv6)',
        maxCharges: 1,
      });
      entries.push({
        id: 'tonic-skill',
        itemId: '2150',
        name: locale === 'ja' ? 'スキル エリクサー' : 'Elixir of Skill',
        desc: locale === 'ja' ? '+1 スキルポイント (Lv9)' : '+1 Skill Point (Lv9)',
        maxCharges: 1,
      });
    }
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemyRunes.primarySlot1, enemyRunes.primarySlot2, enemyRunes.primarySlot3, enemyRunes.secondarySlot1, enemyRunes.secondarySlot2, locale]);

  if (dragonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-[#C89B3C] border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm">Loading game data...</p>
        </div>
      </div>
    );
  }

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
            LoL Build Sim(Beta)
          </h1>
        </div>
      </div>

      {/* Navigation bar */}
      <header className="sticky top-0 z-50 bg-background border-b border-border font-[family-name:var(--font-space-grotesk)]">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 h-10 flex items-center justify-between">
          <nav className="hidden sm:flex gap-1 items-center">
            <img src="/logo.png" alt="LoL Build Sim" className="w-6 h-6 rounded" />
            <span className="text-sm px-2.5 py-1 rounded bg-secondary text-foreground font-medium">
              {t("nav.home")}
            </span>
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
          </nav>
          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-1">
            <MobileMenu currentPage="home" locale={locale} />
            <img src="/logo.png" alt="" className="w-5 h-5 rounded" />
            <span className="text-xs font-medium text-foreground">{t("nav.home")}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleResetAlly}
              className="text-xs px-1.5 sm:px-2 py-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/25 transition-colors font-medium"
              title={locale === "ja" ? "青側リセット" : "Reset Blue Side"}
            >
              {locale === "ja" ? "青リセット" : "Blue Reset"}
            </button>
            <button
              onClick={handleResetEnemy}
              className="text-xs px-1.5 sm:px-2 py-1 rounded bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 transition-colors font-medium"
              title={locale === "ja" ? "赤側リセット" : "Reset Red Side"}
            >
              {locale === "ja" ? "赤リセット" : "Red Reset"}
            </button>
            <span className="text-xs text-muted-foreground/50 hidden sm:inline">v{version}</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "ja")}
              className="text-xs px-1 sm:px-1.5 py-1 rounded bg-secondary/60 text-muted-foreground border border-border transition-colors cursor-pointer focus:outline-none"
            >
              <option value="en" className="bg-white text-black dark:bg-zinc-800 dark:text-zinc-200">EN (English)</option>
              <option value="ja" className="bg-white text-black dark:bg-zinc-800 dark:text-zinc-200">JP (日本語)</option>
            </select>
            {/* <ThemeToggle /> */}
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
            <div
              className={`relative rounded-lg overflow-hidden h-20 ${allyChampion ? "cursor-pointer bg-zinc-900" : ""}`}
              onContextMenu={(e) => {
                if (!allyChampion) return;
                e.preventDefault();
                setAllyChampion(null);
              }}
              title={
                allyChampion
                  ? locale === "ja"
                    ? "右クリックで選択解除"
                    : "Right-click to deselect"
                  : undefined
              }
            >
              {allyChampion ? (
                <>
                  {allyChampion.id === '_Dummy' ? (
                    <div className="absolute inset-0 bg-zinc-700" />
                  ) : (
                    <>
                      <img
                        src={getSplashUrl(allyChampion.image, allyChampion.id)}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: getSplashPosition(allyChampion.id) }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
                    </>
                  )}
                  <div className="relative h-full flex items-center gap-3 px-3 z-10">
                    <Image
                      src={getChampionIconUrl(version, allyChampion.image)}
                      alt={getChampionDisplayName(allyChampion)}
                      width={40}
                      height={40}
                      className="rounded border border-blue-500/50"
                      unoptimized
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-blue-400">
                        {t("ally")}
                      </span>
                      <span className="text-sm font-bold text-white drop-shadow-md">
                        {getChampionDisplayName(allyChampion)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 px-1 h-full">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-blue-400">
                      {t("ally")}
                    </span>
                  </div>
                </div>
              )}
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
              maxLevel={allyTopQuest ? 20 : 18}
            />
            <div className="flex items-center gap-4 px-4 py-1.5 bg-card border border-border text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allyTopQuest}
                  onChange={(e) => {
                    setAllyTopQuest(e.target.checked);
                    if (e.target.checked) setAllyBotQuest(false);
                  }}
                  className="accent-[#C89B3C] w-3.5 h-3.5"
                />
                <span className="text-zinc-400">{locale === "ja" ? "TOPクエスト" : "TOP Quest"}</span>
                <span className="text-zinc-600">(Lv.20)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allyBotQuest}
                  onChange={(e) => {
                    setAllyBotQuest(e.target.checked);
                    if (e.target.checked) setAllyTopQuest(false);
                  }}
                  className="accent-[#C89B3C] w-3.5 h-3.5"
                />
                <span className="text-zinc-400">{locale === "ja" ? "BOTクエスト" : "BOT Quest"}</span>
                <span className="text-zinc-600">({locale === "ja" ? "ブーツ枠+1" : "Boots +1"})</span>
              </label>
            </div>
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
                skillEvolutions={allySkillEvolutions}
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
                runeComboEntries={allyRuneComboEntries}
                runeCharges={allyRuneCharges}
                onRuneChargeChange={(id, charges) => setAllyRuneCharges(prev => ({ ...prev, [id]: charges }))}
                runeItemEntries={allyRuneItemEntries}
                runeItemCharges={allyRuneItemCharges}
                onRuneItemChargeChange={(id, charges) => setAllyRuneItemCharges(prev => ({ ...prev, [id]: charges }))}
                lifelineItem={allyLifelineInfo ? { itemId: allyLifelineInfo.item.itemId, nameEn: allyLifelineInfo.item.nameEn, nameJa: allyLifelineInfo.item.nameJa } : null}
                lifelineActive={allyLifelineActive}
                onLifelineToggle={setAllyLifelineActive}
                conditionalShields={allyConditionalShields.map(s => ({ itemId: s.itemId, nameEn: s.nameEn, nameJa: s.nameJa, shieldType: s.shieldType, maxCharges: s.maxCharges }))}
                conditionalShieldToggles={allyConditionalShieldToggles}
                onConditionalShieldToggle={(itemId, val) => setAllyConditionalShieldToggles(prev => ({ ...prev, [itemId]: val }))}
              />
            )}
            <ItemShop
              items={items}
              selectedItems={allyItems}
              onItemChange={handleAllyItemChange}
              locale={locale}
              version={version}
              enItemData={enItemData}
              bootsSlot={allyBotQuest}
              masterworkSlot={allyMasterworkSlot}
              onMasterworkChange={setAllyMasterworkSlot}
            />
            <CollapsibleSection title={locale === "ja" ? "ルーン" : "Runes"}>
              <RuneSelector
                runePaths={runePaths}
                selectedRunes={allyRunes}
                onRuneChange={setAllyRunes}
                locale={locale}
                enRunePaths={enRunePaths}
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
                selectedRunes={allyRunes}
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
                  championLevel={allyLevel}
                  skillEvolutions={allySkillEvolutions}
                  onSkillEvolutionChange={(key, group) => setAllySkillEvolutions(prev => ({ ...prev, [key]: group }))}
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

            {/* Swap sides button */}
            <button
              onClick={handleSwapSides}
              className="text-xs px-3 py-1.5 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors font-medium flex items-center gap-1.5"
              title={locale === "ja" ? "青側と赤側を入れ替え" : "Swap Blue and Red sides"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7H4m0 0l4-4M4 7l4 4M16 17h4m0 0l-4 4m4-4l-4-4" />
              </svg>
              {locale === "ja" ? "入れ替え" : "Swap"}
            </button>

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
                    shields={enemyShieldsByType}
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
                    shields={allyShieldsByType}
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
            <div
              className={`relative rounded-lg overflow-hidden h-20 ${enemyChampion ? "cursor-pointer bg-zinc-900" : ""}`}
              onContextMenu={(e) => {
                if (!enemyChampion) return;
                e.preventDefault();
                setEnemyChampion(null);
              }}
              title={
                enemyChampion
                  ? locale === "ja"
                    ? "右クリックで選択解除"
                    : "Right-click to deselect"
                  : undefined
              }
            >
              {enemyChampion ? (
                <>
                  {enemyChampion.id === '_Dummy' ? (
                    <div className="absolute inset-0 bg-zinc-700" />
                  ) : (
                    <>
                      <img
                        src={getSplashUrl(enemyChampion.image, enemyChampion.id)}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectPosition: getSplashPosition(enemyChampion.id) }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
                    </>
                  )}
                  <div className="relative h-full flex items-center gap-3 px-3 z-10">
                    <Image
                      src={getChampionIconUrl(version, enemyChampion.image)}
                      alt={getChampionDisplayName(enemyChampion)}
                      width={40}
                      height={40}
                      className="rounded border border-red-500/50"
                      unoptimized
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-red-400">
                        {t("enemy")}
                      </span>
                      <span className="text-sm font-bold text-white drop-shadow-md">
                        {getChampionDisplayName(enemyChampion)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 px-1 h-full">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-red-400">
                      {t("enemy")}
                    </span>
                  </div>
                </div>
              )}
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
              maxLevel={enemyTopQuest ? 20 : 18}
            />
            <div className="flex items-center gap-4 px-4 py-1.5 bg-card border border-border text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enemyTopQuest}
                  onChange={(e) => {
                    setEnemyTopQuest(e.target.checked);
                    if (e.target.checked) setEnemyBotQuest(false);
                  }}
                  className="accent-[#C89B3C] w-3.5 h-3.5"
                />
                <span className="text-zinc-400">{locale === "ja" ? "TOPクエスト" : "TOP Quest"}</span>
                <span className="text-zinc-600">(Lv.20)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enemyBotQuest}
                  onChange={(e) => {
                    setEnemyBotQuest(e.target.checked);
                    if (e.target.checked) setEnemyTopQuest(false);
                  }}
                  className="accent-[#C89B3C] w-3.5 h-3.5"
                />
                <span className="text-zinc-400">{locale === "ja" ? "BOTクエスト" : "BOT Quest"}</span>
                <span className="text-zinc-600">({locale === "ja" ? "ブーツ枠+1" : "Boots +1"})</span>
              </label>
            </div>
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
                skillEvolutions={enemySkillEvolutions}
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
                runeComboEntries={enemyRuneComboEntries}
                runeCharges={enemyRuneCharges}
                onRuneChargeChange={(id, charges) => setEnemyRuneCharges(prev => ({ ...prev, [id]: charges }))}
                runeItemEntries={enemyRuneItemEntries}
                runeItemCharges={enemyRuneItemCharges}
                onRuneItemChargeChange={(id, charges) => setEnemyRuneItemCharges(prev => ({ ...prev, [id]: charges }))}
                lifelineItem={enemyLifelineInfo ? { itemId: enemyLifelineInfo.item.itemId, nameEn: enemyLifelineInfo.item.nameEn, nameJa: enemyLifelineInfo.item.nameJa } : null}
                lifelineActive={enemyLifelineActive}
                onLifelineToggle={setEnemyLifelineActive}
                conditionalShields={enemyConditionalShields.map(s => ({ itemId: s.itemId, nameEn: s.nameEn, nameJa: s.nameJa, shieldType: s.shieldType, maxCharges: s.maxCharges }))}
                conditionalShieldToggles={enemyConditionalShieldToggles}
                onConditionalShieldToggle={(itemId, val) => setEnemyConditionalShieldToggles(prev => ({ ...prev, [itemId]: val }))}
              />
            )}
            <ItemShop
              items={items}
              selectedItems={enemyItems}
              onItemChange={handleEnemyItemChange}
              locale={locale}
              version={version}
              enItemData={enItemData}
              bootsSlot={enemyBotQuest}
              masterworkSlot={enemyMasterworkSlot}
              onMasterworkChange={setEnemyMasterworkSlot}
            />
            <CollapsibleSection title={locale === "ja" ? "ルーン" : "Runes"}>
              <RuneSelector
                runePaths={runePaths}
                selectedRunes={enemyRunes}
                onRuneChange={setEnemyRunes}
                locale={locale}
                enRunePaths={enRunePaths}
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
                selectedRunes={enemyRunes}
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
                  championLevel={enemyLevel}
                  skillEvolutions={enemySkillEvolutions}
                  onSkillEvolutionChange={(key, group) => setEnemySkillEvolutions(prev => ({ ...prev, [key]: group }))}
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

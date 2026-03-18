"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

/**
 * Long-press hook with repeat support.
 * - Tap (< 400ms) → onTap
 * - Long press (≥ 400ms) → onLongPress fires, then repeats every `repeatInterval` ms
 * - Tracks touch state to block synthesized mouse events after touch
 */
function useLongPress(
  onTap: () => void,
  onLongPress: () => void,
  { delay = 400, repeatInterval = 150 }: { delay?: number; repeatInterval?: number } = {},
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef(false);
  const touchMovedRef = useRef(false);
  // Block synthesized mouse events for 500ms after touch
  const touchEndTimeRef = useRef(0);

  const clearAll = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const isTouchRecent = useCallback(() => {
    return Date.now() - touchEndTimeRef.current < 500;
  }, []);

  const handlers = useMemo(
    () => ({
      onTouchStart: () => {
        firedRef.current = false;
        touchMovedRef.current = false;
        timerRef.current = setTimeout(() => {
          firedRef.current = true;
          onLongPress();
          // Start repeating
          intervalRef.current = setInterval(() => {
            onLongPress();
          }, repeatInterval);
        }, delay);
      },
      onTouchMove: () => {
        touchMovedRef.current = true;
        clearAll();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        clearAll();
        touchEndTimeRef.current = Date.now();
        e.preventDefault();
        if (!firedRef.current && !touchMovedRef.current) {
          onTap();
        }
      },
    }),
    [onTap, onLongPress, delay, repeatInterval, clearAll],
  );

  useEffect(() => clearAll, [clearAll]);

  return { handlers, isTouchRecent };
}

/** Style to suppress native long-press menus (iOS "Save Image", Android context menu) */
const TOUCH_SUPPRESS_STYLE: React.CSSProperties = {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
  touchAction: "manipulation",
};

/** Summoner button with long-press support + ref forwarding */
function SummonerButton({
  onTap,
  onLongPress,
  btnRef,
  children,
  className,
  title,
}: {
  onTap: () => void;
  onLongPress: () => void;
  btnRef: (el: HTMLButtonElement | null) => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const { handlers: lp, isTouchRecent } = useLongPress(onTap, onLongPress);
  return (
    <button
      ref={btnRef}
      onClick={(e) => { if (!isTouchRecent()) onTap(); }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!isTouchRecent()) onLongPress();
      }}
      {...lp}
      className={`touch-btn ${className ?? ""}`}
      title={title}
      style={TOUCH_SUPPRESS_STYLE}
    >
      {children}
    </button>
  );
}

/** Button with long-press support: tap = onTap, long press = onLongPress (with repeat) */
function LongPressButton({
  onTap,
  onLongPress,
  children,
  className,
  title,
  disabled,
  onMouseEnter,
  onMouseLeave,
}: {
  onTap: () => void;
  onLongPress: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { handlers: lp, isTouchRecent } = useLongPress(onTap, onLongPress);
  return (
    <button
      onMouseDown={(e) => {
        if (isTouchRecent()) return;
        e.preventDefault();
        if (e.button === 0) onTap();
        else if (e.button === 2) onLongPress();
      }}
      onContextMenu={(e) => e.preventDefault()}
      {...lp}
      className={`touch-btn ${className ?? ""}`}
      title={title}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={TOUCH_SUPPRESS_STYLE}
    >
      {children}
    </button>
  );
}
import type {
  Champion,
  SkillData,
  SummonerSpell,
  ItemActiveEffect,
  ItemOnHitEffect,
  ChampionComboPassive,
} from "@/types";
import type { ItemHealEffect } from "@/lib/data/item-effects";
import { SUMMONER_SPELLS } from "@/lib/data/summoner-spells";

interface SkillComboBarProps {
  champion: Champion;
  skills: SkillData[];
  version: string;
  locale: string;
  comboCounts: Record<string, number>;
  aaCounts: number;
  summonerSpells: [SummonerSpell | null, SummonerSpell | null];
  summonerActive: [boolean, boolean];
  itemActiveEffects?: ItemActiveEffect[];
  itemActiveToggles?: Record<string, number>;
  onHitEffects?: ItemOnHitEffect[];
  onHitToggles?: Record<string, boolean>;
  comboPassives?: ChampionComboPassive[];
  comboPassiveValues?: Record<string, number>;
  selectedFormGroup?: string;
  onFormGroupChange?: (formGroup: string) => void;
  skillEvolutions?: Record<string, string>;
  sylasRChampionId?: string | null;
  onSylasRChange?: (championId: string | null) => void;
  isSylas?: boolean;
  championsForSylasR?: { id: string; name: string; image: string }[];
  onComboChange: (counts: Record<string, number>) => void;
  onAAChange: (count: number) => void;
  onSummonerChange: (index: 0 | 1, spell: SummonerSpell | null) => void;
  onSummonerActiveChange: (index: 0 | 1, active: boolean) => void;
  onItemActiveToggle?: (itemId: string, count: number) => void;
  onOnHitToggle?: (itemId: string, active: boolean) => void;
  onComboPassiveChange?: (id: string, value: number) => void;
  itemStackBonuses?: { itemId: string; nameEn: string; nameJa: string; maxStacks: number }[];
  itemStacks?: Record<string, number>;
  onItemStackChange?: (itemId: string, stacks: number) => void;
  itemHealEffects?: ItemHealEffect[];
  itemHealCharges?: Record<string, number>;
  onItemHealToggle?: (itemId: string, charges: number) => void;
  runeComboEntries?: RuneComboEntry[];
  runeCharges?: Record<string, number>;
  onRuneChargeChange?: (id: string, charges: number) => void;
  runeItemEntries?: RuneItemEntry[];
  runeItemCharges?: Record<string, number>;
  onRuneItemChargeChange?: (id: string, charges: number) => void;
  lifelineItem?: { itemId: string; nameEn: string; nameJa: string } | null;
  lifelineActive?: boolean;
  onLifelineToggle?: (active: boolean) => void;
  conditionalShields?: { itemId: string; nameEn: string; nameJa: string; shieldType: string; maxCharges?: number }[];
  conditionalShieldToggles?: Record<string, number>;
  onConditionalShieldToggle?: (itemId: string, value: number) => void;
}

export interface RuneComboEntry {
  id: string;
  icon: string;
  name: string;
}

export interface RuneItemEntry {
  id: string;
  itemId: string; // DDragon item ID for icon
  name: string;
  desc: string;
  maxCharges: number;
}

const SKILL_KEYS = ["P", "Q", "W", "E", "R"] as const;

const SKILL_COLORS: Record<string, string> = {
  P: "ring-violet-500",
  Q: "ring-blue-500",
  W: "ring-emerald-500",
  E: "ring-orange-500",
  R: "ring-red-500",
};

const SKILL_ACCENT: Record<string, { border: string; text: string }> = {
  P: { border: "border-violet-500/40", text: "text-violet-400" },
  Q: { border: "border-blue-500/40", text: "text-blue-400" },
  W: { border: "border-emerald-500/40", text: "text-emerald-400" },
  E: { border: "border-orange-500/40", text: "text-orange-400" },
  R: { border: "border-red-500/40", text: "text-red-400" },
};

/** Strip HTML tags and clean up DDragon description text */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function SkillComboBar({
  champion,
  skills,
  version,
  locale,
  comboCounts,
  aaCounts,
  summonerSpells,
  summonerActive,
  itemActiveEffects,
  itemActiveToggles,
  onHitEffects,
  onHitToggles,
  comboPassives,
  comboPassiveValues,
  selectedFormGroup,
  onFormGroupChange,
  skillEvolutions,
  sylasRChampionId,
  onSylasRChange,
  isSylas,
  championsForSylasR,
  onComboChange,
  onAAChange,
  onSummonerChange,
  onSummonerActiveChange,
  onItemActiveToggle,
  onOnHitToggle,
  onComboPassiveChange,
  itemStackBonuses,
  itemStacks,
  onItemStackChange,
  itemHealEffects,
  itemHealCharges,
  onItemHealToggle,
  runeComboEntries,
  runeCharges,
  onRuneChargeChange,
  runeItemEntries,
  runeItemCharges,
  onRuneItemChargeChange,
  lifelineItem,
  lifelineActive,
  onLifelineToggle,
  conditionalShields,
  conditionalShieldToggles,
  onConditionalShieldToggle,
}: SkillComboBarProps) {
  const isJa = locale === "ja";
  const [dropdownIndex, setDropdownIndex] = useState<0 | 1 | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const summonerBtnRefs = useRef<(HTMLButtonElement | null)[]>([null, null]);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (dropdownIndex === null) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is inside dropdown portal or summoner buttons
      if (dropdownRef.current?.contains(target)) return;
      if (summonerBtnRefs.current.some((btn) => btn?.contains(target))) return;
      setDropdownIndex(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownIndex]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (dropdownIndex === null) {
      setDropdownPos(null);
      return;
    }
    const btn = summonerBtnRefs.current[dropdownIndex];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPos({
        top: rect.top + window.scrollY - 4, // just above the button
        left: rect.left + window.scrollX,
      });
    }
  }, [dropdownIndex]);

  const getSpellImage = (key: string): string | null => {
    if (key === "P") {
      return champion.passive?.image
        ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${champion.passive.image}`
        : null;
    }
    const idx = ["Q", "W", "E", "R"].indexOf(key);
    if (idx >= 0 && champion.spells[idx]) {
      return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${champion.spells[idx].image}`;
    }
    return null;
  };

  const getSpellInfo = (
    key: string,
  ): { name: string; description: string } | null => {
    if (key === "P") {
      if (champion.passive?.name) {
        return {
          name: champion.passive.name,
          description: stripHtml(champion.passive.description),
        };
      }
      return null;
    }
    const idx = ["Q", "W", "E", "R"].indexOf(key);
    if (idx >= 0 && champion.spells[idx]) {
      return {
        name: champion.spells[idx].name,
        description: stripHtml(champion.spells[idx].description),
      };
    }
    // Fallback to Meraki skill data
    const skill = skills.find((s) => s.key === key);
    if (skill) return { name: skill.name, description: "" };
    return null;
  };

  const handleSummonerClick = (index: 0 | 1) => {
    if (summonerSpells[index]) {
      onSummonerActiveChange(index, !summonerActive[index]);
    } else {
      setDropdownIndex(index);
    }
  };

  const selectSummoner = (index: 0 | 1, spell: SummonerSpell) => {
    onSummonerChange(index, spell);
    onSummonerActiveChange(index, true);
    setDropdownIndex(null);
  };

  const getAvailableSpells = (index: 0 | 1) => {
    const otherIndex = index === 0 ? 1 : 0;
    const otherId = summonerSpells[otherIndex]?.id;
    return SUMMONER_SPELLS.filter((s) => s.id !== otherId);
  };

  // Collect unique formGroup values across all subCasts
  const formGroups = useMemo(() => {
    const groups = new Set<string>();
    for (const skill of skills) {
      if (skill.subCasts) {
        for (const sc of skill.subCasts) {
          if (sc.formGroup) groups.add(sc.formGroup);
        }
      }
    }
    return Array.from(groups);
  }, [skills]);

  const hasFormGroups = formGroups.length >= 2;
  const activeFormGroup = selectedFormGroup || formGroups[0] || '';

  // Form group display names
  const FORM_GROUP_LABELS: Record<string, { en: string; ja: string }> = {
    base: { en: 'Base', ja: '通常' },
    shadow: { en: 'Shadow', ja: '影' },
    rhaast: { en: 'Rhaast', ja: 'ラースト' },
    mini: { en: 'Mini', ja: 'ミニ' },
    mega: { en: 'Mega', ja: 'メガ' },
    normal: { en: 'Normal', ja: '通常' },
    allout: { en: 'All Out', ja: 'オールアウト' },
    cannon: { en: 'Cannon', ja: 'キャノン' },
    hammer: { en: 'Hammer', ja: 'ハンマー' },
  };

  // Sylas R selector state
  const [sylasROpen, setSylasROpen] = useState(false);
  const [sylasRSearch, setSylasRSearch] = useState('');
  const sylasRBtnRef = useRef<HTMLButtonElement>(null);
  const sylasRDropdownRef = useRef<HTMLDivElement>(null);
  const [sylasRPos, setSylasRPos] = useState<{ top: number; left: number } | null>(null);

  // Close Sylas R dropdown on outside click
  useEffect(() => {
    if (!sylasROpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sylasRDropdownRef.current?.contains(target)) return;
      if (sylasRBtnRef.current?.contains(target)) return;
      setSylasROpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sylasROpen]);

  useEffect(() => {
    if (!sylasROpen) { setSylasRPos(null); return; }
    const btn = sylasRBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setSylasRPos({ top: rect.top - 4, left: rect.left });
    }
  }, [sylasROpen]);

  const filteredSylasRChamps = useMemo(() => {
    if (!championsForSylasR || !sylasRSearch) return championsForSylasR ?? [];
    const q = sylasRSearch.toLowerCase();
    return championsForSylasR.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }, [championsForSylasR, sylasRSearch]);

  const hoveredInfo = hoveredSkill ? getSpellInfo(hoveredSkill) : null;
  const hoveredAccent = hoveredSkill ? SKILL_ACCENT[hoveredSkill] : null;

  return (
    <div className="lol-card px-4 py-2.5 overflow-hidden">
      {/* Form group selector */}
      {hasFormGroups && onFormGroupChange && (
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[10px] text-zinc-600 font-medium mr-1">
            {isJa ? '形態' : 'Form'}
          </span>
          {formGroups.map((fg) => (
            <button
              key={fg}
              onClick={() => onFormGroupChange(fg)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all
 ${activeFormGroup === fg ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300' : 'bg-zinc-800/60 border border-zinc-700/40 text-zinc-500 hover:text-zinc-300'}`}
            >
              {isJa ? (FORM_GROUP_LABELS[fg]?.ja ?? fg) : (FORM_GROUP_LABELS[fg]?.en ?? fg)}
            </button>
          ))}
        </div>
      )}

      <div className="text-xs text-zinc-500 mb-1.5 font-medium">
        {isJa ? "コンボ設定" : "Combo Setup"}
        <span className="ml-1.5 text-zinc-500">
          {isJa ? "(クリック+1 / 右クリック or 長押し-1)" : "(Click +1 / R-click or long-press -1)"}
        </span>
      </div>

      <div className="overflow-x-auto pt-2 pb-2 pr-2">
       <div className="flex items-center gap-2 w-max pr-1">
        {/* Skill icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {SKILL_KEYS.map((key) => {
            const skill = skills.find((s) => s.key === key);
            const hasSubCasts = key !== "P" && skill?.subCasts && skill.subCasts.length > 0;

            if (hasSubCasts && skill?.subCasts) {
              // Filter sub-casts by formGroup and evolutionGroup
              const visibleSubCasts = skill.subCasts.filter((sc) => {
                // formGroup filter (global form switch)
                if (sc.formGroup) {
                  if (!hasFormGroups) return true;
                  if (sc.formGroup !== activeFormGroup) return false;
                }
                // evolutionGroup filter (per-skill evolution)
                if (sc.evolutionGroup) {
                  const activeEvo = skillEvolutions?.[skill.key];
                  if (!activeEvo) return sc.evolutionGroup === 'normal';
                  return sc.evolutionGroup === activeEvo;
                }
                return true;
              });
              // Render sub-cast buttons (e.g. Q1, Q2, Q3)
              return visibleSubCasts.map((sc) => {
                const count = comboCounts[sc.id] ?? 0;
                const imgSrc = sc.image || getSpellImage(key);
                const isActive = count > 0;
                const subLabel = sc.comboLabel ?? sc.id.replace(key, ""); // e.g. 'Q1' -> '1', or '往'/'復'

                return (
                  <LongPressButton
                    key={sc.id}
                    onTap={() => onComboChange({ ...comboCounts, [sc.id]: (comboCounts[sc.id] ?? 0) + 1 })}
                    onLongPress={() => {
                      const c = comboCounts[sc.id] ?? 0;
                      if (c > 0) onComboChange({ ...comboCounts, [sc.id]: c - 1 });
                    }}
                    onMouseEnter={() => setHoveredSkill(key)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${isActive ? `ring-2 ${SKILL_COLORS[key]} shadow-md` : "opacity-40 hover:opacity-70"}
 `}
                    title={`${sc.id} (${count})`}
                  >
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={sc.id}
                        width={36}
                        height={36}
                        className="rounded border border-black/50"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded border border-zinc-700 bg-zinc-800 flex items-center justify-center text-xs font-bold ${SKILL_ACCENT[key]?.text || "text-zinc-400"}`}
                      >
                        {sc.id}
                      </div>
                    )}
                    {/* Sub-cast label overlay */}
                    <span
                      className={`absolute bottom-0 left-0 text-[9px] font-black ${SKILL_ACCENT[key]?.text || "text-zinc-400"} bg-black/80 rounded-tr px-0.5 leading-tight`}
                    >
                      {subLabel}
                    </span>
                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-black bg-zinc-900 border border-zinc-600 text-white rounded-full px-0.5 leading-none">
                        {count}
                      </span>
                    )}
                  </LongPressButton>
                );
              });
            }

            // Regular skill button (no sub-casts)
            const count = comboCounts[key] ?? 0;
            const imgSrc = getSpellImage(key);
            const isActive = count > 0;
            const hasSkillData =
              key === "P" || skills.some((s) => s.key === key);

            // P is display-only (not clickable) — managed via passive section below
            if (key === "P") {
              return (
                <div
                  key={key}
                  className="relative flex-shrink-0 rounded opacity-60 select-none"
                  onMouseEnter={() => setHoveredSkill(key)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  title={isJa ? "パッシブ (下で管理)" : "Passive (managed below)"}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={key}
                      width={36}
                      height={36}
                      className="rounded border border-black/50"
                      unoptimized
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded border border-zinc-700 bg-zinc-800 flex items-center justify-center text-xs font-bold ${SKILL_ACCENT[key]?.text || "text-zinc-400"}`}
                    >
                      {key}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <LongPressButton
                key={key}
                onTap={() => onComboChange({ ...comboCounts, [key]: (comboCounts[key] ?? 0) + 1 })}
                onLongPress={() => {
                  const c = comboCounts[key] ?? 0;
                  if (c > 0) onComboChange({ ...comboCounts, [key]: c - 1 });
                }}
                onMouseEnter={() => setHoveredSkill(key)}
                onMouseLeave={() => setHoveredSkill(null)}
                disabled={!hasSkillData}
                className={`relative flex-shrink-0 rounded transition-all duration-100 select-none
 ${isActive ? `ring-2 ${SKILL_COLORS[key]} shadow-md` : "opacity-40 hover:opacity-70"}
 ${!hasSkillData ? "cursor-not-allowed opacity-20" : "cursor-pointer"}
 `}
                title={`${key} (${count})`}
              >
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={key}
                    width={36}
                    height={36}
                    className="rounded border border-black/50"
                    unoptimized
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded border border-zinc-700 bg-zinc-800 flex items-center justify-center text-xs font-bold ${SKILL_ACCENT[key]?.text || "text-zinc-400"}`}
                  >
                    {key}
                  </div>
                )}
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[11px] font-black bg-zinc-900 border border-zinc-600 text-white rounded-full px-0.5 leading-none">
                    {count}
                  </span>
                )}
              </LongPressButton>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-9 bg-zinc-700/60 flex-shrink-0" />

        {/* AA count */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-zinc-400 font-medium">AA</span>
          <input
            type="number"
            min={0}
            max={99}
            value={aaCounts}
            onChange={(e) =>
              onAAChange(
                Math.max(0, Math.min(99, parseInt(e.target.value) || 0)),
              )
            }
            className="w-10 h-9 text-center text-xs font-bold bg-zinc-800/80 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-zinc-500 tabular-nums"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-9 bg-zinc-700/60 flex-shrink-0" />

        {/* Summoner spells */}
        <div className="flex items-center gap-1.5 flex-shrink-0" ref={dropdownRef}>
          {([0, 1] as const).map((idx) => {
            const spell = summonerSpells[idx];
            const active = summonerActive[idx];

            return (
              <SummonerButton
                key={idx}
                btnRef={(el) => { summonerBtnRefs.current[idx] = el; }}
                onTap={() => handleSummonerClick(idx)}
                onLongPress={() => {
                  if (summonerSpells[idx]) {
                    onSummonerChange(idx, null);
                    onSummonerActiveChange(idx, false);
                  } else {
                    setDropdownIndex(idx);
                  }
                }}
                className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${spell && active ? "ring-2 ring-amber-500 shadow-md" : spell ? "opacity-40 hover:opacity-70" : "opacity-30 hover:opacity-60"}
 `}
                title={
                  spell
                    ? isJa
                      ? spell.nameJa
                      : spell.name
                    : isJa
                      ? "スペル選択"
                      : "Select Spell"
                }
              >
                {spell ? (
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image}`}
                    alt={spell.name}
                    width={36}
                    height={36}
                    className="rounded border border-black/50"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded border border-zinc-700 border-dashed bg-zinc-800/50 flex items-center justify-center text-[10px] text-zinc-600">
                    +
                  </div>
                )}
                {spell && active && spell.damage && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[9px] bg-amber-600 text-white rounded-full leading-none">
                    !
                  </span>
                )}
              </SummonerButton>
            );
          })}

          {/* Dropdown - rendered via portal to escape overflow:hidden */}
          {dropdownIndex !== null &&
            dropdownPos &&
            createPortal(
              <div
                ref={dropdownRef}
                className="fixed bg-card border border-border shadow-xl p-1.5 min-w-[180px]"
                style={{
                  zIndex: 9999,
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  transform: "translateY(-100%)",
                }}
              >
                {getAvailableSpells(dropdownIndex).map((spell) => (
                  <button
                    key={spell.id}
                    onClick={() => selectSummoner(dropdownIndex, spell)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-700/50 transition-colors"
                  >
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.image}`}
                      alt={spell.name}
                      width={24}
                      height={24}
                      className="rounded border border-black/40"
                      unoptimized
                    />
                    <span className="text-xs text-zinc-300">
                      {isJa ? spell.nameJa : spell.name}
                    </span>
                    {spell.damage && (
                      <span className="text-[9px] text-amber-400 ml-auto">
                        DMG
                      </span>
                    )}
                  </button>
                ))}
                {summonerSpells[dropdownIndex] && (
                  <>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => {
                        onSummonerChange(dropdownIndex, null);
                        onSummonerActiveChange(dropdownIndex, false);
                        setDropdownIndex(null);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-xs text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
                    >
                      {isJa ? "クリア" : "Clear"}
                    </button>
                  </>
                )}
              </div>,
              document.body,
            )}
        </div>

        {/* Item active effects */}
        {itemActiveEffects &&
          itemActiveEffects.length > 0 &&
          onItemActiveToggle && (
            <>
              <div className="w-px h-9 bg-zinc-700/60" />
              <div className="flex items-center gap-1.5">
                {itemActiveEffects.map((effect) => {
                  const count = itemActiveToggles?.[effect.itemId] ?? 0;
                  return (
                    <LongPressButton
                      key={effect.itemId}
                      onTap={() => onItemActiveToggle(effect.itemId, count + 1)}
                      onLongPress={() => {
                        if (count > 0) onItemActiveToggle(effect.itemId, count - 1);
                      }}
                      className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${count > 0 ? "ring-2 ring-teal-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                      title={isJa ? effect.nameJa : effect.nameEn}
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${effect.itemId}.png`}
                        alt={effect.nameEn}
                        width={36}
                        height={36}
                        className="rounded border border-black/50"
                        unoptimized
                      />
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[9px] bg-teal-600 text-white rounded-full leading-none font-bold">
                          {count}
                        </span>
                      )}
                    </LongPressButton>
                  );
                })}
              </div>
            </>
          )}

        {/* On-hit item toggles (BotRK, Nashor's, etc.) */}
        {onHitEffects && onHitEffects.length > 0 && onOnHitToggle && (
          <>
            <div className="w-px h-9 bg-zinc-700/60" />
            <div className="flex items-center gap-1.5">
              {onHitEffects.map((effect) => {
                const active = onHitToggles?.[effect.itemId] ?? false;
                return (
                  <LongPressButton
                    key={`oh-${effect.itemId}`}
                    onTap={() => onOnHitToggle(effect.itemId, !active)}
                    onLongPress={() => onOnHitToggle(effect.itemId, !active)}
                    className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${active ? "ring-2 ring-cyan-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                    title={`${isJa ? effect.nameJa : effect.nameEn} (${effect.trigger === "spellblade" ? "Spellblade" : "On-Hit"})`}
                  >
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${effect.itemId}.png`}
                      alt={effect.nameEn}
                      width={36}
                      height={36}
                      className="rounded border border-black/50"
                      unoptimized
                    />
                    {active && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[9px] bg-cyan-600 text-white rounded-full leading-none">
                        {effect.trigger === "spellblade" ? "S" : "!"}
                      </span>
                    )}
                  </LongPressButton>
                );
              })}
            </div>
          </>
        )}

        {/* Potion / heal item toggles */}
        {itemHealEffects && itemHealEffects.length > 0 && onItemHealToggle && (
          <>
            <div className="w-px h-9 bg-zinc-700/60" />
            <div className="flex items-center gap-1.5">
              {itemHealEffects.map((effect) => {
                const charges = itemHealCharges?.[effect.itemId] ?? 0;
                return (
                  <LongPressButton
                    key={`heal-${effect.itemId}`}
                    onTap={() => onItemHealToggle(effect.itemId, Math.min(charges + 1, effect.maxCharges))}
                    onLongPress={() => {
                      if (charges > 0) onItemHealToggle(effect.itemId, charges - 1);
                    }}
                    className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${charges > 0 ? "ring-2 ring-green-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                    title={`${isJa ? effect.nameJa : effect.nameEn} (+${effect.healPerCharge} HP)`}
                  >
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${effect.itemId}.png`}
                      alt={effect.nameEn}
                      width={36}
                      height={36}
                      className="rounded border border-black/50"
                      unoptimized
                    />
                    {charges > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] bg-green-600 text-white rounded-full leading-none font-bold px-0.5">
                        {charges}
                      </span>
                    )}
                  </LongPressButton>
                );
              })}
            </div>
          </>
        )}

        {/* Lifeline shield toggle (Maw, Sterak's, Shieldbow) */}
        {lifelineItem && onLifelineToggle && (
          <>
            <div className="w-px h-9 bg-zinc-700/60" />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onLifelineToggle(!lifelineActive)}
                className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${lifelineActive ? "ring-2 ring-sky-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                title={`${isJa ? lifelineItem.nameJa : lifelineItem.nameEn} (Lifeline 🛡)`}
              >
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${lifelineItem.itemId}.png`}
                  alt={lifelineItem.nameEn}
                  width={36}
                  height={36}
                  className="rounded border border-black/50"
                  unoptimized
                />
                {lifelineActive && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] bg-sky-600 text-white rounded-full leading-none font-bold px-0.5">
                    🛡
                  </span>
                )}
              </button>
            </div>
          </>
        )}

        {/* Conditional shields (non-lifeline, toggleable or charge-based) */}
        {conditionalShields && conditionalShields.length > 0 && onConditionalShieldToggle && (
          <>
            <div className="w-px h-9 bg-zinc-700/60" />
            <div className="flex items-center gap-1.5">
              {conditionalShields.map((shield) => {
                const charges = conditionalShieldToggles?.[shield.itemId] ?? 0;
                const max = shield.maxCharges ?? 1;
                const isChargeBased = max > 1;
                const badgeColor = shield.shieldType === 'physical' ? 'bg-orange-600' : shield.shieldType === 'magic' ? 'bg-purple-600' : 'bg-sky-600';
                if (isChargeBased) {
                  return (
                    <LongPressButton
                      key={shield.itemId}
                      onTap={() => onConditionalShieldToggle(shield.itemId, Math.min(charges + 1, max))}
                      onLongPress={() => onConditionalShieldToggle(shield.itemId, Math.max(charges - 1, 0))}
                      className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${charges > 0 ? "ring-2 ring-sky-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                      title={`${isJa ? shield.nameJa : shield.nameEn} (🛡 ×${charges})`}
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${shield.itemId}.png`}
                        alt={shield.nameEn}
                        width={36}
                        height={36}
                        className="rounded border border-black/50"
                        unoptimized
                      />
                      {charges > 0 && (
                        <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] ${badgeColor} text-white rounded-full leading-none font-bold px-0.5`}>
                          {charges}
                        </span>
                      )}
                    </LongPressButton>
                  );
                }
                return (
                  <button
                    key={shield.itemId}
                    type="button"
                    onClick={() => onConditionalShieldToggle(shield.itemId, charges > 0 ? 0 : 1)}
                    className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${charges > 0 ? "ring-2 ring-sky-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                    title={`${isJa ? shield.nameJa : shield.nameEn} (🛡)`}
                  >
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${shield.itemId}.png`}
                      alt={shield.nameEn}
                      width={36}
                      height={36}
                      className="rounded border border-black/50"
                      unoptimized
                    />
                    {charges > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] ${badgeColor} text-white rounded-full leading-none font-bold px-0.5`}>
                        🛡
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Rune combo entries (keystones with proc charges) */}
        {runeComboEntries && runeComboEntries.length > 0 && onRuneChargeChange && (
          <>
            <div className="w-px h-9 bg-zinc-700/60" />
            <div className="flex items-center gap-1.5">
              {runeComboEntries.map((entry) => {
                const charges = runeCharges?.[entry.id] ?? 0;
                return (
                  <LongPressButton
                    key={entry.id}
                    onTap={() => onRuneChargeChange(entry.id, charges + 1)}
                    onLongPress={() => {
                      if (charges > 0) onRuneChargeChange(entry.id, charges - 1);
                    }}
                    className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${charges > 0 ? "ring-2 ring-yellow-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                    title={entry.name}
                  >
                    <Image
                      src={entry.icon}
                      alt={entry.name}
                      width={36}
                      height={36}
                      className="rounded border border-black/50"
                      unoptimized
                    />
                    {charges > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] bg-yellow-600 text-white rounded-full leading-none font-bold px-0.5">
                        {charges}
                      </span>
                    )}
                  </LongPressButton>
                );
              })}
            </div>
          </>
        )}

        {/* Rune item toggles (Biscuit, Triple Tonic elixirs) */}
        {runeItemEntries && runeItemEntries.length > 0 && onRuneItemChargeChange && (
          <>
            <div className="w-px h-9 bg-zinc-700/60" />
            <div className="flex items-center gap-1.5">
              {runeItemEntries.map((entry) => {
                const charges = runeItemCharges?.[entry.id] ?? 0;
                return (
                  <LongPressButton
                    key={entry.id}
                    onTap={() => onRuneItemChargeChange(entry.id, Math.min(charges + 1, entry.maxCharges))}
                    onLongPress={() => {
                      if (charges > 0) onRuneItemChargeChange(entry.id, charges - 1);
                    }}
                    className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${charges > 0 ? "ring-2 ring-amber-500 shadow-md" : "opacity-30 hover:opacity-60"}
 `}
                    title={`${entry.name}\n${entry.desc}`}
                  >
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${entry.itemId}.png`}
                      alt={entry.name}
                      width={36}
                      height={36}
                      className="rounded border border-black/50"
                      unoptimized
                    />
                    {charges > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] bg-amber-600 text-white rounded-full leading-none font-bold px-0.5">
                        {charges}
                      </span>
                    )}
                  </LongPressButton>
                );
              })}
            </div>
          </>
        )}

        {/* Sylas R selector */}
        {isSylas && onSylasRChange && championsForSylasR && (
          <>
            <div className="w-px h-9 bg-zinc-700/60" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-600 font-medium">R:</span>
              <button
                ref={sylasRBtnRef}
                onClick={() => { setSylasROpen(!sylasROpen); setSylasRSearch(''); }}
                className={`relative flex-shrink-0 rounded transition-all duration-100 select-none cursor-pointer
 ${sylasRChampionId ? 'ring-2 ring-red-500 shadow-md' : 'opacity-40 hover:opacity-70'}`}
                title={isJa ? 'サイラスR: チャンピオン選択' : 'Sylas R: Select Champion'}
              >
                {sylasRChampionId ? (
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championsForSylasR.find(c => c.id === sylasRChampionId)?.image ?? ''}`}
                    alt="Sylas R"
                    width={36}
                    height={36}
                    className="rounded border border-black/50"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded border border-zinc-700 border-dashed bg-zinc-800/50 flex items-center justify-center text-[10px] text-zinc-600">
                    R
                  </div>
                )}
              </button>
            </div>
            {/* Sylas R dropdown */}
            {sylasROpen && sylasRPos && createPortal(
              <div
                ref={sylasRDropdownRef}
                className="fixed bg-card border border-border shadow-xl p-1.5 w-[220px] max-h-[300px] flex flex-col"
                style={{ zIndex: 9999, top: sylasRPos.top, left: sylasRPos.left, transform: 'translateY(-100%)' }}
              >
                <input
                  type="text"
                  value={sylasRSearch}
                  onChange={(e) => setSylasRSearch(e.target.value)}
                  placeholder={isJa ? 'チャンピオン検索...' : 'Search champion...'}
                  className="w-full px-2 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-200 focus:outline-none focus:border-zinc-500 mb-1"
                  autoFocus
                />
                <div className="overflow-y-auto flex-1">
                  {sylasRChampionId && (
                    <>
                      <button
                        onClick={() => { onSylasRChange(null); setSylasROpen(false); }}
                        className="w-full text-left px-2 py-1 rounded text-xs text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
                      >
                        {isJa ? 'クリア' : 'Clear'}
                      </button>
                      <div className="h-px bg-border my-1" />
                    </>
                  )}
                  {filteredSylasRChamps.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { onSylasRChange(c.id); setSylasROpen(false); }}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-700/50 transition-colors ${sylasRChampionId === c.id ? 'bg-red-500/10' : ''}`}
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image}`}
                        alt={c.name}
                        width={20}
                        height={20}
                        className="rounded border border-black/40"
                        unoptimized
                      />
                      <span className="text-xs text-zinc-300">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>,
              document.body,
            )}
          </>
        )}
       </div>
      </div>

      {/* Champion combo passives row */}
      {comboPassives && comboPassives.length > 0 && onComboPassiveChange && (
        <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-zinc-700/40">
          <span className="text-[10px] text-zinc-600 font-medium">
            {isJa ? "パッシブ" : "Passive"}
          </span>
          {comboPassives.map((passive) => {
            // formGroup filter: only show passives matching the active form group
            if (passive.formGroup && hasFormGroups && passive.formGroup !== activeFormGroup) {
              return null;
            }
            const val =
              comboPassiveValues?.[passive.id] ?? passive.defaultValue;
            // aaLinked: cap max at current AA count
            const effectiveMax = passive.aaLinked ? Math.min(passive.max ?? 99, aaCounts) : (passive.max ?? 9999);
            const isShield = !!passive.shieldCalc;
            const activeColor = isShield
              ? "bg-sky-500/20 border border-sky-500/40 text-sky-300"
              : "bg-violet-500/20 border border-violet-500/40 text-violet-300";
            const activeAccent = isShield ? "text-sky-400" : "text-violet-400";
            if (passive.inputType === "toggle") {
              return (
                <button
                  key={passive.id}
                  onClick={() => onComboPassiveChange(passive.id, val ? 0 : 1)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all
 ${val ? activeColor : "bg-zinc-800/60 border border-zinc-700/40 text-zinc-500 hover:text-zinc-300"}
 `}
                  title={isJa ? passive.descriptionJa : passive.descriptionEn}
                >
                  {isShield && <span className="text-[11px]">🛡</span>}
                  <span className="font-medium">
                    {isJa ? passive.nameJa : passive.nameEn}
                  </span>
                  <span
                    className={`text-[10px] ${val ? activeAccent : "text-zinc-600"}`}
                  >
                    {val ? "ON" : "OFF"}
                  </span>
                </button>
              );
            }
            // Stack-based passive
            return (
              <div
                key={passive.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded border ${isShield && val > 0 ? "bg-sky-500/10 border-sky-500/30" : "bg-zinc-800/60 border-zinc-700/40"}`}
                title={isJa ? passive.descriptionJa : passive.descriptionEn}
              >
                {isShield && <span className="text-[11px]">🛡</span>}
                <span
                  className={`text-xs font-medium ${val > 0 ? (isShield ? "text-sky-300" : "text-violet-300") : "text-zinc-500"}`}
                >
                  {isJa ? passive.nameJa : passive.nameEn}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() =>
                      onComboPassiveChange(
                        passive.id,
                        Math.max(passive.min ?? 0, val - 1),
                      )
                    }
                    className="w-5 h-5 flex items-center justify-center rounded bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 text-xs font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={passive.min ?? 0}
                    max={effectiveMax}
                    value={Math.min(val, effectiveMax)}
                    onChange={(e) => {
                      const n = parseInt(e.target.value) || 0;
                      onComboPassiveChange(
                        passive.id,
                        Math.max(
                          passive.min ?? 0,
                          Math.min(effectiveMax, n),
                        ),
                      );
                    }}
                    className="w-12 h-5 text-center text-xs font-bold bg-zinc-900/60 border border-zinc-700/40 rounded text-zinc-200 focus:outline-none focus:border-zinc-500 tabular-nums"
                  />
                  <button
                    onClick={() =>
                      onComboPassiveChange(
                        passive.id,
                        Math.min(effectiveMax, val + 1),
                      )
                    }
                    className="w-5 h-5 flex items-center justify-center rounded bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
                {/* Show seconds for time-based passives (e.g. Renekton R ticks) */}
                {passive.secondsPerUnit && val > 0 && (
                  <span className="text-[10px] text-zinc-500 ml-0.5">
                    ({(val * passive.secondsPerUnit).toFixed(1)}s)
                  </span>
                )}
                {/* Show AA cap hint for aaLinked */}
                {passive.aaLinked && (
                  <span className="text-[10px] text-zinc-600 ml-0.5">
                    /AA{aaCounts}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Item stack bonuses (Dark Seal, Mejai's, Yuntal, etc.) */}
      {itemStackBonuses && itemStackBonuses.length > 0 && onItemStackChange && (
        <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-zinc-700/40">
          <span className="text-[10px] text-zinc-600 font-medium">
            {isJa ? "スタック" : "Stacks"}
          </span>
          {itemStackBonuses.map((sb) => {
            const stacks = itemStacks?.[sb.itemId] ?? 0;
            return (
              <div
                key={sb.itemId}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700/40"
              >
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${sb.itemId}.png`}
                  alt={isJa ? sb.nameJa : sb.nameEn}
                  width={20}
                  height={20}
                  className="rounded border border-black/40"
                  unoptimized
                />
                <span className={`text-xs font-medium ${stacks > 0 ? "text-teal-300" : "text-zinc-500"}`}>
                  {isJa ? sb.nameJa : sb.nameEn}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => onItemStackChange(sb.itemId, Math.max(0, stacks - 1))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 text-xs font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={sb.maxStacks}
                    value={stacks}
                    onChange={(e) => {
                      const n = parseInt(e.target.value) || 0;
                      onItemStackChange(sb.itemId, Math.max(0, Math.min(sb.maxStacks, n)));
                    }}
                    className="w-12 h-5 text-center text-xs font-bold bg-zinc-900/60 border border-zinc-700/40 rounded text-zinc-200 focus:outline-none focus:border-zinc-500 tabular-nums"
                  />
                  <button
                    onClick={() => onItemStackChange(sb.itemId, Math.min(sb.maxStacks, stacks + 1))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Skill description tooltip panel */}
      {hoveredInfo && hoveredAccent && (
        <div
          className={`mt-2 p-2 rounded border ${hoveredAccent.border} bg-card`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-sm font-bold ${hoveredAccent.text}`}>
              {hoveredSkill}
            </span>
            <span className="text-sm text-zinc-300 font-medium">
              {hoveredInfo.name}
            </span>
          </div>
          {hoveredInfo.description && (
            <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line line-clamp-4">
              {hoveredInfo.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

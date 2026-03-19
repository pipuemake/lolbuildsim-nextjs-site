"use client";

import React from "react";
import { DamageSegment } from "@/types";

const SEGMENT_COLORS: Record<string, string> = {
  Q: "#3b82f6",
  W: "#10b981",
  E: "#f97316",
  R: "#ef4444",
  AA: "#94a3b8",
  P: "#a855f7",
  SUM: "#f59e0b",
  ITEM: "#14b8a6",
  // Keystone damage
  PtA: "#eab308",
  LT: "#f472b6",
  ELEC: "#c084fc",    // Electrocute - purple
  DH: "#7c3aed",      // Dark Harvest - deep purple
  AERY: "#60a5fa",     // Summon Aery - light blue
  COMET: "#818cf8",    // Arcane Comet - indigo
  GRASP: "#4ade80",    // Grasp - green
  AFTER: "#fbbf24",    // Aftershock - amber
  FS: "#f97316",       // First Strike - orange
  // Sub-rune damage
  RUNE: "#d946ef",     // Generic sub-rune - fuchsia
};

// Shield type colors
const SHIELD_COLORS = {
  all:      { bar: 'linear-gradient(180deg, #e2e8f0dd 0%, #94a3b899 100%)', legend: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)' },
  physical: { bar: 'linear-gradient(180deg, #fb923cdd 0%, #ea580c99 100%)', legend: 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)' },
  magic:    { bar: 'linear-gradient(180deg, #c084fcdd 0%, #9333ea99 100%)', legend: 'linear-gradient(180deg, #c084fc 0%, #9333ea 100%)' },
} as const;

const SHIELD_LABELS = {
  all:      { ja: 'シールド', en: 'Shield' },
  physical: { ja: '物理シールド', en: 'Phys Shield' },
  magic:    { ja: '魔法シールド', en: 'Mag Shield' },
} as const;

export type ShieldType = 'physical' | 'magic' | 'all';

export interface ShieldInfo {
  physical: number;
  magic: number;
  all: number;
}

interface HPBarProps {
  maxHP: number;
  damageSegments: DamageSegment[];
  /** @deprecated Use shields instead */
  shieldAmount?: number;
  shields?: ShieldInfo;
  healAmount?: number;
  label?: string;
  locale?: string;
}

export function HPBar({
  maxHP,
  damageSegments,
  shieldAmount: legacyShield = 0,
  shields,
  healAmount = 0,
  label,
  locale = "ja",
}: HPBarProps) {
  // Use new shields prop if available, fallback to legacy shieldAmount
  const physicalShield = shields?.physical ?? 0;
  const magicShield = shields?.magic ?? 0;
  const allShield = shields?.all ?? (shields ? 0 : legacyShield);
  const totalShield = physicalShield + magicShield + allShield;

  // Calculate how much of each damage type exists
  const physicalDmg = damageSegments
    .filter(s => s.damageType === 'physical')
    .reduce((sum, s) => sum + s.amount, 0);
  const magicDmg = damageSegments
    .filter(s => s.damageType === 'magic')
    .reduce((sum, s) => sum + s.amount, 0);
  const trueDmg = damageSegments
    .filter(s => s.damageType === 'true')
    .reduce((sum, s) => sum + s.amount, 0);
  // Segments without damageType are treated as physical (AA, skills default)
  const untyped = damageSegments
    .filter(s => !s.damageType)
    .reduce((sum, s) => sum + s.amount, 0);

  const totalPhys = physicalDmg + untyped;
  const totalMag = magicDmg;

  // Calculate effective shield absorption:
  // Physical shield blocks physical damage, magic shield blocks magic damage
  // All shield blocks remaining damage after typed shields
  // True damage bypasses all shields
  const physBlocked = Math.min(physicalShield, totalPhys);
  const magBlocked = Math.min(magicShield, totalMag);
  const remainingPhys = totalPhys - physBlocked;
  const remainingMag = totalMag - magBlocked;
  const remainingDmgForAllShield = remainingPhys + remainingMag; // true damage bypasses shields
  const allBlocked = Math.min(allShield, remainingDmgForAllShield);

  const totalBlocked = physBlocked + magBlocked + allBlocked;
  const effectiveShield = totalBlocked; // actual HP saved by shields

  const effectiveHP = maxHP + effectiveShield;
  const totalDamageRaw = damageSegments.reduce((sum, s) => sum + s.amount, 0);
  // Healing reduces effective damage (can't overheal above max HP)
  const totalDamage = Math.max(0, totalDamageRaw - healAmount);
  const remainingHP = Math.max(0, effectiveHP - totalDamage);
  const killable = totalDamage >= effectiveHP;

  // Segment dividers every 100 HP, max 30 visible
  const segmentCount = Math.min(Math.ceil(effectiveHP / 100), 30);

  const remainingPct = (remainingHP / effectiveHP) * 100;
  const hpOnlyPct = (maxHP / effectiveHP) * 100;

  // HP bar color based on remaining HP (not shield)
  const remainingHpOnly = Math.max(0, maxHP - Math.max(0, totalDamage - effectiveShield));
  const hpRatio = maxHP > 0 ? (remainingHpOnly / maxHP) * 100 : 0;
  const hpColor =
    hpRatio > 60 ? "#22c55e" : hpRatio > 30 ? "#eab308" : "#ef4444";

  // Build shield segments for visualization (in order: all, physical, magic)
  const shieldSegments: { type: ShieldType; amount: number }[] = [];
  if (allBlocked > 0) shieldSegments.push({ type: 'all', amount: allBlocked });
  if (physBlocked > 0) shieldSegments.push({ type: 'physical', amount: physBlocked });
  if (magBlocked > 0) shieldSegments.push({ type: 'magic', amount: magBlocked });

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-zinc-400 font-medium">{label}</span>
          <span
            className={`text-[13px] font-bold tabular-nums ${killable ? "text-red-400" : "text-zinc-300"}`}
          >
            {killable ? (
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                {locale === "ja" ? "キル可能" : "Killable"}
              </span>
            ) : (
              <>
                {Math.round(remainingHP)}{" "}
                <span className="text-zinc-600 font-normal">
                  / {Math.round(maxHP)}
                </span>
              </>
            )}
          </span>
        </div>
      )}

      {/* Main HP bar */}
      <div className="relative h-7 bg-zinc-900 rounded overflow-hidden border border-zinc-700/50 shadow-inner">
        {/* Remaining HP (green/yellow/red portion) */}
        <div
          className="absolute left-0 top-0 h-full transition-all duration-300"
          style={{
            width: `${Math.min(remainingPct, hpOnlyPct)}%`,
            background: `linear-gradient(180deg, ${hpColor}dd 0%, ${hpColor}99 100%)`,
          }}
        />
        {/* Shield portions (shown after HP, each typed shield gets its own color) */}
        {(() => {
          let shieldOffset = Math.min(remainingPct, hpOnlyPct);
          const shieldEnd = remainingPct;
          return shieldSegments.map((seg, i) => {
            const segPct = (seg.amount / effectiveHP) * 100;
            const available = shieldEnd - shieldOffset;
            const w = Math.min(segPct, available);
            if (w <= 0) return null;
            const el = (
              <div
                key={`shield-${i}`}
                className="absolute top-0 h-full transition-all duration-300"
                style={{
                  left: `${shieldOffset}%`,
                  width: `${w}%`,
                  background: SHIELD_COLORS[seg.type].bar,
                }}
              />
            );
            shieldOffset += w;
            return el;
          });
        })()}

        {/* Damage segments */}
        {(() => {
          let offset = remainingHP / effectiveHP;
          return damageSegments.map((seg, i) => {
            const width = Math.min(seg.amount / effectiveHP, 1 - offset);
            if (width <= 0) return null;
            const segEl = (
              <div
                key={i}
                className="absolute top-0 h-full transition-all duration-300"
                style={{
                  left: `${offset * 100}%`,
                  width: `${width * 100}%`,
                  backgroundColor:
                    seg.color || SEGMENT_COLORS[seg.source] || "#666",
                  opacity: 0.75,
                }}
              />
            );
            offset += width;
            return segEl;
          });
        })()}

        {/* 100 HP divider lines */}
        {Array.from({ length: segmentCount - 1 }).map((_, i) => (
          <div
            key={`seg-${i}`}
            className="absolute top-0 h-full w-px bg-black/40 pointer-events-none"
            style={{ left: `${(((i + 1) * 100) / effectiveHP) * 100}%` }}
          />
        ))}

        {/* HP text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {effectiveShield > 0
              ? `${Math.round(remainingHpOnly)} + ${Math.round(Math.max(0, remainingHP - remainingHpOnly))} / ${Math.round(maxHP)}`
              : `${Math.round(remainingHP)} / ${Math.round(maxHP)}`}
          </span>
        </div>
      </div>

      {/* Damage legend */}
      {damageSegments.some((s) => s.amount > 0) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {damageSegments
            .filter((s) => s.amount > 0)
            .map((seg, i) => (
              <div key={i} className="flex items-center gap-1 text-xs">
                <div
                  className="w-2.5 h-2.5 flex-shrink-0"
                  style={{
                    backgroundColor:
                      seg.color || SEGMENT_COLORS[seg.source] || "#666",
                  }}
                />
                <span className="text-zinc-500">{seg.source}</span>
                <span className="text-zinc-300 tabular-nums">
                  {Math.round(seg.amount)}
                </span>
              </div>
            ))}
          {/* Shield legend entries - one per type */}
          {shieldSegments.map((seg, i) => (
            <div key={`shield-legend-${i}`} className="flex items-center gap-1 text-[10px]">
              <div className="w-2.5 h-2.5 flex-shrink-0 rounded-sm" style={{ background: SHIELD_COLORS[seg.type].legend }} />
              <span className="text-zinc-500">{SHIELD_LABELS[seg.type][locale === 'ja' ? 'ja' : 'en']}</span>
              <span className="text-zinc-300 tabular-nums">{Math.round(seg.amount)}</span>
            </div>
          ))}
          {healAmount > 0 && (
            <div className="flex items-center gap-1 text-[10px]">
              <div className="w-2.5 h-2.5 flex-shrink-0 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-zinc-500">{locale === "ja" ? "回復" : "Heal"}</span>
              <span className="text-green-400 tabular-nums">+{Math.round(healAmount)}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] ml-auto">
            <span className="text-zinc-600">
              {locale === "ja" ? "計" : "Total"}:
            </span>
            <span
              className={`font-medium tabular-nums ${killable ? "text-red-400" : "text-amber-400"}`}
            >
              {Math.round(totalDamage)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

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
};

interface HPBarProps {
  maxHP: number;
  damageSegments: DamageSegment[];
  shieldAmount?: number;
  healAmount?: number;
  label?: string;
  locale?: string;
}

export function HPBar({
  maxHP,
  damageSegments,
  shieldAmount = 0,
  healAmount = 0,
  label,
  locale = "ja",
}: HPBarProps) {
  const effectiveHP = maxHP + shieldAmount;
  const totalDamageRaw = damageSegments.reduce((sum, s) => sum + s.amount, 0);
  // Healing reduces effective damage (can't overheal above max HP)
  const totalDamage = Math.max(0, totalDamageRaw - healAmount);
  const remainingHP = Math.max(0, effectiveHP - totalDamage);
  const killable = totalDamage >= effectiveHP;

  // Segment dividers every 100 HP, max 30 visible
  const segmentCount = Math.min(Math.ceil(effectiveHP / 100), 30);

  const remainingPct = (remainingHP / effectiveHP) * 100;
  const shieldPct = (shieldAmount / effectiveHP) * 100;
  const hpOnlyPct = (maxHP / effectiveHP) * 100;

  // HP bar color based on remaining HP (not shield)
  const remainingHpOnly = Math.max(0, maxHP - Math.max(0, totalDamage - shieldAmount));
  const hpRatio = maxHP > 0 ? (remainingHpOnly / maxHP) * 100 : 0;
  const hpColor =
    hpRatio > 60 ? "#22c55e" : hpRatio > 30 ? "#eab308" : "#ef4444";

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
        {/* Shield portion (white/silver, shown after HP) */}
        {shieldAmount > 0 && remainingPct > hpOnlyPct && (
          <div
            className="absolute top-0 h-full transition-all duration-300"
            style={{
              left: `${Math.min(remainingPct, hpOnlyPct)}%`,
              width: `${Math.min(remainingPct - hpOnlyPct, shieldPct)}%`,
              background: 'linear-gradient(180deg, #e2e8f0dd 0%, #94a3b899 100%)',
            }}
          />
        )}

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
            {shieldAmount > 0
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
          {shieldAmount > 0 && (
            <div className="flex items-center gap-1 text-[10px]">
              <div className="w-2.5 h-2.5 flex-shrink-0 rounded-sm" style={{ background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)' }} />
              <span className="text-zinc-500">{locale === "ja" ? "シールド" : "Shield"}</span>
              <span className="text-zinc-300 tabular-nums">{Math.round(shieldAmount)}</span>
            </div>
          )}
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

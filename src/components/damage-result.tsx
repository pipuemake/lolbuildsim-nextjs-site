"use client";

import React, { useState } from "react";
import {
  DamageResult,
  DPSResult,
  SkillDamageResult,
  OnHitDamageResult,
} from "@/types";

interface DamageResultPanelProps {
  aaDamage: DamageResult;
  skillDamages: SkillDamageResult[];
  comboDamage: number;
  dps: DPSResult;
  targetHP: number;
  locale?: string;
}

const SKILL_TEXT_COLORS: Record<string, string> = {
  Q: "text-blue-400",
  W: "text-emerald-400",
  E: "text-orange-400",
  R: "text-red-400",
  P: "text-violet-400",
};

const SKILL_BAR_COLORS: Record<string, string> = {
  Q: "bg-blue-500",
  W: "bg-emerald-500",
  E: "bg-orange-500",
  R: "bg-red-500",
  P: "bg-violet-500",
};

const SKILL_BG_COLORS: Record<string, string> = {
  Q: "bg-blue-500/10 border-blue-500/30",
  W: "bg-emerald-500/10 border-emerald-500/30",
  E: "bg-orange-500/10 border-orange-500/30",
  R: "bg-red-500/10 border-red-500/30",
  P: "bg-violet-500/10 border-violet-500/30",
};

export function DamageResultPanel({
  aaDamage,
  skillDamages,
  comboDamage,
  dps,
  targetHP,
  locale = "ja",
}: DamageResultPanelProps) {
  const isJa = locale === "ja";
  const [expanded, setExpanded] = useState(false);

  const killable = comboDamage >= targetHP;
  const comboPercent =
    targetHP > 0 ? Math.min((comboDamage / targetHP) * 100, 100) : 0;

  const allDamages = [
    {
      key: "AA",
      label: isJa ? "通常攻撃" : "Auto Attack",
      amount: aaDamage.total,
    },
    ...skillDamages.map((sd) => ({
      key: sd.skillKey,
      label: isJa && sd.skillNameJa ? sd.skillNameJa : sd.skillName,
      amount: sd.totalAfterResist,
    })),
  ].filter((d) => d.amount > 0);

  const maxDamage = Math.max(...allDamages.map((d) => d.amount), 1);

  return (
    <div className="lol-card overflow-hidden w-full">
      {/* Combo header - always visible */}
      <div
        className={`px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors ${killable ? "lol-card-gold" : ""}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="lol-section-title font-[family-name:Arial,sans-serif]">
            {isJa ? "ダメージ計算" : "Damage"}
          </span>
          <div className="flex items-center gap-2">
            {killable && (
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                {isJa ? "KILL" : "KILL"}
              </span>
            )}
            <span className="text-zinc-500 text-xs">
              {expanded ? "▲" : "▼"}
            </span>
          </div>
        </div>

        {/* Combo progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-4 bg-zinc-800/80 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${killable ? "bg-red-500" : "bg-amber-500"}`}
              style={{ width: `${comboPercent}%` }}
            />
            {/* HP tick marks */}
            {[25, 50, 75].map((pct) => (
              <div
                key={pct}
                className="absolute top-0 h-full w-px bg-black/40"
                style={{ left: `${pct}%` }}
              />
            ))}
          </div>
          <span
            className={`text-xl font-semibold tabular-nums min-w-[4rem] text-right ${killable ? "text-red-400" : "text-amber-400"}`}
          >
            {Math.round(comboDamage)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-zinc-500 mt-0.5 px-0.5">
          <span>0</span>
          <span className="text-zinc-400">
            {Math.round(comboPercent)}% {isJa ? "対象HP" : "of target HP"}
          </span>
          <span>{Math.round(targetHP)}</span>
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 space-y-1.5 border-t border-border/60">
          {/* Auto Attack */}
          {aaDamage.total > 0 && (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 font-medium">
                  {isJa ? "通常攻撃" : "Auto Attack"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 text-xs">
                    {aaDamage.physical > 0 && (
                      <span className="text-orange-400">
                        {Math.round(aaDamage.physical)}
                      </span>
                    )}
                    {aaDamage.magical > 0 && (
                      <span className="text-violet-400">
                        {Math.round(aaDamage.magical)}
                      </span>
                    )}
                    {aaDamage.trueDamage > 0 && (
                      <span className="text-zinc-200">
                        {Math.round(aaDamage.trueDamage)}
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-200 font-bold tabular-nums w-14 text-right">
                    {Math.round(aaDamage.total)}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 rounded-full transition-all duration-300"
                  style={{ width: `${(aaDamage.total / maxDamage) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Skill damages (including sub-casts) */}
          {skillDamages.map((skill) => {
            const displayKey = skill.subCastId ?? skill.skillKey;
            return (
              <div key={displayKey} className="space-y-0.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded ${SKILL_TEXT_COLORS[skill.skillKey] || "text-zinc-400"} bg-black/30`}
                    >
                      {skill.subCastId ?? skill.skillKey}
                    </span>
                    <span
                      className={`font-medium ${SKILL_TEXT_COLORS[skill.skillKey] || "text-zinc-400"}`}
                    >
                      {isJa && skill.skillNameJa
                        ? skill.skillNameJa
                        : skill.skillName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {Math.round(skill.baseDamage)}+
                      {Math.round(skill.scaledDamage)}
                    </span>
                    <span
                      className={`font-bold tabular-nums w-14 text-right ${SKILL_TEXT_COLORS[skill.skillKey] || "text-zinc-200"}`}
                    >
                      {Math.round(skill.totalAfterResist)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${SKILL_BAR_COLORS[skill.skillKey] || "bg-zinc-400"}`}
                    style={{
                      width: `${(skill.totalAfterResist / maxDamage) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* On-Hit Effects */}
          {aaDamage.onHitEffects && aaDamage.onHitEffects.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-border/40">
              <div className="text-xs text-zinc-500 mb-1 font-medium">
                {isJa
                  ? "オンヒット効果 (AA1回あたり)"
                  : "On-Hit Effects (per AA)"}
              </div>
              {aaDamage.onHitEffects.map((oh) => (
                <div
                  key={oh.itemId}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <span className="text-zinc-400">{isJa && oh.itemNameJa ? oh.itemNameJa : oh.itemName}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        oh.damageType === "physical"
                          ? "text-orange-400"
                          : oh.damageType === "magic"
                            ? "text-violet-400"
                            : "text-zinc-200"
                      }
                    >
                      {Math.round(oh.effectiveDamage)}
                    </span>
                    {oh.trigger === "spellblade" && (
                      <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1 rounded">
                        SB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DPS */}
          <div className="mt-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-400 uppercase tracking-wide">
                  DPS
                </span>
                <span className="text-xs text-zinc-500">
                  ({dps.attackSpeed.toFixed(2)} AS
                  {dps.critRate > 0 &&
                    ` · ${Math.round(dps.critRate * 100)}% Crit`}
                  {dps.onHitDpsContribution != null &&
                    dps.onHitDpsContribution > 0 &&
                    ` · +${Math.round(dps.onHitDpsContribution)} on-hit`}
                  )
                </span>
              </div>
              <span className="text-yellow-400 font-bold tabular-nums">
                {Math.round(dps.dps)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

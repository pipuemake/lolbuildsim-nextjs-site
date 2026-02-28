"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Champion, SkillData, SkillDamageResult, SkillScaling } from "@/types";

/** Map scaling stat keys to display names */
const STAT_DISPLAY_NAMES: Record<string, string> = {
  ad: "AD",
  bonusAd: "Bonus AD",
  ap: "AP",
  hp: "HP",
  bonusHp: "Bonus HP",
  maxHp: "Max HP",
  armor: "Armor",
  mr: "MR",
  mana: "Mana",
  bonusMana: "Bonus Mana",
  attackSpeed: "AS",
  targetMaxHp: "Target Max HP",
  targetCurrentHp: "Target Current HP",
  targetMissingHp: "Target Missing HP",
};

const DAMAGE_TYPE_STYLE: Record<string, { color: string; label: string }> = {
  physical: { color: "bg-red-400", label: "Physical" },
  magic: { color: "bg-blue-400", label: "Magic" },
  true: { color: "bg-white", label: "True" },
};

/** Build a human-readable damage formula string, e.g. "60 + 60% AD + 40% AP" */
function buildDamageFormula(
  baseDamage: number[],
  scalings: SkillScaling[],
  rank: number,
): string | null {
  const base = baseDamage[rank - 1];
  if (base === undefined && scalings.length === 0) return null;
  const parts: string[] = [];
  if (base !== undefined && base !== 0) parts.push(String(base));
  for (const s of scalings) {
    const pct = Math.round(s.ratio * 100);
    if (pct === 0) continue;
    parts.push(`${pct}% ${STAT_DISPLAY_NAMES[s.stat] ?? s.stat}`);
  }
  return parts.length > 0 ? parts.join(" + ") : null;
}

interface SkillDamageProps {
  champion: Champion;
  skills: SkillData[];
  skillDamages: SkillDamageResult[];
  skillRanks: Record<string, number>;
  distanceMultipliers?: Record<string, number>;
  onSkillRankChange: (key: string, rank: number) => void;
  onDistanceMultiplierChange?: (subCastId: string, pct: number) => void;
  version: string;
  locale?: string;
  targetHpPercent?: number;
  onTargetHpPercentChange?: (pct: number) => void;
}

const SKILL_ACCENT: Record<
  string,
  { border: string; bg: string; text: string; bar: string }
> = {
  Q: {
    border: "border-blue-500/40",
    bg: "bg-blue-950/40",
    text: "text-blue-400",
    bar: "bg-blue-500",
  },
  W: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/40",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  E: {
    border: "border-orange-500/40",
    bg: "bg-orange-950/40",
    text: "text-orange-400",
    bar: "bg-orange-500",
  },
  R: {
    border: "border-red-500/40",
    bg: "bg-red-950/40",
    text: "text-red-400",
    bar: "bg-red-500",
  },
  P: {
    border: "border-violet-500/40",
    bg: "bg-violet-950/40",
    text: "text-violet-400",
    bar: "bg-violet-500",
  },
};

const DEFAULT_ACCENT = {
  border: "border-zinc-700",
  bg: "bg-zinc-800/40",
  text: "text-zinc-400",
  bar: "bg-zinc-500",
};

/** Strip HTML tags and decode entities from DDragon description */
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

export function SkillDamagePanel({
  champion,
  skills,
  skillDamages,
  skillRanks,
  distanceMultipliers,
  onSkillRankChange,
  onDistanceMultiplierChange,
  version,
  locale = "ja",
  targetHpPercent = 100,
  onTargetHpPercentChange,
}: SkillDamageProps) {
  const isJa = locale === "ja";
  const [collapsed, setCollapsed] = useState(false);

  // Check if any skill has targetMissingHp or targetCurrentHp scaling
  const hasHpScaling = skills.some(
    (s) =>
      s.scalings.some((sc) => sc.stat === "targetMissingHp" || sc.stat === "targetCurrentHp") ||
      s.subCasts?.some((sub) =>
        sub.scalings.some((sc) => sc.stat === "targetMissingHp" || sc.stat === "targetCurrentHp"),
      ),
  );

  const displaySkills = skills.filter((s) => s.key !== "P");

  /** Get localized spell info from DDragon champion data */
  const getSpellInfo = (
    key: string,
  ): { name: string; description: string; image: string } | null => {
    const idx = ["Q", "W", "E", "R"].indexOf(key);
    if (idx >= 0 && champion.spells[idx]) {
      const spell = champion.spells[idx];
      return {
        name: spell.name,
        description: stripHtml(spell.description),
        image: spell.image,
      };
    }
    return null;
  };

  return (
    <div className="lol-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="lol-section-title font-[family-name:Arial,sans-serif]">
          {isJa ? "スキルダメージ" : "Skill Damage"}
        </span>
        <span
          className="text-zinc-500 text-xs transition-transform duration-200"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {/* Target HP % slider - shown when any skill has HP-based scaling */}
          {hasHpScaling && onTargetHpPercentChange && (
            <div className="flex items-center gap-2 px-1 py-1.5 rounded bg-zinc-800/40 border border-zinc-700/30">
              <span className="text-[10px] text-zinc-500 whitespace-nowrap font-medium">
                {isJa ? "対象HP%" : "Target HP%"}
              </span>
              <input
                type="range"
                min={1}
                max={100}
                value={targetHpPercent}
                onChange={(e) => onTargetHpPercentChange(parseInt(e.target.value))}
                className="flex-1 h-1.5 accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-emerald-400 font-bold tabular-nums min-w-[2.5rem] text-right">
                {targetHpPercent}%
              </span>
            </div>
          )}
          {displaySkills.map((skill) => {
            const rank = skillRanks[skill.key] || 1;
            const spellInfo = getSpellInfo(skill.key);
            const accent = SKILL_ACCENT[skill.key] || DEFAULT_ACCENT;
            const displayName = spellInfo?.name || skill.name;
            const hasSubCasts = skill.subCasts && skill.subCasts.length > 0;

            // For sub-cast skills, find all sub-cast damage results
            const subCastDamages = hasSubCasts
              ? skillDamages.filter(
                  (d) => d.skillKey === skill.key && d.subCastId,
                )
              : [];
            // For regular skills, find the single damage result
            const damage = !hasSubCasts
              ? skillDamages.find(
                  (d) => d.skillKey === skill.key && !d.subCastId,
                )
              : null;

            return (
              <div
                key={skill.key}
                className={`rounded border ${accent.border} ${accent.bg} overflow-hidden`}
              >
                {/* Skill header */}
                <div className="flex items-center gap-2 px-2.5 py-2">
                  {spellInfo?.image ? (
                    <div className="relative flex-shrink-0">
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellInfo.image}`}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="rounded border border-black/40"
                        unoptimized
                      />
                      <span
                        className={`absolute -top-1 -left-1 text-[10px] font-black ${accent.text} bg-black/90 rounded px-1 leading-tight`}
                      >
                        {skill.key}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded border border-current ${accent.border} ${accent.bg} flex items-center justify-center`}
                    >
                      <span className={`text-sm font-black ${accent.text}`}>
                        {skill.key}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-zinc-200 font-medium truncate flex-1">
                    {displayName}
                  </span>

                  {/* Rank selector */}
                  <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                    {Array.from({ length: skill.maxRank }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => onSkillRankChange(skill.key, i + 1)}
                        className={`w-6 h-6 text-[11px] font-bold rounded transition-all duration-100 ${
                          rank === i + 1
                            ? `${accent.bar} text-white shadow-sm`
                            : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-cast damage info */}
                {hasSubCasts && subCastDamages.length > 0 && (
                  <div className="px-2 pb-1.5 space-y-1.5">
                    {subCastDamages.map((scd) => {
                      // Find the subCast definition to check for distanceMultiplier and image
                      const scDef = skill.subCasts?.find(
                        (sc) => sc.id === scd.subCastId,
                      );
                      const subLabel =
                        scDef?.comboLabel ??
                        scd.subCastId?.replace(skill.key, "") ??
                        "";
                      const hasDist = scDef?.distanceMultiplier;
                      const distPct = hasDist
                        ? (distanceMultipliers?.[scd.subCastId!] ??
                          hasDist.defaultPct)
                        : 0;
                      const distMult = hasDist
                        ? hasDist.min +
                          (hasDist.max - hasDist.min) * (distPct / 100)
                        : 1;

                      return (
                        <div key={scd.subCastId} className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {scDef?.image && (
                              <Image
                                src={scDef.image}
                                alt={scd.subCastId ?? ""}
                                width={20}
                                height={20}
                                className="rounded border border-black/40"
                                unoptimized
                              />
                            )}
                            <span className={`font-bold ${accent.text}`}>
                              {scd.subCastId}
                            </span>
                            <span className="text-zinc-500">
                              {isJa && scd.skillNameJa
                                ? scd.skillNameJa
                                : scd.skillName}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-[13px]">
                            <div className="flex flex-col">
                              <span className="text-zinc-600">
                                {isJa ? "基礎" : "Base"}
                              </span>
                              <span className="text-zinc-300 font-medium tabular-nums">
                                {Math.round(scd.baseDamage)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-zinc-600">
                                {isJa ? "スケール" : "Scale"}
                              </span>
                              <span className="text-zinc-300 font-medium tabular-nums">
                                +{Math.round(scd.scaledDamage)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-zinc-600">
                                {isJa ? "最終" : "Final"}
                              </span>
                              <span
                                className={`font-bold tabular-nums ${accent.text}`}
                              >
                                {Math.round(scd.totalAfterResist)}
                              </span>
                            </div>
                          </div>

                          {/* Damage formula */}
                          {(() => {
                            const formula = buildDamageFormula(scDef?.baseDamage ?? [], scDef?.scalings ?? [], rank);
                            const dmgType = DAMAGE_TYPE_STYLE[scd.damageType];
                            return formula ? (
                              <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                                {dmgType && (
                                  <span
                                    className={`inline-block w-1.5 h-1.5 rounded-full ${dmgType.color} flex-shrink-0`}
                                    title={dmgType.label}
                                  />
                                )}
                                {formula}
                              </div>
                            ) : null;
                          })()}

                          {/* Distance multiplier slider (e.g. Nidalee Q) */}
                          {hasDist && onDistanceMultiplierChange && (
                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-white/5">
                              <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                                {isJa ? hasDist.labelJa : hasDist.labelEn}
                              </span>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={distPct}
                                onChange={(e) =>
                                  onDistanceMultiplierChange(
                                    scd.subCastId!,
                                    parseInt(e.target.value),
                                  )
                                }
                                className="flex-1 h-1.5 accent-blue-500 cursor-pointer"
                              />
                              <span className="text-[11px] text-zinc-400 font-bold tabular-nums min-w-[2.5rem] text-right">
                                x{distMult.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Cooldown & cost (shared across sub-casts) */}
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <span>
                        CD:{" "}
                        <span className="text-zinc-400">
                          {skill.cooldown[rank - 1]}s
                        </span>
                      </span>
                      {skill.cost[rank - 1] > 0 && (
                        <span>
                          {isJa ? "コスト" : "Cost"}:{" "}
                          <span className="text-sky-400">
                            {skill.cost[rank - 1]} {skill.costType}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Regular damage info */}
                {!hasSubCasts && damage && (
                  <div className="px-2 pb-1.5 space-y-1">
                    <div className="grid grid-cols-3 gap-1 text-[13px]">
                      <div className="flex flex-col">
                        <span className="text-zinc-600">
                          {isJa ? "基礎" : "Base"}
                        </span>
                        <span className="text-zinc-300 font-medium tabular-nums">
                          {Math.round(damage.baseDamage)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-600">
                          {isJa ? "スケール" : "Scale"}
                        </span>
                        <span className="text-zinc-300 font-medium tabular-nums">
                          +{Math.round(damage.scaledDamage)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-600">
                          {isJa ? "最終" : "Final"}
                        </span>
                        <span
                          className={`font-bold tabular-nums ${accent.text}`}
                        >
                          {Math.round(damage.totalAfterResist)}
                        </span>
                      </div>
                    </div>

                    {/* Damage formula */}
                    {(() => {
                      const formula = buildDamageFormula(skill.baseDamage, skill.scalings, rank);
                      const dmgType = DAMAGE_TYPE_STYLE[skill.damageType];
                      return formula ? (
                        <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                          {dmgType && (
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${dmgType.color} flex-shrink-0`}
                              title={dmgType.label}
                            />
                          )}
                          {formula}
                        </div>
                      ) : null;
                    })()}

                    {/* Cooldown & cost */}
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <span>
                        CD:{" "}
                        <span className="text-zinc-400">
                          {skill.cooldown[rank - 1]}s
                        </span>
                      </span>
                      {skill.cost[rank - 1] > 0 && (
                        <span>
                          {isJa ? "コスト" : "Cost"}:{" "}
                          <span className="text-sky-400">
                            {skill.cost[rank - 1]} {skill.costType}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Skill description from DDragon */}
                {spellInfo?.description && (
                  <div className="px-2 pb-2">
                    <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-line line-clamp-3">
                      {spellInfo.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

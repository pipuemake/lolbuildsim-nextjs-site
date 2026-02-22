"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import type { ChampionBonusDefinition, BonusStats } from "@/types";

interface BonusStatsValues {
  [bonusId: string]: number;
}

interface GenericBonusValues {
  ad: number;
  ap: number;
  hp: number;
  armor: number;
  mr: number;
}

interface BonusStatsPanelProps {
  championBonuses: ChampionBonusDefinition[];
  runeBonuses: ChampionBonusDefinition[];
  bonusValues: BonusStatsValues;
  genericBonuses: GenericBonusValues;
  onBonusChange: (bonusId: string, value: number) => void;
  onGenericChange: (stat: keyof GenericBonusValues, value: number) => void;
  locale: string;
}

export function BonusStatsPanel({
  championBonuses,
  runeBonuses,
  bonusValues,
  genericBonuses,
  onBonusChange,
  onGenericChange,
  locale,
}: BonusStatsPanelProps) {
  const allBonuses = [...championBonuses, ...runeBonuses];

  if (allBonuses.length === 0 && !genericBonuses) return null;

  return (
    <div className="sim-card p-3 space-y-2">
      <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
        {locale === "ja" ? "ボーナスステータス" : "Bonus Stats"}
      </div>

      {/* Champion-specific bonuses */}
      {championBonuses.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wide">
            {locale === "ja" ? "チャンピオン固有" : "Champion"}
          </div>
          {championBonuses.map((bonus) => (
            <BonusRow
              key={bonus.id}
              bonus={bonus}
              value={bonusValues[bonus.id] ?? bonus.defaultValue}
              onChange={(v) => onBonusChange(bonus.id, v)}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Rune bonuses */}
      {runeBonuses.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wide">
            {locale === "ja" ? "ルーン" : "Runes"}
          </div>
          {runeBonuses.map((bonus) => (
            <BonusRow
              key={bonus.id}
              bonus={bonus}
              value={bonusValues[bonus.id] ?? bonus.defaultValue}
              onChange={(v) => onBonusChange(bonus.id, v)}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Generic bonus inputs */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-zinc-400 uppercase tracking-wide">
          {locale === "ja" ? "追加ボーナス" : "Extra Bonus"}
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[
            { key: "ad" as const, label: "AD", color: "text-orange-400" },
            { key: "ap" as const, label: "AP", color: "text-violet-400" },
            { key: "hp" as const, label: "HP", color: "text-emerald-400" },
            {
              key: "armor" as const,
              label: locale === "ja" ? "AR" : "AR",
              color: "text-yellow-400",
            },
            { key: "mr" as const, label: "MR", color: "text-blue-400" },
          ].map(({ key, label, color }) => (
            <div key={key} className="flex flex-col items-center gap-0.5">
              <span className={`text-[9px] font-medium ${color}`}>{label}</span>
              <Input
                type="number"
                min={0}
                value={genericBonuses[key] || ""}
                onChange={(e) =>
                  onGenericChange(key, Number(e.target.value) || 0)
                }
                className="h-6 w-full text-center text-[11px] bg-background border-border text-zinc-200 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BonusRow({
  bonus,
  value,
  onChange,
  locale,
}: {
  bonus: ChampionBonusDefinition;
  value: number;
  onChange: (v: number) => void;
  locale: string;
}) {
  const name = locale === "ja" ? bonus.nameJa : bonus.nameEn;
  const desc = locale === "ja" ? bonus.descriptionJa : bonus.descriptionEn;

  if (bonus.inputType === "toggle") {
    return (
      <label className="flex items-center gap-2 py-0.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={value === 1}
          onChange={(e) => onChange(e.target.checked ? 1 : 0)}
          className="rounded border-border bg-background text-[#C89B3C] focus:ring-[#C89B3C]/30 w-3.5 h-3.5"
        />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-zinc-200 font-medium truncate">
            {name}
          </div>
          <div className="text-[9px] text-zinc-400 truncate">{desc}</div>
        </div>
      </label>
    );
  }

  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-zinc-200 font-medium truncate">
          {name}
        </div>
        <div className="text-[9px] text-zinc-400 truncate">{desc}</div>
      </div>
      <Input
        type="number"
        min={bonus.min ?? 0}
        max={bonus.max}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-6 w-16 text-center text-[11px] bg-background border-border text-zinc-200 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        placeholder="0"
      />
    </div>
  );
}

/** Compute merged BonusStats from all active bonus definitions + generic values */
export function computeBonusStats(
  bonuses: ChampionBonusDefinition[],
  values: Record<string, number>,
  genericBonuses: GenericBonusValues,
  level: number,
): BonusStats {
  const result: BonusStats = {};

  for (const bonus of bonuses) {
    const val = values[bonus.id] ?? bonus.defaultValue;
    if (val === 0 && bonus.inputType === "number") continue;
    if (val === 0 && bonus.inputType === "toggle") continue;

    const stats = bonus.calc(val, level);
    for (const [key, v] of Object.entries(stats)) {
      if (v !== undefined && v !== 0) {
        (result as Record<string, number>)[key] =
          ((result as Record<string, number>)[key] ?? 0) + (v as number);
      }
    }
  }

  // Add generic bonuses
  if (genericBonuses.ad) result.ad = (result.ad ?? 0) + genericBonuses.ad;
  if (genericBonuses.ap) result.ap = (result.ap ?? 0) + genericBonuses.ap;
  if (genericBonuses.hp) result.hp = (result.hp ?? 0) + genericBonuses.hp;
  if (genericBonuses.armor)
    result.armor = (result.armor ?? 0) + genericBonuses.armor;
  if (genericBonuses.mr) result.mr = (result.mr ?? 0) + genericBonuses.mr;

  return result;
}

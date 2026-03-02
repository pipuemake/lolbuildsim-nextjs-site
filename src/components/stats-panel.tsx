"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ComputedStats } from "@/types";

interface StatRow {
  key: string;
  label: string;
  value: number;
  format?: "number" | "percent" | "decimal";
  color?: string;
  icon?: string;
  hideIfZero?: boolean;
}

interface StatCategory {
  title: string;
  icon: string;
  rows: StatRow[];
}

interface StatsPanelProps {
  stats: ComputedStats;
  locale?: string;
  aaCounts?: number;
  critHitCount?: number;
  onCritHitCountChange?: (count: number) => void;
}

export function StatsPanel({ stats, locale = "ja", aaCounts, critHitCount, onCritHitCountChange }: StatsPanelProps) {
  const isJa = locale === "ja";
  const [collapsed, setCollapsed] = useState(false);

  const categories: StatCategory[] = [
    {
      title: isJa ? "基本" : "Core",
      icon: "♥",
      rows: [
        {
          key: "hp",
          label: isJa ? "体力" : "Health",
          value: stats.hp,
          color: "text-emerald-400",
        },
        {
          key: "mp",
          label: isJa ? "マナ" : "Mana",
          value: stats.mp,
          color: "text-sky-400",
          hideIfZero: true,
        },
        {
          key: "ad",
          label: isJa ? "攻撃力" : "Attack Dmg",
          value: stats.ad,
          color: "text-orange-400",
        },
        {
          key: "ap",
          label: isJa ? "魔力" : "Ability Pwr",
          value: stats.ap,
          color: "text-violet-400",
          hideIfZero: true,
        },
        {
          key: "ms",
          label: isJa ? "移動速度" : "Move Speed",
          value: stats.moveSpeed,
        },
        {
          key: "range",
          label: isJa ? "射程" : "Range",
          value: stats.attackRange,
        },
      ],
    },
    {
      title: isJa ? "防御" : "Defense",
      icon: "🛡",
      rows: [
        {
          key: "armor",
          label: isJa ? "物理防御" : "Armor",
          value: stats.armor,
          color: "text-yellow-400",
        },
        {
          key: "mr",
          label: isJa ? "魔法防御" : "Magic Resist",
          value: stats.mr,
          color: "text-blue-400",
        },
        {
          key: "hpRegen",
          label: isJa ? "HP回復" : "HP Regen",
          value: stats.hpRegen ?? 0,
          format: "decimal",
          color: "text-emerald-300",
          hideIfZero: true,
        },
        {
          key: "tenacity",
          label: isJa ? "テナシティ" : "Tenacity",
          value: stats.tenacity,
          format: "percent",
          color: "text-teal-400",
          hideIfZero: true,
        },
      ],
    },
    {
      title: isJa ? "攻撃" : "Attack",
      icon: "⚔",
      rows: [
        {
          key: "as",
          label: isJa ? "攻撃速度" : "Attack Speed",
          value: stats.attackSpeed,
          format: "decimal",
        },
        {
          key: "crit",
          label: isJa ? "クリティカル" : "Crit Chance",
          value: stats.critChance * 100,
          format: "percent",
          color: "text-yellow-300",
          hideIfZero: true,
        },
        {
          key: "lethality",
          label: isJa ? "脅威" : "Lethality",
          value: stats.lethality,
          color: "text-red-400",
          hideIfZero: true,
        },
        {
          key: "pap",
          label: isJa ? "物理貫通%" : "Armor Pen %",
          value: stats.percentArmorPen * 100,
          format: "percent",
          color: "text-red-300",
          hideIfZero: true,
        },
        {
          key: "lifeSteal",
          label: isJa ? "ライフスティール" : "Life Steal",
          value: (stats.lifeSteal ?? 0) * 100,
          format: "percent",
          color: "text-rose-400",
          hideIfZero: true,
        },
        {
          key: "omnivamp",
          label: isJa ? "オムニバンプ" : "Omnivamp",
          value: (stats.omnivamp ?? 0) * 100,
          format: "percent",
          color: "text-rose-300",
          hideIfZero: true,
        },
      ],
    },
    {
      title: isJa ? "スキル" : "Ability",
      icon: "✦",
      rows: [
        {
          key: "ah",
          label: isJa ? "アビリティヘイスト" : "Ability Haste",
          value: stats.abilityHaste,
          color: "text-cyan-400",
          hideIfZero: true,
        },
        {
          key: "fmp",
          label: isJa ? "魔法貫通" : "Magic Pen",
          value: stats.flatMagicPen,
          color: "text-purple-400",
          hideIfZero: true,
        },
        {
          key: "pmp",
          label: isJa ? "魔法貫通%" : "Magic Pen %",
          value: stats.percentMagicPen * 100,
          format: "percent",
          color: "text-purple-300",
          hideIfZero: true,
        },
        {
          key: "mpRegen",
          label: isJa ? "MPリジェン" : "Mana Regen",
          value: stats.mpRegen ?? 0,
          format: "decimal",
          color: "text-sky-300",
          hideIfZero: true,
        },
      ],
    },
  ];

  const formatValue = (row: StatRow): string => {
    switch (row.format) {
      case "percent":
        return `${Math.round(row.value)}%`;
      case "decimal":
        return row.value.toFixed(2);
      default:
        return Math.round(row.value).toString();
    }
  };

  return (
    <div className="lol-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="lol-section-title font-[family-name:Arial,sans-serif]">
          {isJa ? "ステータス" : "Stats"}
        </span>
        <span
          className="text-zinc-500 text-xs transition-transform duration-200"
          style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-4">
          {categories.map((cat) => {
            const visibleRows = cat.rows.filter(
              (row) => !(row.hideIfZero && row.value === 0),
            );
            if (visibleRows.length === 0) return null;
            return (
              <div key={cat.title}>
                <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-border/60">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {cat.title}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {visibleRows.map((row) => (
                    <div key={row.key} className="lol-stat-row px-1">
                      <span className="text-[13px] text-zinc-400">
                        {row.label}
                      </span>
                      <span
                        className={`text-[13px] font-medium tabular-nums ${row.color || "text-zinc-200"}`}
                      >
                        {formatValue(row)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Critical hit count slider — disabled when crit chance is 0% */}
          {aaCounts != null && aaCounts > 0 && onCritHitCountChange && (
            <div className={`pt-2 border-t border-border/60${stats.critChance <= 0 ? ' opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                  {isJa ? 'クリティカル' : 'Crit'}
                </span>
                <Slider
                  value={[stats.critChance <= 0 ? 0 : (critHitCount ?? 0)]}
                  onValueChange={([v]) => onCritHitCountChange(v)}
                  min={0}
                  max={aaCounts}
                  step={1}
                  disabled={stats.critChance <= 0}
                  className="flex-1 [&_[role=slider]]:bg-yellow-400 [&_[role=slider]]:border-yellow-400 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_.relative]:h-2"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xl font-bold text-zinc-200 w-8 text-center tabular-nums leading-none">
                    {stats.critChance <= 0 ? 0 : (critHitCount ?? 0)}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => onCritHitCountChange(Math.min(aaCounts, (critHitCount ?? 0) + 1))}
                      disabled={stats.critChance <= 0}
                      className="text-[10px] text-zinc-600 hover:text-zinc-300 leading-none transition-colors px-0.5"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => onCritHitCountChange(Math.max(0, (critHitCount ?? 0) - 1))}
                      disabled={stats.critChance <= 0}
                      className="text-[10px] text-zinc-600 hover:text-zinc-300 leading-none transition-colors px-0.5"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

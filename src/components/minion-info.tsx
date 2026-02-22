"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComputedStats, MinionStats, TowerStats } from "@/types";

interface MinionInfoProps {
  attackerStats: ComputedStats;
  minionData: {
    type: string;
    stats: MinionStats;
    damageToMinion: number;
    hitsToKill: number;
    damageFromMinion: number;
  }[];
  towerData: {
    stats: TowerStats;
    damageToYou: number[]; // damage per consecutive shot
  } | null;
  gameMinute: number;
  onGameMinuteChange: (min: number) => void;
  locale?: string;
}

export function MinionInfo({
  minionData,
  towerData,
  gameMinute,
  onGameMinuteChange,
  locale = "ja",
}: MinionInfoProps) {
  const isJa = locale === "ja";

  const MINION_LABELS: Record<string, Record<string, string>> = {
    melee: { ja: "近接ミニオン", en: "Melee Minion" },
    ranged: { ja: "遠隔ミニオン", en: "Ranged Minion" },
    cannon: { ja: "キャノンミニオン", en: "Cannon Minion" },
    super: { ja: "スーパーミニオン", en: "Super Minion" },
  };

  return (
    <div className="bg-zinc-900/80 p-3 border border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-300">
          {isJa ? "ミニオン・タワー" : "Minions & Tower"}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {isJa ? "ゲーム時間" : "Game Time"}
          </span>
          <Select
            value={gameMinute.toString()}
            onValueChange={(v) => onGameMinuteChange(parseInt(v))}
          >
            <SelectTrigger className="w-20 h-7 text-xs bg-zinc-800 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {[0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30].map((min) => (
                <SelectItem
                  key={min}
                  value={min.toString()}
                  className="text-xs"
                >
                  {min}
                  {isJa ? "分" : "min"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Minion table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-400 border-b border-zinc-800">
              <th className="text-left py-1 font-normal">
                {isJa ? "タイプ" : "Type"}
              </th>
              <th className="text-right py-1 font-normal">HP</th>
              <th className="text-right py-1 font-normal">
                {isJa ? "AAダメージ" : "AA Dmg"}
              </th>
              <th className="text-right py-1 font-normal">
                {isJa ? "AA数" : "Hits"}
              </th>
              <th className="text-right py-1 font-normal">
                {isJa ? "被ダメ" : "Dmg to You"}
              </th>
            </tr>
          </thead>
          <tbody>
            {minionData.map((m) => (
              <tr key={m.type} className="border-b border-zinc-800/50">
                <td className="py-1 text-zinc-300">
                  {MINION_LABELS[m.type]?.[locale] || m.type}
                </td>
                <td className="text-right text-green-400">
                  {Math.round(m.stats.hp)}
                </td>
                <td className="text-right text-orange-400">
                  {Math.round(m.damageToMinion)}
                </td>
                <td className="text-right text-amber-400">{m.hitsToKill}</td>
                <td className="text-right text-red-400">
                  {Math.round(m.damageFromMinion)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tower damage */}
      {towerData && (
        <div className="mt-3 pt-2 border-t border-zinc-800">
          <h4 className="text-xs text-zinc-500 mb-1">
            {isJa ? "タワーショットダメージ" : "Tower Shot Damage"}
          </h4>
          <div className="flex gap-2 text-xs">
            {towerData.damageToYou.slice(0, 5).map((dmg, i) => (
              <div key={i} className="text-center">
                <div className="text-zinc-500">#{i + 1}</div>
                <div className="text-red-400 font-medium">
                  {Math.round(dmg)}
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            {isJa
              ? "※連続ショットでダメージ増加(+40%/shot)"
              : "※ Damage increases per consecutive shot (+40%/shot)"}
          </div>
        </div>
      )}
    </div>
  );
}

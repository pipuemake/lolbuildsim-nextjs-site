"use client";

import React, { useState } from "react";
import { HasteInfo } from "@/types";

interface HasteDisplayProps {
  hasteInfo: HasteInfo;
  locale?: string;
}

export function HasteDisplay({ hasteInfo, locale = "ja" }: HasteDisplayProps) {
  const isJa = locale === "ja";
  const [collapsed, setCollapsed] = useState(false);

  const cdrPct = (hasteInfo.cooldownReduction * 100).toFixed(1);
  const hasteVal = hasteInfo.abilityHaste;

  return (
    <div className="lol-card overflow-hidden w-full">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="lol-section-title font-[family-name:Arial,sans-serif]">
            {isJa ? "ヘイスト" : "Haste"}
          </span>
          {hasteVal > 0 && (
            <span className="text-[13px] text-cyan-400 font-bold">
              {hasteVal} AH
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasteVal > 0 && (
            <span className="text-xs text-zinc-500">{cdrPct}% CDR</span>
          )}
          <span
            className="text-zinc-500 text-xs"
            style={{
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
          >
            ▼
          </span>
        </div>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="lol-stat-row px-1">
              <span className="text-[13px] text-zinc-500">
                {isJa ? "スキルヘイスト" : "Ability Haste"}
              </span>
              <span className="text-[13px] font-medium text-cyan-400 tabular-nums">
                {hasteVal}
              </span>
            </div>
            <div className="lol-stat-row px-1">
              <span className="text-[13px] text-zinc-500">
                {isJa ? "CDR換算" : "CDR Equiv."}
              </span>
              <span className="text-[13px] font-medium text-cyan-300 tabular-nums">
                {cdrPct}%
              </span>
            </div>
            {hasteInfo.ultimateHaste > 0 && (
              <div className="lol-stat-row px-1">
                <span className="text-[13px] text-zinc-500">
                  {isJa ? "アルティメットヘイスト" : "Ultimate Haste"}
                </span>
                <span className="text-[13px] font-medium text-purple-400 tabular-nums">
                  {hasteInfo.ultimateHaste}
                </span>
              </div>
            )}
            {hasteInfo.tenacity > 0 && (
              <>
                <div className="lol-stat-row px-1">
                  <span className="text-[13px] text-zinc-500">
                    {isJa ? "テナシティ" : "Tenacity"}
                  </span>
                  <span className="text-[13px] font-medium text-teal-400 tabular-nums">
                    {hasteInfo.tenacity}%
                  </span>
                </div>
                <div className="lol-stat-row px-1">
                  <span className="text-[13px] text-zinc-500">
                    {isJa ? "CC軽減" : "CC Reduction"}
                  </span>
                  <span className="text-[13px] font-medium text-teal-300 tabular-nums">
                    {(hasteInfo.ccReduction * 100).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Skill cooldowns */}
          {hasteInfo.skillCooldowns.length > 0 && (
            <div className="space-y-1.5 mt-1">
              <div className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                {isJa ? "スキルCD" : "Skill CDs"}
              </div>
              {hasteInfo.skillCooldowns.map((cd) => {
                const reductionPct =
                  cd.baseCooldown > 0 ? cd.actualCooldown / cd.baseCooldown : 1;
                return (
                  <div key={cd.key} className="flex items-center gap-2">
                    <span className="w-4 text-center text-xs font-bold text-zinc-400 flex-shrink-0">
                      {cd.key}
                    </span>
                    <div className="flex-1 h-2.5 bg-zinc-800/80 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-cyan-600/70 rounded-full transition-all duration-300"
                        style={{ width: `${reductionPct * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs flex-shrink-0 tabular-nums">
                      <span className="text-zinc-600">
                        {cd.baseCooldown.toFixed(1)}s
                      </span>
                      <span className="text-zinc-700">→</span>
                      <span className="text-amber-400 font-medium">
                        {cd.actualCooldown.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

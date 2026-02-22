"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";

interface LevelSliderProps {
  level: number;
  onLevelChange: (level: number) => void;
  locale?: string;
}

export function LevelSlider({
  level,
  onLevelChange,
  locale = "ja",
}: LevelSliderProps) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border px-4 py-3">
      <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
        Lv.
      </span>
      <Slider
        value={[level]}
        onValueChange={([v]) => onLevelChange(v)}
        min={1}
        max={18}
        step={1}
        className="flex-1 [&_[role=slider]]:bg-[#C89B3C] [&_[role=slider]]:border-[#C89B3C] [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_.relative]:h-2"
      />
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xl font-bold text-zinc-200 w-8 text-center tabular-nums leading-none">
          {level}
        </span>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onLevelChange(Math.min(18, level + 1))}
            className="text-[10px] text-zinc-600 hover:text-zinc-300 leading-none transition-colors px-0.5"
          >
            ▲
          </button>
          <button
            onClick={() => onLevelChange(Math.max(1, level - 1))}
            className="text-[10px] text-zinc-600 hover:text-zinc-300 leading-none transition-colors px-0.5"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}

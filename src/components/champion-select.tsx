"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Champion } from "@/types";
import { championMatchesLane, type Lane } from "@/lib/data/champion-lanes";

const LANES = ["all", "TOP", "JG", "MID", "BOT", "SUP"] as const;

const LANE_ICONS: Record<string, string | null> = {
  all: null,
  TOP: "/lanes/position-top.svg",
  JG: "/lanes/position-jungle.svg",
  MID: "/lanes/position-middle.svg",
  BOT: "/lanes/position-bottom.svg",
  SUP: "/lanes/position-utility.svg",
};

const LANE_LABELS: Record<string, Record<string, string>> = {
  ja: {
    all: "全て",
    TOP: "TOP",
    JG: "JG",
    MID: "MID",
    BOT: "BOT",
    SUP: "SUP",
  },
  en: {
    all: "All",
    TOP: "TOP",
    JG: "JG",
    MID: "MID",
    BOT: "BOT",
    SUP: "SUP",
  },
};

const LANE_FULL_LABELS: Record<string, Record<string, string>> = {
  ja: {
    all: "全て",
    TOP: "トップ",
    JG: "ジャングル",
    MID: "ミッド",
    BOT: "ボット",
    SUP: "サポート",
  },
  en: {
    all: "All",
    TOP: "Top",
    JG: "Jungle",
    MID: "Mid",
    BOT: "Bot",
    SUP: "Support",
  },
};

/** Convert hiragana to katakana (U+3041-U+3096 → U+30A1-U+30F6) */
function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60),
  );
}

interface ChampionSelectProps {
  champions: Champion[];
  selectedId: string | null;
  onSelect: (champion: Champion) => void;
  onDeselect?: () => void;
  locale?: string;
  version: string;
}

export function ChampionSelect({
  champions,
  selectedId,
  onSelect,
  onDeselect,
  locale = "ja",
  version,
}: ChampionSelectProps) {
  const [search, setSearch] = useState("");
  const [laneFilter, setLaneFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return champions.filter((c) => {
      const q = search.toLowerCase();
      const qKata = hiraganaToKatakana(q);
      const matchesSearch =
        search === "" ||
        c.name.toLowerCase().includes(q) ||
        c.name.includes(qKata) ||
        c.id.toLowerCase().includes(q);
      const matchesLane =
        laneFilter === "all" || championMatchesLane(c.id, laneFilter as Lane);
      return matchesSearch && matchesLane;
    });
  }, [champions, search, laneFilter]);

  const labels = LANE_LABELS[locale] || LANE_LABELS.en;
  const fullLabels = LANE_FULL_LABELS[locale] || LANE_FULL_LABELS.en;

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder={
          locale === "ja" ? "チャンピオンを検索..." : "Search champion..."
        }
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#C89B3C]/30 focus-visible:border-[#C89B3C]/50"
      />
      <div className="flex flex-wrap gap-1">
        {LANES.map((lane) => {
          const active = laneFilter === lane;
          const icon = LANE_ICONS[lane];
          return (
            <button
              key={lane}
              title={fullLabels[lane]}
              onClick={() => setLaneFilter(lane)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all duration-150 flex items-center justify-center ${
                active
                  ? "bg-zinc-600 text-white shadow-sm"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
              }`}
            >
              {icon ? (
                <img
                  src={icon}
                  alt={labels[lane]}
                  className={`w-5 h-5 transition-all ${active ? "brightness-200" : "brightness-0 hover:brightness-50 dark:brightness-75 dark:hover:brightness-150"}`}
                />
              ) : (
                labels[lane]
              )}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-zinc-500 self-center">
          {filtered.length}/{champions.length}
        </span>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-7 gap-1 p-1">
          {filtered.map((champion) => {
            const isSelected = selectedId === champion.id;
            return (
              <button
                key={champion.id}
                onClick={() => {
                  if (champion.id !== selectedId) onSelect(champion);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isSelected && onDeselect) onDeselect();
                }}
                className={`relative group rounded overflow-hidden transition-all duration-150 ${
                  isSelected
                    ? "ring-2 ring-[#C89B3C] z-10"
                    : "opacity-80 hover:opacity-100 hover:ring-1 hover:ring-zinc-600 hover:z-10"
                }`}
                title={champion.name}
              >
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion.image}`}
                  alt={champion.name}
                  width={52}
                  height={52}
                  className="rounded block"
                  unoptimized
                />
                <span
                  className={`absolute bottom-0 left-0 right-0 text-[10px] text-center truncate px-0.5 pb-0.5 ${
                    isSelected
                      ? "bg-[#C89B3C]/80 text-white font-medium"
                      : "bg-black/70 text-white/90 group-hover:bg-black/80"
                  }`}
                >
                  {champion.name}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

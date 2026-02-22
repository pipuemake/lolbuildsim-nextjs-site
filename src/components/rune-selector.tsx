"use client";

import React from "react";
import Image from "next/image";
import { RunePath, SelectedRunes } from "@/types";
import { STAT_SHARDS } from "@/lib/data/runes";

const DDRAGON_CDN = "https://ddragon.leagueoflegends.com/cdn/img/";
const CDRAGON_CDN =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/statmods/";

/** Community Dragon image filenames for each stat shard (all lowercase) */
const SHARD_IMAGES: Record<string, string> = {
  shard_adaptive: "statmodsadaptiveforceicon.png",
  shard_adaptive2: "statmodsadaptiveforceicon.png",
  shard_attack_speed: "statmodsattackspeedicon.png",
  shard_ability_haste: "statmodscdrscalingicon.png",
  shard_move_speed: "statmodsmovementspeedicon.png",
  shard_hp_flat: "statmodshealthplusicon.png",
  shard_hp_scaling: "statmodshealthscalingicon.png",
  shard_hp_scaling2: "statmodshealthscalingicon.png",
  shard_tenacity: "statmodstenacityicon.png",
};

interface RuneSelectorProps {
  runePaths: RunePath[];
  selectedRunes: SelectedRunes;
  onRuneChange: (runes: SelectedRunes) => void;
  locale?: string;
}

export function RuneSelector({
  runePaths,
  selectedRunes,
  onRuneChange,
  locale = "ja",
}: RuneSelectorProps) {
  const primaryPath = runePaths.find((p) => p.id === selectedRunes.primaryPath);
  const secondaryPath = runePaths.find(
    (p) => p.id === selectedRunes.secondaryPath,
  );

  const updateRune = (field: keyof SelectedRunes, value: number | string) => {
    onRuneChange({ ...selectedRunes, [field]: value });
  };

  const selectPrimaryPath = (pathId: number) => {
    const path = runePaths.find((p) => p.id === pathId);
    if (!path) return;
    onRuneChange({
      ...selectedRunes,
      primaryPath: pathId,
      keystone: path.slots[0]?.runes[0]?.id ?? 0,
      primarySlot1: path.slots[1]?.runes[0]?.id ?? 0,
      primarySlot2: path.slots[2]?.runes[0]?.id ?? 0,
      primarySlot3: path.slots[3]?.runes[0]?.id ?? 0,
    });
  };

  const selectSecondaryPath = (pathId: number) => {
    if (pathId === selectedRunes.primaryPath) return;
    onRuneChange({
      ...selectedRunes,
      secondaryPath: pathId,
      secondarySlot1: 0,
      secondarySlot2: 0,
    });
  };

  const selectSecondaryRune = (runeId: number, slotIdx: number) => {
    const { secondarySlot1, secondarySlot2 } = selectedRunes;
    const path = secondaryPath;
    if (!path) return;

    // Find which slot index each currently selected rune belongs to
    const getSlotIdxForRune = (id: number): number => {
      if (id === 0) return -1;
      for (let i = 1; i <= 3; i++) {
        if (path.slots[i]?.runes.some((r) => r.id === id)) return i;
      }
      return -1;
    };

    const slot1Row = getSlotIdxForRune(secondarySlot1);
    const slot2Row = getSlotIdxForRune(secondarySlot2);

    // Already selected - deselect
    if (secondarySlot1 === runeId) {
      onRuneChange({
        ...selectedRunes,
        secondarySlot1: secondarySlot2,
        secondarySlot2: 0,
      });
      return;
    }
    if (secondarySlot2 === runeId) {
      onRuneChange({ ...selectedRunes, secondarySlot2: 0 });
      return;
    }

    // Same row as slot1 - replace slot1
    if (slotIdx === slot1Row) {
      onRuneChange({ ...selectedRunes, secondarySlot1: runeId });
      return;
    }

    // Same row as slot2 - replace slot2
    if (slotIdx === slot2Row) {
      onRuneChange({ ...selectedRunes, secondarySlot2: runeId });
      return;
    }

    // slot1 is empty - fill slot1
    if (secondarySlot1 === 0) {
      onRuneChange({ ...selectedRunes, secondarySlot1: runeId });
      return;
    }

    // slot2 is empty - fill slot2
    if (secondarySlot2 === 0) {
      onRuneChange({ ...selectedRunes, secondarySlot2: runeId });
      return;
    }

    // Both filled, different rows - replace slot1 (oldest)
    onRuneChange({
      ...selectedRunes,
      secondarySlot1: secondarySlot2,
      secondarySlot2: runeId,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Primary Path Selection */}
      <div className="flex gap-2">
        <span className="text-xs text-zinc-400 w-12">
          {locale === "ja" ? "メイン" : "Primary"}
        </span>
        <div className="flex gap-1">
          {runePaths.map((path) => (
            <button
              key={path.id}
              onClick={() => selectPrimaryPath(path.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                selectedRunes.primaryPath === path.id
                  ? "ring-2 ring-amber-500 bg-zinc-700"
                  : "bg-zinc-800 hover:bg-zinc-700 opacity-50"
              }`}
              title={path.name}
            >
              <Image
                src={`${DDRAGON_CDN}${path.icon}`}
                alt={path.name}
                width={24}
                height={24}
                unoptimized
              />
            </button>
          ))}
        </div>
      </div>

      {/* Keystone */}
      {primaryPath && primaryPath.slots[0] && (
        <div className="flex gap-1 ml-14">
          {primaryPath.slots[0].runes.map((rune) => (
            <button
              key={rune.id}
              onClick={() => updateRune("keystone", rune.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                selectedRunes.keystone === rune.id
                  ? "ring-2 ring-amber-400 bg-zinc-700"
                  : "bg-zinc-800 opacity-40 hover:opacity-70"
              }`}
              title={rune.name}
            >
              <Image
                src={`${DDRAGON_CDN}${rune.icon}`}
                alt={rune.name}
                width={32}
                height={32}
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Primary minor runes */}
      {primaryPath &&
        [1, 2, 3].map((slotIdx) => {
          const slot = primaryPath.slots[slotIdx];
          if (!slot) return null;
          const fieldMap = [
            "",
            "primarySlot1",
            "primarySlot2",
            "primarySlot3",
          ] as const;
          const field = fieldMap[slotIdx] as keyof SelectedRunes;
          return (
            <div key={slotIdx} className="flex gap-1 ml-14">
              {slot.runes.map((rune) => (
                <button
                  key={rune.id}
                  onClick={() => updateRune(field, rune.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    selectedRunes[field] === rune.id
                      ? "ring-2 ring-amber-400 bg-zinc-700"
                      : "bg-zinc-800 opacity-40 hover:opacity-70"
                  }`}
                  title={rune.name}
                >
                  <Image
                    src={`${DDRAGON_CDN}${rune.icon}`}
                    alt={rune.name}
                    width={24}
                    height={24}
                    unoptimized
                  />
                </button>
              ))}
            </div>
          );
        })}

      {/* Secondary Path */}
      <div className="flex gap-2 mt-2">
        <span className="text-xs text-zinc-400 w-12">
          {locale === "ja" ? "サブ" : "Secondary"}
        </span>
        <div className="flex gap-1">
          {runePaths
            .filter((p) => p.id !== selectedRunes.primaryPath)
            .map((path) => (
              <button
                key={path.id}
                onClick={() => selectSecondaryPath(path.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  selectedRunes.secondaryPath === path.id
                    ? "ring-2 ring-amber-500 bg-zinc-700"
                    : "bg-zinc-800 hover:bg-zinc-700 opacity-50"
                }`}
                title={path.name}
              >
                <Image
                  src={`${DDRAGON_CDN}${path.icon}`}
                  alt={path.name}
                  width={24}
                  height={24}
                  unoptimized
                />
              </button>
            ))}
        </div>
      </div>

      {/* Secondary minor runes (pick 2 from slots 1-3, different rows) */}
      {secondaryPath &&
        [1, 2, 3].map((slotIdx) => {
          const slot = secondaryPath.slots[slotIdx];
          if (!slot) return null;
          return (
            <div key={`sec-${slotIdx}`} className="flex gap-1 ml-14">
              {slot.runes.map((rune) => {
                const isSelected =
                  selectedRunes.secondarySlot1 === rune.id ||
                  selectedRunes.secondarySlot2 === rune.id;
                return (
                  <button
                    key={rune.id}
                    onClick={() => selectSecondaryRune(rune.id, slotIdx)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "ring-2 ring-amber-400 bg-zinc-700"
                        : "bg-zinc-800 opacity-40 hover:opacity-70"
                    }`}
                    title={rune.name}
                  >
                    <Image
                      src={`${DDRAGON_CDN}${rune.icon}`}
                      alt={rune.name}
                      width={24}
                      height={24}
                      unoptimized
                    />
                  </button>
                );
              })}
            </div>
          );
        })}

      {/* Stat Shards */}
      <div className="flex gap-2 mt-2">
        <span className="text-xs text-zinc-400 w-12">
          {locale === "ja" ? "シャード" : "Shards"}
        </span>
      </div>
      {STAT_SHARDS.map((row, rowIdx) => {
        const shardFields = ["statShard1", "statShard2", "statShard3"] as const;
        const field = shardFields[rowIdx];
        const currentValue = selectedRunes[field];

        return (
          <div key={`shard-${rowIdx}`} className="flex gap-1 ml-14">
            {row.map((shard) => {
              const isSelected = currentValue === shard.id;
              const imageFile = SHARD_IMAGES[shard.id];
              return (
                <button
                  key={shard.id}
                  onClick={() => updateRune(field, shard.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "ring-2 ring-amber-400 bg-zinc-700"
                      : "bg-zinc-800 opacity-40 hover:opacity-70"
                  }`}
                  title={shard.description}
                >
                  {imageFile ? (
                    <Image
                      src={`${CDRAGON_CDN}${imageFile}`}
                      alt={shard.name}
                      width={24}
                      height={24}
                      unoptimized
                    />
                  ) : (
                    <span className="text-xs text-zinc-400">
                      {shard.name.charAt(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import type { Champion, Item, RunePath } from "@/types";
import { parseChampionList } from "@/lib/data/champions";
import { parseItems } from "@/lib/data/items";
import { parseRunes } from "@/lib/data/runes";

const BASE_URL = "https://ddragon.leagueoflegends.com";

interface DragonData {
  version: string;
  champions: Champion[];
  items: Item[];
  runePaths: RunePath[];
  enChampionNames: Record<string, string>;
  enItemData: Record<string, { name: string; description: string }>;
}

interface UseDragonDataResult extends DragonData {
  loading: boolean;
  error: string | null;
}

// Module-level cache so data is shared across components / re-renders
let cachedData: DragonData | null = null;
let fetchPromise: Promise<DragonData> | null = null;

async function fetchDragonData(): Promise<DragonData> {
  const verRes = await fetch(`${BASE_URL}/api/versions.json`);
  if (!verRes.ok) throw new Error(`Failed to fetch versions: ${verRes.status}`);
  const versions: string[] = await verRes.json();
  const version = versions[0];

  const urls = {
    champJa: `${BASE_URL}/cdn/${version}/data/ja_JP/champion.json`,
    itemJa: `${BASE_URL}/cdn/${version}/data/ja_JP/item.json`,
    runeJa: `${BASE_URL}/cdn/${version}/data/ja_JP/runesReforged.json`,
    champEn: `${BASE_URL}/cdn/${version}/data/en_US/champion.json`,
    itemEn: `${BASE_URL}/cdn/${version}/data/en_US/item.json`,
  };

  const [champJaRes, itemJaRes, runeJaRes, champEnRes, itemEnRes] =
    await Promise.all([
      fetch(urls.champJa),
      fetch(urls.itemJa),
      fetch(urls.runeJa),
      fetch(urls.champEn),
      fetch(urls.itemEn),
    ]);

  if (!champJaRes.ok || !itemJaRes.ok || !runeJaRes.ok || !champEnRes.ok || !itemEnRes.ok) {
    throw new Error("Failed to fetch DDragon data");
  }

  const [champJa, itemJa, runeJa, champEn, itemEn] = await Promise.all([
    champJaRes.json(),
    itemJaRes.json(),
    runeJaRes.json(),
    champEnRes.json(),
    itemEnRes.json(),
  ]);

  const champions = parseChampionList(champJa.data);
  const items = parseItems(itemJa.data);
  const runePaths = parseRunes(runeJa);

  const enChampionNames: Record<string, string> = {};
  for (const [, champ] of Object.entries(champEn.data as Record<string, { id: string; name: string }>)) {
    enChampionNames[champ.id] = champ.name;
  }

  const enItemData: Record<string, { name: string; description: string }> = {};
  for (const [id, item] of Object.entries(itemEn.data as Record<string, { name: string; description: string }>)) {
    enItemData[id] = { name: item.name, description: item.description };
  }

  return { version, champions, items, runePaths, enChampionNames, enItemData };
}

export function useDragonData(): UseDragonDataResult {
  const [data, setData] = useState<DragonData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchDragonData();
    }

    fetchPromise
      .then((result) => {
        cachedData = result;
        if (mounted.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        fetchPromise = null; // Allow retry
        if (mounted.current) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setLoading(false);
        }
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  if (data) {
    return { ...data, loading, error };
  }

  return {
    version: "15.3.1",
    champions: [],
    items: [],
    runePaths: [],
    enChampionNames: {},
    enItemData: {},
    loading,
    error,
  };
}

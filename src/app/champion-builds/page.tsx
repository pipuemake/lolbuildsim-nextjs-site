import type { Metadata } from "next";
import {
  getLatestVersion,
  getChampions,
  getItems,
  getRunes,
} from "@/lib/data/dragon";
import { parseChampionList } from "@/lib/data/champions";
import { parseItems } from "@/lib/data/items";
import { parseRunes } from "@/lib/data/runes";
import { ChampionBuildsClient } from "./champion-builds-client";

export const metadata: Metadata = {
  title: "チャンピオンビルド | LoL Build Sim",
  description: "コミュニティが共有したLeague of Legendsのビルドを検索・ブックマーク。チャンピオン、レーン、役割でフィルタリング。",
  openGraph: {
    title: "チャンピオンビルド | LoL Build Sim",
    description: "LoLのコミュニティビルドを検索・ブックマーク・シミュレーターに読み込み。",
  },
};

export default async function ChampionBuildsPage() {
  let version = "15.3.1";
  let champions: ReturnType<typeof parseChampionList> = [];
  let items: ReturnType<typeof parseItems> = [];
  let runePaths: ReturnType<typeof parseRunes> = [];
  let enChampionNames: Record<string, string> = {};
  let error: string | null = null;

  try {
    version = await getLatestVersion();
    const [champData, itemData, runeData, champDataEn] = await Promise.all([
      getChampions(version),
      getItems(version),
      getRunes(version),
      getChampions(version, "en_US"),
    ]);

    champions = parseChampionList(champData);
    items = parseItems(itemData);
    runePaths = parseRunes(runeData);
    for (const [, champ] of Object.entries(champDataEn)) {
      enChampionNames[champ.id] = champ.name;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load data";
  }

  return (
    <ChampionBuildsClient
      version={version}
      champions={champions}
      items={items}
      runePaths={runePaths}
      enChampionNames={enChampionNames}
      error={error}
    />
  );
}

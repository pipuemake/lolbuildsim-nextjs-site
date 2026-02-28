import {
  getLatestVersion,
  getChampions,
  getItems,
  getRunes,
} from "@/lib/data/dragon";
import { parseChampionList } from "@/lib/data/champions";
import { parseItems } from "@/lib/data/items";
import { parseRunes } from "@/lib/data/runes";
import { SimulatorClient } from "./simulator-client";

export default async function Home() {
  let version = "15.3.1";
  let champions: ReturnType<typeof parseChampionList> = [];
  let items: ReturnType<typeof parseItems> = [];
  let runePaths: ReturnType<typeof parseRunes> = [];
  let enChampionNames: Record<string, string> = {};
  let enItemData: Record<string, { name: string; description: string }> = {};
  let error: string | null = null;

  try {
    version = await getLatestVersion();
    const [champData, itemData, runeData, champDataEn, itemDataEn] = await Promise.all([
      getChampions(version, 'ja_JP'),
      getItems(version, 'ja_JP'),
      getRunes(version, 'ja_JP'),
      getChampions(version, 'en_US'),
      getItems(version, 'en_US'),
    ]);

    champions = parseChampionList(champData);
    items = parseItems(itemData);
    runePaths = parseRunes(runeData);

    // Build English name maps for locale switching
    for (const [, champ] of Object.entries(champDataEn)) {
      enChampionNames[champ.id] = champ.name;
    }
    for (const [id, item] of Object.entries(itemDataEn)) {
      enItemData[id] = { name: item.name, description: item.description };
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load data";
  }

  return (
    <SimulatorClient
      version={version}
      champions={champions}
      items={items}
      runePaths={runePaths}
      enChampionNames={enChampionNames}
      enItemData={enItemData}
      error={error}
    />
  );
}

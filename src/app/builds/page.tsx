import {
  getLatestVersion,
  getChampions,
  getItems,
  getRunes,
} from "@/lib/data/dragon";
import { parseChampionList } from "@/lib/data/champions";
import { parseItems } from "@/lib/data/items";
import { parseRunes } from "@/lib/data/runes";
import { BuildsClient } from "./builds-client";

export default async function BuildsPage() {
  let version = "15.3.1";
  let champions: ReturnType<typeof parseChampionList> = [];
  let items: ReturnType<typeof parseItems> = [];
  let runePaths: ReturnType<typeof parseRunes> = [];
  let error: string | null = null;

  try {
    version = await getLatestVersion();
    const [champData, itemData, runeData] = await Promise.all([
      getChampions(version),
      getItems(version),
      getRunes(version),
    ]);

    champions = parseChampionList(champData);
    items = parseItems(itemData);
    runePaths = parseRunes(runeData);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load data";
  }

  return (
    <BuildsClient
      version={version}
      champions={champions}
      items={items}
      runePaths={runePaths}
      error={error}
    />
  );
}

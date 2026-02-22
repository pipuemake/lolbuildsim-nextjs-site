import type {
  DDragonChampionListData,
  DDragonChampionDetail,
  DDragonItemData,
} from '@/types';

const BASE_URL = 'https://ddragon.leagueoflegends.com';

// Simple in-memory cache
const cache = new Map<string, unknown>();

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`DDragon fetch failed: ${res.status} ${url}`);
  }
  const data = (await res.json()) as T;
  cache.set(url, data);
  return data;
}

export async function getLatestVersion(): Promise<string> {
  const versions = await fetchWithCache<string[]>(
    `${BASE_URL}/api/versions.json`
  );
  return versions[0];
}

export async function getChampions(
  version: string,
  locale = 'ja_JP'
): Promise<DDragonChampionListData> {
  const url = `${BASE_URL}/cdn/${version}/data/${locale}/champion.json`;
  const data = await fetchWithCache<{ data: DDragonChampionListData }>(url);
  return data.data;
}

export async function getChampionDetail(
  version: string,
  championId: string,
  locale = 'ja_JP'
): Promise<DDragonChampionDetail> {
  const url = `${BASE_URL}/cdn/${version}/data/${locale}/champion/${championId}.json`;
  const data = await fetchWithCache<{ data: Record<string, DDragonChampionDetail> }>(url);
  return data.data[championId];
}

export async function getItems(
  version: string,
  locale = 'ja_JP'
): Promise<DDragonItemData> {
  const url = `${BASE_URL}/cdn/${version}/data/${locale}/item.json`;
  const data = await fetchWithCache<{ data: DDragonItemData }>(url);
  return data.data;
}

export async function getRunes(
  version: string,
  locale = 'ja_JP'
): Promise<unknown[]> {
  const url = `${BASE_URL}/cdn/${version}/data/${locale}/runesReforged.json`;
  return fetchWithCache<unknown[]>(url);
}

export function getChampionImageUrl(version: string, imageName: string): string {
  return `${BASE_URL}/cdn/${version}/img/champion/${imageName}`;
}

export function getItemImageUrl(version: string, imageId: string): string {
  return `${BASE_URL}/cdn/${version}/img/item/${imageId}`;
}

export function getSpellImageUrl(version: string, imageName: string): string {
  return `${BASE_URL}/cdn/${version}/img/spell/${imageName}`;
}

export function getPassiveImageUrl(version: string, imageName: string): string {
  return `${BASE_URL}/cdn/${version}/img/passive/${imageName}`;
}

import type { RiotAccount, MatchDto, MatchTimelineDto } from '@/types/riot-api';
import { REGIONS } from '@/types/riot-api';

const API_KEY = process.env.RIOT_API_KEY;

export class RiotApiError extends Error {
  override name = 'RiotApiError';
  constructor(public status: number, message: string, public retryAfter?: number) {
    super(message);
  }
}

// ===== In-memory cache (server-side, per-process) =====
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_ENTRIES = 500;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

function evictExpired(): void {
  const now = Date.now();
  for (const [k, v] of cache) {
    if (now > v.expiresAt) cache.delete(k);
  }
}

function setCache<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    // First try removing expired entries
    evictExpired();
    // If still full, remove the oldest entry (FIFO)
    if (cache.size >= CACHE_MAX_ENTRIES) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }
  }
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Pre-built platform → regional routing lookup
const REGIONAL_MAP = new Map(REGIONS.map(r => [r.value, r.regional]));

/** Get regional routing value from platform ID */
export function getRegional(platform: string): string {
  return REGIONAL_MAP.get(platform) ?? 'asia';
}

// Generic fetch with API key and error handling
export async function riotFetch<T>(url: string): Promise<T> {
  if (!API_KEY) throw new RiotApiError(500, 'RIOT_API_KEY not configured');

  const res = await fetch(url, {
    headers: { 'X-Riot-Token': API_KEY },
  });

  if (!res.ok) {
    const retryAfter = res.headers.get('Retry-After');
    if (res.status === 429) {
      throw new RiotApiError(429, 'Rate limited', retryAfter ? parseInt(retryAfter, 10) : undefined);
    }
    if (res.status === 404) {
      throw new RiotApiError(404, 'Not found');
    }
    throw new RiotApiError(res.status, `Riot API error: ${res.status}`);
  }

  return res.json();
}

// Cached fetch: check cache first, then fetch and store
async function cachedFetch<T>(cacheKey: string, url: string, ttlMs = CACHE_TTL_MS): Promise<T> {
  const cached = getCached<T>(cacheKey);
  if (cached !== undefined) return cached;

  const data = await riotFetch<T>(url);
  setCache(cacheKey, data, ttlMs);
  return data;
}

// Account-V1: lookup by Riot ID (short cache: 2 min)
export async function getAccountByRiotId(gameName: string, tagLine: string, platform: string): Promise<RiotAccount> {
  const regional = getRegional(platform);
  const url = `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return cachedFetch<RiotAccount>(`account:${regional}:${gameName}#${tagLine}`, url, 2 * 60 * 1000);
}

// Match-V5: get match IDs (short cache: 1 min — list changes frequently)
export async function getMatchIds(puuid: string, platform: string, count = 20, queue?: number): Promise<string[]> {
  const regional = getRegional(platform);
  const params = new URLSearchParams({ count: String(count) });
  if (queue !== undefined) params.set('queue', String(queue));
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?${params}`;
  return cachedFetch<string[]>(`matchIds:${regional}:${puuid}:${count}:${queue ?? ''}`, url, 60 * 1000);
}

// Match-V5: get match detail (long cache: 5 min — match data is immutable)
export async function getMatch(matchId: string, platform: string): Promise<MatchDto> {
  const regional = getRegional(platform);
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  return cachedFetch<MatchDto>(`match:${matchId}`, url);
}

// Match-V5: get match timeline (long cache: 5 min — timeline data is immutable)
export async function getMatchTimeline(matchId: string, platform: string): Promise<MatchTimelineDto> {
  const regional = getRegional(platform);
  const url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`;
  return cachedFetch<MatchTimelineDto>(`timeline:${matchId}`, url);
}

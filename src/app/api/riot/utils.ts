import { NextResponse } from 'next/server';
import { RiotApiError } from '@/lib/riot/api';
import { isValidRegion } from '@/types/riot-api';

/** Create a JSON response with Cache-Control headers */
export function cachedJson(data: unknown, maxAgeSec: number): NextResponse {
  return NextResponse.json(data, {
    headers: { 'Cache-Control': `private, max-age=${maxAgeSec}` },
  });
}

/**
 * Validate that a region string is one of the known REGIONS values.
 * Returns the validated region string on success, or a NextResponse error.
 * Usage: `const region = validateRegion(param); if (region instanceof NextResponse) return region;`
 */
export function validateRegion(region: string | null): string | NextResponse {
  if (!region) {
    return NextResponse.json({ error: 'Missing required param: region' }, { status: 400 });
  }
  if (!isValidRegion(region)) {
    return NextResponse.json({ error: 'Invalid region' }, { status: 400 });
  }
  return region;
}

/**
 * Sanitize a match ID to prevent injection.
 * Riot match IDs follow the pattern: {REGION}_{NUMERIC_ID} e.g. "JP1_123456789"
 */
const MATCH_ID_RE = /^[A-Z]{2,4}\d?_\d+$/;

export function isValidMatchId(matchId: string): boolean {
  return MATCH_ID_RE.test(matchId);
}

/**
 * Sanitize a PUUID — Riot PUUIDs are 78-char hex-like strings with hyphens.
 */
const PUUID_RE = /^[a-zA-Z0-9_-]{40,100}$/;

export function isValidPuuid(puuid: string): boolean {
  return PUUID_RE.test(puuid);
}

/**
 * Convert a RiotApiError (or unknown error) into an appropriate NextResponse.
 * Keeps the API key and internal details from leaking to the client.
 */
export function handleRiotApiError(err: unknown, context: string): NextResponse {
  if (err instanceof RiotApiError) {
    if (err.status === 404) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (err.status === 429) {
      return NextResponse.json(
        { error: 'Rate limited', retryAfter: err.retryAfter },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(`${context}:`, err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

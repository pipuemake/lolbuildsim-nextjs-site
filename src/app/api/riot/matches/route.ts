import { NextResponse } from 'next/server';
import { getMatchIds } from '@/lib/riot/api';
import { validateRegion, isValidPuuid, handleRiotApiError, cachedJson } from '../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const puuid = searchParams.get('puuid');
  const countRaw = Number(searchParams.get('count') ?? 20);
  const count = Number.isFinite(countRaw) ? Math.min(Math.max(countRaw, 1), 100) : 20;
  const queueRaw = searchParams.get('queue');
  const queue = queueRaw !== null ? Number(queueRaw) : undefined;

  if (!puuid) {
    return NextResponse.json({ error: 'Missing required param: puuid' }, { status: 400 });
  }

  if (!isValidPuuid(puuid)) {
    return NextResponse.json({ error: 'Invalid puuid format' }, { status: 400 });
  }

  const region = validateRegion(searchParams.get('region'));
  if (region instanceof NextResponse) return region;

  if (queue !== undefined && !Number.isFinite(queue)) {
    return NextResponse.json({ error: 'Invalid queue value' }, { status: 400 });
  }

  try {
    const matchIds = await getMatchIds(puuid, region, count, queue);
    return cachedJson({ matchIds }, 60);
  } catch (err) {
    return handleRiotApiError(err, 'Match IDs fetch failed');
  }
}

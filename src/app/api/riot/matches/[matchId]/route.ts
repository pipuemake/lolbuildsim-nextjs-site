import { NextResponse } from 'next/server';
import { getMatch } from '@/lib/riot/api';
import { validateRegion, isValidMatchId, handleRiotApiError, cachedJson } from '../../utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> },
) {
  const { matchId } = await params;
  const { searchParams } = new URL(request.url);

  if (!isValidMatchId(matchId)) {
    return NextResponse.json({ error: 'Invalid matchId format' }, { status: 400 });
  }

  const region = validateRegion(searchParams.get('region'));
  if (region instanceof NextResponse) return region;

  try {
    const match = await getMatch(matchId, region);
    return cachedJson(match, 300);
  } catch (err) {
    return handleRiotApiError(err, 'Match fetch failed');
  }
}

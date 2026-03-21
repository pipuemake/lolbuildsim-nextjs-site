import { NextResponse } from 'next/server';
import { getMatch, getMatchTimeline } from '@/lib/riot/api';
import { processTimeline } from '@/lib/riot/timeline-processor';
import { validateRegion, isValidMatchId, handleRiotApiError, cachedJson } from '../../../utils';

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
    const [timeline, match] = await Promise.all([
      getMatchTimeline(matchId, region),
      getMatch(matchId, region),
    ]);

    const frames = processTimeline(timeline, match);

    return cachedJson({
      frames,
      participants: match.info.participants,
    }, 300);
  } catch (err) {
    return handleRiotApiError(err, 'Timeline fetch failed');
  }
}

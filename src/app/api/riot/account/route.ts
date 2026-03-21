import { NextResponse } from 'next/server';
import { getAccountByRiotId } from '@/lib/riot/api';
import { validateRegion, handleRiotApiError, cachedJson } from '../utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName')?.trim();
  const tagLine = searchParams.get('tagLine')?.trim();
  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: 'Missing required params: gameName, tagLine' },
      { status: 400 },
    );
  }
  if (gameName.length > 16 || tagLine.length > 5) {
    return NextResponse.json(
      { error: 'gameName max 16 chars, tagLine max 5 chars' },
      { status: 400 },
    );
  }

  const validatedRegion = validateRegion(searchParams.get('region'));
  if (validatedRegion instanceof NextResponse) return validatedRegion;

  try {
    const account = await getAccountByRiotId(gameName, tagLine, validatedRegion);
    return cachedJson({
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
    }, 120);
  } catch (err) {
    return handleRiotApiError(err, 'Account lookup failed');
  }
}

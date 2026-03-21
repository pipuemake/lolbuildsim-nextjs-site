// Region configuration
export type PlatformId = typeof REGIONS[number]['value'];
export type RegionalRouting = 'asia' | 'americas' | 'europe' | 'sea';

export interface RegionOption {
  value: string;      // platform routing value: jp1, kr, na1, euw1, etc.
  label: string;      // display name
  regional: RegionalRouting;   // regional routing: asia, americas, europe, sea
}

export const REGIONS: RegionOption[] = [
  { value: 'jp1', label: 'JP (日本)', regional: 'asia' },
  { value: 'kr', label: 'KR (한국)', regional: 'asia' },
  { value: 'na1', label: 'NA (North America)', regional: 'americas' },
  { value: 'euw1', label: 'EUW (Europe West)', regional: 'europe' },
  { value: 'eun1', label: 'EUNE (Europe Nordic)', regional: 'europe' },
  { value: 'oc1', label: 'OCE (Oceania)', regional: 'sea' },
  { value: 'br1', label: 'BR (Brazil)', regional: 'americas' },
  { value: 'la1', label: 'LAN (Latin America North)', regional: 'americas' },
  { value: 'la2', label: 'LAS (Latin America South)', regional: 'americas' },
  { value: 'tr1', label: 'TR (Turkey)', regional: 'europe' },
  { value: 'ru', label: 'RU (Russia)', regional: 'europe' },
  { value: 'ph2', label: 'PH (Philippines)', regional: 'sea' },
  { value: 'sg2', label: 'SG (Singapore)', regional: 'sea' },
  { value: 'th2', label: 'TH (Thailand)', regional: 'sea' },
  { value: 'tw2', label: 'TW (Taiwan)', regional: 'sea' },
  { value: 'vn2', label: 'VN (Vietnam)', regional: 'sea' },
] as const;

/** Set of valid platform IDs for O(1) validation */
export const VALID_REGIONS = new Set(REGIONS.map(r => r.value));

/** Type guard: checks if a string is a valid platform ID */
export function isValidRegion(value: string): boolean {
  return VALID_REGIONS.has(value);
}

// Riot Account API response
export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

// Match-V5 participant
export interface MatchParticipant {
  puuid: string;
  participantId: number;
  championId: number;
  championName: string;  // matches DDragon champion.id e.g. "Aatrox"
  riotIdGameName: string;
  riotIdTagline: string;
  teamId: number;        // 100=blue, 200=red
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  champLevel: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;  // trinket
  totalDamageDealtToChampions: number;
  summoner1Id: number;
  summoner2Id: number;
  perks: {
    statPerks: { offense: number; flex: number; defense: number };
    styles: Array<{
      style: number;  // RunePath id
      selections: Array<{ perk: number; var1: number; var2: number; var3: number }>;  // rune IDs + end-of-game stats
    }>;
  };
}

// Match-V5 match info
export interface MatchInfo {
  gameId: number;
  gameDuration: number;  // seconds
  gameMode: string;
  queueId: number;
  gameCreation: number;
  participants: MatchParticipant[];
}

export interface MatchDto {
  metadata: {
    matchId: string;
    participants: string[];  // PUUIDs
  };
  info: MatchInfo;
}

// Timeline types
export interface TimelineEvent {
  type: string;
  timestamp: number;
  participantId?: number;
  itemId?: number;
  beforeId?: number;  // for ITEM_UNDO
  afterId?: number;   // for ITEM_UNDO
  killerId?: number;
  victimId?: number;
  assistingParticipantIds?: number[];
  skillSlot?: number;  // 1=Q, 2=W, 3=E, 4=R for SKILL_LEVEL_UP
}

export interface ParticipantFrame {
  participantId: number;
  level: number;
  currentGold: number;
  totalGold: number;
  minionsKilled: number;
  jungleMinionsKilled: number;
  position: { x: number; y: number };
}

export interface TimelineFrame {
  timestamp: number;
  participantFrames: Record<string, ParticipantFrame>;
  events: TimelineEvent[];
}

export interface MatchTimelineDto {
  metadata: { matchId: string };
  info: {
    frameInterval: number;
    frames: TimelineFrame[];
  };
}

// Skill slot keys
export type SkillKey = 'Q' | 'W' | 'E' | 'R';

// Processed timeline snapshot for UI
export interface PlayerSnapshot {
  participantId: number;
  championName: string;
  level: number;
  items: number[];      // current item IDs (no zeros)
  totalGold: number;
  kills: number;
  deaths: number;
  assists: number;
  skillRanks: Record<SkillKey, number>;
}

export interface ProcessedFrame {
  minute: number;
  participants: Record<number, PlayerSnapshot>;
}

// Queue type labels
export const QUEUE_TYPES: Record<number, { en: string; ja: string }> = {
  420: { en: 'Ranked Solo', ja: 'ランクソロ' },
  440: { en: 'Ranked Flex', ja: 'ランクフレックス' },
  400: { en: 'Normal Draft', ja: 'ノーマル(ドラフト)' },
  430: { en: 'Normal Blind', ja: 'ノーマル(ブラインド)' },
  450: { en: 'ARAM', ja: 'ARAM' },
  490: { en: 'Quickplay', ja: 'クイックプレイ' },
  1700: { en: 'Arena', ja: 'アリーナ' },
};

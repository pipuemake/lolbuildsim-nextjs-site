/**
 * Champion lane/role assignments.
 * Based on LoLJP Wiki "おすすめチャンピオン一覧".
 * Champions can appear in multiple lanes.
 */

export type Lane = 'TOP' | 'JG' | 'MID' | 'BOT' | 'SUP';

// Map of champion DDragon ID → array of lanes
const CHAMPION_LANES: Record<string, Lane[]> = {
  // A
  Aatrox: ['TOP'],
  Ahri: ['MID'],
  Akali: ['MID'],
  Akshan: ['MID'],
  Alistar: ['SUP'],
  Ambessa: ['TOP', 'JG'],
  Amumu: ['JG'],
  Anivia: ['MID'],
  Annie: ['MID'],
  Aphelios: ['BOT'],
  Ashe: ['BOT', 'SUP'],
  AurelionSol: ['MID'],
  Aurora: ['TOP', 'MID'],
  Azir: ['MID'],

  // B
  Bard: ['SUP'],
  Belveth: ['JG'],
  Blitzcrank: ['SUP'],
  Brand: ['SUP'],
  Braum: ['SUP'],
  Briar: ['JG'],

  // C
  Caitlyn: ['BOT'],
  Camille: ['TOP'],
  Cassiopeia: ['TOP', 'MID'],
  Chogath: ['TOP'],
  Corki: ['MID'],

  // D
  Darius: ['TOP'],
  Diana: ['JG', 'MID'],
  Draven: ['BOT'],
  DrMundo: ['TOP'],

  // E
  Ekko: ['JG', 'MID'],
  Elise: ['JG', 'SUP'],
  Evelynn: ['JG'],
  Ezreal: ['BOT'],

  // F
  Fiddlesticks: ['JG'],
  Fiora: ['TOP'],
  Fizz: ['MID', 'JG'],

  // G
  Galio: ['MID'],
  Gangplank: ['TOP'],
  Garen: ['TOP'],
  Gnar: ['TOP'],
  Gragas: ['TOP', 'JG'],
  Graves: ['JG'],
  Gwen: ['JG'],

  // H
  Hecarim: ['JG'],
  Heimerdinger: ['TOP', 'MID'],
  Hwei: ['MID', 'SUP'],

  // I
  Illaoi: ['TOP'],
  Irelia: ['TOP'],
  Ivern: ['JG'],

  // J
  Janna: ['SUP'],
  JarvanIV: ['JG'],
  Jax: ['TOP', 'JG'],
  Jayce: ['TOP', 'JG'],
  Jhin: ['BOT'],
  Jinx: ['BOT'],

  // K
  Kaisa: ['BOT'],
  Kalista: ['BOT'],
  Karma: ['MID', 'SUP'],
  Karthus: ['JG'],
  Kassadin: ['MID'],
  Katarina: ['MID'],
  Kayle: ['TOP'],
  Kayn: ['JG'],
  Kennen: ['TOP'],
  Khazix: ['JG'],
  Kindred: ['JG'],
  Kled: ['TOP'],
  KogMaw: ['BOT'],
  KSante: ['TOP'],

  // L
  Leblanc: ['MID'],
  LeeSin: ['JG'],
  Leona: ['SUP'],
  Lillia: ['JG'],
  Lissandra: ['MID'],
  Lucian: ['MID', 'BOT'],
  Lulu: ['SUP'],
  Lux: ['MID', 'SUP'],

  // M
  Malphite: ['TOP'],
  Malzahar: ['MID'],
  Maokai: ['SUP'],
  MasterYi: ['JG'],
  Mel: ['MID'],
  Milio: ['SUP'],
  MissFortune: ['BOT'],
  MonkeyKing: ['JG'],
  Mordekaiser: ['TOP'],
  Morgana: ['JG', 'SUP'],

  // N
  Naafiri: ['MID', 'JG'],
  Nami: ['SUP'],
  Nasus: ['TOP'],
  Nautilus: ['SUP'],
  Neeko: ['MID'],
  Nidalee: ['JG'],
  Nilah: ['BOT'],
  Nocturne: ['JG'],
  Nunu: ['JG'],

  // O
  Olaf: ['TOP'],
  Orianna: ['MID'],
  Ornn: ['TOP'],

  // P
  Pantheon: ['TOP', 'JG', 'MID', 'SUP'],
  Poppy: ['TOP', 'JG', 'SUP'],
  Pyke: ['SUP'],

  // Q
  Qiyana: ['MID'],
  Quinn: ['TOP'],

  // R
  Rakan: ['SUP'],
  Rammus: ['JG'],
  RekSai: ['JG'],
  Rell: ['SUP'],
  Renata: ['SUP'],
  Renekton: ['TOP'],
  Rengar: ['JG'],
  Riven: ['TOP'],
  Rumble: ['TOP'],
  Ryze: ['TOP', 'MID'],

  // S
  Samira: ['BOT'],
  Sejuani: ['JG'],
  Senna: ['SUP'],
  Seraphine: ['MID', 'BOT', 'SUP'],
  Sett: ['TOP'],
  Shaco: ['JG', 'SUP'],
  Shen: ['TOP'],
  Shyvana: ['JG'],
  Singed: ['TOP'],
  Sion: ['TOP'],
  Sivir: ['BOT'],
  Skarner: ['JG'],
  Smolder: ['BOT', 'MID'],
  Sona: ['SUP'],
  Soraka: ['SUP'],
  Swain: ['MID', 'BOT', 'SUP'],
  Sylas: ['MID'],
  Syndra: ['MID'],

  // T
  TahmKench: ['TOP'],
  Taliyah: ['JG', 'MID'],
  Talon: ['MID'],
  Taric: ['SUP'],
  Teemo: ['TOP'],
  Thresh: ['SUP'],
  Tristana: ['MID', 'BOT'],
  Trundle: ['TOP', 'JG'],
  Tryndamere: ['TOP'],
  TwistedFate: ['MID'],
  Twitch: ['BOT'],

  // U
  Udyr: ['JG'],
  Urgot: ['TOP'],

  // V
  Varus: ['TOP', 'BOT'],
  Vayne: ['TOP', 'BOT'],
  Veigar: ['MID'],
  Velkoz: ['MID', 'SUP'],
  Vex: ['MID'],
  Vi: ['JG'],
  Viego: ['JG'],
  Viktor: ['MID'],
  Vladimir: ['TOP', 'MID'],
  Volibear: ['TOP', 'JG'],

  // W
  Warwick: ['JG'],

  // X
  Xayah: ['BOT'],
  Xerath: ['MID', 'SUP'],
  XinZhao: ['JG'],

  // Y
  Yasuo: ['TOP', 'MID'],
  Yone: ['TOP', 'MID'],
  Yorick: ['TOP'],
  Yuumi: ['SUP'],

  // Z
  Zaahen: ['TOP'],
  Zac: ['JG'],
  Zed: ['MID', 'JG'],
  Zeri: ['BOT'],
  Ziggs: ['MID', 'BOT'],
  Zilean: ['SUP'],
  Zoe: ['MID'],
  Zyra: ['SUP'],
};

/**
 * Get the lanes for a champion by DDragon ID.
 * Returns ['TOP','JG','MID','BOT','SUP'] (all) if champion is not in the mapping.
 */
export function getChampionLanes(championId: string): Lane[] {
  return CHAMPION_LANES[championId] ?? ['TOP', 'JG', 'MID', 'BOT', 'SUP'];
}

/**
 * Check if a champion can play in the given lane.
 */
export function championMatchesLane(championId: string, lane: Lane): boolean {
  const lanes = CHAMPION_LANES[championId];
  if (!lanes) return true; // unknown champion: show in all lanes
  return lanes.includes(lane);
}

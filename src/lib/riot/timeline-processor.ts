import type {
  MatchDto,
  MatchTimelineDto,
  PlayerSnapshot,
  ProcessedFrame,
  SkillKey,
} from '@/types/riot-api';

const SKILL_SLOT_MAP: Record<number, SkillKey> = { 1: 'Q', 2: 'W', 3: 'E', 4: 'R' };

/** Remove the first occurrence of an item from a participant's inventory */
function removeItem(inventory: number[], itemId: number): void {
  const idx = inventory.indexOf(itemId);
  if (idx !== -1) inventory.splice(idx, 1);
}

export function processTimeline(
  timeline: MatchTimelineDto,
  match: MatchDto,
): ProcessedFrame[] {
  const participants = match.info.participants;

  // Build participantId → championName map
  const championMap = new Map<number, string>();
  for (const p of participants) {
    championMap.set(p.participantId, p.championName);
  }

  // Derive participant IDs from match data instead of hardcoding 1-10
  const participantIds = participants.map(p => p.participantId);

  // Running state per participant
  const inventories = new Map<number, number[]>();
  const kda = new Map<number, { kills: number; deaths: number; assists: number }>();
  const skillRanks = new Map<number, Record<SkillKey, number>>();

  for (const pid of participantIds) {
    inventories.set(pid, []);
    kda.set(pid, { kills: 0, deaths: 0, assists: 0 });
    skillRanks.set(pid, { Q: 0, W: 0, E: 0, R: 0 });
  }

  const frames: ProcessedFrame[] = [];

  for (const frame of timeline.info.frames) {
    // Process events in order
    for (const event of frame.events) {
      const pid = event.participantId;

      switch (event.type) {
        case 'ITEM_PURCHASED':
          if (pid && event.itemId && event.itemId !== 0) {
            inventories.get(pid)?.push(event.itemId);
          }
          break;

        case 'ITEM_SOLD':
        case 'ITEM_DESTROYED':
          if (pid && event.itemId) {
            const inv = inventories.get(pid);
            if (inv) removeItem(inv, event.itemId);
          }
          break;

        case 'ITEM_UNDO':
          if (pid) {
            const inv = inventories.get(pid);
            if (inv) {
              // Remove the item that was purchased (beforeId)
              if (event.beforeId && event.beforeId !== 0) {
                removeItem(inv, event.beforeId);
              }
              // Restore the item that was there before (afterId)
              if (event.afterId && event.afterId !== 0) {
                inv.push(event.afterId);
              }
            }
          }
          break;

        case 'SKILL_LEVEL_UP':
          if (pid && event.skillSlot) {
            const key = SKILL_SLOT_MAP[event.skillSlot];
            const ranks = skillRanks.get(pid);
            if (key && ranks) {
              ranks[key]++;
            }
          }
          break;

        case 'CHAMPION_KILL': {
          const killerId = event.killerId;
          const victimId = event.victimId;
          if (killerId && killerId > 0) {
            const k = kda.get(killerId);
            if (k) k.kills++;
          }
          if (victimId) {
            const v = kda.get(victimId);
            if (v) v.deaths++;
          }
          if (event.assistingParticipantIds) {
            for (const aid of event.assistingParticipantIds) {
              const a = kda.get(aid);
              if (a) a.assists++;
            }
          }
          break;
        }
      }
    }

    // Snapshot current state
    const minute = Math.round(frame.timestamp / 60000);
    const participantSnapshots: Record<number, PlayerSnapshot> = {};

    for (const pid of participantIds) {
      const pFrame = frame.participantFrames[String(pid)];
      const pidKda = kda.get(pid)!;
      participantSnapshots[pid] = {
        participantId: pid,
        championName: championMap.get(pid) ?? '',
        level: pFrame?.level ?? 1,
        items: [...(inventories.get(pid) ?? [])],
        totalGold: pFrame?.totalGold ?? 0,
        kills: pidKda.kills,
        deaths: pidKda.deaths,
        assists: pidKda.assists,
        skillRanks: { ...skillRanks.get(pid)! },
      };
    }

    frames.push({ minute, participants: participantSnapshots });
  }

  return frames;
}

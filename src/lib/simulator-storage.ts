import type { SelectedRunes } from '@/types';

const SIMULATOR_STATE_KEY = 'lol-sim-state:v1';
const SAVED_BUILDS_KEY = 'lol-saved-builds:v1';
const LOAD_BUILD_KEY = 'lol-load-build:v1';

// Migrate old unversioned keys to v1
function migrateStorage() {
  const OLD_KEYS = [
    ['lol-sim-state', SIMULATOR_STATE_KEY],
    ['lol-saved-builds', SAVED_BUILDS_KEY],
    ['lol-load-build', LOAD_BUILD_KEY],
  ] as const;
  try {
    for (const [oldKey, newKey] of OLD_KEYS) {
      const data = localStorage.getItem(oldKey);
      if (data && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, data);
        localStorage.removeItem(oldKey);
      }
    }
  } catch {}
}

// Run migration on module load (client-side only)
if (typeof window !== 'undefined') {
  migrateStorage();
}
const MAX_SAVED_BUILDS = 10;

/** Serializable simulator side state */
export interface SideState {
  championId: string | null;
  level: number;
  items: (string | null)[];
  runes: SelectedRunes;
  skillRanks: Record<string, number>;
}

export interface SimulatorPersistedState {
  ally: SideState;
  enemy: SideState;
}

export interface StoredBuild {
  id: string;
  name: string;
  championId: string;
  level: number;
  items: (string | null)[];
  runes: SelectedRunes;
  savedAt: number;
}

/** Instruction to load a build into a specific side on the simulator */
export interface LoadBuildInstruction {
  side: 'ally' | 'enemy';
  championId: string;
  level: number;
  items: (string | null)[];
  runes: SelectedRunes;
}

// ===== Simulator State =====

export function saveSimulatorState(state: SimulatorPersistedState): void {
  try {
    localStorage.setItem(SIMULATOR_STATE_KEY, JSON.stringify(state));
  } catch {}
}

export function loadSimulatorState(): SimulatorPersistedState | null {
  try {
    const raw = localStorage.getItem(SIMULATOR_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSimulatorState(): void {
  try {
    localStorage.removeItem(SIMULATOR_STATE_KEY);
  } catch {}
}

// ===== Build Loading (cross-page communication) =====

export function setLoadBuildInstruction(instruction: LoadBuildInstruction): void {
  try {
    localStorage.setItem(LOAD_BUILD_KEY, JSON.stringify(instruction));
  } catch {}
}

export function consumeLoadBuildInstruction(): LoadBuildInstruction | null {
  try {
    const raw = localStorage.getItem(LOAD_BUILD_KEY);
    if (!raw) return null;
    localStorage.removeItem(LOAD_BUILD_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ===== Saved Builds =====

export function getSavedBuilds(): StoredBuild[] {
  try {
    const raw = localStorage.getItem(SAVED_BUILDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBuild(build: Omit<StoredBuild, 'id' | 'savedAt'>): StoredBuild[] {
  const builds = getSavedBuilds();
  const newBuild: StoredBuild = {
    ...build,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    savedAt: Date.now(),
  };
  builds.unshift(newBuild);
  // Keep max 10
  const trimmed = builds.slice(0, MAX_SAVED_BUILDS);
  try {
    localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(trimmed));
  } catch {}
  return trimmed;
}

export function deleteSavedBuild(id: string): StoredBuild[] {
  const builds = getSavedBuilds().filter((b) => b.id !== id);
  try {
    localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(builds));
  } catch {}
  return builds;
}

import { KumonLevel, type GameSettings, type PlayerProgress } from '@/types/game-types';

const KEYS = {
  progress: 'mathgame_progress',
  achievements: 'mathgame_achievements',
  settings: 'mathgame_settings',
};

const DEFAULT_PROGRESS: PlayerProgress = {
  currentLevel: KumonLevel.LEVEL_7A,
  levelData: {},
  totalStars: 0,
  streakDays: 0,
  lastPlayedDate: '',
  sessionsPlayed: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  muted: false,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn('localStorage write failed');
  }
}

export function loadProgress(): PlayerProgress {
  return safeGet(KEYS.progress, DEFAULT_PROGRESS);
}

export function saveProgress(progress: PlayerProgress): void {
  safeSet(KEYS.progress, progress);
}

export function loadAchievements(): string[] {
  return safeGet<string[]>(KEYS.achievements, []);
}

export function saveAchievements(ids: string[]): void {
  safeSet(KEYS.achievements, ids);
}

export function loadSettings(): GameSettings {
  return safeGet(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: GameSettings): void {
  safeSet(KEYS.settings, settings);
}

export function clearAll(): void {
  try {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

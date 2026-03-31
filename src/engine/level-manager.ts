import { KumonLevel, ActivityType, type LevelProgress, type PlayerProgress } from '@/types/game-types';
import { LEVEL_DEFINITIONS, getLevelDefinition } from '@/data/levels';
import { loadProgress, saveProgress } from '@/utils/storage';

const LEVEL_ORDER: KumonLevel[] = [
  KumonLevel.LEVEL_7A,
  KumonLevel.LEVEL_6A,
  KumonLevel.LEVEL_5A,
  KumonLevel.LEVEL_4A,
  KumonLevel.LEVEL_3A,
  KumonLevel.LEVEL_2A,
];

function getLevelData(progress: PlayerProgress, level: KumonLevel): LevelProgress {
  return progress.levelData[level as string] ?? {
    currentTier: 1, sessionsCompleted: 0, recentAccuracies: [],
    bestAccuracy: 0, totalStars: 0, mastered: false,
  };
}

export class LevelManager {
  isLevelUnlocked(level: KumonLevel): boolean {
    if (level === KumonLevel.LEVEL_7A) return true;
    const def = getLevelDefinition(level);
    if (!def.prerequisite) return true;
    const progress = loadProgress();
    return getLevelData(progress, def.prerequisite).mastered === true;
  }

  checkMastery(level: KumonLevel): boolean {
    const progress = loadProgress();
    const data = getLevelData(progress, level);
    const recent = data.recentAccuracies.slice(-5);
    if (recent.length < 5) return false;
    const avg = recent.reduce((s, a) => s + a, 0) / recent.length;
    return avg >= 95;
  }

  getCurrentTier(level: KumonLevel): number {
    const progress = loadProgress();
    return getLevelData(progress, level).currentTier ?? 1;
  }

  advanceTier(level: KumonLevel): { tieredUp: boolean; leveledUp: boolean } {
    if (!this.checkMastery(level)) return { tieredUp: false, leveledUp: false };

    const progress = loadProgress();
    const levelKey = level as string;
    if (!progress.levelData[levelKey]) {
      progress.levelData[levelKey] = {
        currentTier: 1, sessionsCompleted: 0, recentAccuracies: [],
        bestAccuracy: 0, totalStars: 0, mastered: false,
      };
    }

    const data = progress.levelData[levelKey];
    const def = getLevelDefinition(level);
    const maxTier = def.tiers.length;

    if (data.currentTier >= maxTier) {
      data.mastered = true;
      saveProgress(progress);
      return { tieredUp: false, leveledUp: true };
    }

    data.currentTier += 1;
    data.recentAccuracies = []; // reset for new tier
    saveProgress(progress);
    return { tieredUp: true, leveledUp: false };
  }

  getAvailableActivities(level: KumonLevel): ActivityType[] {
    return getLevelDefinition(level).activities;
  }

  getRecommendedActivity(level: KumonLevel): ActivityType {
    const activities = this.getAvailableActivities(level);
    const progress = loadProgress();
    const data = getLevelData(progress, level);

    if (!data.recentAccuracies.length) return activities[0];

    // Pick the activity with the lowest recent accuracy
    // Since we track per-level not per-activity, return first activity as default
    // or shuffle to add variety when no per-activity data is available
    return activities[0];
  }

  getNextLevel(current: KumonLevel): KumonLevel | null {
    const idx = LEVEL_ORDER.indexOf(current);
    if (idx === -1 || idx === LEVEL_ORDER.length - 1) return null;
    return LEVEL_ORDER[idx + 1];
  }

  getUnlockedLevels(): KumonLevel[] {
    return LEVEL_ORDER.filter(l => this.isLevelUnlocked(l));
  }
}

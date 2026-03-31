import { KumonLevel, ActivityType, type QuestionResult, type SessionSummary, type PlayerProgress, type LevelProgress } from '@/types/game-types';
import { getLevelDefinition } from '@/data/levels';
import { ACHIEVEMENT_DEFINITIONS } from '@/data/achievements';
import { loadProgress, saveProgress, loadAchievements, saveAchievements } from '@/utils/storage';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultLevelProgress(): LevelProgress {
  return { currentTier: 1, sessionsCompleted: 0, recentAccuracies: [], bestAccuracy: 0, totalStars: 0, mastered: false };
}

export class ProgressTracker {
  getProgress(): PlayerProgress {
    return loadProgress();
  }

  getTotalStars(): number {
    return loadProgress().totalStars;
  }

  calculateStars(accuracy: number, avgTimeMs: number, targetTimeMs: number): number {
    if (accuracy < 80) return 0;
    if (accuracy < 90) return 1;
    if (accuracy < 95) return 2;
    return avgTimeMs <= targetTimeMs * 1000 ? 3 : 2;
  }

  updateStreak(progress: PlayerProgress): void {
    const today = todayString();
    if (!progress.lastPlayedDate) {
      progress.streakDays = 1;
    } else if (progress.lastPlayedDate === today) {
      // same day - no change
    } else {
      const last = new Date(progress.lastPlayedDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
      progress.streakDays = diffDays === 1 ? progress.streakDays + 1 : 1;
    }
    progress.lastPlayedDate = today;
  }

  recordSession(
    level: KumonLevel,
    activityType: ActivityType,
    results: QuestionResult[]
  ): SessionSummary {
    const progress = loadProgress();
    const levelKey = level as string;

    if (!progress.levelData[levelKey]) {
      progress.levelData[levelKey] = defaultLevelProgress();
    }

    const levelProgress = progress.levelData[levelKey];
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const avgTimeMs = totalQuestions > 0 ? results.reduce((s, r) => s + r.timeMs, 0) / totalQuestions : 0;
    const targetTime = getLevelDefinition(level).targetTimePerQuestion;
    const starsEarned = this.calculateStars(accuracy, avgTimeMs, targetTime);

    const summary: SessionSummary = {
      level, activityType, totalQuestions, correctCount,
      accuracy, avgTimeMs, starsEarned, timestamp: Date.now(),
    };

    levelProgress.sessionsCompleted += 1;
    levelProgress.recentAccuracies = [...levelProgress.recentAccuracies, accuracy].slice(-10);
    if (accuracy > levelProgress.bestAccuracy) levelProgress.bestAccuracy = accuracy;
    levelProgress.totalStars += starsEarned;

    progress.totalStars += starsEarned;
    progress.sessionsPlayed += 1;
    this.updateStreak(progress);
    saveProgress(progress);

    return summary;
  }

  checkNewAchievements(summary: SessionSummary): string[] {
    const progress = loadProgress();
    const unlocked = new Set(loadAchievements());
    const newlyUnlocked: string[] = [];

    for (const ach of ACHIEVEMENT_DEFINITIONS) {
      if (unlocked.has(ach.id)) continue;
      if (this.meetsRequirement(ach.id, ach.requirement.type, ach.requirement.value, progress, summary)) {
        newlyUnlocked.push(ach.id);
        unlocked.add(ach.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      saveAchievements([...unlocked]);
    }
    return newlyUnlocked;
  }

  private meetsRequirement(
    id: string,
    type: string,
    value: number | string,
    progress: PlayerProgress,
    summary: SessionSummary
  ): boolean {
    switch (type) {
      case 'first_correct':
        return summary.correctCount >= 1;
      case 'level_complete':
        return progress.levelData[value as string]?.mastered === true;
      case 'perfect_score':
        return summary.accuracy === 100;
      case 'streak':
        return progress.streakDays >= (value as number);
      case 'stars':
        return progress.totalStars >= (value as number);
      case 'sessions':
        if (id === 'speed_star') {
          const targetMs = 10 * 1000;
          return summary.accuracy >= 95 && summary.avgTimeMs <= targetMs;
        }
        return progress.sessionsPlayed >= (value as number);
      default:
        return false;
    }
  }
}

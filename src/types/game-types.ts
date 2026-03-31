export enum KumonLevel {
  LEVEL_7A = '7A',
  LEVEL_6A = '6A',
  LEVEL_5A = '5A',
  LEVEL_4A = '4A',
  LEVEL_3A = '3A',
  LEVEL_2A = '2A',
}

export enum ActivityType {
  COUNTING = 'counting',
  NUMBER_RECOGNITION = 'number_recognition',
  SEQUENCING = 'sequencing',
  COMPARISON = 'comparison',
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  PATTERN = 'pattern',
}

export enum CharacterName {
  OWL = 'owl',
  BEAR = 'bear',
  CAT = 'cat',
  RABBIT = 'rabbit',
  FOX = 'fox',
}

export enum CharacterExpression {
  HAPPY = 'happy',
  THINKING = 'thinking',
  CELEBRATING = 'celebrating',
  ENCOURAGING = 'encouraging',
  SURPRISED = 'surprised',
}

export interface Question {
  id: string;
  level: KumonLevel;
  activityType: ActivityType;
  prompt: string;
  visualData: VisualData;
  options: AnswerOption[];
  correctAnswerIndex: number;
}

export interface VisualData {
  type: 'objects' | 'number' | 'sequence' | 'comparison' | 'addition' | 'pattern';
  objects?: { icon: string; count: number }[];
  numbers?: number[];
  blanks?: number[];
  leftGroup?: number;
  rightGroup?: number;
  addend1?: number;
  addend2?: number;
  subtraction?: number;
  patternSequence?: (string | null)[];
}

export interface AnswerOption {
  value: number | string;
  display: string;
}

export interface QuestionResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeMs: number;
  starsEarned: number;
}

export interface SessionSummary {
  level: KumonLevel;
  activityType: ActivityType;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  avgTimeMs: number;
  starsEarned: number;
  timestamp: number;
}

export interface PlayerProgress {
  currentLevel: KumonLevel;
  levelData: Record<string, LevelProgress>;
  totalStars: number;
  streakDays: number;
  lastPlayedDate: string;
  sessionsPlayed: number;
}

export interface LevelProgress {
  currentTier: number;
  sessionsCompleted: number;
  recentAccuracies: number[];
  bestAccuracy: number;
  totalStars: number;
  mastered: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: AchievementRequirement;
}

export interface AchievementRequirement {
  type: 'level_complete' | 'perfect_score' | 'streak' | 'stars' | 'sessions' | 'first_correct';
  value: number | string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface QuizSceneData {
  level: KumonLevel;
  activityType: ActivityType;
  tier: number;
}

export interface ResultsSceneData {
  summary: SessionSummary;
  level: KumonLevel;
  activityType: ActivityType;
  tier: number;
  newAchievements?: Achievement[];
  levelUp?: KumonLevel;
}

export interface RewardsSceneData {
  newAchievements: Achievement[];
  levelUp?: KumonLevel;
  previousLevel?: KumonLevel;
}

export interface LevelDefinition {
  level: KumonLevel;
  name: string;
  description: string;
  prerequisite: KumonLevel | null;
  activities: ActivityType[];
  questionsPerSession: number;
  targetTimePerQuestion: number;
  numberRange: { min: number; max: number };
  tiers: TierDefinition[];
}

export interface TierDefinition {
  tier: number;
  name: string;
  description: string;
  numberRange: { min: number; max: number };
  optionCount: number;
  showVisualAids: boolean;
}

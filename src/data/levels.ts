import { KumonLevel, ActivityType, type LevelDefinition } from '@/types/game-types';

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    level: KumonLevel.LEVEL_7A,
    name: 'Level 7A',
    description: 'Count objects from 1 to 10',
    prerequisite: null,
    activities: [ActivityType.COUNTING, ActivityType.NUMBER_RECOGNITION],
    questionsPerSession: 10,
    targetTimePerQuestion: 15,
    numberRange: { min: 1, max: 10 },
    tiers: [
      { tier: 1, name: 'Intro', description: 'Count 1-5 with help', numberRange: { min: 1, max: 5 }, optionCount: 3, showVisualAids: true },
      { tier: 2, name: 'Practice', description: 'Count 1-10', numberRange: { min: 1, max: 10 }, optionCount: 4, showVisualAids: true },
      { tier: 3, name: 'Mastery', description: 'Count 5-10 fast', numberRange: { min: 5, max: 10 }, optionCount: 4, showVisualAids: false },
    ],
  },
  {
    level: KumonLevel.LEVEL_6A,
    name: 'Level 6A',
    description: 'Count objects from 1 to 30',
    prerequisite: KumonLevel.LEVEL_7A,
    activities: [ActivityType.COUNTING, ActivityType.NUMBER_RECOGNITION],
    questionsPerSession: 10,
    targetTimePerQuestion: 15,
    numberRange: { min: 1, max: 30 },
    tiers: [
      { tier: 1, name: 'Intro', description: 'Count 1-15', numberRange: { min: 1, max: 15 }, optionCount: 3, showVisualAids: true },
      { tier: 2, name: 'Practice', description: 'Count 1-30', numberRange: { min: 1, max: 30 }, optionCount: 4, showVisualAids: true },
      { tier: 3, name: 'Mastery', description: 'Count 10-30 fast', numberRange: { min: 10, max: 30 }, optionCount: 4, showVisualAids: false },
    ],
  },
  {
    level: KumonLevel.LEVEL_5A,
    name: 'Level 5A',
    description: 'Number sequences up to 50',
    prerequisite: KumonLevel.LEVEL_6A,
    activities: [ActivityType.SEQUENCING, ActivityType.NUMBER_RECOGNITION],
    questionsPerSession: 12,
    targetTimePerQuestion: 12,
    numberRange: { min: 1, max: 50 },
    tiers: [
      { tier: 1, name: 'Intro', description: 'Sequences 1-20', numberRange: { min: 1, max: 20 }, optionCount: 3, showVisualAids: true },
      { tier: 2, name: 'Practice', description: 'Sequences 1-50', numberRange: { min: 1, max: 50 }, optionCount: 4, showVisualAids: true },
      { tier: 3, name: 'Mastery', description: 'Sequences 10-50', numberRange: { min: 10, max: 50 }, optionCount: 4, showVisualAids: false },
    ],
  },
  {
    level: KumonLevel.LEVEL_4A,
    name: 'Level 4A',
    description: 'Patterns and numbers up to 120',
    prerequisite: KumonLevel.LEVEL_5A,
    activities: [ActivityType.SEQUENCING, ActivityType.COMPARISON, ActivityType.PATTERN],
    questionsPerSession: 12,
    targetTimePerQuestion: 12,
    numberRange: { min: 1, max: 120 },
    tiers: [
      { tier: 1, name: 'Intro', description: 'Patterns with help', numberRange: { min: 1, max: 50 }, optionCount: 3, showVisualAids: true },
      { tier: 2, name: 'Practice', description: 'Numbers to 120', numberRange: { min: 1, max: 120 }, optionCount: 4, showVisualAids: true },
      { tier: 3, name: 'Mastery', description: 'Advanced patterns', numberRange: { min: 20, max: 120 }, optionCount: 4, showVisualAids: false },
    ],
  },
  {
    level: KumonLevel.LEVEL_3A,
    name: 'Level 3A',
    description: 'Addition from +1 to +5',
    prerequisite: KumonLevel.LEVEL_4A,
    activities: [ActivityType.ADDITION, ActivityType.COMPARISON],
    questionsPerSession: 15,
    targetTimePerQuestion: 10,
    numberRange: { min: 1, max: 10 },
    tiers: [
      { tier: 1, name: 'Intro', description: 'Add +1 and +2', numberRange: { min: 1, max: 5 }, optionCount: 3, showVisualAids: true },
      { tier: 2, name: 'Practice', description: 'Add +1 to +5', numberRange: { min: 1, max: 10 }, optionCount: 4, showVisualAids: true },
      { tier: 3, name: 'Mastery', description: 'Fast addition', numberRange: { min: 1, max: 10 }, optionCount: 4, showVisualAids: false },
    ],
  },
  {
    level: KumonLevel.LEVEL_2A,
    name: 'Level 2A',
    description: 'Addition to +10 and subtraction',
    prerequisite: KumonLevel.LEVEL_3A,
    activities: [ActivityType.ADDITION, ActivityType.SUBTRACTION],
    questionsPerSession: 15,
    targetTimePerQuestion: 10,
    numberRange: { min: 1, max: 20 },
    tiers: [
      { tier: 1, name: 'Intro', description: 'Add +6 to +10', numberRange: { min: 1, max: 10 }, optionCount: 3, showVisualAids: true },
      { tier: 2, name: 'Practice', description: 'Mixed addition', numberRange: { min: 1, max: 20 }, optionCount: 4, showVisualAids: true },
      { tier: 3, name: 'Mastery', description: 'Fast mixed', numberRange: { min: 1, max: 20 }, optionCount: 4, showVisualAids: false },
    ],
  },
];

export function getLevelDefinition(level: KumonLevel): LevelDefinition {
  return LEVEL_DEFINITIONS.find(l => l.level === level)!;
}

export const VISUAL_OBJECTS = ['butterfly', 'bird', 'mushroom', 'acorn', 'flower', 'firefly', 'frog', 'squirrel', 'ladybug', 'berry', 'pinecone', 'leaf'];

export const OBJECT_EMOJIS: Record<string, string> = {
  butterfly: '\uD83E\uDD8B', bird: '\uD83D\uDC26', mushroom: '\uD83C\uDF44',
  acorn: '\uD83C\uDF30', flower: '\uD83C\uDF3C', firefly: '\u2728',
  frog: '\uD83D\uDC38', squirrel: '\uD83D\uDC3F\uFE0F', ladybug: '\uD83D\uDC1E',
  berry: '\uD83C\uDF53', pinecone: '\uD83C\uDF32', leaf: '\uD83C\uDF43',
};

export const PATTERN_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'];
export const PATTERN_COLORS = [0xFF6B6B, 0x7EC8E3, 0x90D26D, 0xFFB347, 0xDDA0DD];

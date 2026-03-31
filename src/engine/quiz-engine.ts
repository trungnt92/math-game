import { KumonLevel, ActivityType, type Question, type AnswerOption } from '@/types/game-types';
import { getLevelDefinition, VISUAL_OBJECTS, OBJECT_EMOJIS, PATTERN_SHAPES } from '@/data/levels';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function plural(word: string): string {
  if (word.endsWith('y') && !word.endsWith('ey')) return word.slice(0, -1) + 'ies';
  if (word.endsWith('f')) return word.slice(0, -1) + 'ves';
  if (word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x')) return word + 'es';
  return word + 's';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeOptions(correct: number, count: number, min: number): AnswerOption[] {
  const set = new Set<number>([correct]);
  let delta = 1;
  while (set.size < count) {
    if (correct - delta >= Math.max(0, min)) set.add(correct - delta);
    if (set.size < count) set.add(correct + delta);
    delta++;
  }
  return shuffle([...set]).map(v => ({ value: v, display: String(v) }));
}

export class QuizEngine {
  generateSession(level: KumonLevel, activityType: ActivityType, tier: number): Question[] {
    const def = getLevelDefinition(level);
    const tierDef = def.tiers.find(t => t.tier === tier) ?? def.tiers[0];
    const total = def.questionsPerSession;
    const { min, max } = tierDef.numberRange;
    const optionCount = tierDef.optionCount;
    const ts = Date.now();

    return Array.from({ length: total }, (_, i) => {
      const difficulty = i < total * 0.3 ? 'easy' : i < total * 0.7 ? 'medium' : 'hard';
      const range = this.difficultyRange(min, max, difficulty);
      const id = `q-${ts}-${i}`;
      return this.buildQuestion(id, level, activityType, range.min, range.max, optionCount, i);
    });
  }

  private difficultyRange(min: number, max: number, difficulty: string): { min: number; max: number } {
    const span = max - min;
    if (difficulty === 'easy') return { min, max: min + Math.floor(span * 0.4) };
    if (difficulty === 'medium') return { min: min + Math.floor(span * 0.2), max: min + Math.floor(span * 0.7) };
    return { min: min + Math.floor(span * 0.5), max };
  }

  private buildQuestion(
    id: string, level: KumonLevel, activityType: ActivityType,
    min: number, max: number, optionCount: number, _index: number
  ): Question {
    switch (activityType) {
      case ActivityType.COUNTING: return this.counting(id, level, min, max, optionCount);
      case ActivityType.NUMBER_RECOGNITION: return this.numberRecognition(id, level, min, max, optionCount);
      case ActivityType.SEQUENCING: return this.sequencing(id, level, min, max, optionCount);
      case ActivityType.COMPARISON: return this.comparison(id, level, min, max, optionCount);
      case ActivityType.ADDITION: return this.addition(id, level, min, max, optionCount);
      case ActivityType.SUBTRACTION: return this.subtraction(id, level, min, max, optionCount);
      case ActivityType.PATTERN: return this.pattern(id, level, optionCount);
    }
  }

  private counting(id: string, level: KumonLevel, min: number, max: number, optionCount: number): Question {
    const count = randInt(min, max);
    const objType = VISUAL_OBJECTS[randInt(0, VISUAL_OBJECTS.length - 1)];
    const icon = OBJECT_EMOJIS[objType] ?? objType;
    const options = makeOptions(count, optionCount, 1);
    return {
      id, level, activityType: ActivityType.COUNTING,
      prompt: `How many ${plural(objType)}?`,
      visualData: { type: 'objects', objects: [{ icon, count }] },
      options,
      correctAnswerIndex: options.findIndex(o => o.value === count),
    };
  }

  private numberRecognition(id: string, level: KumonLevel, min: number, max: number, optionCount: number): Question {
    const n = randInt(min, max);
    const showNumber = Math.random() < 0.5;
    if (showNumber) {
      const options = makeOptions(n, optionCount, 1);
      return {
        id, level, activityType: ActivityType.NUMBER_RECOGNITION,
        prompt: 'Which number is this?',
        visualData: { type: 'number', numbers: [n] },
        options,
        correctAnswerIndex: options.findIndex(o => o.value === n),
      };
    }
    const icon = OBJECT_EMOJIS[VISUAL_OBJECTS[randInt(0, VISUAL_OBJECTS.length - 1)]];
    const options = makeOptions(n, optionCount, 1);
    return {
      id, level, activityType: ActivityType.NUMBER_RECOGNITION,
      prompt: `Find ${n} objects`,
      visualData: { type: 'objects', objects: [{ icon, count: n }] },
      options,
      correctAnswerIndex: options.findIndex(o => o.value === n),
    };
  }

  private sequencing(id: string, level: KumonLevel, min: number, max: number, optionCount: number): Question {
    const start = randInt(min, Math.max(min, max - 4));
    const seq = [start, start + 1, start + 2, start + 3];
    const blankIdx = randInt(1, 2);
    const correct = seq[blankIdx];
    const numbers = seq.map((v, i) => (i === blankIdx ? 0 : v));
    const options = makeOptions(correct, optionCount, min);
    return {
      id, level, activityType: ActivityType.SEQUENCING,
      prompt: 'What number is missing?',
      visualData: { type: 'sequence', numbers, blanks: [blankIdx] },
      options,
      correctAnswerIndex: options.findIndex(o => o.value === correct),
    };
  }

  private comparison(id: string, level: KumonLevel, min: number, max: number, optionCount: number): Question {
    let left = randInt(min, max);
    let right = randInt(min, max);
    while (left === right) right = randInt(min, max);
    const correct = left > right ? 0 : 1;
    const options: AnswerOption[] = [
      { value: 'left', display: String(left) },
      { value: 'right', display: String(right) },
    ];
    return {
      id, level, activityType: ActivityType.COMPARISON,
      prompt: 'Which group has more?',
      visualData: { type: 'comparison', leftGroup: left, rightGroup: right },
      options,
      correctAnswerIndex: correct,
    };
  }

  private addition(id: string, level: KumonLevel, min: number, max: number, optionCount: number): Question {
    const addend2Max = level === KumonLevel.LEVEL_3A ? 5 : 10;
    const a = randInt(min, Math.max(min, max - addend2Max));
    const b = randInt(1, addend2Max);
    const correct = a + b;
    const options = makeOptions(correct, optionCount, 1);
    return {
      id, level, activityType: ActivityType.ADDITION,
      prompt: `${a} + ${b} = ?`,
      visualData: { type: 'addition', addend1: a, addend2: b },
      options,
      correctAnswerIndex: options.findIndex(o => o.value === correct),
    };
  }

  private subtraction(id: string, level: KumonLevel, min: number, max: number, optionCount: number): Question {
    const a = randInt(Math.max(2, min), max);
    const b = randInt(1, a - 1);
    const correct = a - b;
    const options = makeOptions(correct, optionCount, 0);
    return {
      id, level, activityType: ActivityType.SUBTRACTION,
      prompt: `${a} - ${b} = ?`,
      visualData: { type: 'addition', addend1: a, addend2: b, subtraction: 1 },
      options,
      correctAnswerIndex: options.findIndex(o => o.value === correct),
    };
  }

  private pattern(id: string, level: KumonLevel, optionCount: number): Question {
    const shapes = shuffle([...PATTERN_SHAPES]).slice(0, 2);
    const repeatingUnit = [shapes[0], shapes[1]];
    const fullSeq: (string | null)[] = [
      repeatingUnit[0], repeatingUnit[1],
      repeatingUnit[0], repeatingUnit[1],
      null,
    ];
    const correct = repeatingUnit[0];
    const wrongShapes = PATTERN_SHAPES.filter(s => s !== correct);
    const wrongOptions = shuffle(wrongShapes).slice(0, optionCount - 1);
    const allOptions: AnswerOption[] = shuffle([correct, ...wrongOptions]).map(v => ({ value: v, display: v }));
    return {
      id, level, activityType: ActivityType.PATTERN,
      prompt: 'What comes next?',
      visualData: { type: 'pattern', patternSequence: fullSeq },
      options: allOptions,
      correctAnswerIndex: allOptions.findIndex(o => o.value === correct),
    };
  }
}

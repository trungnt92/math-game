import Phaser from 'phaser';
import { Character } from '@/components/character';
import { Button } from '@/components/button';
import { ProgressBar } from '@/components/progress-bar';
import { QuizEngine } from '@/engine/quiz-engine';
import { ProgressTracker } from '@/engine/progress-tracker';
import { LevelManager } from '@/engine/level-manager';
import { relativeX, relativeY, scaleFont } from '@/utils/responsive';
import { renderQuestion } from '@/scenes/quiz-question-renderers';
import { KumonLevel, ActivityType } from '@/types/game-types';
import type { QuizSceneData, Question, QuestionResult, ResultsSceneData, Achievement } from '@/types/game-types';
import { ACHIEVEMENT_DEFINITIONS } from '@/data/achievements';

const FOREST_BGS = ['bg-forest-clearing', 'bg-mushroom-grove', 'bg-forest-river'];

export class QuizScene extends Phaser.Scene {
  private level: KumonLevel = KumonLevel.LEVEL_7A;
  private activityType: ActivityType = ActivityType.COUNTING;
  private tier = 1;
  private questions: Question[] = [];
  private currentIndex = 0;
  private results: QuestionResult[] = [];
  private questionStartTime = 0;
  private answerButtons: Button[] = [];
  private sceneObjects: Phaser.GameObjects.GameObject[] = [];
  private progressBar!: ProgressBar;
  private counterText!: Phaser.GameObjects.Text;
  private owl!: Character;
  private answered = false;
  private bgKey: string = FOREST_BGS[0];

  constructor() { super('QuizScene'); }

  init(data: QuizSceneData): void {
    this.level = data.level ?? KumonLevel.LEVEL_7A;
    this.activityType = data.activityType ?? ActivityType.COUNTING;
    this.tier = data.tier ?? 1;
    this.currentIndex = 0; this.results = []; this.answered = false; this.sceneObjects = [];
    this.bgKey = FOREST_BGS[Phaser.Math.Between(0, FOREST_BGS.length - 1)];
  }

  create(): void {
    const { width, height } = this.cameras.main;

    if (this.textures.exists(this.bgKey)) {
      const bg = this.add.image(width / 2, height / 2, this.bgKey);
      const bigSide = Math.max(width, height) * 2;
      bg.setDisplaySize(bigSide, bigSide);
    } else {
      this.add.rectangle(width / 2, height / 2, width * 3, height * 3, 0x2d5a27);
    }

    this.buildTopBar(width);
    this.owl = new Character(this, relativeX(this, 0.09), relativeY(this, 0.88), 'owl', 'happy', { scale: 0.5 });

    const engine = new QuizEngine();
    this.questions = engine.generateSession(this.level, this.activityType, this.tier);
    this.questionStartTime = Date.now();
    this.showQuestion();
  }

  private buildTopBar(width: number): void {
    const barY = relativeY(this, 0.055);
    const bar = this.add.graphics();
    bar.fillStyle(0x4a3210, 0.85);
    bar.fillRoundedRect(0, 0, width, barY * 2, 0);
    bar.lineStyle(2, 0x8b6914, 0.7);
    bar.lineBetween(0, barY * 2, width, barY * 2);

    this.progressBar = new ProgressBar(this, relativeX(this, 0.38), barY, relativeX(this, 0.3), 14);
    this.counterText = this.add.text(relativeX(this, 0.22), barY, '1/?', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: `${scaleFont(18, this)}px`, color: '#FFF8DC',
    }).setOrigin(0, 0.5);

    new Button(this, relativeX(this, 0.92), barY, 'Quit', () => this.scene.start('ClassroomScene'),
      { color: 'danger', width: 90, height: 38, fontSize: 14 });
  }

  private showQuestion(): void {
    this.clearSceneObjects();
    if (this.currentIndex >= this.questions.length) { this.finishQuiz(); return; }

    const q = this.questions[this.currentIndex];
    this.counterText.setText(`${this.currentIndex + 1}/${this.questions.length}`);
    this.progressBar.setProgress(this.currentIndex / this.questions.length, false);

    renderQuestion(this, q, this.sceneObjects, () => this.buildAnswerButtons());
  }

  private buildAnswerButtons(): void {
    this.clearAnswerButtons();
    if (this.currentIndex >= this.questions.length) return;
    const q = this.questions[this.currentIndex];
    const optCount = q.options.length;
    const btnW = optCount <= 3 ? 180 : 140;
    const gap = 20;
    const startX = this.cameras.main.width / 2 - (optCount * btnW + (optCount - 1) * gap) / 2 + btnW / 2;
    const btnY = relativeY(this, 0.87);

    q.options.forEach((opt, i) => {
      const btn = new Button(this, startX + i * (btnW + gap), btnY, opt.display,
        () => this.handleAnswer(i), { color: 'success', width: btnW, height: 64, fontSize: 26 });
      this.answerButtons.push(btn);
    });
  }

  private clearAnswerButtons(): void {
    this.answerButtons.forEach(b => { if (b?.active) b.destroy(); });
    this.answerButtons = [];
  }

  private clearSceneObjects(): void {
    this.sceneObjects.forEach(o => { if (o && (o as any).active) (o as any).destroy(); });
    this.sceneObjects = [];
  }

  private handleAnswer(selectedIndex: number): void {
    if (this.answered) return;
    this.answered = true;
    this.answerButtons.forEach(b => b.disable());

    const q = this.questions[this.currentIndex];
    const isCorrect = selectedIndex === q.correctAnswerIndex;
    this.results.push({
      questionId: q.id, selectedIndex, isCorrect,
      timeMs: Date.now() - this.questionStartTime, starsEarned: isCorrect ? 1 : 0,
    });

    const next = this.currentIndex + 1;
    this.counterText.setText(`${next}/${this.questions.length}`);
    this.progressBar.setProgress(next / this.questions.length, true);

    if (isCorrect) {
      this.owl.celebrate();
      this.sceneObjects.forEach((o, i) => {
        this.tweens.add({ targets: o, angle: 8, duration: 200, delay: i * 50, ease: 'Sine.easeInOut', yoyo: true, repeat: 1 });
      });
    } else {
      this.owl.setExpression('encouraging');
      const wrongBtn = this.answerButtons[selectedIndex];
      if (wrongBtn) {
        this.tweens.add({ targets: wrongBtn, x: wrongBtn.x + 8, duration: 60, ease: 'Sine.easeInOut', yoyo: true, repeat: 3 });
      }
    }

    this.time.delayedCall(900, () => {
      this.currentIndex++;
      this.answered = false;
      this.clearAnswerButtons();
      if (this.currentIndex < this.questions.length) {
        this.questionStartTime = Date.now();
        this.showQuestion();
      } else {
        this.finishQuiz();
      }
    });
  }

  private finishQuiz(): void {
    this.clearAnswerButtons();
    const tracker = new ProgressTracker();
    const summary = tracker.recordSession(this.level, this.activityType, this.results);
    const ids = tracker.checkNewAchievements(summary);
    const manager = new LevelManager();
    const advance = manager.advanceTier(this.level);
    const newAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.filter(a => ids.includes(a.id));
    const data: ResultsSceneData = { summary, level: this.level, activityType: this.activityType, tier: this.tier };
    if (advance.leveledUp || newAchievements.length > 0) {
      Object.assign(data, {
        newAchievements,
        levelUp: advance.leveledUp ? manager.getNextLevel(this.level) ?? undefined : undefined,
      });
    }
    this.scene.start('ResultsScene', data);
  }

  shutdown(): void {
    this.clearSceneObjects();
    this.clearAnswerButtons();
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

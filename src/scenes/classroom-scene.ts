import Phaser from 'phaser';
import { Character } from '@/components/character';
import { Button } from '@/components/button';
import { relativeX, relativeY, scaleFont } from '@/utils/responsive';
import { loadProgress } from '@/utils/storage';
import { getRandomDialogue } from '@/data/dialogue';
import { LEVEL_DEFINITIONS } from '@/data/levels';
import { LevelManager } from '@/engine/level-manager';
import { KumonLevel } from '@/types/game-types';
import type { QuizSceneData } from '@/types/game-types';
import type { AudioManager } from '@/utils/audio-manager';

const LEVEL_ORDER = [KumonLevel.LEVEL_7A, KumonLevel.LEVEL_6A, KumonLevel.LEVEL_5A, KumonLevel.LEVEL_4A, KumonLevel.LEVEL_3A, KumonLevel.LEVEL_2A];
const TXT_STYLE = { fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif' };

export class ClassroomScene extends Phaser.Scene {
  private levelManager = new LevelManager();
  private overlay: Phaser.GameObjects.Container | null = null;
  private practicePulseTween: Phaser.Tweens.Tween | null = null;

  constructor() { super('ClassroomScene'); }

  create(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    if (this.textures.exists('bg-treehouse')) {
      const bg = this.add.image(cx, height / 2, 'bg-treehouse');
      const bigSide = Math.max(width, height) * 2;
      bg.setDisplaySize(bigSide, bigSide);
    } else {
      this.add.rectangle(cx, height / 2, width, height, 0x2d5a27);
    }

    // Title
    this.add.text(cx, relativeY(this, 0.07), 'Forest Map', {
      ...TXT_STYLE, fontSize: `${scaleFont(36, this)}px`, color: '#FFF8DC', stroke: '#4a3210', strokeThickness: 3,
    }).setOrigin(0.5);

    // Owl with speech
    const owl = new Character(this, relativeX(this, 0.5), relativeY(this, 0.2), 'owl', 'encouraging', { scale: 0.7, interactive: true });
    this.time.delayedCall(400, () => owl.say(getRandomDialogue('encouragement'), 4000));

    // 4 Animals around the scene on branches/mushrooms
    const positions = [
      { name: 'bear', x: 0.1, y: 0.55 },
      { name: 'cat', x: 0.22, y: 0.78 },
      { name: 'rabbit', x: 0.78, y: 0.72 },
      { name: 'fox', x: 0.9, y: 0.5 },
    ];
    positions.forEach(({ name, x, y }, i) => {
      const a = new Character(this, relativeX(this, x), relativeY(this, y), name, 'happy', { scale: 0.65, interactive: true });
      this.time.delayedCall(200 * i, () => a.startIdle());
    });

    // 3 Path buttons - VERTICAL stack to avoid overlap
    const btnX = relativeX(this, 0.5);
    new Button(this, btnX, relativeY(this, 0.42), 'Explore', () => this.showLevelSelect(), { width: 220, height: 58, fontSize: 22 });
    const practiceBtn = new Button(this, btnX, relativeY(this, 0.54), 'Practice', () => this.startPractice(), { width: 220, height: 58, fontSize: 22 });
    new Button(this, btnX, relativeY(this, 0.66), 'Rewards', () => this.showAchievements(), { width: 220, height: 58, fontSize: 22 });

    this.practicePulseTween = this.tweens.add({ targets: practiceBtn, scaleX: 1.05, scaleY: 1.05, duration: 1000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });

    new Button(this, relativeX(this, 0.07), relativeY(this, 0.06), 'Home', () => this.scene.start('MenuScene'), { color: 'primary', width: 100, height: 46, fontSize: 16 });

    const progress = loadProgress();
    this.add.text(relativeX(this, 0.92), relativeY(this, 0.06), `\u2B50 ${progress.totalStars}`, {
      ...TXT_STYLE, fontSize: `${scaleFont(20, this)}px`, color: '#ffd700',
    }).setOrigin(1, 0.5);

    const audio = this.registry.get('audioManager') as AudioManager | undefined;
    if (audio) audio.playMusic(this, 'bgm-classroom');
  }

  private startPractice(): void {
    const progress = loadProgress();
    const level = progress.currentLevel ?? KumonLevel.LEVEL_7A;
    const data: QuizSceneData = {
      level,
      activityType: this.levelManager.getRecommendedActivity(level),
      tier: this.levelManager.getCurrentTier(level),
    };
    this.scene.start('QuizScene', data);
  }

  private makeOverlay(w: number, h: number): Phaser.GameObjects.Container {
    this.closeOverlay();
    const c = this.add.container(0, 0);
    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.8).setInteractive();
    c.add(bg);
    return c;
  }

  private showLevelSelect(): void {
    const { width, height } = this.cameras.main;
    this.overlay = this.makeOverlay(width, height);
    const pw = Math.min(700, width * 0.85), ph = 420, px = (width - pw) / 2, py = (height - ph) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x2d5a27, 0.95);
    panel.lineStyle(3, 0x7ab450, 1);
    panel.fillRoundedRect(px, py, pw, ph, 20);
    panel.strokeRoundedRect(px, py, pw, ph, 20);
    this.overlay.add(panel);

    this.overlay.add(this.add.text(width / 2, py + 30, 'Choose a Path', {
      ...TXT_STYLE, fontSize: `${scaleFont(28, this)}px`, color: '#FFF8DC',
    }).setOrigin(0.5, 0));

    const btnW = 160, btnH = 56, gapX = (pw - 3 * btnW) / 4;
    LEVEL_ORDER.forEach((level, i) => {
      const bx = px + gapX + (i % 3) * (btnW + gapX) + btnW / 2;
      const by = py + 80 + Math.floor(i / 3) * (btnH + 20) + btnH / 2;
      const def = LEVEL_DEFINITIONS.find(d => d.level === level)!;
      const unlocked = this.levelManager.isLevelUnlocked(level);
      const btn = new Button(this, bx, by, unlocked ? def.name : `\uD83D\uDD12 ${def.name}`, () => { if (unlocked) this.showActivitySelect(level); },
        { color: unlocked ? 'primary' : 'disabled' as never, width: btnW, height: btnH, fontSize: 16 });
      if (!unlocked) btn.disable();
      this.overlay!.add(btn);
    });

    this.overlay.add(new Button(this, width / 2, py + ph - 36, 'Back', () => this.closeOverlay(), { color: 'danger', width: 120, height: 44, fontSize: 16 }));
    this.overlay.setDepth(10);
  }

  private showActivitySelect(level: KumonLevel): void {
    const { width, height } = this.cameras.main;
    this.overlay = this.makeOverlay(width, height);
    const pw = Math.min(560, width * 0.75);
    const def = LEVEL_DEFINITIONS.find(d => d.level === level)!;
    const ph = 160 + def.activities.length * 85;
    const px = (width - pw) / 2, py = (height - ph) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x2d5a27, 0.97);
    panel.lineStyle(3, 0x7ab450, 1);
    panel.fillRoundedRect(px, py, pw, ph, 20);
    panel.strokeRoundedRect(px, py, pw, ph, 20);
    this.overlay.add(panel);

    this.overlay.add(this.add.text(width / 2, py + 35, `${def.name} Activities`, {
      ...TXT_STYLE, fontSize: `${scaleFont(28, this)}px`, color: '#FFF8DC',
    }).setOrigin(0.5, 0));

    def.activities.forEach((act, i) => {
      const tier = this.levelManager.getCurrentTier(level);
      const btn = new Button(this, width / 2, py + 105 + i * 85, act.replace('_', ' ').toUpperCase(),
        () => { this.closeOverlay(); this.scene.start('QuizScene', { level, activityType: act, tier } as QuizSceneData); },
        { color: 'success', width: 300, height: 62, fontSize: 20 });
      this.overlay!.add(btn);
    });

    this.overlay.add(new Button(this, width / 2, py + ph - 40, 'Back', () => this.showLevelSelect(), { color: 'primary', width: 140, height: 48, fontSize: 16 }));
    this.overlay.setDepth(10);
  }

  private showAchievements(): void {
    const { width, height } = this.cameras.main;
    this.overlay = this.makeOverlay(width, height);
    const panel = this.add.graphics();
    panel.fillStyle(0x2d5a27, 0.95);
    panel.lineStyle(3, 0x7ab450, 1);
    panel.fillRoundedRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8, 20);
    panel.strokeRoundedRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8, 20);
    this.overlay.add(panel);

    this.overlay.add(this.add.text(width / 2, height * 0.15, '\uD83C\uDF32 Forest Rewards', {
      ...TXT_STYLE, fontSize: `${scaleFont(32, this)}px`, color: '#FFF8DC',
    }).setOrigin(0.5));

    this.overlay.add(this.add.text(width / 2, height / 2, 'Earn stars to unlock rewards!', {
      ...TXT_STYLE, fontSize: `${scaleFont(20, this)}px`, color: '#c8f0a0',
    }).setOrigin(0.5));

    this.overlay.add(new Button(this, width / 2, height * 0.86, 'Close', () => this.closeOverlay(), { color: 'primary', width: 140, height: 48, fontSize: 18 }));
    this.overlay.setDepth(10);
  }

  private closeOverlay(): void {
    if (this.overlay) { this.overlay.destroy(); this.overlay = null; }
  }

  shutdown(): void {
    this.closeOverlay();
    if (this.practicePulseTween) { this.practicePulseTween.stop(); this.practicePulseTween = null; }
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

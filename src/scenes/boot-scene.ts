import Phaser from 'phaser';
import { AudioManager } from '@/utils/audio-manager';
import { loadProgress } from '@/utils/storage';

const CHARACTER_COLORS: Record<string, number> = {
  owl: 0x8b6914, bear: 0x8b4513, cat: 0xff8c00, rabbit: 0xffb6c1, fox: 0xff6347,
};
const EXPRESSIONS = ['happy', 'thinking', 'celebrating', 'encouraging', 'surprised'];
const CHARACTERS = ['owl', 'bear', 'cat', 'rabbit', 'fox'];
const FOREST_BGS = ['forest-entrance', 'forest-clearing', 'mushroom-grove', 'treehouse', 'forest-river'];
const FOREST_OBJECTS = ['butterfly', 'bird', 'mushroom', 'acorn', 'flower', 'firefly', 'frog', 'squirrel', 'ladybug', 'berry', 'pinecone', 'leaf'];

export class BootScene extends Phaser.Scene {
  private loadBar!: Phaser.GameObjects.Graphics;
  private loadBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super('BootScene');
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const barW = width * 0.5;
    const barH = 24;
    const barX = (width - barW) / 2;
    const barY = height * 0.6;

    this.loadBg = this.add.graphics();
    this.loadBg.fillStyle(0x4a7a40, 1);
    this.loadBg.fillRoundedRect(barX, barY, barW, barH, 12);

    this.loadBar = this.add.graphics();

    this.add.text(width / 2, height * 0.4, 'Math Adventure', {
      fontFamily: 'Arial, sans-serif', fontSize: '48px', color: '#FFF8DC',
      stroke: '#4a3210', strokeThickness: 3,
    }).setOrigin(0.5);

    const loadingText = this.add.text(width / 2, height * 0.55, 'Loading...', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#a8d890',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      this.loadBar.clear();
      this.loadBar.fillStyle(0x7ec85a, 1);
      this.loadBar.fillRoundedRect(barX, barY, barW * value, barH, 12);
      loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    // Characters
    for (const name of CHARACTERS) {
      for (const expr of EXPRESSIONS) {
        this.load.image(`${name}-${expr}`, `assets/characters/${name}-${expr}.png`);
      }
    }

    // Forest backgrounds
    for (const bg of FOREST_BGS) {
      this.load.image(`bg-${bg}`, `assets/backgrounds/${bg}.png`);
    }

    // Forest math objects
    for (const obj of FOREST_OBJECTS) {
      this.load.image(`math-${obj}`, `assets/math-objects/${obj}.png`);
    }

    // UI elements
    this.load.image('wooden-btn', 'assets/ui/wooden-btn.png');
    this.load.image('wooden-panel', 'assets/ui/wooden-panel.png');
    this.load.image('wooden-circle-btn', 'assets/ui/wooden-circle-btn.png');
    this.load.image('treasure-chest', 'assets/ui/treasure-chest.png');
    this.load.image('campfire', 'assets/ui/campfire.png');
    this.load.image('star-empty-img', 'assets/ui/star-empty.png');
    this.load.image('star-filled-img', 'assets/ui/star-filled.png');
    // badge-template removed (forest theme uses treasure-chest instead)

    // Audio
    this.load.audio('sfx-correct', 'assets/audio/sfx-correct.wav');
    this.load.audio('sfx-wrong', 'assets/audio/sfx-wrong.wav');
    this.load.audio('sfx-star', 'assets/audio/sfx-star.wav');
    this.load.audio('sfx-levelup', 'assets/audio/sfx-levelup.wav');
    this.load.audio('sfx-click', 'assets/audio/sfx-click.wav');
    this.load.audio('sfx-celebrate', 'assets/audio/sfx-celebrate.wav');
    this.load.audio('bgm-classroom', 'assets/audio/bgm-classroom.wav');
    this.load.audio('bgm-quiz', 'assets/audio/bgm-quiz.wav');
  }

  create(): void {
    this.generateFallbackTextures();
    const audio = new AudioManager();
    this.registry.set('audioManager', audio);
    loadProgress();

    this.cameras.main.fadeOut(200, 45, 90, 39);
    this.time.delayedCall(250, () => {
      this.scene.start('MenuScene');
    });
  }

  private generateFallbackTextures(): void {
    for (const name of CHARACTERS) {
      const color = CHARACTER_COLORS[name];
      for (const expr of EXPRESSIONS) {
        const key = `${name}-${expr}`;
        if (!this.textures.exists(key)) {
          const g = this.add.graphics();
          g.fillStyle(color, 1);
          g.fillCircle(32, 32, 32);
          g.fillStyle(0xffffff, 0.9);
          g.fillCircle(22, 26, 8);
          g.fillCircle(42, 26, 8);
          g.generateTexture(key, 64, 64);
          g.destroy();
        }
      }
    }

    // Forest background fallbacks (green gradient)
    for (const bg of FOREST_BGS) {
      const key = `bg-${bg}`;
      if (!this.textures.exists(key)) {
        const g = this.add.graphics();
        for (let y = 0; y < 768; y++) {
          const t = y / 768;
          const r = Math.round(0x1a + (0x2d - 0x1a) * t);
          const gv = Math.round(0x5a - (0x5a - 0x3a) * t);
          const b = Math.round(0x1a + (0x10 - 0x1a) * t);
          g.fillStyle(Phaser.Display.Color.GetColor(r, gv, b), 1);
          g.fillRect(0, y, 1024, 1);
        }
        g.generateTexture(key, 1024, 768);
        g.destroy();
      }
    }

    // Star fallbacks
    if (!this.textures.exists('star-empty')) {
      const g = this.add.graphics();
      this.drawStar(g, 20, 20, 18, 0xdddddd);
      g.generateTexture('star-empty', 40, 40);
      g.destroy();
    }
    if (!this.textures.exists('star-filled')) {
      const g = this.add.graphics();
      this.drawStar(g, 20, 20, 18, 0xffd700);
      g.generateTexture('star-filled', 40, 40);
      g.destroy();
    }
  }

  private drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, color: number): void {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.42;
      pts.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad });
    }
    g.fillStyle(color, 1);
    g.fillPoints(pts, true);
  }

  shutdown(): void {
    this.load.off('progress');
    this.load.off('complete');
  }
}

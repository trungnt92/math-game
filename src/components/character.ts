import Phaser from 'phaser';
import { scaleFont } from '@/utils/responsive';
import { AudioManager } from '@/utils/audio-manager';

const COLORS: Record<string, number> = {
  owl: 0x8b6914, bear: 0x8b4513, cat: 0xff8c00, rabbit: 0xffb6c1, fox: 0xff6347,
};
const GREETINGS = ['Hi!', 'Yay!', "Let's play!", 'Hello!', 'Hehe!'];
const SPARKLES = ['\u2728', '\u2B50', '\uD83D\uDCAB', '\uD83C\uDF1F'];

interface CharacterOptions { scale?: number; interactive?: boolean }

export class Character extends Phaser.GameObjects.Container {
  private charImage: Phaser.GameObjects.Image | null = null;
  private charFallback: Phaser.GameObjects.Ellipse | null = null;
  private charName: string;
  private currentExpression = 'happy';
  private speechBubble: Phaser.GameObjects.Container | null = null;
  private speechTimer: Phaser.Time.TimerEvent | null = null;
  private charRadius = 80;
  private baseY: number;
  private baseScale: number;
  private idleTweens: Phaser.Tweens.Tween[] = [];
  private idleTimers: Phaser.Time.TimerEvent[] = [];
  private audio: AudioManager;

  constructor(scene: Phaser.Scene, x: number, y: number, characterName: string, initialExpression = 'happy', options: CharacterOptions = {}) {
    super(scene, x, y);
    this.charName = characterName.toLowerCase();
    this.currentExpression = initialExpression;
    this.baseY = y;
    this.baseScale = options.scale ?? 1;
    this.audio = new AudioManager();

    const key = `${this.charName}-${initialExpression}`;
    if (scene.textures.exists(key) && scene.textures.get(key).key !== '__MISSING') {
      const size = this.charRadius * 2.8;
      // Soft shadow so light characters (rabbit) are visible on any background
      const shadow = scene.add.ellipse(2, 4, size * 0.85, size * 0.3, 0x000000, 0.12);
      shadow.setOrigin(0.5, 0);
      shadow.y = size * 0.38;
      this.add(shadow);
      this.charImage = scene.add.image(0, 0, key);
      this.charImage.setDisplaySize(size, size);
      this.add(this.charImage);
    } else {
      const color = COLORS[this.charName] ?? 0x888888;
      this.charFallback = scene.add.ellipse(0, 0, this.charRadius * 2, this.charRadius * 2, color);
      this.charFallback.setStrokeStyle(3, 0x000000, 0.3);
      const letter = scene.add.text(0, 0, characterName.charAt(0).toUpperCase(), {
        fontSize: `${scaleFont(32, scene)}px`, fontFamily: 'Arial, sans-serif', color: '#ffffff',
      }).setOrigin(0.5);
      this.add([this.charFallback, letter]);
    }

    if (options.scale) this.setScale(options.scale);
    if (options.interactive) this.setupInteractive();
    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    this.startIdle();
  }

  private setupInteractive(): void {
    const hit = this.scene.add.zone(0, 0, this.charRadius * 3, this.charRadius * 3).setInteractive();
    this.add(hit);
    hit.on('pointerdown', () => {
      this.audio.playSfx(this.scene, 'sfx-click');
      const prev = this.currentExpression;
      const tgt = this.charImage ?? this.charFallback;
      if (!tgt) return;
      const imgSx = tgt.scaleX;
      const imgSy = tgt.scaleY;
      this.setExpression('surprised');
      this.scene.tweens.chain({ targets: tgt, tweens: [
        { scaleX: imgSx * 1.12, scaleY: imgSy * 0.92, duration: 80 },
        { scaleX: imgSx * 0.92, scaleY: imgSy * 1.12, duration: 80 },
        { scaleX: imgSx, scaleY: imgSy, duration: 140 },
      ]});
      this.say(GREETINGS[Phaser.Math.Between(0, GREETINGS.length - 1)], 1500);
      this.emitSparkles(Phaser.Math.Between(3, 5));
      this.scene.time.delayedCall(1500, () => this.setExpression(prev));
    });
  }

  startIdle(): void {
    this.stopIdle();
    const img = this.charImage ?? this.charFallback;
    if (!img) return;
    const baseScaleY = img.scaleY;
    const delay = Phaser.Math.Between(0, 500);

    // Breathing - use relative scale from actual displaySize scale
    this.idleTweens.push(this.scene.tweens.add({
      targets: img, scaleY: baseScaleY * 1.03, duration: 2000, ease: 'Sine.easeInOut',
      yoyo: true, repeat: -1, delay,
    }));

    // Bob
    this.idleTweens.push(this.scene.tweens.add({
      targets: this, y: this.baseY - 4, duration: 3000, ease: 'Sine.easeInOut',
      yoyo: true, repeat: -1,
    }));

    // Blink loop
    const blink = () => {
      const t = this.scene.time.addEvent({ delay: Phaser.Math.Between(3000, 6000), callback: () => {
        if (img && this.scene) this.scene.tweens.add({ targets: img, scaleY: baseScaleY * 0.96, duration: 60, yoyo: true });
        blink();
      }});
      this.idleTimers.push(t);
    };
    blink();

    this.startCharacterIdle(baseScaleY);
  }

  private startCharacterIdle(baseScaleY: number): void {
    const scheduleTimer = (minMs: number, maxMs: number, cb: () => void) => {
      const t = this.scene.time.addEvent({
        delay: Phaser.Math.Between(minMs, maxMs), callback: () => { cb(); scheduleTimer(minMs, maxMs, cb); },
      });
      this.idleTimers.push(t);
    };
    const img = this.charImage ?? this.charFallback;

    if (this.charName === 'owl') {
      this.idleTweens.push(this.scene.tweens.add({ targets: this, angle: 3, duration: 4000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }));
      scheduleTimer(5000, 8000, () => this.scene.tweens.add({ targets: this, angle: -8, duration: 150, yoyo: true }));
    } else if (this.charName === 'bear') {
      this.idleTweens.push(this.scene.tweens.add({ targets: this, x: this.x + 3, duration: 3500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }));
      scheduleTimer(6000, 10000, () => { if (img) this.scene.tweens.add({ targets: img, scaleY: baseScaleY * 1.08, duration: 120, yoyo: true }); });
    } else if (this.charName === 'cat') {
      this.idleTweens.push(this.scene.tweens.add({ targets: this, angle: 2, duration: 2500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }));
      scheduleTimer(4000, 7000, () => this.scene.tweens.add({ targets: this, angle: -6, duration: 150, yoyo: true }));
    } else if (this.charName === 'rabbit') {
      this.idleTweens.push(this.scene.tweens.add({ targets: this, y: this.baseY - 6, duration: 1800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }));
      scheduleTimer(3000, 5000, () => this.scene.tweens.add({ targets: this, y: this.y - 12, duration: 200, ease: 'Back.easeOut', yoyo: true }));
    } else if (this.charName === 'fox') {
      this.idleTweens.push(this.scene.tweens.add({ targets: this, x: this.x + 4, duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 }));
      scheduleTimer(5000, 8000, () => this.scene.tweens.add({ targets: this, angle: 5, duration: 150, yoyo: true }));
    }
  }

  stopIdle(): void {
    this.idleTweens.forEach(t => t.stop());
    this.idleTweens = [];
    this.idleTimers.forEach(t => t.remove());
    this.idleTimers = [];
  }

  private emitSparkles(count: number): void {
    for (let i = 0; i < count; i++) {
      const sx = Phaser.Math.Between(-40, 40);
      const sy = Phaser.Math.Between(-40, 40);
      const s = this.scene.add.text(this.x + sx, this.y + sy, SPARKLES[Phaser.Math.Between(0, 3)], { fontSize: '20px' }).setOrigin(0.5);
      this.scene.tweens.add({
        targets: s, y: s.y - Phaser.Math.Between(30, 60), alpha: 0,
        duration: Phaser.Math.Between(600, 1000), onComplete: () => s.destroy(),
      });
    }
  }

  setExpression(expression: string): void {
    this.currentExpression = expression;
    const key = `${this.charName}-${expression}`;
    if (this.charImage && this.scene.textures.exists(key)) this.charImage.setTexture(key);
  }

  say(text: string, duration = 3000): void {
    this.clearSpeech();
    const p = 12, mw = 200, fs = `${scaleFont(16, this.scene)}px`, ff = 'Arial, sans-serif';
    const tmp = this.scene.add.text(0, 0, text, { fontSize: fs, fontFamily: ff, wordWrap: { width: mw } });
    const bw = tmp.width + p * 2, bh = tmp.height + p * 2;
    tmp.destroy();
    const bubble = this.scene.add.container(0, -(this.charRadius + bh / 2 + 20));
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95).fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 10);
    bg.lineStyle(2, 0x333333, 0.6).strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 10);
    bg.fillStyle(0xffffff, 0.95).fillTriangle(-8, bh / 2, 8, bh / 2, 0, bh / 2 + 12);
    const label = this.scene.add.text(0, 0, text, { fontSize: fs, fontFamily: ff, color: '#333333', wordWrap: { width: mw }, align: 'center' }).setOrigin(0.5);
    bubble.add([bg, label]);
    this.add(bubble);
    this.speechBubble = bubble;
    this.speechTimer = this.scene.time.delayedCall(duration, () => this.clearSpeech());
  }

  private clearSpeech(): void {
    if (this.speechTimer) { this.speechTimer.remove(); this.speechTimer = null; }
    if (this.speechBubble) { this.speechBubble.destroy(); this.speechBubble = null; }
  }

  bounce(): void {
    this.scene.tweens.add({ targets: this, y: this.y - 25, duration: 280, ease: 'Back.easeOut', yoyo: true });
  }

  celebrate(): void {
    this.setExpression('celebrating');
    this.emitSparkles(5);
    this.scene.tweens.chain({ targets: this, tweens: [
      { y: this.y - 25, duration: 300, ease: 'Back.easeOut' },
      { y: this.y, duration: 300, ease: 'Bounce.easeOut' },
      { angle: 360, duration: 500, ease: 'Sine.easeInOut', onComplete: () => this.setAngle(0) },
    ]});
  }

  think(): void {
    this.setExpression('thinking');
    this.scene.tweens.add({ targets: this, x: this.x + 6, duration: 400, ease: 'Sine.easeInOut', yoyo: true, repeat: 2 });
    this.say('...', 3000);
  }

  wave(): void {
    const targetX = this.x;
    this.x = targetX - 300;
    this.scene.tweens.add({
      targets: this, x: targetX, duration: 500, ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({ targets: this, y: this.y - 15, duration: 200, ease: 'Sine.easeOut', yoyo: true, repeat: 1 });
      },
    });
  }

  override destroy(fromScene?: boolean): void {
    this.stopIdle();
    this.clearSpeech();
    super.destroy(fromScene);
  }
}

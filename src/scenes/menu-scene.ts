import Phaser from 'phaser';
import { Character } from '@/components/character';
import { Button } from '@/components/button';
import { relativeX, relativeY, scaleFont } from '@/utils/responsive';
import { loadProgress, loadSettings, saveSettings } from '@/utils/storage';
import { getRandomDialogue } from '@/data/dialogue';
import type { AudioManager } from '@/utils/audio-manager';

export class MenuScene extends Phaser.Scene {
  private owl!: Character;
  private muteBtn!: Button;
  private leafObjects: Phaser.GameObjects.Text[] = [];
  private leafTweens: Phaser.Tweens.Tween[] = [];

  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    this.createBackground(width, height);

    // Title
    const titleY = relativeY(this, 0.15);
    const title = this.add.text(cx, titleY, 'Math Adventure', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: `${scaleFont(68, this)}px`,
      color: '#FFF8DC',
      stroke: '#4a3210',
      strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0);

    // Subtitle
    const sub = this.add.text(cx, relativeY(this, 0.24), 'A Forest Journey', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: `${scaleFont(30, this)}px`,
      color: '#c8f0a0',
      stroke: '#2d5a1a',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    // Owl
    this.owl = new Character(this, cx, relativeY(this, 0.45), 'owl', 'happy', { scale: 0.8, interactive: true });

    // Play button
    const playBtn = new Button(
      this, cx, relativeY(this, 0.68),
      'Play!', () => this.scene.start('ClassroomScene'),
      { color: 'success', width: 260, height: 80, fontSize: 34 }
    );
    playBtn.setScale(0);

    // Stars display
    const progress = loadProgress();
    this.add.text(relativeX(this, 0.88), relativeY(this, 0.94), `\u2B50 ${progress.totalStars}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${scaleFont(22, this)}px`,
      color: '#ffd700',
    }).setOrigin(1, 1);

    // Mute button
    const settings = loadSettings();
    this.muteBtn = new Button(
      this, relativeX(this, 0.12), relativeY(this, 0.94),
      settings.muted ? 'Sound: OFF' : 'Sound: ON',
      () => this.toggleMute(),
      { color: 'primary', width: 160, height: 48, fontSize: 16 }
    );

    // Entrance animations
    this.tweens.add({ targets: title, alpha: 1, duration: 600, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: sub, alpha: 1, duration: 600, delay: 200 });
    this.tweens.add({
      targets: playBtn, scaleX: 1, scaleY: 1, duration: 500, delay: 400, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: playBtn, scaleX: 1.06, scaleY: 1.06, duration: 750, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
      },
    });

    // Title float
    this.time.delayedCall(700, () => {
      this.tweens.add({ targets: title, y: titleY + 6, duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    });

    // Owl greeting
    this.time.delayedCall(500, () => {
      this.owl.wave();
      this.time.delayedCall(900, () => this.owl.say(getRandomDialogue('greetings'), 4000));
    });

    this.createLeafParticles(width, height);
  }

  private createBackground(width: number, height: number): void {
    if (this.textures.exists('bg-forest-entrance')) {
      const bg = this.add.image(width / 2, height / 2, 'bg-forest-entrance');
      // Covers any aspect ratio: 4:3 tablets, 16:9 laptops, 19.5:9 iPhones
      const bigSide = Math.max(width, height) * 2;
      bg.setDisplaySize(bigSide, bigSide);
    } else {
      const g = this.add.graphics();
      const steps = 20;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const r = Math.round(0x1a + (0x2d - 0x1a) * t);
        const gv = Math.round(0x5a - (0x5a - 0x3a) * t);
        const b = Math.round(0x1a + (0x10 - 0x1a) * t);
        g.fillStyle(Phaser.Display.Color.GetColor(r, gv, b), 1);
        g.fillRect(0, (height / steps) * i, width, Math.ceil(height / steps) + 1);
      }
    }
  }

  private createLeafParticles(width: number, height: number): void {
    const positions = [0.05, 0.2, 0.45, 0.7, 0.9, 0.6];
    positions.forEach((xFrac, i) => {
      const leaf = this.add.text(
        relativeX(this, xFrac), Phaser.Math.Between(-40, height * 0.3),
        '\uD83C\uDF43',
        { fontSize: `${Phaser.Math.Between(18, 30)}px` }
      ).setOrigin(0.5).setAlpha(0.7);
      this.leafObjects.push(leaf);

      const baseX = relativeX(this, xFrac);
      const t = this.tweens.add({
        targets: leaf,
        y: height + 50,
        x: baseX + Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(6000, 12000),
        delay: i * 1500,
        ease: 'Linear',
        onComplete: () => {
          leaf.y = Phaser.Math.Between(-60, -20);
          leaf.x = Phaser.Math.Between(0, width);
          this.tweens.add({
            targets: leaf, y: height + 50,
            x: leaf.x + Phaser.Math.Between(-60, 60),
            duration: Phaser.Math.Between(7000, 13000),
            ease: 'Linear',
            repeat: -1,
          });
        },
      });
      this.leafTweens.push(t);

      // Sine wave horizontal drift
      this.tweens.add({
        targets: leaf, x: baseX + 30, duration: 2000 + i * 300,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1,
      });
    });
  }

  private toggleMute(): void {
    const audio = this.registry.get('audioManager') as AudioManager | undefined;
    if (audio) {
      const muted = audio.toggleMute();
      this.muteBtn.setText(muted ? 'Sound: OFF' : 'Sound: ON');
    } else {
      const settings = loadSettings();
      settings.muted = !settings.muted;
      saveSettings(settings);
      this.muteBtn.setText(settings.muted ? 'Sound: OFF' : 'Sound: ON');
    }
  }

  shutdown(): void {
    this.leafTweens.forEach(t => t.stop());
    this.leafTweens = [];
    this.leafObjects = [];
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

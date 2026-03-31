import Phaser from 'phaser';
import { scaleFont } from '@/utils/responsive';
import type { AudioManager } from '@/utils/audio-manager';

interface ButtonOptions {
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private hitZone: Phaser.GameObjects.Zone;
  private btnWidth: number;
  private btnHeight: number;
  private isDisabled = false;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, callback: () => void, options: ButtonOptions = {}) {
    super(scene, x, y);

    this.btnWidth = Math.max(140, options.width ?? 180);
    this.btnHeight = Math.max(50, options.height ?? 56);

    this.bg = scene.add.graphics();
    this.drawWood();

    this.label = scene.add.text(0, 0, text, {
      fontSize: `${scaleFont(options.fontSize ?? 22, scene)}px`,
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#fff5e0',
      stroke: '#3d1e00',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.hitZone = scene.add.zone(0, 0, this.btnWidth, this.btnHeight).setInteractive({ useHandCursor: true });
    this.add([this.bg, this.label, this.hitZone]);
    scene.add.existing(this);

    this.hitZone.on('pointerover', () => {
      if (!this.isDisabled) scene.tweens.add({ targets: this, scaleX: 1.07, scaleY: 1.07, duration: 80 });
    });
    this.hitZone.on('pointerout', () => {
      if (!this.isDisabled) scene.tweens.add({ targets: this, scaleX: 1, scaleY: 1, duration: 80 });
    });
    this.hitZone.on('pointerdown', () => {
      if (this.isDisabled) return;
      scene.tweens.add({ targets: this, scaleX: 0.92, scaleY: 0.92, duration: 50 });
      const audio = scene.registry.get('audioManager') as AudioManager | undefined;
      audio?.playSfx(scene, 'sfx-click');
      callback();
    });
    this.hitZone.on('pointerup', () => {
      if (!this.isDisabled) scene.tweens.add({ targets: this, scaleX: 1.07, scaleY: 1.07, duration: 60 });
    });
  }

  private drawWood(alpha = 1): void {
    const hw = this.btnWidth / 2;
    const hh = this.btnHeight / 2;
    const r = 12;
    this.bg.clear();

    // Drop shadow
    this.bg.fillStyle(0x1a0e00, 0.35 * alpha);
    this.bg.fillRoundedRect(-hw + 4, -hh + 5, this.btnWidth, this.btnHeight, r);

    // Outer dark border (bark edge)
    this.bg.fillStyle(0x4a2800, alpha);
    this.bg.fillRoundedRect(-hw, -hh, this.btnWidth, this.btnHeight, r);

    // Main wood body (lighter brown)
    this.bg.fillStyle(0x8B6914, alpha);
    this.bg.fillRoundedRect(-hw + 3, -hh + 3, this.btnWidth - 6, this.btnHeight - 6, r - 2);

    // Bottom darker wood (depth)
    this.bg.fillStyle(0x6B4E0A, alpha);
    this.bg.fillRoundedRect(-hw + 3, -hh + this.btnHeight * 0.5, this.btnWidth - 6, this.btnHeight * 0.5 - 3, { tl: 0, tr: 0, bl: r - 2, br: r - 2 });

    // Top highlight (sheen)
    this.bg.fillStyle(0xC09838, 0.6 * alpha);
    this.bg.fillRoundedRect(-hw + 6, -hh + 4, this.btnWidth - 12, this.btnHeight * 0.3, { tl: r - 3, tr: r - 3, bl: 4, br: 4 });

    // Wood grain lines
    this.bg.lineStyle(1, 0x5a3a08, 0.25 * alpha);
    for (let i = 0; i < 3; i++) {
      const gy = -hh + 10 + i * (this.btnHeight / 3.5);
      const wobble = (i % 2 === 0 ? 5 : -3);
      this.bg.lineBetween(-hw + 12, gy, hw - 12, gy + wobble);
    }

    // Inner border highlight
    this.bg.lineStyle(1, 0xC09838, 0.3 * alpha);
    this.bg.strokeRoundedRect(-hw + 3, -hh + 3, this.btnWidth - 6, this.btnHeight - 6, r - 2);
  }

  disable(): void {
    this.isDisabled = true;
    this.setAlpha(0.4);
    this.hitZone.disableInteractive();
  }

  enable(): void {
    this.isDisabled = false;
    this.setAlpha(1);
    this.hitZone.setInteractive();
  }

  setText(text: string): void { this.label.setText(text); }
  setButtonColor(_color: string): void { /* wood theme - all buttons same */ }
}

import Phaser from 'phaser';
import { scaleFont } from '@/utils/responsive';

interface ProgressBarOptions {
  bgColor?: number;
  fillColor?: number;
  showLabel?: boolean;
}

const FILL_RED = 0xFF6B6B;
const FILL_YELLOW = 0xFFB347;
const FILL_GREEN = 0x90D26D;
const BG_COLOR = 0xe0e0e0;

export class ProgressBar extends Phaser.GameObjects.Container {
  private bgGraphics: Phaser.GameObjects.Graphics;
  private fillGraphics: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text | null = null;
  private barWidth: number;
  private barHeight: number;
  private bgColor: number;
  private currentProgress = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    options: ProgressBarOptions = {}
  ) {
    super(scene, x, y);

    this.barWidth = width;
    this.barHeight = Math.max(height, 16);
    this.bgColor = options.bgColor ?? BG_COLOR;

    this.bgGraphics = scene.add.graphics();
    this.fillGraphics = scene.add.graphics();

    this.drawBackground();
    this.drawFill(0);

    this.add([this.bgGraphics, this.fillGraphics]);

    if (options.showLabel) {
      this.labelText = scene.add.text(this.barWidth / 2, -this.barHeight / 2 - 14, '', {
        fontSize: `${scaleFont(18, scene)}px`,
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        color: '#333333',
      }).setOrigin(0.5, 1);
      this.add(this.labelText);
    }

    scene.add.existing(this);
  }

  private drawBackground(): void {
    const hh = this.barHeight / 2;
    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(this.bgColor, 1);
    this.bgGraphics.fillRoundedRect(0, -hh, this.barWidth, this.barHeight, hh);
  }

  private getFillColor(progress: number): number {
    if (progress < 0.33) return FILL_RED;
    if (progress < 0.66) return FILL_YELLOW;
    return FILL_GREEN;
  }

  private drawFill(progress: number): void {
    const hh = this.barHeight / 2;
    const minFillW = progress > 0 ? Math.max(this.barHeight, this.barWidth * progress) : 0;
    const fillW = Math.min(minFillW, this.barWidth);
    this.fillGraphics.clear();
    if (fillW <= 0) return;
    this.fillGraphics.fillStyle(this.getFillColor(progress), 1);
    this.fillGraphics.fillRoundedRect(0, -hh, fillW, this.barHeight, hh);
  }

  setProgress(value: number, animated = false): void {
    const clamped = Math.max(0, Math.min(1, value));

    if (animated) {
      const obj = { progress: this.currentProgress };
      this.scene.tweens.add({
        targets: obj,
        progress: clamped,
        duration: 400,
        ease: 'Quad.easeOut',
        onUpdate: () => {
          this.drawFill(obj.progress);
        },
        onComplete: () => {
          this.currentProgress = clamped;
        },
      });
    } else {
      this.currentProgress = clamped;
      this.drawFill(clamped);
    }
  }

  setLabel(current: number, total: number): void {
    if (this.labelText) {
      this.labelText.setText(`${current}/${total}`);
    }
  }
}

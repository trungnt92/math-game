import Phaser from 'phaser';
import { Character } from '@/components/character';
import { Button } from '@/components/button';
import { relativeX, relativeY, scaleFont } from '@/utils/responsive';
import type { RewardsSceneData, Achievement } from '@/types/game-types';

const CONFETTI_COLORS = [0x7ec85a, 0xffd700, 0xa0e878, 0xffb347, 0x90d26d, 0xc8f0a0, 0x4a9a35];

export class RewardsScene extends Phaser.Scene {
  private sceneData!: RewardsSceneData;
  private confettiPieces: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('RewardsScene');
  }

  init(data: RewardsSceneData): void {
    this.sceneData = data;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;

    // Forest-green tinted overlay
    this.add.rectangle(cx, height / 2, width, height, 0x1a3a10);
    // Subtle green vignette
    const vignette = this.add.graphics();
    vignette.fillStyle(0x0d2208, 0.6);
    vignette.fillCircle(cx, height / 2, Math.max(width, height) * 0.85);
    vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.spawnConfetti(width, height);

    // Level up display
    if (this.sceneData.levelUp) {
      const levelName = this.sceneData.levelUp as string;
      const banner = this.add.text(cx, relativeY(this, 0.15), `\uD83C\uDF32 Level ${levelName} Unlocked!`, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: `${scaleFont(44, this)}px`,
        color: '#ffd700',
        stroke: '#4a3210',
        strokeThickness: 3,
      }).setOrigin(0.5).setAlpha(0).setScale(0.5);

      this.tweens.add({ targets: banner, alpha: 1, scaleX: 1, scaleY: 1, duration: 600, delay: 200, ease: 'Back.easeOut' });
      this.time.delayedCall(800, () => {
        this.tweens.add({ targets: banner, alpha: 0.75, duration: 600, yoyo: true, repeat: -1 });
      });
    }

    // Achievement badges
    const achievements: Achievement[] = this.sceneData.newAchievements ?? [];
    const badgeY = relativeY(this, this.sceneData.levelUp ? 0.38 : 0.22);
    const badgeColors = [0x5a8e4a, 0x7ec85a, 0x4a9a35, 0xffb347, 0x8b6914];

    achievements.slice(0, 4).forEach((ach, i) => {
      const totalBadges = Math.min(achievements.length, 4);
      const bx = cx + (i - (totalBadges - 1) / 2) * 160;
      const badgeContainer = this.add.container(bx, badgeY).setAlpha(0).setScale(0.3);

      // Treasure chest icon or colored circle
      if (this.textures.exists('treasure-chest')) {
        const chest = this.add.image(0, -10, 'treasure-chest').setDisplaySize(64, 64);
        badgeContainer.add(chest);
      } else {
        const circle = this.add.graphics();
        circle.fillStyle(badgeColors[i % badgeColors.length], 1);
        circle.fillCircle(0, 0, 36);
        circle.lineStyle(3, 0xffd700, 0.9);
        circle.strokeCircle(0, 0, 36);
        badgeContainer.add(circle);
        const icon = this.add.text(0, -4, ach.icon[0]?.toUpperCase() ?? '\u2605', {
          fontFamily: 'Arial, sans-serif', fontSize: `${scaleFont(24, this)}px`, color: '#FFF8DC',
        }).setOrigin(0.5);
        badgeContainer.add(icon);
      }

      const nameTxt = this.add.text(0, 50, ach.name, {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: `${scaleFont(14, this)}px`, color: '#c8f0a0', align: 'center', wordWrap: { width: 130 },
      }).setOrigin(0.5, 0);
      badgeContainer.add(nameTxt);

      this.tweens.add({ targets: badgeContainer, alpha: 1, scaleX: 1, scaleY: 1, duration: 500, delay: 400 + i * 150, ease: 'Back.easeOut' });
    });

    // 5 animal characters celebrating
    const animals = ['bear', 'cat', 'rabbit', 'fox', 'owl'];
    animals.forEach((name, i) => {
      const ax = relativeX(this, 0.1 + i * 0.2);
      const ay = relativeY(this, 0.76);
      const char = new Character(this, ax, ay, name, 'celebrating');
      char.setAlpha(0).setDepth(5);
      this.tweens.add({ targets: char, alpha: 1, duration: 400, delay: 600 + i * 100 });
      this.time.delayedCall(700 + i * 100, () => char.celebrate());
      this.time.addEvent({ delay: 2000 + i * 200, loop: true, callback: () => char.celebrate() });
    });

    // Continue button
    const continueBtn = new Button(
      this, cx, relativeY(this, 0.91),
      'Continue', () => this.scene.start('ClassroomScene'),
      { color: 'success', width: 220, height: 60, fontSize: 22 }
    );
    continueBtn.setAlpha(0).setDepth(10);
    this.tweens.add({ targets: continueBtn, alpha: 1, duration: 400, delay: 1200 });
  }

  private spawnConfetti(width: number, height: number): void {
    const count = 40;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, width);
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const piece = this.add.rectangle(x, -20, 10, 14, color);
      piece.setAngle(Phaser.Math.Between(0, 360));
      this.confettiPieces.push(piece);

      this.tweens.add({
        targets: piece,
        y: height + 30,
        x: x + Phaser.Math.Between(-80, 80),
        angle: piece.angle + Phaser.Math.Between(180, 540),
        duration: Phaser.Math.Between(1800, 3500),
        delay: Phaser.Math.Between(0, 1200),
        ease: 'Quad.easeIn',
        onComplete: () => {
          piece.y = -20;
          piece.x = Phaser.Math.Between(0, width);
          this.tweens.add({
            targets: piece, y: height + 30, x: piece.x + Phaser.Math.Between(-80, 80),
            angle: piece.angle + 360, duration: Phaser.Math.Between(2000, 3800), ease: 'Linear',
          });
        },
      });
    }
  }

  shutdown(): void {
    this.confettiPieces = [];
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

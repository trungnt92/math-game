import Phaser from 'phaser';

const GOLD = 0xffd700;
const EMPTY = 0xdddddd;
const STAR_STROKE = 0xaaaaaa;

export class StarRating extends Phaser.GameObjects.Container {
  private stars: Phaser.GameObjects.Graphics[] = [];
  private maxStars: number;
  private starSize: number;
  private spacing: number;
  private currentRating = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxStars = 3,
    starSize = 40
  ) {
    super(scene, x, y);

    this.maxStars = maxStars;
    this.starSize = starSize;
    this.spacing = starSize * 1.4;

    const totalWidth = (maxStars - 1) * this.spacing;
    const startX = -totalWidth / 2;

    for (let i = 0; i < maxStars; i++) {
      const g = scene.add.graphics();
      g.x = startX + i * this.spacing;
      this.drawStar(g, false);
      this.stars.push(g);
      this.add(g);
    }

    scene.add.existing(this);
  }

  private drawStar(g: Phaser.GameObjects.Graphics, filled: boolean): void {
    g.clear();
    const r = this.starSize / 2;
    const innerR = r * 0.42;
    const points = 5;
    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? r : innerR;
      pts.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }

    if (filled) {
      g.fillStyle(GOLD, 1);
      g.fillPoints(pts, true);
    }
    g.lineStyle(2, filled ? 0xcc9900 : STAR_STROKE, 1);
    g.fillStyle(filled ? GOLD : EMPTY, filled ? 1 : 0.6);
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
  }

  setRating(stars: number, animated = false): void {
    const clamped = Math.max(0, Math.min(this.maxStars, stars));
    this.currentRating = clamped;

    for (let i = 0; i < this.maxStars; i++) {
      this.drawStar(this.stars[i], false);
      this.stars[i].setScale(1);
    }

    if (!animated) {
      for (let i = 0; i < clamped; i++) {
        this.drawStar(this.stars[i], true);
      }
      return;
    }

    for (let i = 0; i < clamped; i++) {
      const star = this.stars[i];
      const delay = i * 200;

      this.scene.time.delayedCall(delay, () => {
        this.drawStar(star, true);
        star.setScale(0);
        this.scene.tweens.add({
          targets: star,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 150,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.scene.tweens.add({
              targets: star,
              scaleX: 1,
              scaleY: 1,
              duration: 100,
              ease: 'Quad.easeIn',
            });
          },
        });
      });
    }
  }

  getRating(): number {
    return this.currentRating;
  }
}

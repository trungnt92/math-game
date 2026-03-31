import Phaser from 'phaser';
import { Character } from '@/components/character';
import { Button } from '@/components/button';
import { StarRating } from '@/components/star-rating';
import { relativeX, relativeY, scaleFont } from '@/utils/responsive';
import { KumonLevel, ActivityType } from '@/types/game-types';
import type { ResultsSceneData, QuizSceneData } from '@/types/game-types';

export class ResultsScene extends Phaser.Scene {
  private sceneData!: ResultsSceneData;

  constructor() {
    super('ResultsScene');
  }

  init(data: ResultsSceneData): void {
    this.sceneData = data;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const { summary, level, activityType, tier } = this.sceneData;
    const stars = summary?.starsEarned ?? 0;

    // Forest clearing background
    if (this.textures.exists('bg-forest-clearing')) {
      this.add.image(cx, height / 2, 'bg-forest-clearing').setDisplaySize(width, height);
    } else {
      this.add.rectangle(cx, height / 2, width, height, 0x2d5a27);
    }

    // Semi-transparent dark overlay for readability
    this.add.rectangle(cx, height / 2, width, height, 0x000000, 0.35);

    // Header
    const headerMsg = stars === 3 ? 'Perfect Score!' : stars >= 2 ? 'Great Job!' : 'Well Done!';
    const headerColor = stars === 3 ? '#ffd700' : '#c8f0a0';
    const header = this.add.text(relativeX(this, 0.5), relativeY(this, 0.1), headerMsg, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: `${scaleFont(42, this)}px`,
      color: headerColor,
      stroke: '#4a3210',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    // Owl character
    const owlExpr = stars === 3 ? 'celebrating' : stars >= 2 ? 'happy' : 'encouraging';
    const owl = new Character(this, relativeX(this, 0.75), relativeY(this, 0.3), 'owl', owlExpr);

    // Star rating
    const starRating = new StarRating(this, relativeX(this, 0.45), relativeY(this, 0.3), 3, 50);
    starRating.setScale(0);

    // Stats panel
    const correct = summary?.correctCount ?? 0;
    const total = summary?.totalQuestions ?? 0;
    const accuracy = summary ? Math.round(summary.accuracy) : 0;
    const statsText = this.add.text(
      relativeX(this, 0.5), relativeY(this, 0.48),
      `Correct: ${correct}/${total}    Accuracy: ${accuracy}%`,
      {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: `${scaleFont(22, this)}px`,
        color: '#FFF8DC',
        stroke: '#4a3210',
        strokeThickness: 2,
      }
    ).setOrigin(0.5).setAlpha(0);

    const owlMsg = stars === 3 ? 'Amazing, perfect score!' : stars >= 2 ? 'Great work, keep it up!' : 'Good try, you can do it!';

    // Buttons
    const quizData: QuizSceneData = { level: level ?? KumonLevel.LEVEL_7A, activityType: activityType ?? ActivityType.COUNTING, tier: tier ?? 1 };
    const btnY = relativeY(this, 0.72);
    const tryAgainBtn = new Button(this, relativeX(this, 0.25), btnY, 'Try Again',
      () => this.scene.start('QuizScene', quizData), { color: 'warning', width: 160, height: 56, fontSize: 20 });
    const continueBtn = new Button(this, relativeX(this, 0.5), btnY, 'Continue',
      () => this.scene.start('ClassroomScene'), { color: 'success', width: 160, height: 56, fontSize: 20 });
    const homeBtn = new Button(this, relativeX(this, 0.75), btnY, 'Home',
      () => this.scene.start('MenuScene'), { color: 'primary', width: 160, height: 56, fontSize: 20 });

    [tryAgainBtn, continueBtn, homeBtn].forEach(b => b.setScale(0));

    // Entrance animations
    this.tweens.add({ targets: header, alpha: 1, duration: 500 });
    this.tweens.add({
      targets: starRating, scaleX: 1, scaleY: 1, duration: 500, delay: 300, ease: 'Back.easeOut',
      onComplete: () => {
        starRating.setRating(stars, true);
        owl.say(owlMsg, 4000);
        if (stars === 3) owl.celebrate();
      },
    });
    this.tweens.add({ targets: statsText, alpha: 1, duration: 400, delay: 700 });
    this.tweens.add({ targets: [tryAgainBtn, continueBtn, homeBtn], scaleX: 1, scaleY: 1, duration: 400, delay: 900, ease: 'Back.easeOut' });

    // Level up/achievements banner
    const hasRewards = (this.sceneData.newAchievements?.length ?? 0) > 0 || this.sceneData.levelUp;
    if (hasRewards) {
      const banner = this.add.text(relativeX(this, 0.5), relativeY(this, 0.58), '\uD83C\uDF32 Level Up! New rewards!', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: `${scaleFont(26, this)}px`,
        color: '#ffd700',
        stroke: '#4a3210',
        strokeThickness: 2,
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: banner, alpha: 1, duration: 500, delay: 1200 });
      this.time.delayedCall(2500, () => {
        this.scene.start('RewardsScene', {
          newAchievements: this.sceneData.newAchievements ?? [],
          levelUp: this.sceneData.levelUp,
        });
      });
    }
  }

  shutdown(): void {
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}

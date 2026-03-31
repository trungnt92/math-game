import Phaser from 'phaser';
import { scaleFont } from '@/utils/responsive';
import type { AudioManager } from '@/utils/audio-manager';

function getAudio(scene: Phaser.Scene): AudioManager | undefined {
  return scene.registry.get('audioManager') as AudioManager | undefined;
}

function makeCircle(scene: Phaser.Scene, x: number, y: number, color: number, size: number): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const circle = scene.add.graphics();
  circle.fillStyle(color, 1);
  circle.fillCircle(0, 0, size);
  c.add(circle);
  return c;
}

export class FeedbackPopup {
  static showCorrect(scene: Phaser.Scene, x: number, y: number): void {
    const size = 48;
    const popup = makeCircle(scene, x, y, 0x4caf50, size);

    const check = scene.add.text(0, 0, '✓', {
      fontSize: `${scaleFont(36, scene)}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);
    popup.add(check);
    popup.setScale(0);
    popup.setDepth(100);

    getAudio(scene)?.playSfx(scene, 'sfx-correct');

    scene.tweens.add({
      targets: popup,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.time.delayedCall(1200, () => {
          scene.tweens.add({
            targets: popup,
            alpha: 0,
            duration: 300,
            onComplete: () => popup.destroy(),
          });
        });
      },
    });
  }

  static showIncorrect(scene: Phaser.Scene, x: number, y: number, correctAnswer: string): void {
    const size = 48;
    const popup = scene.add.container(x, y);
    popup.setDepth(100);

    const circle = scene.add.graphics();
    circle.fillStyle(0xf44336, 1);
    circle.fillCircle(0, 0, size);
    popup.add(circle);

    const xMark = scene.add.text(0, 0, '✗', {
      fontSize: `${scaleFont(36, scene)}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);
    popup.add(xMark);

    const answerLabel = scene.add.text(0, size + 20, `Answer: ${correctAnswer}`, {
      fontSize: `${scaleFont(18, scene)}px`,
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#333333',
      backgroundColor: '#ffffffcc',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0);
    popup.add(answerLabel);

    popup.setScale(0);
    getAudio(scene)?.playSfx(scene, 'sfx-wrong');
    scene.cameras.main.shake(100, 0.01);

    scene.tweens.add({
      targets: popup,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.time.delayedCall(2200, () => {
          scene.tweens.add({
            targets: popup,
            alpha: 0,
            duration: 300,
            onComplete: () => popup.destroy(),
          });
        });
      },
    });
  }

  static showEncouragement(scene: Phaser.Scene, x: number, y: number, message: string): void {
    const popup = scene.add.container(x, y);
    popup.setDepth(100);
    popup.setAlpha(0);

    const padding = 16;
    const maxW = 260;
    const tempText = scene.add.text(0, 0, message, {
      fontSize: `${scaleFont(20, scene)}px`,
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      wordWrap: { width: maxW },
    });
    const tw = tempText.width + padding * 2;
    const th = tempText.height + padding * 2;
    tempText.destroy();

    const bg = scene.add.graphics();
    bg.fillStyle(0x2196f3, 0.92);
    bg.fillRoundedRect(-tw / 2, -th / 2, tw, th, 14);
    popup.add(bg);

    const label = scene.add.text(0, 0, message, {
      fontSize: `${scaleFont(20, scene)}px`,
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      color: '#ffffff',
      wordWrap: { width: maxW },
      align: 'center',
    }).setOrigin(0.5, 0.5);
    popup.add(label);

    scene.tweens.add({
      targets: popup,
      alpha: 1,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        scene.time.delayedCall(1200, () => {
          scene.tweens.add({
            targets: popup,
            alpha: 0,
            duration: 400,
            onComplete: () => popup.destroy(),
          });
        });
      },
    });
  }
}

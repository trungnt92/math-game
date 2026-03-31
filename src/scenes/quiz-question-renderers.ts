import Phaser from 'phaser';
import { ActivityType } from '@/types/game-types';
import { relativeX, relativeY, scaleFont } from '@/utils/responsive';
import { spawnForestObjects, exitForestObjects, renderOnPanel } from '@/scenes/quiz-visuals';
import { VISUAL_OBJECTS, OBJECT_EMOJIS } from '@/data/levels';
import type { Question } from '@/types/game-types';

type GO = Phaser.GameObjects.GameObject;

function getItemForQuestion(q: Question): { key: string; emoji: string }[] {
  // Extract the specific object type from the question's visual data
  const icon = q.visualData.objects?.[0]?.icon ?? '\u2B50';
  // Find the matching key by emoji
  const matchKey = VISUAL_OBJECTS.find(k => OBJECT_EMOJIS[k] === icon) ?? VISUAL_OBJECTS[0];
  return [{ key: matchKey, emoji: icon }];
}

function promptStyle(scene: Phaser.Scene): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: `${scaleFont(26, scene)}px`,
    color: '#FFF8DC', stroke: '#4a3210', strokeThickness: 3,
    align: 'center',
  };
}

export function renderCounting(scene: Phaser.Scene, q: Question, out: GO[], onReady: () => void): void {
  const { width, height } = scene.cameras.main;
  const cx = relativeX(scene, 0.5);
  const cy = relativeY(scene, 0.5);
  const count = q.visualData.objects?.[0]?.count ?? 3;

  const objs = spawnForestObjects(scene, getItemForQuestion(q), count, cx, relativeY(scene, 0.4),
    { w: width * 0.65, h: height * 0.35 }, () => {
      const prompt = scene.add.text(cx, relativeY(scene, 0.68), q.prompt, {
        ...promptStyle(scene), wordWrap: { width: width * 0.7 },
      }).setOrigin(0.5).setAlpha(0);
      out.push(prompt);
      scene.tweens.add({ targets: prompt, alpha: 1, duration: 300 });
      onReady();
    });
  objs.forEach(o => out.push(o));
}

export function renderAddition(scene: Phaser.Scene, q: Question, out: GO[], onReady: () => void): void {
  const { width, height } = scene.cameras.main;
  const add1 = q.visualData.addend1 ?? 0;
  const add2 = q.visualData.addend2 ?? 0;
  const items = getItemForQuestion(q);
  const leftCx = relativeX(scene, 0.28);
  const rightCx = relativeX(scene, 0.72);
  const cy = relativeY(scene, 0.48);
  const area = { w: width * 0.28, h: height * 0.35 };

  const leftObjs = spawnForestObjects(scene, items, add1, leftCx, cy, area, () => {
    const plus = scene.add.text(relativeX(scene, 0.5), cy, '+', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: `${scaleFont(48, scene)}px`, color: '#FFF8DC', stroke: '#4a3210', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
    out.push(plus);
    scene.tweens.add({ targets: plus, alpha: 1, duration: 200 });

    const rightObjs = spawnForestObjects(scene, items, add2, rightCx, cy, area, () => {
      const eq = scene.add.text(relativeX(scene, 0.5), relativeY(scene, 0.75), '= ?', {
        fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
        fontSize: `${scaleFont(36, scene)}px`, color: '#FFF8DC', stroke: '#4a3210', strokeThickness: 3,
      }).setOrigin(0.5).setAlpha(0);
      out.push(eq);
      scene.tweens.add({ targets: eq, alpha: 1, duration: 200 });
      onReady();
    });
    rightObjs.forEach(o => out.push(o));
  });
  leftObjs.forEach(o => out.push(o));
}

export function renderSubtraction(scene: Phaser.Scene, q: Question, out: GO[], onReady: () => void): void {
  const { width, height } = scene.cameras.main;
  const total = q.visualData.addend1 ?? 0;
  const minus = q.visualData.addend2 ?? 0;
  const cx = relativeX(scene, 0.5);
  const cy = relativeY(scene, 0.48);

  const allObjs = spawnForestObjects(scene, getItemForQuestion(q), total, cx, cy,
    { w: width * 0.65, h: height * 0.35 }, () => {
      scene.time.delayedCall(400, () => {
        exitForestObjects(scene, allObjs, minus, () => {
          const leftTxt = scene.add.text(cx, relativeY(scene, 0.78), 'How many are left?', {
            ...promptStyle(scene), wordWrap: { width: width * 0.7 },
          }).setOrigin(0.5).setAlpha(0);
          out.push(leftTxt);
          scene.tweens.add({ targets: leftTxt, alpha: 1, duration: 300 });
          onReady();
        });
      });
    });
  allObjs.forEach(o => out.push(o));
}

export function renderPanel(scene: Phaser.Scene, q: Question, out: GO[], onReady: () => void): void {
  const { width } = scene.cameras.main;
  const cx = relativeX(scene, 0.5);
  const cy = relativeY(scene, 0.46);
  const panelObjs = renderOnPanel(scene, q, cx, cy);
  panelObjs.forEach(o => out.push(o));

  const prompt = scene.add.text(cx, relativeY(scene, 0.7), q.prompt, {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
    fontSize: `${scaleFont(22, scene)}px`,
    color: '#FFF8DC', stroke: '#4a3210', strokeThickness: 2,
    align: 'center', wordWrap: { width: width * 0.7 },
  }).setOrigin(0.5).setAlpha(0);
  out.push(prompt);
  scene.tweens.add({ targets: prompt, alpha: 1, duration: 300 });
  onReady();
}

export function renderQuestion(scene: Phaser.Scene, q: Question, out: GO[], onReady: () => void): void {
  switch (q.activityType) {
    case ActivityType.COUNTING:
      renderCounting(scene, q, out, onReady); break;
    case ActivityType.ADDITION:
      renderAddition(scene, q, out, onReady); break;
    case ActivityType.SUBTRACTION:
      renderSubtraction(scene, q, out, onReady); break;
    default:
      renderPanel(scene, q, out, onReady); break;
  }
}

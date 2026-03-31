import Phaser from 'phaser';
import { ActivityType } from '@/types/game-types';
import { scaleFont } from '@/utils/responsive';
import type { Question } from '@/types/game-types';

type GO = Phaser.GameObjects.GameObject;

export interface SpawnArea { w: number; h: number }

function ts(scene: Phaser.Scene, size: number, color = '#FFF8DC'): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: `${scaleFont(size, scene)}px`, color };
}

/** Spawn forest objects with staggered bounce-in animation */
export function spawnForestObjects(
  scene: Phaser.Scene,
  items: { key: string; emoji: string }[],
  count: number,
  centerX: number,
  centerY: number,
  area: SpawnArea,
  onComplete: () => void
): GO[] {
  const created: GO[] = [];
  const clamped = Math.min(count, 15);
  const item = items[0] ?? { key: 'butterfly', emoji: '\uD83E\uDD8B' };
  const imgKey = `math-${item.key}`;
  const hasTexture = scene.textures.exists(imgKey) && scene.textures.get(imgKey).key !== '__MISSING';

  // Calculate grid positions to avoid overlap
  const cols = clamped <= 3 ? clamped : clamped <= 6 ? 3 : clamped <= 9 ? 3 : 5;
  const rows = Math.ceil(clamped / cols);
  const cellW = area.w / cols;
  const cellH = area.h / rows;
  const targetSize = Math.min(110, cellW * 0.7, cellH * 0.7);

  for (let i = 0; i < clamped; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ox = centerX - area.w / 2 + cellW * (col + 0.5) + Phaser.Math.Between(-8, 8);
    const oy = centerY - area.h / 2 + cellH * (row + 0.5) + Phaser.Math.Between(-8, 8);
    let obj: GO;
    let targetScale = 1;

    if (hasTexture) {
      const img = scene.add.image(ox, oy, imgKey);
      targetScale = targetSize / Math.max(img.width, img.height);
      img.setScale(0);
      obj = img;
    } else {
      const sz = Math.min(56, targetSize * 0.6);
      const txt = scene.add.text(ox, oy, item.emoji, { fontSize: `${scaleFont(sz, scene)}px` }).setOrigin(0.5).setScale(0);
      obj = txt;
    }

    scene.tweens.add({
      targets: obj, scaleX: targetScale, scaleY: targetScale, duration: 350,
      delay: i * 250, ease: 'Back.easeOut',
      onComplete: i === clamped - 1 ? () => { scene.time.delayedCall(100, onComplete); } : undefined,
    });
    created.push(obj);
  }

  if (clamped === 0) scene.time.delayedCall(0, onComplete);
  return created;
}

/** Exit objects upward with stagger - for subtraction */
export function exitForestObjects(
  scene: Phaser.Scene,
  objects: GO[],
  count: number,
  onComplete: () => void
): void {
  const clamped = Math.min(count, objects.length);
  let completed = 0;
  for (let i = 0; i < clamped; i++) {
    const obj = objects[i] as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject;
    scene.tweens.add({
      targets: obj,
      y: (obj as any).y - 120,
      alpha: 0,
      duration: 400,
      delay: i * 150,
      ease: 'Quad.easeIn',
      onComplete: () => {
        completed++;
        if (completed === clamped) onComplete();
      },
    });
  }
  if (clamped === 0) scene.time.delayedCall(0, onComplete);
}

/** Render question on a wooden panel for non-counting types */
export function renderOnPanel(scene: Phaser.Scene, question: Question, cx: number, cy: number): GO[] {
  const items: GO[] = [];
  const pw = Math.min(700, scene.cameras.main.width * 0.7);
  const ph = 160;

  const panel = scene.add.graphics();
  panel.fillStyle(0x4a3210, 0.9);
  panel.lineStyle(4, 0x8b6914, 1);
  panel.fillRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 16);
  panel.strokeRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 16);
  // Wood grain
  panel.lineStyle(1, 0x6b4e0a, 0.4);
  for (let i = 0; i < 4; i++) {
    const gy = cy - ph / 2 + 20 + i * 36;
    panel.lineBetween(cx - pw / 2 + 16, gy, cx + pw / 2 - 16, gy);
  }
  items.push(panel);

  const displayText = buildDisplayText(question);
  const txt = scene.add.text(cx, cy, displayText, { ...ts(scene, 28), align: 'center', wordWrap: { width: pw - 40 } }).setOrigin(0.5);
  items.push(txt);

  return items;
}

function buildDisplayText(q: Question): string {
  const { activityType, visualData, prompt } = q;
  switch (activityType) {
    case ActivityType.SEQUENCING: {
      const nums = visualData.numbers ?? [];
      const blanks = visualData.blanks ?? [];
      return nums.map((n, i) => (blanks.includes(i) ? '__' : String(n))).join('  ,  ');
    }
    case ActivityType.COMPARISON:
      return `${visualData.leftGroup ?? 0}   vs   ${visualData.rightGroup ?? 0}`;
    case ActivityType.ADDITION:
      return `${visualData.addend1 ?? 0}  +  ${visualData.addend2 ?? 0}  =  ?`;
    case ActivityType.SUBTRACTION:
      return `${visualData.addend1 ?? 0}  \u2212  ${visualData.addend2 ?? 0}  =  ?`;
    case ActivityType.PATTERN: {
      const seq = visualData.patternSequence ?? [];
      return seq.map(s => (s === null ? '__' : s[0].toUpperCase())).join('  ');
    }
    case ActivityType.NUMBER_RECOGNITION:
      return visualData.type === 'number' ? String(visualData.numbers?.[0] ?? '') : prompt;
    default:
      return prompt;
  }
}

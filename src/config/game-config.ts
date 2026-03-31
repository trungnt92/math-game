import Phaser from 'phaser';
import { BootScene } from '@/scenes/boot-scene';
import { MenuScene } from '@/scenes/menu-scene';
import { ClassroomScene } from '@/scenes/classroom-scene';
import { QuizScene } from '@/scenes/quiz-scene';
import { ResultsScene } from '@/scenes/results-scene';
import { RewardsScene } from '@/scenes/rewards-scene';

// Base design resolution (4:3 for tablet-first)
// The game scales to fill any screen via FIT + autoCenter
const WIDTH = 1024;
const HEIGHT = 768;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#2d5a27',
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 480, height: 360 },
    max: { width: 2048, height: 1536 },
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [BootScene, MenuScene, ClassroomScene, QuizScene, ResultsScene, RewardsScene],
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
  input: {
    activePointers: 3,
  },
} as Phaser.Types.Core.GameConfig;

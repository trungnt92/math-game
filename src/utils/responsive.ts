import Phaser from 'phaser';

const DESIGN_WIDTH = 1024;
const DESIGN_HEIGHT = 768;

export function getCenter(scene: Phaser.Scene): { x: number; y: number } {
  return {
    x: scene.cameras.main.width / 2,
    y: scene.cameras.main.height / 2,
  };
}

export function getSize(scene: Phaser.Scene): { width: number; height: number } {
  return {
    width: scene.cameras.main.width,
    height: scene.cameras.main.height,
  };
}

export function scaleValue(base: number, scene: Phaser.Scene): number {
  const scaleX = scene.cameras.main.width / DESIGN_WIDTH;
  const scaleY = scene.cameras.main.height / DESIGN_HEIGHT;
  return base * Math.min(scaleX, scaleY);
}

export function scaleFont(baseSize: number, scene: Phaser.Scene): number {
  return Math.round(scaleValue(baseSize, scene));
}

export function getButtonSize(scene: Phaser.Scene): { width: number; height: number } {
  const w = Math.max(160, scaleValue(180, scene));
  const h = Math.max(60, scaleValue(64, scene));
  return { width: w, height: h };
}

export function isPortrait(scene: Phaser.Scene): boolean {
  return scene.cameras.main.height > scene.cameras.main.width;
}

export function relativeX(scene: Phaser.Scene, fraction: number): number {
  return scene.cameras.main.width * fraction;
}

export function relativeY(scene: Phaser.Scene, fraction: number): number {
  return scene.cameras.main.height * fraction;
}

import Phaser from 'phaser';
import { loadSettings, saveSettings } from '@/utils/storage';

export class AudioManager {
  private music: Phaser.Sound.BaseSound | null = null;
  private muted: boolean;
  private musicVolume: number;
  private sfxVolume: number;

  constructor() {
    const settings = loadSettings();
    this.muted = settings.muted;
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;
  }

  playMusic(scene: Phaser.Scene, key: string, loop = true): void {
    this.stopMusic();
    if (!scene.cache.audio.exists(key)) return;
    this.music = scene.sound.add(key, {
      volume: this.muted ? 0 : this.musicVolume,
      loop,
    });
    this.music.play();
  }

  stopMusic(): void {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = null;
    }
  }

  playSfx(scene: Phaser.Scene, key: string): void {
    if (this.muted || !scene.cache.audio.exists(key)) return;
    scene.sound.play(key, { volume: this.sfxVolume });
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.music) {
      (this.music as Phaser.Sound.WebAudioSound).setVolume(this.muted ? 0 : this.musicVolume);
    }
    this.persist();
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMusicVolume(vol: number): void {
    this.musicVolume = vol;
    if (this.music && !this.muted) {
      (this.music as Phaser.Sound.WebAudioSound).setVolume(vol);
    }
    this.persist();
  }

  private persist(): void {
    saveSettings({ musicVolume: this.musicVolume, sfxVolume: this.sfxVolume, muted: this.muted });
  }
}

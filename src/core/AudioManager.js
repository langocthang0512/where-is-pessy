import Phaser from "phaser";
import { Logger } from "../utils/logger.js";

class AudioManager {
  constructor() {
    this.scene = null;
    this.currentBgm = null;
    this.masterVolume = 1;
    this.bgmVolume = 0.7;
    this.sfxVolume = 0.85;
    this.muted = false;
  }

  setScene(scene) {
    this.scene = scene;
  }

  playBgm(key, config = {}) {
    if (!this.scene || this.muted) {
      return;
    }

    if (this.currentBgm?.key === key && this.currentBgm.isPlaying) {
      return;
    }

    this.fadeOutCurrentBgm(config.fadeDuration ?? 600);

    if (!this.scene.cache.audio.exists(key)) {
      Logger.warn("Asset Missing:", { type: "audio", key });
      return;
    }

    const targetVolume = (config.volume ?? this.bgmVolume) * this.masterVolume;
    this.currentBgm = this.scene.sound.add(key, {
      loop: true,
      volume: 0,
      ...config,
      volume: 0
    });
    this.currentBgm.play();
    this.scene.tweens.add({
      targets: this.currentBgm,
      volume: targetVolume,
      duration: config.fadeDuration ?? 600
    });
  }

  stopBgm(fadeDuration = 400) {
    this.fadeOutCurrentBgm(fadeDuration);
  }

  playSfx(key, config = {}) {
    if (!this.scene || this.muted) {
      return;
    }

    if (!this.scene.cache.audio.exists(key)) {
      Logger.warn("Asset Missing:", { type: "audio", key });
      return;
    }

    const targetVolume = (config.volume ?? this.sfxVolume) * this.masterVolume;
    this.scene.sound.play(key, {
      ...config,
      volume: targetVolume
    });
  }

  setMasterVolume(volume) {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);

    if (this.currentBgm) {
      this.currentBgm.setVolume(this.bgmVolume * this.masterVolume);
    }
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    this.scene?.sound.setMute(isMuted);
  }

  fadeOutCurrentBgm(duration) {
    if (!this.scene || !this.currentBgm) {
      return;
    }

    const bgm = this.currentBgm;
    this.currentBgm = null;

    this.scene.tweens.add({
      targets: bgm,
      volume: 0,
      duration,
      onComplete: () => {
        if (bgm.isPlaying) {
          bgm.stop();
        }
        bgm.destroy();
      }
    });
  }
}

export default new AudioManager();

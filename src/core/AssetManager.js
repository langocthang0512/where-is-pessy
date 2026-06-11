import { Logger } from "../utils/logger.js";

class AssetManager {
  constructor() {
    this.placeholderTextureKey = "asset_placeholder";
  }

  createPlaceholderTexture(scene) {
    if (scene.textures.exists(this.placeholderTextureKey)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x2b2d42, 1);
    graphics.fillRect(0, 0, 256, 256);
    graphics.lineStyle(8, 0xf2c14e, 1);
    graphics.strokeRect(4, 4, 248, 248);
    graphics.lineStyle(4, 0xe45a4f, 1);
    graphics.lineBetween(24, 24, 232, 232);
    graphics.lineBetween(232, 24, 24, 232);
    graphics.generateTexture(this.placeholderTextureKey, 256, 256);
    graphics.destroy();
  }

  safeTexture(scene, key) {
    if (scene.textures.exists(key)) {
      return key;
    }

    Logger.warn("Asset Missing:", { type: "texture", key });
    this.createPlaceholderTexture(scene);
    return this.placeholderTextureKey;
  }

  validateTexture(scene, key) {
    const exists = scene.textures.exists(key);

    if (!exists) {
      Logger.warn("Asset Missing:", { type: "texture", key });
    }

    return exists;
  }

  queueCriticalAssets(scene) {
    this.createPlaceholderTexture(scene);
    this.installLoadErrorHandler(scene);
    this.queueStoryImages(scene);
    this.queueAudio(scene);
  }

  installLoadErrorHandler(scene) {
    scene.load.off("loaderror");
    scene.load.on("loaderror", (file) => {
      Logger.warn("Asset Missing:", {
        type: file?.type ?? "unknown",
        key: file?.key ?? "unknown",
        url: file?.url ?? ""
      });
    });
  }

  queueStoryImages(scene) {
    const imageAssets = {
      character_cameldo: new URL("../../assets/characters/Cameldo.png", import.meta.url).href,
      character_pessy: new URL("../../assets/characters/Pessy.png", import.meta.url).href,
      character_dealer: new URL("../../assets/characters/Dealer.png", import.meta.url).href,
      dragon_king: new URL("../../assets/dragons/StarStripeDragon_PLACEHOLDER.png", import.meta.url).href
    };

    Object.entries(imageAssets).forEach(([key, url]) => {
      if (!scene.textures.exists(key)) {
        scene.load.image(key, url);
      }
    });
  }

  queueAudio(scene) {
    const audioAssets = {
      bgm_main_menu: new URL("../../assets/audio/bgm/main_menu.wav", import.meta.url).href,
      bgm_visual_novel: new URL("../../assets/audio/bgm/visual_novel.wav", import.meta.url).href,
      bgm_blackjack: new URL("../../assets/audio/bgm/blackjack.wav", import.meta.url).href,
      bgm_battle: new URL("../../assets/audio/bgm/battle.wav", import.meta.url).href,
      bgm_ending: new URL("../../assets/audio/bgm/ending.wav", import.meta.url).href,
      button_hover: new URL("../../assets/audio/sfx/button_hover.wav", import.meta.url).href,
      button_click: new URL("../../assets/audio/sfx/button_click.wav", import.meta.url).href,
      scene_transition: new URL("../../assets/audio/sfx/scene_transition.wav", import.meta.url).href
    };

    Object.entries(audioAssets).forEach(([key, url]) => {
      if (!scene.cache.audio.exists(key)) {
        scene.load.audio(key, url);
      }
    });
  }

}

export default new AssetManager();

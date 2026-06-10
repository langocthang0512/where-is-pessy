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
    this.createStoryTextures(scene);
  }

  createStoryTextures(scene) {
    this.createStickmanTexture(scene, "character_cameldo", 0x3d5a80, "7");
    this.createStickmanTexture(scene, "character_pessy", 0x7a9e7e, "10");
    this.createStickmanTexture(scene, "character_dealer", 0x8d5524, "$");
    this.createDragonTexture(scene, "dragon_king");
  }

  createStickmanTexture(scene, key, color, label) {
    if (scene.textures.exists(key)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.lineStyle(12, color, 1);
    graphics.strokeCircle(128, 72, 34);
    graphics.lineBetween(128, 106, 128, 218);
    graphics.lineBetween(128, 140, 70, 178);
    graphics.lineBetween(128, 140, 186, 178);
    graphics.lineBetween(128, 218, 82, 308);
    graphics.lineBetween(128, 218, 174, 308);
    graphics.fillStyle(0xfff7df, 1);
    graphics.fillCircle(116, 66, 5);
    graphics.fillCircle(140, 66, 5);
    graphics.generateTexture(key, 256, 340);
    graphics.destroy();

    const canvasTexture = scene.textures.get(key);
    const source = canvasTexture.getSourceImage();
    const context = source.getContext("2d");
    context.fillStyle = "#fff7df";
    context.font = "bold 38px Arial";
    context.textAlign = "center";
    context.fillText(label, 128, 180);
    canvasTexture.refresh();
  }

  createDragonTexture(scene, key) {
    if (scene.textures.exists(key)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x6a994e, 1);
    graphics.fillEllipse(230, 210, 280, 130);
    graphics.fillEllipse(112, 158, 118, 92);
    graphics.fillTriangle(172, 174, 258, 52, 302, 176);
    graphics.fillTriangle(238, 176, 388, 66, 374, 202);
    graphics.fillStyle(0xf2c14e, 1);
    graphics.fillTriangle(60, 100, 74, 48, 96, 104);
    graphics.fillTriangle(112, 88, 132, 34, 144, 100);
    graphics.fillStyle(0xfff7df, 1);
    graphics.fillCircle(88, 150, 9);
    graphics.fillStyle(0xe45a4f, 1);
    graphics.fillTriangle(40, 178, 8, 192, 42, 204);
    graphics.lineStyle(10, 0x386641, 1);
    graphics.lineBetween(358, 222, 456, 276);
    graphics.generateTexture(key, 512, 360);
    graphics.destroy();
  }
}

export default new AssetManager();

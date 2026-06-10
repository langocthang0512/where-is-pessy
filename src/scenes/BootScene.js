import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
import SceneManager from "../core/SceneManager.js";
import { COLORS, SCENE_KEYS, TRANSITIONS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create() {
    try {
      this.cameras.main.setBackgroundColor(COLORS.background);
      AssetManager.createPlaceholderTexture(this);
      SceneManager.changeScene(this, SCENE_KEYS.PRELOAD, {
        transition: TRANSITIONS.NONE
      });
    } catch (error) {
      Logger.error("Boot scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }
}

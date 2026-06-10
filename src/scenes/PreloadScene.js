import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
import AudioManager from "../core/AudioManager.js";
import SceneManager from "../core/SceneManager.js";
import { COLORS, FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PRELOAD);
  }

  preload() {
    try {
      this.cameras.main.setBackgroundColor(COLORS.background);
      this.createLoadingUI();
      AssetManager.queueCriticalAssets(this);
    } catch (error) {
      Logger.error("Preload setup failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  create() {
    try {
      AudioManager.setScene(this);
      SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU);
    } catch (error) {
      Logger.error("Preload scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  createLoadingUI() {
    const { width, height } = this.scale;
    const barWidth = 700;
    const barHeight = 34;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2;

    this.add.text(width / 2, barY - 90, "Loading...", {
      fontFamily: FONT_FAMILY,
      fontSize: "56px",
      color: COLORS.text
    }).setOrigin(0.5);

    const border = this.add.rectangle(width / 2, barY, barWidth, barHeight, COLORS.panelDark, 1);
    border.setStrokeStyle(4, COLORS.accent, 1);

    const progress = this.add.rectangle(barX, barY, 0, barHeight - 10, COLORS.accent, 1);
    progress.setOrigin(0, 0.5);

    const percentage = this.add.text(width / 2, barY + 72, "0%", {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: COLORS.text
    }).setOrigin(0.5);

    this.load.on("progress", (value) => {
      progress.width = (barWidth - 10) * value;
      percentage.setText(`${Math.round(value * 100)}%`);
    });
  }
}

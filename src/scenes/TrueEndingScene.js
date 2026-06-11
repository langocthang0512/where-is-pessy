import Phaser from "phaser";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import { SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class TrueEndingScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TRUE_ENDING);
  }

  create() {
    try {
      this.cameras.main.fadeIn(450, 23, 25, 35);
      this.cameras.main.setBackgroundColor(0x171923);

      GameManager.update({
        currentScene: this.scene.key,
        currentVN: "",
        currentFlowId: "",
        currentMinigame: "",
        endingUnlocked: true,
        trueEndingUnlocked: true
      });
      SaveManager.save({ currentScene: this.scene.key });

      this.time.delayedCall(120, () => {
        SceneManager.changeScene(this, SCENE_KEYS.CREDITS);
      });
    } catch (error) {
      Logger.error("True ending scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }
}

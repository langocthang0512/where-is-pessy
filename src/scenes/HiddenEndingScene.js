import Phaser from "phaser";
import AudioManager from "../core/AudioManager.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import { UIButton } from "../ui/UIButton.js";
import { FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class HiddenEndingScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.HIDDEN_ENDING);
  }

  create() {
    try {
      this.cameras.main.fadeIn(450, 23, 25, 35);
      this.cameras.main.setBackgroundColor(0x171923);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_ending");

      GameManager.update({
        currentScene: this.scene.key,
        currentVN: "",
        currentFlowId: "",
        currentMinigame: "",
        endingUnlocked: true,
        hiddenEndingUnlocked: true
      });
      SaveManager.save({ currentScene: this.scene.key });

      const { width, height } = this.scale;
      const graphics = this.add.graphics();
      graphics.fillStyle(0x000000, 1).fillRect(0, 0, width, height);

      this.add.text(width / 2, 320, "THE END", {
        fontFamily: FONT_FAMILY,
        fontSize: "124px",
        color: "#ffffff",
        align: "center"
      }).setOrigin(0.5);

      this.add.text(width / 2, 485, "This ending is sponsored by DRAGOLANDIA.", {
        fontFamily: FONT_FAMILY,
        fontSize: "46px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 1040 }
      }).setOrigin(0.5);

      new UIButton(this, width / 2 - 230, height - 210, 360, 74, "PLAY NOW", () => {
        window.open("https://dragonmanialegends.com/", "_blank", "noopener,noreferrer");
      });

      new UIButton(this, width / 2 + 230, height - 210, 420, 74, "RETURN TO TITLE", () => {
        SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU, { autoSave: true });
      });
    } catch (error) {
      Logger.error("Hidden ending scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }
}

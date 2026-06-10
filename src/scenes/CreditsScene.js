import Phaser from "phaser";
import SceneManager from "../core/SceneManager.js";
import { UIButton } from "../ui/UIButton.js";
import { COLORS, FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.CREDITS);
  }

  create() {
    try {
      this.cameras.main.fadeIn(350, 23, 25, 35);
      this.cameras.main.setBackgroundColor(COLORS.background);

      const { width, height } = this.scale;

      this.add.text(width / 2, 210, "Credits", {
        fontFamily: FONT_FAMILY,
        fontSize: "96px",
        color: COLORS.text
      }).setOrigin(0.5);

      this.add.text(width / 2, 390, "Credits content will be supplied with the story prompts.", {
        fontFamily: FONT_FAMILY,
        fontSize: "46px",
        color: COLORS.text,
        align: "center",
        wordWrap: { width: 980 }
      }).setOrigin(0.5);

      new UIButton(this, width / 2, height - 180, 360, 74, "Main Menu", () => {
        SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU);
      });
    } catch (error) {
      Logger.error("Credits scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }
}

import Phaser from "phaser";
import EventBus from "../core/EventBus.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import { UIButton } from "../ui/UIButton.js";
import { COLORS, EVENTS, FONT_FAMILY, SCENE_KEYS, TRANSITIONS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";
import gameConfig from "../data/gameConfig.json";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MAIN_MENU);
  }

  create() {
    try {
      this.cameras.main.fadeIn(350, 23, 25, 35);
      this.cameras.main.setBackgroundColor(COLORS.background);
      GameManager.setCurrentScene(SCENE_KEYS.MAIN_MENU);
      this.createTitle();
      this.createMenuButtons();
      this.createLanguageSelector();
      this.createVersion();
    } catch (error) {
      Logger.error("Main menu failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  createTitle() {
    const { width } = this.scale;

    this.add.text(width / 2, 180, gameConfig.title, {
      fontFamily: FONT_FAMILY,
      fontSize: "118px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);

    this.add.text(width / 2, 286, "A narrative game architecture shell", {
      fontFamily: FONT_FAMILY,
      fontSize: "40px",
      color: "#f2c14e",
      align: "center"
    }).setOrigin(0.5);
  }

  createMenuButtons() {
    const { width } = this.scale;
    const startY = 430;
    const spacing = 112;

    new UIButton(this, width / 2, startY, 460, 78, "Start The Journey", () => {
      GameManager.reset();
      SaveManager.save({
        currentScene: SCENE_KEYS.VN,
        currentVN: "VN_01"
      });
      SceneManager.changeScene(this, SCENE_KEYS.VN, {
        autoSave: true,
        data: { dialogueKey: "VN_01" }
      });
    });

    const continueButton = new UIButton(this, width / 2, startY + spacing, 460, 78, "Continue Journey", () => {
      const save = SaveManager.load();
      const targetScene = save?.currentScene || SCENE_KEYS.VN;
      SceneManager.changeScene(this, targetScene, {
        autoSave: true,
        data: {
          dialogueKey: save?.currentVN,
          flowId: save?.currentFlowId
        }
      });
    });
    continueButton.setVisible(SaveManager.hasSave());

    new UIButton(this, width / 2, startY + spacing * 2, 460, 78, "Credits", () => {
      SceneManager.changeScene(this, SCENE_KEYS.CREDITS);
    });
  }

  createLanguageSelector() {
    const { width } = this.scale;
    const state = GameManager.getState();
    const y = 820;

    this.add.text(width / 2, y - 56, "Language", {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: COLORS.text
    }).setOrigin(0.5);

    this.createLanguageOption(width / 2 - 90, y, "US", state.language === "US");
    this.createLanguageOption(width / 2 + 90, y, "UK", state.language === "UK");
  }

  createLanguageOption(x, y, language, isSelected) {
    const circle = this.add.circle(x - 44, y, 17, isSelected ? COLORS.accent : COLORS.panelDark, 1);
    circle.setStrokeStyle(3, COLORS.accent, 1);

    const label = this.add.text(x, y, language, {
      fontFamily: FONT_FAMILY,
      fontSize: "40px",
      color: COLORS.text
    }).setOrigin(0, 0.5);

    const hitArea = this.add.rectangle(x + 16, y, 120, 54, 0xffffff, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on("pointerdown", () => {
      GameManager.setLanguage(language);
      EventBus.emitEvent(EVENTS.LANGUAGE_CHANGED, { language });
      SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU, {
        transition: TRANSITIONS.NONE
      });
    });

    return { circle, label, hitArea };
  }

  createVersion() {
    const { width, height } = this.scale;

    this.add.text(width - 38, height - 34, `Version ${gameConfig.version}`, {
      fontFamily: FONT_FAMILY,
      fontSize: "32px",
      color: "#fff7df"
    }).setOrigin(1, 1);
  }
}

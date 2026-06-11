import Phaser from "phaser";
import AudioManager from "../core/AudioManager.js";
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
      this.cameras.main.setBackgroundColor(0xbde0fe);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_main_menu");
      GameManager.setCurrentScene(SCENE_KEYS.MAIN_MENU);
      this.drawBackground();
      this.createTitle();
      this.createMenuButtons();
      this.createLanguageSelector();
      this.createVersion();
    } catch (error) {
      Logger.error("Main menu failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  drawBackground() {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();

    graphics.fillStyle(0xbde0fe, 1).fillRect(0, 0, width, height);
    graphics.fillStyle(0xfff7df, 0.9).fillCircle(1520, 170, 92);
    graphics.fillStyle(0x95d5b2, 1).fillRect(0, 675, width, height - 675);
    graphics.fillStyle(0x78b56f, 1).fillEllipse(1340, 760, 620, 150);
    graphics.lineStyle(7, 0xfff7df, 0.5).strokeEllipse(1340, 760, 620, 150);
    graphics.fillStyle(0x6a994e, 1).fillEllipse(1340, 710, 300, 120);
    graphics.fillEllipse(1220, 670, 114, 88);
    graphics.fillTriangle(1290, 675, 1380, 545, 1420, 678);
    graphics.fillTriangle(1355, 680, 1505, 568, 1490, 705);
    graphics.fillStyle(0xf2c14e, 1);
    graphics.fillTriangle(1170, 615, 1188, 560, 1210, 620);
    graphics.fillTriangle(1220, 600, 1245, 545, 1254, 620);
    graphics.fillStyle(0xfff7df, 1).fillCircle(1200, 664, 9);
    graphics.lineStyle(10, 0x386641, 1).lineBetween(1485, 735, 1585, 785);
  }

  createTitle() {
    const { width } = this.scale;

    this.add.text(width / 2, 155, gameConfig.title, {
      fontFamily: FONT_FAMILY,
      fontSize: "118px",
      color: "#171923",
      align: "center"
    }).setOrigin(0.5);
  }

  createMenuButtons() {
    const menuX = 390;
    const startY = 360;
    const spacing = 104;

    new UIButton(this, menuX, startY, 460, 78, "Start The Journey", () => {
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

    const continueButton = new UIButton(this, menuX, startY + spacing, 460, 78, "Continue Journey", () => {
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

    new UIButton(this, menuX, startY + spacing * 2, 460, 78, "Credits", () => {
      SceneManager.changeScene(this, SCENE_KEYS.CREDITS);
    });
  }

  createLanguageSelector() {
    const state = GameManager.getState();
    const y = 700;

    this.add.text(390, y - 62, "Language", {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: "#171923"
    }).setOrigin(0.5);

    this.createLanguageOption(310, y, "US", state.language === "US");
    this.createLanguageOption(470, y, "UK", state.language === "UK");
  }

  createLanguageOption(x, y, language, isSelected) {
    const circle = this.add.circle(x - 44, y, 17, isSelected ? COLORS.accent : COLORS.panelDark, 1);
    circle.setStrokeStyle(3, COLORS.accent, 1);

    const label = this.add.text(x, y, language, {
      fontFamily: FONT_FAMILY,
      fontSize: "40px",
      color: "#171923"
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
      color: "#171923"
    }).setOrigin(1, 1);
  }
}

import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
import AudioManager from "../core/AudioManager.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import { UIButton } from "../ui/UIButton.js";
import { COLORS, FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";
import gameConfig from "../data/gameConfig.json";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MAIN_MENU);
    this.settingsPanel = null;
    this.cosmeticSettings = { audio: "ON", language: "US" };
  }

  create() {
    try {
      this.cameras.main.fadeIn(350, 23, 25, 35);
      this.cameras.main.setBackgroundColor(0xbde0fe);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_main_menu");
      GameManager.setCurrentScene(SCENE_KEYS.MAIN_MENU);
      this.cosmeticSettings = { audio: "ON", language: "US" };
      this.drawBackground();
      this.createTitle();
      this.createMenuButtons();
      this.createVersion();
    } catch (error) {
      Logger.error("Main menu failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  drawBackground() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, AssetManager.safeTexture(this, "background_main_menu"))
      .setDisplaySize(width, height)
      .setDepth(-100);
    this.add.rectangle(width / 2, height / 2, width, height, 0xfff7df, 0.08).setDepth(-90);
  }

  createTitle() {
    const { width } = this.scale;

    this.add.text(width / 2, 155, gameConfig.title, {
      fontFamily: FONT_FAMILY,
      fontSize: "126px",
      color: "#171923",
      align: "center",
      stroke: "#fff7df",
      strokeThickness: 10
    }).setOrigin(0.5);
  }

  createMenuButtons() {
    const menuX = this.scale.width / 2;
    const hasSave = SaveManager.hasSave();
    const labels = hasSave
      ? ["Start The Journey", "Continue Journey", "Game Settings", "Credits"]
      : ["Start The Journey", "Game Settings", "Credits"];
    const startY = hasSave ? 360 : 410;
    const spacing = 104;
    const actions = {
      "Start The Journey": () => this.startJourney(),
      "Continue Journey": () => this.continueJourney(),
      "Game Settings": () => this.showSettings(),
      Credits: () => SceneManager.changeScene(this, SCENE_KEYS.CREDITS)
    };

    labels.forEach((label, index) => {
      new UIButton(this, menuX, startY + index * spacing, 500, 78, label, actions[label]);
    });
  }

  startJourney() {
    GameManager.reset();
    SaveManager.save({
      currentScene: SCENE_KEYS.VN,
      currentVN: "VN_01"
    });
    SceneManager.changeScene(this, SCENE_KEYS.VN, {
      autoSave: true,
      data: { dialogueKey: "VN_01" }
    });
  }

  continueJourney() {
    const save = SaveManager.load();
    const targetScene = save?.currentScene || SCENE_KEYS.VN;
    SceneManager.changeScene(this, targetScene, {
      autoSave: true,
      data: {
        dialogueKey: save?.currentVN,
        flowId: save?.currentFlowId
      }
    });
  }

  showSettings() {
    this.settingsPanel?.destroy(true);
    const { width, height } = this.scale;
    const panel = this.add.container(width / 2, height / 2).setDepth(220);
    this.settingsPanel = panel;

    const shade = this.add.rectangle(0, 0, width, height, 0x171923, 0.72).setInteractive();
    const surface = this.add.rectangle(0, 0, 820, 650, 0xfff7df, 0.98).setStrokeStyle(6, COLORS.accentDark, 1);
    const title = this.add.text(0, -260, "Game Settings", {
      fontFamily: FONT_FAMILY,
      fontSize: "72px",
      color: "#171923"
    }).setOrigin(0.5);
    const audioTitle = this.add.text(-280, -135, "Audio", {
      fontFamily: FONT_FAMILY,
      fontSize: "48px",
      color: "#171923"
    }).setOrigin(0, 0.5);
    const languageTitle = this.add.text(-280, 80, "Language", {
      fontFamily: FONT_FAMILY,
      fontSize: "48px",
      color: "#171923"
    }).setOrigin(0, 0.5);
    const close = this.add.text(350, -270, "X", {
      fontFamily: FONT_FAMILY,
      fontSize: "64px",
      color: "#171923"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on("pointerdown", () => {
      panel.destroy(true);
      this.settingsPanel = null;
    });

    panel.add([shade, surface, title, audioTitle, languageTitle, close]);
    this.createSettingOption(panel, -240, -62, "audio", "ON", "ON");
    this.createSettingOption(panel, -20, -62, "audio", "OFF", "OFF (unplug your headphones)");
    this.createSettingOption(panel, -240, 155, "language", "US", "US");
    this.createSettingOption(panel, 30, 155, "language", "UK", "UK");
  }

  createSettingOption(panel, x, y, group, value, labelText) {
    const selected = this.cosmeticSettings[group] === value;
    const circle = this.add.circle(x, y, 17, selected ? COLORS.accent : 0xfff7df, 1).setStrokeStyle(4, COLORS.accentDark, 1);
    const label = this.add.text(x + 38, y, labelText, {
      fontFamily: FONT_FAMILY,
      fontSize: group === "audio" && value === "OFF" ? "32px" : "40px",
      color: "#171923"
    }).setOrigin(0, 0.5);
    const hitArea = this.add.rectangle(x + 115, y, value === "OFF" ? 410 : 190, 64, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    hitArea.on("pointerdown", () => {
      this.cosmeticSettings[group] = value;
      this.showSettings();
    });
    panel.add([circle, label, hitArea]);
  }

  createVersion() {
    const { width, height } = this.scale;

    this.add.text(width - 38, height - 34, `v${gameConfig.version}`, {
      fontFamily: FONT_FAMILY,
      fontSize: "32px",
      color: "#171923"
    }).setOrigin(1, 1);
  }
}

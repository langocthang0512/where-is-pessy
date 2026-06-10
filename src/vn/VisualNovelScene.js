import Phaser from "phaser";
import EventBus from "../core/EventBus.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import { DialogueBox } from "./DialogueBox.js";
import { CharacterLayer } from "./CharacterLayer.js";
import sceneFlow from "../data/sceneFlow.json";
import { DialogueDatabase } from "../data/DialogueDatabase.js";
import { BACKGROUNDS, SceneDatabase } from "../data/SceneDatabase.js";
import { UIButton } from "../ui/UIButton.js";
import { ChoiceMenu } from "../ui/ChoiceMenu.js";
import { COLORS, EVENTS, FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class VisualNovelScene extends Phaser.Scene {
  constructor(sceneKey = SCENE_KEYS.VN) {
    super(sceneKey);
    this.dialogueKey = "VN_01";
    this.currentIndex = 0;
    this.lines = [];
    this.autoMode = false;
    this.autoTimer = null;
    this.sceneConfig = null;
    this.choiceMenu = null;
    this.nextButton = null;
    this.isChoiceOpen = false;
  }

  init(data = {}) {
    this.dialogueKey = data.dialogueKey || GameManager.getState().currentVN || "VN_01";
    this.currentIndex = 0;
    this.lines = DialogueDatabase.getDialogue(this.dialogueKey);
    this.sceneConfig = SceneDatabase[this.dialogueKey] ?? null;
    this.isChoiceOpen = false;
  }

  create() {
    try {
      this.cameras.main.fadeIn(350, 23, 25, 35);
      this.cameras.main.setBackgroundColor(COLORS.background);
      GameManager.update({
        currentScene: this.scene.key,
        currentVN: this.dialogueKey
      });

      this.createLayers();
      this.createInputHandlers();
      this.renderCurrentLine();
    } catch (error) {
      Logger.error("VN scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  createLayers() {
    this.backgroundLayer = this.add.graphics();
    this.setBackground(this.sceneConfig?.background ?? BACKGROUNDS.FOOTBALL_FIELD);
    this.characterLayer = new CharacterLayer(this);
    this.applyInitialCharacters();
    this.dialogueBox = new DialogueBox(this);
    this.nextButton = new UIButton(this, this.scale.width - 270, this.scale.height - 74, 210, 58, "Next", () => {
      this.stopAutoMode();
      this.advanceDialogue();
    });
    this.choiceMenu = new ChoiceMenu(this);

    if (this.lines.length === 0) {
      this.add.text(this.scale.width / 2, 390, "VN data pending", {
        fontFamily: FONT_FAMILY,
        fontSize: "64px",
        color: "#f2c14e",
        align: "center"
      }).setOrigin(0.5);
    }
  }

  createInputHandlers() {
    this.input.on("pointerdown", () => {
      this.stopAutoMode();
    });

    this.input.keyboard.on("keydown-SPACE", () => this.handleAdvanceKey());
    this.input.keyboard.on("keydown-ENTER", () => this.handleAdvanceKey());
    this.input.keyboard.on("keydown-ESC", () => {
      this.stopAutoMode();
      SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU, { autoSave: true });
    });
    this.input.keyboard.on("keydown-CTRL", () => this.toggleAutoMode());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopAutoMode();
    });
  }

  handleAdvanceKey() {
    if (this.isChoiceOpen) {
      return;
    }

    this.stopAutoMode();
    this.advanceDialogue();
  }

  renderCurrentLine() {
    if (this.lines.length === 0) {
      this.dialogueBox.setLine({
        speaker: "",
        text: "Scenario files are ready. Narrative content will be added in a later phase."
      });
      this.dialogueBox.setPrompt("Menu");
      return;
    }

    const line = this.lines[this.currentIndex];
    this.characterLayer.applyLineDirectives(line);
    this.dialogueBox.setLine(line);
    this.dialogueBox.setPrompt(this.currentIndex >= this.lines.length - 1 ? "Finish" : "Next");
    this.nextButton.text.setText(this.currentIndex >= this.lines.length - 1 ? "Finish" : "Next");
  }

  advanceDialogue() {
    if (this.lines.length === 0) {
      SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU, { autoSave: true });
      return;
    }

    if (this.currentIndex >= this.lines.length - 1) {
      this.finishDialogue();
      return;
    }

    this.currentIndex += 1;
    this.renderCurrentLine();
  }

  finishDialogue() {
    SaveManager.save({
      currentScene: this.scene.key,
      currentVN: this.dialogueKey
    });
    EventBus.emitEvent(EVENTS.DIALOGUE_FINISHED, {
      dialogueKey: this.dialogueKey
    });

    if (this.sceneConfig?.choice) {
      this.showChoice();
      return;
    }

    SceneManager.changeToNextFromFlow(this, sceneFlow, this.dialogueKey, { autoSave: true });
  }

  showChoice() {
    this.stopAutoMode();
    this.isChoiceOpen = true;
    this.dialogueBox.setVisible(false);
    this.nextButton.setVisible(false);
    this.choiceMenu.show(this.sceneConfig.choice.choices, (choice) => {
      SaveManager.save({
        currentVN: this.dialogueKey,
        selectedChoice: choice.flowKey
      });
      SceneManager.changeToNextFromFlow(this, sceneFlow, choice.flowKey, { autoSave: true });
    });
  }

  toggleAutoMode() {
    if (this.autoMode) {
      this.stopAutoMode();
      return;
    }

    this.startAutoMode();
  }

  startAutoMode() {
    if (this.isChoiceOpen) {
      return;
    }

    this.autoMode = true;
    EventBus.emitEvent(EVENTS.AUTO_MODE_CHANGED, { enabled: true });
    this.autoTimer = this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => this.advanceDialogue()
    });
  }

  stopAutoMode() {
    if (!this.autoMode && !this.autoTimer) {
      return;
    }

    this.autoMode = false;
    this.autoTimer?.remove(false);
    this.autoTimer = null;
    EventBus.emitEvent(EVENTS.AUTO_MODE_CHANGED, { enabled: false });
  }

  setBackground(textureKey) {
    this.backgroundLayer.clear();
    const drawBackground = this.backgroundDrawers[textureKey] ?? this.backgroundDrawers.default;
    drawBackground.call(this);
  }

  applyInitialCharacters() {
    this.sceneConfig?.characters?.forEach((character) => {
      this.characterLayer.showCharacter(character.id, character.texture, character);
    });
  }

  get backgroundDrawers() {
    return {
      [BACKGROUNDS.FOOTBALL_FIELD]: this.drawFootballField,
      [BACKGROUNDS.OPEN_SKY]: this.drawOpenSky,
      [BACKGROUNDS.HARBOR]: this.drawHarbor,
      [BACKGROUNDS.CASINO]: this.drawCasino,
      [BACKGROUNDS.BLACKJACK_TABLE]: this.drawBlackjackTable,
      [BACKGROUNDS.FREEDUMB_LAND]: this.drawFreeDumbLand,
      [BACKGROUNDS.FIRST_FIGHT]: this.drawFirstFight,
      [BACKGROUNDS.DICE]: this.drawDice,
      [BACKGROUNDS.LAST_FIGHT]: this.drawLastFight,
      default: this.drawFootballField
    };
  }

  drawFootballField() {
    this.backgroundLayer.fillStyle(0x9bcf8d, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0x78b56f, 1).fillRect(0, 690, this.scale.width, 390);
    this.backgroundLayer.lineStyle(6, 0xfff7df, 0.75).strokeCircle(this.scale.width / 2, 760, 125);
    this.backgroundLayer.lineBetween(this.scale.width / 2, 690, this.scale.width / 2, 1080);
  }

  drawOpenSky() {
    this.backgroundLayer.fillStyle(0xa7d8ff, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0xfff7df, 0.9).fillCircle(300, 190, 90);
    this.backgroundLayer.fillCircle(1240, 170, 70);
    this.backgroundLayer.fillCircle(1320, 160, 88);
    this.backgroundLayer.fillStyle(0x8fcf88, 1).fillRect(0, 760, this.scale.width, 320);
  }

  drawHarbor() {
    this.backgroundLayer.fillStyle(0x9dd1f1, 1).fillRect(0, 0, this.scale.width, 520);
    this.backgroundLayer.fillStyle(0x4d96b8, 1).fillRect(0, 520, this.scale.width, 560);
    this.backgroundLayer.fillStyle(0x6b4f3f, 1).fillRect(0, 680, this.scale.width, 110);
    this.backgroundLayer.fillStyle(0xfff7df, 1).fillRect(760, 245, 400, 90);
    this.add.text(960, 290, "SHANGHAI BUND", {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: "#171923"
    }).setOrigin(0.5);
  }

  drawCasino() {
    this.backgroundLayer.fillStyle(0x2b2d42, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0x8d2440, 1).fillRect(0, 680, this.scale.width, 400);
    this.backgroundLayer.fillStyle(0xf2c14e, 0.9).fillCircle(960, 210, 92);
    this.backgroundLayer.lineStyle(8, 0xf2c14e, 1).strokeRect(560, 120, 800, 220);
  }

  drawBlackjackTable() {
    this.backgroundLayer.fillStyle(0x243b2f, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0x0f6b4f, 1).fillEllipse(960, 720, 1040, 340);
    this.backgroundLayer.lineStyle(8, 0xf2c14e, 1).strokeEllipse(960, 720, 1040, 340);
  }

  drawFreeDumbLand() {
    this.backgroundLayer.fillStyle(0xbde0fe, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0x95d5b2, 1).fillRect(0, 650, this.scale.width, 430);
    this.backgroundLayer.fillStyle(0xf2c14e, 1).fillRect(820, 260, 280, 280);
    this.backgroundLayer.lineStyle(6, 0x171923, 0.6).strokeRect(820, 260, 280, 280);
  }

  drawFirstFight() {
    this.backgroundLayer.fillStyle(0x566246, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0x3a3f30, 1).fillRect(0, 690, this.scale.width, 390);
    this.backgroundLayer.lineStyle(8, 0xfff7df, 0.5).strokeRect(300, 250, 1320, 550);
  }

  drawDice() {
    this.backgroundLayer.fillStyle(0x293241, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0xfff7df, 1).fillRoundedRect(860, 300, 150, 150, 18);
    this.backgroundLayer.fillRoundedRect(1040, 300, 150, 150, 18);
    this.backgroundLayer.fillStyle(0x171923, 1).fillCircle(900, 340, 12);
    this.backgroundLayer.fillCircle(970, 410, 12);
    this.backgroundLayer.fillCircle(1080, 340, 12);
    this.backgroundLayer.fillCircle(1150, 410, 12);
  }

  drawLastFight() {
    this.backgroundLayer.fillStyle(0x3c1642, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.backgroundLayer.fillStyle(0x1f1f29, 1).fillRect(0, 700, this.scale.width, 380);
    this.backgroundLayer.lineStyle(10, 0xe45a4f, 0.8).strokeCircle(960, 420, 230);
  }
}

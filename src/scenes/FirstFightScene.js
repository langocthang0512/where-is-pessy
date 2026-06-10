import Phaser from "phaser";
import AudioManager from "../core/AudioManager.js";
import EventBus from "../core/EventBus.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { FirstFightGame, FIRST_FIGHT_FLOW_IDS } from "../minigames/firstfight/FirstFightGame.js";
import { UIButton } from "../ui/UIButton.js";
import { COLORS, EVENTS, FONT_FAMILY, MINIGAME_KEYS, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class FirstFightScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.FIRST_FIGHT);
    this.flowId = "FIRST_FIGHT_TURN_1";
    this.game = null;
    this.slashButton = null;
    this.hitButton = null;
    this.playerSprite = null;
    this.dragonSprite = null;
    this.playerHpFill = null;
    this.dragonHpFill = null;
    this.isAnimating = false;
  }

  preload() {
    this.load.audio("first_fight_attack", new URL("../../assets/audio/sfx/first_fight_attack.wav", import.meta.url).href);
  }

  init(data = {}) {
    const savedFlowId = GameManager.getState().currentFlowId;
    this.flowId = data.flowId || (FIRST_FIGHT_FLOW_IDS.includes(savedFlowId) ? savedFlowId : "FIRST_FIGHT_TURN_1");
  }

  create() {
    try {
      this.cameras.main.fadeIn(250, 23, 25, 35);
      AudioManager.setScene(this);
      this.game = new FirstFightGame(this, this.flowId);

      GameManager.update({
        currentScene: this.scene.key,
        currentFlowId: this.flowId,
        currentMinigame: MINIGAME_KEYS.FIRST_FIGHT
      });
      SaveManager.save();

      this.drawBattlefield();
      this.createCharacters();
      this.createBattlePanels();
      this.createActionButtons();
      this.renderSnapshot(this.game.start());
    } catch (error) {
      Logger.error("First Fight scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  drawBattlefield() {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();

    graphics.fillStyle(0xbde0fe, 1).fillRect(0, 0, width, height);
    graphics.fillStyle(0x95d5b2, 1).fillRect(0, 560, width, 520);
    graphics.fillStyle(0x78b56f, 1).fillEllipse(520, 760, 520, 150);
    graphics.fillStyle(0x78b56f, 1).fillEllipse(1340, 470, 600, 170);
    graphics.lineStyle(7, 0xfff7df, 0.45).strokeEllipse(520, 760, 520, 150);
    graphics.lineStyle(7, 0xfff7df, 0.45).strokeEllipse(1340, 470, 600, 170);
  }

  createCharacters() {
    this.playerSprite = this.add.container(500, 680);
    const playerBody = this.add.graphics();
    playerBody.lineStyle(12, 0x3d5a80, 1);
    playerBody.strokeCircle(0, -90, 34);
    playerBody.lineBetween(0, -56, 0, 72);
    playerBody.lineBetween(0, -24, -58, 20);
    playerBody.lineBetween(0, -24, 58, 20);
    playerBody.lineBetween(0, 72, -48, 156);
    playerBody.lineBetween(0, 72, 48, 156);
    playerBody.fillStyle(0xfff7df, 1);
    playerBody.fillCircle(-12, -96, 5);
    playerBody.fillCircle(12, -96, 5);
    this.playerSprite.add(playerBody);

    this.dragonSprite = this.add.container(1340, 405);
    const dragonBody = this.add.graphics();
    dragonBody.fillStyle(0x6a994e, 1);
    dragonBody.fillEllipse(0, 30, 340, 150);
    dragonBody.fillEllipse(-140, -18, 136, 104);
    dragonBody.fillTriangle(-72, -6, 25, -145, 72, -8);
    dragonBody.fillTriangle(12, 0, 182, -120, 168, 38);
    dragonBody.fillStyle(0xf2c14e, 1);
    dragonBody.fillTriangle(-196, -74, -180, -142, -152, -68);
    dragonBody.fillTriangle(-140, -92, -112, -152, -104, -66);
    dragonBody.fillStyle(0xfff7df, 1);
    dragonBody.fillCircle(-168, -28, 10);
    dragonBody.lineStyle(12, 0x386641, 1);
    dragonBody.lineBetween(142, 54, 266, 112);
    this.dragonSprite.add(dragonBody);
  }

  createBattlePanels() {
    this.createNamePanel(180, 122, "Dragon King");
    this.dragonHpFill = this.createHpBar(400, 232);
    this.createNamePanel(1160, 720, "Cameldo");
    this.playerHpFill = this.createHpBar(1380, 830);
  }

  createNamePanel(x, y, name) {
    const panel = this.add.rectangle(x, y, 380, 82, COLORS.panel, 0.95);
    panel.setOrigin(0, 0.5);
    panel.setStrokeStyle(4, COLORS.accent, 1);
    this.add.text(x + 28, y, name, {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: COLORS.text
    }).setOrigin(0, 0.5);
  }

  createHpBar(x, y) {
    const width = 420;
    const height = 34;
    const back = this.add.rectangle(x, y, width, height, COLORS.panelDark, 1);
    back.setOrigin(0, 0.5);
    back.setStrokeStyle(3, 0x171923, 1);
    const fill = this.add.rectangle(x, y, width, height, COLORS.success, 1);
    fill.setOrigin(0, 0.5);
    return fill;
  }

  createActionButtons() {
    this.add.rectangle(this.scale.width / 2, 965, 900, 160, COLORS.panel, 0.96).setStrokeStyle(5, COLORS.accent, 1);
    this.slashButton = new UIButton(this, 760, 965, 260, 76, "Slash", () => this.handleAttack());
    this.hitButton = new UIButton(this, 1160, 965, 260, 76, "Hit", () => this.handleAttack());
  }

  renderSnapshot(snapshot) {
    this.playerHpFill.width = 420 * snapshot.playerHpPercent;
    this.dragonHpFill.width = 420 * snapshot.dragonHpPercent;
  }

  handleAttack() {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.setButtonsEnabled(false);
    const snapshot = this.game.attack();
    this.renderSnapshot(snapshot);
    AudioManager.playSfx("first_fight_attack");

    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 70,
      duration: 120,
      yoyo: true,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: this.dragonSprite,
      x: this.dragonSprite.x + 16,
      duration: 80,
      yoyo: true,
      repeat: 2,
      ease: "Sine.easeInOut"
    });

    this.showFloatingDamage(snapshot.damageText);
    EventBus.emitEvent(EVENTS.MINIGAME_COMPLETED, this.game.getResult());

    this.time.delayedCall(900, () => {
      this.finishTurn();
    });
  }

  showFloatingDamage(text) {
    const damageText = this.add.text(this.dragonSprite.x, this.dragonSprite.y - 180, text, {
      fontFamily: FONT_FAMILY,
      fontSize: "58px",
      color: "#ffef7a"
    }).setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 100,
      alpha: 0,
      duration: 650,
      ease: "Sine.easeOut",
      onComplete: () => damageText.destroy()
    });
  }

  setButtonsEnabled(isEnabled) {
    this.slashButton.container.disableInteractive();
    this.hitButton.container.disableInteractive();

    if (isEnabled) {
      this.slashButton.container.setInteractive({ useHandCursor: true });
      this.hitButton.container.setInteractive({ useHandCursor: true });
    }
  }

  finishTurn() {
    this.game.cleanup();
    SceneManager.changeToNextFromFlow(this, sceneFlow, this.flowId, { autoSave: true });
  }
}

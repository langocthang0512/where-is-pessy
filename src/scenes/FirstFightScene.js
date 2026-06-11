import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
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
    this.slashHitArea = null;
    this.hitHitArea = null;
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
      this.isAnimating = false;
      this.slashButton = null;
      this.hitButton = null;
      this.slashHitArea = null;
      this.hitHitArea = null;
      this.cameras.main.fadeIn(250, 23, 25, 35);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_battle");
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
      this.createInputFallbacks();
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
    playerBody.lineStyle(12, 0x171923, 1);
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
    const dragonBody = this.add.image(0, 0, AssetManager.safeTexture(this, "dragon_king"));
    dragonBody.setScale(0.86);
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
    this.slashHitArea = this.createAttackHitArea(760, 965, this.slashButton);
    this.hitHitArea = this.createAttackHitArea(1160, 965, this.hitButton);
  }

  createAttackHitArea(x, y, button) {
    const hitArea = this.add.rectangle(x, y, 320, 104, 0xffffff, 0.001).setDepth(20);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on("pointerover", () => button.setHover(true));
    hitArea.on("pointerout", () => button.setHover(false));
    hitArea.on("pointerdown", () => {
      button.setHover(false);
      this.handleAttack();
    });
    return hitArea;
  }

  createInputFallbacks() {
    this.input.off("pointerdown", this.handleActionPanelPointer, this);
    this.input.keyboard.off("keydown-SPACE", this.handleAttackKey, this);
    this.input.keyboard.off("keydown-ENTER", this.handleAttackKey, this);
    this.input.on("pointerdown", this.handleActionPanelPointer, this);
    this.input.keyboard.on("keydown-SPACE", this.handleAttackKey, this);
    this.input.keyboard.on("keydown-ENTER", this.handleAttackKey, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.handleActionPanelPointer, this);
      this.input.keyboard.off("keydown-SPACE", this.handleAttackKey, this);
      this.input.keyboard.off("keydown-ENTER", this.handleAttackKey, this);
    });
  }

  handleActionPanelPointer(pointer) {
    const isInsideActionPanel = pointer.x >= 510 && pointer.x <= 1410 && pointer.y >= 885 && pointer.y <= 1045;

    if (isInsideActionPanel) {
      this.handleAttack();
    }
  }

  handleAttackKey() {
    this.handleAttack();
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
    this.slashButton.setEnabled(isEnabled);
    this.hitButton.setEnabled(isEnabled);
    this.slashHitArea?.disableInteractive();
    this.hitHitArea?.disableInteractive();

    if (isEnabled) {
      this.slashHitArea?.setInteractive({ useHandCursor: true });
      this.hitHitArea?.setInteractive({ useHandCursor: true });
    }
  }

  finishTurn() {
    this.game.cleanup();
    SceneManager.changeToNextFromFlow(this, sceneFlow, this.flowId, { autoSave: true });
  }
}

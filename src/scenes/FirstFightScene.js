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
import { BattleHud } from "../ui/BattleHud.js";
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
    this.battleHud = null;
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
    this.add.image(width / 2, height / 2, AssetManager.safeTexture(this, "background_battle"))
      .setDisplaySize(width, height)
      .setDepth(-100);
  }

  createCharacters() {
    this.playerSprite = this.add.image(470, 600, AssetManager.safeTexture(this, "character_cameldo")).setScale(0.82);
    this.dragonSprite = this.add.image(1360, 410, AssetManager.safeTexture(this, "dragon_king")).setScale(0.76);
  }

  createBattlePanels() {
    this.battleHud = new BattleHud(this);
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
    this.battleHud.setPlayerPercent(snapshot.playerHpPercent);
    this.battleHud.setDragonPercent(snapshot.dragonHpPercent);
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

    this.time.delayedCall(1250, () => {
      this.finishTurn();
    });
  }

  showFloatingDamage(text) {
    const damageText = this.add.text(this.dragonSprite.x, this.dragonSprite.y - 180, text, {
      fontFamily: FONT_FAMILY,
      fontSize: "92px",
      color: "#ef4444",
      stroke: "#5c1111",
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 130,
      alpha: 0,
      duration: 1150,
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

import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
import AudioManager from "../core/AudioManager.js";
import EventBus from "../core/EventBus.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { LastFightGame, LAST_FIGHT_FLOW_IDS } from "../minigames/lastfight/LastFightGame.js";
import { BattleHud } from "../ui/BattleHud.js";
import { COLORS, EVENTS, FONT_FAMILY, MINIGAME_KEYS, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

const KEY_TO_ARROW = {
  ArrowUp: "UP",
  ArrowDown: "DOWN",
  ArrowLeft: "LEFT",
  ArrowRight: "RIGHT"
};

const ARROW_LABELS = {
  UP: "\u2191",
  DOWN: "\u2193",
  LEFT: "\u2190",
  RIGHT: "\u2192"
};

export class LastFightScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.LAST_FIGHT);
    this.flowId = "LAST_FIGHT_ROUND_1";
    this.game = null;
    this.playerSprite = null;
    this.dragonSprite = null;
    this.battleHud = null;
    this.sequenceTexts = [];
    this.messageText = null;
    this.countdownEvent = null;
    this.remainingTime = 0;
    this.isResolving = false;
  }

  preload() {
    this.load.audio("last_fight_correct", new URL("../../assets/audio/sfx/last_fight_correct.wav", import.meta.url).href);
    this.load.audio("last_fight_wrong", new URL("../../assets/audio/sfx/last_fight_wrong.wav", import.meta.url).href);
    this.load.audio("last_fight_complete", new URL("../../assets/audio/sfx/last_fight_complete.wav", import.meta.url).href);
  }

  init(data = {}) {
    const savedFlowId = GameManager.getState().currentFlowId;
    this.flowId = data.flowId || (LAST_FIGHT_FLOW_IDS.includes(savedFlowId) ? savedFlowId : "LAST_FIGHT_ROUND_1");
  }

  create() {
    try {
      this.sequenceTexts = [];
      this.countdownEvent = null;
      this.remainingTime = 0;
      this.isResolving = false;
      this.cameras.main.fadeIn(250, 23, 25, 35);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_battle");
      this.game = new LastFightGame(this, this.flowId);

      GameManager.update({
        currentScene: this.scene.key,
        currentFlowId: this.flowId,
        currentMinigame: MINIGAME_KEYS.LAST_FIGHT
      });
      SaveManager.save();

      this.drawBattlefield();
      this.createCharacters();
      this.createBattlePanels();
      this.createRhythmUi();
      this.createInputHandlers();
      this.startAttempt();
    } catch (error) {
      Logger.error("Last Fight scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  drawBattlefield() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, AssetManager.safeTexture(this, "background_battle"))
      .setDisplaySize(width, height)
      .setDepth(-100);
    this.add.rectangle(width / 2, height / 2, width, height, 0x29162f, 0.18).setDepth(-90);
  }

  createCharacters() {
    this.playerSprite = this.add.image(470, 600, AssetManager.safeTexture(this, "character_cameldo")).setScale(0.82);
    this.dragonSprite = this.add.image(1360, 410, AssetManager.safeTexture(this, "dragon_king")).setScale(0.76);
  }

  createBattlePanels() {
    this.battleHud = new BattleHud(this);
  }

  createRhythmUi() {
    this.add.rectangle(this.scale.width / 2, 940, 1060, 210, COLORS.panel, 0.96).setStrokeStyle(5, COLORS.accent, 1);
    this.add.text(this.scale.width / 2, 852, "FOLLOW THE SEQUENCE", {
      fontFamily: FONT_FAMILY,
      fontSize: "34px",
      color: "#f8d568"
    }).setOrigin(0.5);
    this.messageText = this.add.text(this.scale.width / 2, 1030, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "52px",
      color: COLORS.text
    }).setOrigin(0.5);
  }

  createInputHandlers() {
    this.input.keyboard.on("keydown", (event) => {
      if (!KEY_TO_ARROW[event.key] || this.isResolving) {
        return;
      }

      this.handleArrowInput(KEY_TO_ARROW[event.key]);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopTimer();
    });
  }

  startAttempt() {
    this.isResolving = false;
    const snapshot = this.game.start();
    this.renderSnapshot(snapshot);
    this.renderSequence(snapshot);
    this.startTimer(snapshot.timeLimit);
    this.messageText.setText("");
  }

  restartAttempt() {
    this.isResolving = false;
    const snapshot = this.game.resetAttempt();
    this.renderSnapshot(snapshot);
    this.renderSequence(snapshot);
    this.startTimer(snapshot.timeLimit);
  }

  startTimer(seconds) {
    this.stopTimer();
    this.remainingTime = seconds;
    this.updateTimerText();
    this.countdownEvent = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        this.remainingTime = Math.max(0, this.remainingTime - 0.1);
        this.updateTimerText();

        if (this.remainingTime <= 0) {
          this.handleFailure();
        }
      }
    });
  }

  stopTimer() {
    this.countdownEvent?.remove(false);
    this.countdownEvent = null;
  }

  updateTimerText() {
    // The time limit remains active but is intentionally hidden for presentation.
  }

  renderSnapshot(snapshot) {
    this.battleHud.setPlayerPercent(snapshot.playerHpPercent);
    this.battleHud.setDragonPercent(snapshot.dragonHpPercent);
  }

  renderSequence(snapshot) {
    this.sequenceTexts.forEach((text) => text.destroy());
    this.sequenceTexts = snapshot.sequence.map((arrow, index) => {
      const item = this.add.text(760 + index * 100, 930, ARROW_LABELS[arrow], {
        fontFamily: FONT_FAMILY,
        fontSize: "66px",
        color: index < snapshot.inputIndex ? "#5fbf77" : COLORS.text
      }).setOrigin(0.5);
      return item;
    });
  }

  handleArrowInput(inputName) {
    const snapshot = this.game.handleInput(inputName);

    if (snapshot.inputResult === "wrong") {
      this.handleFailure();
      return;
    }

    if (snapshot.inputResult === "correct") {
      AudioManager.playSfx("last_fight_correct");
      this.renderSequence(snapshot);
      return;
    }

    if (snapshot.inputResult === "complete") {
      this.handleSuccess(snapshot);
    }
  }

  handleFailure() {
    if (this.isResolving) {
      return;
    }

    this.isResolving = true;
    this.stopTimer();
    AudioManager.playSfx("last_fight_wrong");
    this.messageText.setColor("#e45a4f");
    this.messageText.setText("TRY AGAIN");
    this.time.delayedCall(750, () => {
      this.messageText.setColor(COLORS.text);
      this.restartAttempt();
    });
  }

  handleSuccess(snapshot) {
    this.isResolving = true;
    this.stopTimer();
    AudioManager.playSfx("last_fight_complete");
    EventBus.emitEvent(EVENTS.MINIGAME_COMPLETED, this.game.getResult());
    this.renderSnapshot(snapshot);
    this.renderSequence(snapshot);
    this.messageText.setColor("#5fbf77");
    this.messageText.setText("SUCCESS");
    this.showFloatingDamage(snapshot.damageText);
    this.time.delayedCall(1450, () => {
      this.game.cleanup();
      SceneManager.changeToNextFromFlow(this, sceneFlow, this.flowId, { autoSave: true });
    });
  }

  showFloatingDamage(text) {
    const damageText = this.add.text(this.dragonSprite.x, this.dragonSprite.y - 190, text, {
      fontFamily: FONT_FAMILY,
      fontSize: "108px",
      color: "#ef4444",
      stroke: "#5c1111",
      strokeThickness: 10
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 150,
      alpha: 0,
      duration: 1300,
      ease: "Sine.easeOut",
      onComplete: () => damageText.destroy()
    });
  }
}

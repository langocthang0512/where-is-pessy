import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
import AudioManager from "../core/AudioManager.js";
import EventBus from "../core/EventBus.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { LastFightGame, LAST_FIGHT_FLOW_IDS } from "../minigames/lastfight/LastFightGame.js";
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
    this.playerHpFill = null;
    this.dragonHpFill = null;
    this.sequenceTexts = [];
    this.timerText = null;
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
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3c1642, 1).fillRect(0, 0, width, height);
    graphics.fillStyle(0x4b2f54, 1).fillRect(0, 560, width, 520);
    graphics.fillStyle(0x23172b, 1).fillEllipse(520, 760, 520, 150);
    graphics.fillStyle(0x23172b, 1).fillEllipse(1340, 470, 600, 170);
    graphics.lineStyle(7, 0xe45a4f, 0.5).strokeEllipse(520, 760, 520, 150);
    graphics.lineStyle(7, 0xe45a4f, 0.5).strokeEllipse(1340, 470, 600, 170);
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

  createRhythmUi() {
    this.add.rectangle(this.scale.width / 2, 940, 1120, 210, COLORS.panel, 0.96).setStrokeStyle(5, COLORS.accent, 1);
    this.timerText = this.add.text(480, 860, "0.0", {
      fontFamily: FONT_FAMILY,
      fontSize: "58px",
      color: COLORS.text
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
    this.timerText.setText(this.remainingTime.toFixed(1));
  }

  renderSnapshot(snapshot) {
    this.playerHpFill.width = 420 * snapshot.playerHpPercent;
    this.dragonHpFill.width = 420 * snapshot.dragonHpPercent;
  }

  renderSequence(snapshot) {
    this.sequenceTexts.forEach((text) => text.destroy());
    this.sequenceTexts = snapshot.sequence.map((arrow, index) => {
      const item = this.add.text(760 + index * 100, 910, ARROW_LABELS[arrow], {
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
      this.cameras.main.flash(90, 95, 191, 119);
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
    this.cameras.main.flash(140, 228, 90, 79);
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
    this.cameras.main.flash(220, 242, 193, 78);
    this.time.delayedCall(950, () => {
      this.game.cleanup();
      SceneManager.changeToNextFromFlow(this, sceneFlow, this.flowId, { autoSave: true });
    });
  }

  showFloatingDamage(text) {
    const damageText = this.add.text(this.dragonSprite.x, this.dragonSprite.y - 190, text, {
      fontFamily: FONT_FAMILY,
      fontSize: "72px",
      color: "#e45a4f"
    }).setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 120,
      alpha: 0,
      duration: 800,
      ease: "Sine.easeOut",
      onComplete: () => damageText.destroy()
    });
  }
}

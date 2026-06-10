import Phaser from "phaser";
import AudioManager from "../core/AudioManager.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { RollDiceGame, ROLL_DICE_FLOW_IDS } from "../minigames/rolldice/RollDiceGame.js";
import { UIButton } from "../ui/UIButton.js";
import { COLORS, FONT_FAMILY, MINIGAME_KEYS, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class RollDiceScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.ROLL_DICE);
    this.flowId = "ROLL_DICE_1";
    this.game = null;
    this.rollButton = null;
    this.leftDie = null;
    this.rightDie = null;
    this.isRolling = false;
  }

  preload() {
    this.load.audio("dice_roll", new URL("../../assets/audio/sfx/dice_roll.wav", import.meta.url).href);
    this.load.audio("dice_stop", new URL("../../assets/audio/sfx/dice_stop.wav", import.meta.url).href);
  }

  init(data = {}) {
    const savedFlowId = GameManager.getState().currentFlowId;
    this.flowId = data.flowId || (ROLL_DICE_FLOW_IDS.includes(savedFlowId) ? savedFlowId : "ROLL_DICE_1");
  }

  create() {
    try {
      this.cameras.main.fadeIn(250, 23, 25, 35);
      AudioManager.setScene(this);
      this.game = new RollDiceGame(this, this.flowId);
      GameManager.update({
        currentScene: this.scene.key,
        currentFlowId: this.flowId,
        currentMinigame: MINIGAME_KEYS.ROLL_DICE
      });
      SaveManager.save();

      this.drawTabletop();
      this.createDice();
      this.createControls();
      this.renderSnapshot(this.game.start());
    } catch (error) {
      Logger.error("Roll Dice scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }

  drawTabletop() {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    graphics.fillStyle(0x5a3520, 1).fillRect(0, 0, width, height);
    graphics.fillStyle(0x7a4a2d, 1).fillRoundedRect(260, 120, width - 520, height - 240, 32);
    graphics.lineStyle(8, 0xf2c14e, 0.55).strokeRoundedRect(260, 120, width - 520, height - 240, 32);
    graphics.fillStyle(0x3f2416, 0.28).fillEllipse(width / 2, 530, 860, 260);

    this.add.text(width / 2, 130, this.flowId === "ROLL_DICE_1" ? "Roll Dice 1" : "Roll Dice 2", {
      fontFamily: FONT_FAMILY,
      fontSize: "72px",
      color: COLORS.text
    }).setOrigin(0.5);
  }

  createDice() {
    this.leftDie = this.createDie(760, 500);
    this.rightDie = this.createDie(1160, 500);
  }

  createDie(x, y) {
    const container = this.add.container(x, y);
    const body = this.add.rectangle(0, 0, 210, 210, 0xfff7df, 1);
    body.setStrokeStyle(6, 0x171923, 1);
    container.add(body);
    container.setData("pips", []);
    return container;
  }

  createControls() {
    this.rollButton = new UIButton(this, this.scale.width / 2, 900, 300, 82, "ROLL", () => {
      this.handleRoll();
    });
  }

  handleRoll() {
    if (this.isRolling) {
      return;
    }

    this.isRolling = true;
    this.rollButton.setVisible(false);
    AudioManager.playSfx("dice_roll");

    const rollEvent = this.time.addEvent({
      delay: 100,
      repeat: 8,
      callback: () => {
        const step = rollEvent.repeatCount;
        this.renderDice([(step % 6) + 1, ((step + 3) % 6) + 1]);
        this.leftDie.angle = step % 2 === 0 ? -8 : 8;
        this.rightDie.angle = step % 2 === 0 ? 8 : -8;
      }
    });

    this.time.delayedCall(1000, () => {
      const snapshot = this.game.roll();
      this.leftDie.angle = 0;
      this.rightDie.angle = 0;
      this.renderSnapshot(snapshot);
      AudioManager.playSfx("dice_stop");
      this.cameras.main.flash(180, 242, 193, 78);
      this.time.delayedCall(550, () => this.finishRoll());
    });
  }

  renderSnapshot(snapshot) {
    this.renderDice(snapshot.dice);
  }

  renderDice(values) {
    this.renderDie(this.leftDie, values[0]);
    this.renderDie(this.rightDie, values[1]);
  }

  renderDie(container, value) {
    container.getData("pips").forEach((pip) => pip.destroy());

    const positions = {
      1: [[0, 0]],
      2: [[-54, -54], [54, 54]],
      3: [[-54, -54], [0, 0], [54, 54]],
      4: [[-54, -54], [54, -54], [-54, 54], [54, 54]],
      5: [[-54, -54], [54, -54], [0, 0], [-54, 54], [54, 54]],
      6: [[-54, -62], [54, -62], [-54, 0], [54, 0], [-54, 62], [54, 62]]
    };

    const pips = positions[value].map(([x, y]) => {
      const pip = this.add.circle(x, y, 14, 0x171923, 1);
      container.add(pip);
      return pip;
    });

    container.setData("pips", pips);
  }

  finishRoll() {
    this.game.cleanup();
    SceneManager.changeToNextFromFlow(this, sceneFlow, this.flowId, { autoSave: true });
  }
}

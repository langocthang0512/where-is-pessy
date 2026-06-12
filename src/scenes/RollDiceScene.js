import Phaser from "phaser";
import AssetManager from "../core/AssetManager.js";
import AudioManager from "../core/AudioManager.js";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { RollDiceGame, ROLL_DICE_FLOW_IDS } from "../minigames/rolldice/RollDiceGame.js";
import { UIButton } from "../ui/UIButton.js";
import { MINIGAME_KEYS, SCENE_KEYS } from "../utils/constants.js";
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
      this.isRolling = false;
      this.rollButton = null;
      this.leftDie = null;
      this.rightDie = null;
      this.cameras.main.fadeIn(250, 23, 25, 35);
      AudioManager.setScene(this);
      AudioManager.playBgm("bgm_blackjack", { volume: 0.52 });
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
    this.add.image(width / 2, height / 2, AssetManager.safeTexture(this, "background_dice_table"))
      .setDisplaySize(width, height)
      .setDepth(-100);
    this.add.rectangle(width / 2, height / 2, width, height, 0x2f1b12, 0.08).setDepth(-90);

  }

  createDice() {
    this.leftDie = this.createDie(740, 485);
    this.rightDie = this.createDie(1180, 485);
  }

  createDie(x, y) {
    const container = this.add.container(x, y);
    const shadow = this.add.rectangle(12, 14, 248, 248, 0x171923, 0.38);
    const body = this.add.rectangle(0, 0, 248, 248, 0xfff7df, 1);
    body.setStrokeStyle(7, 0x171923, 1);
    container.add([shadow, body]);
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
      2: [[-64, -64], [64, 64]],
      3: [[-64, -64], [0, 0], [64, 64]],
      4: [[-64, -64], [64, -64], [-64, 64], [64, 64]],
      5: [[-64, -64], [64, -64], [0, 0], [-64, 64], [64, 64]],
      6: [[-64, -74], [64, -74], [-64, 0], [64, 0], [-64, 74], [64, 74]]
    };

    const pips = positions[value].map(([x, y]) => {
      const pip = this.add.circle(x, y, 17, 0x171923, 1);
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

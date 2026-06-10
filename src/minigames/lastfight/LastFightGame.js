import GameManager from "../../core/GameManager.js";
import SaveManager from "../../core/SaveManager.js";
import { MinigameBase } from "../MinigameBase.js";
import { MINIGAME_KEYS } from "../../utils/constants.js";

const LAST_FIGHT_ROUNDS = {
  LAST_FIGHT_ROUND_1: {
    roundNumber: 1,
    timeLimit: 6,
    startHpPercent: 1,
    successHpPercent: 0.66,
    sequence: ["UP", "LEFT", "RIGHT", "DOWN", "UP"]
  },
  LAST_FIGHT_ROUND_2: {
    roundNumber: 2,
    timeLimit: 4,
    startHpPercent: 0.66,
    successHpPercent: 0.33,
    sequence: ["LEFT", "DOWN", "RIGHT", "UP", "LEFT"]
  },
  LAST_FIGHT_ROUND_3: {
    roundNumber: 3,
    timeLimit: 2,
    startHpPercent: 0.33,
    successHpPercent: 0,
    sequence: ["RIGHT", "UP", "DOWN", "LEFT", "RIGHT"]
  }
};

export class LastFightGame extends MinigameBase {
  constructor(scene, flowId) {
    super(scene, MINIGAME_KEYS.LAST_FIGHT);
    this.flowId = flowId;
    this.roundConfig = LAST_FIGHT_ROUNDS[flowId] ?? LAST_FIGHT_ROUNDS.LAST_FIGHT_ROUND_1;
    this.inputIndex = 0;
    this.dragonHpPercent = this.roundConfig.startHpPercent;
    this.isComplete = false;
  }

  start() {
    super.start();
    GameManager.update({
      currentMinigame: MINIGAME_KEYS.LAST_FIGHT,
      currentFlowId: this.flowId
    });
    SaveManager.save();

    return this.getSnapshot();
  }

  handleInput(inputName) {
    if (this.isComplete) {
      return {
        ...this.getSnapshot(),
        inputResult: "ignored"
      };
    }

    if (this.roundConfig.sequence[this.inputIndex] !== inputName) {
      return {
        ...this.getSnapshot(),
        inputResult: "wrong"
      };
    }

    this.inputIndex += 1;

    if (this.inputIndex >= this.roundConfig.sequence.length) {
      this.isComplete = true;
      this.dragonHpPercent = this.roundConfig.successHpPercent;
      GameManager.update({
        fightProgress: this.roundConfig.roundNumber,
        lastFightRoundsCompleted: this.roundConfig.roundNumber,
        currentMinigameResult: this.getResult()
      });
      SaveManager.save();

      return {
        ...this.getSnapshot(),
        inputResult: "complete"
      };
    }

    return {
      ...this.getSnapshot(),
      inputResult: "correct"
    };
  }

  resetAttempt() {
    this.inputIndex = 0;
    this.isComplete = false;
    this.dragonHpPercent = this.roundConfig.startHpPercent;
    return this.getSnapshot();
  }

  getResult() {
    return {
      success: true
    };
  }

  getSnapshot() {
    return {
      roundNumber: this.roundConfig.roundNumber,
      timeLimit: this.roundConfig.timeLimit,
      sequence: [...this.roundConfig.sequence],
      inputIndex: this.inputIndex,
      dragonHpPercent: this.dragonHpPercent,
      playerHpPercent: 1,
      isComplete: this.isComplete,
      damageText: "-8008"
    };
  }
}

export const LAST_FIGHT_FLOW_IDS = Object.keys(LAST_FIGHT_ROUNDS);

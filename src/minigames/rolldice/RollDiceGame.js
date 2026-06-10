import EventBus from "../../core/EventBus.js";
import GameManager from "../../core/GameManager.js";
import SaveManager from "../../core/SaveManager.js";
import { MinigameBase } from "../MinigameBase.js";
import { EVENTS, MINIGAME_KEYS } from "../../utils/constants.js";

const ROLL_RESULTS = {
  ROLL_DICE_1: [3, 6],
  ROLL_DICE_2: [6, 6]
};

export class RollDiceGame extends MinigameBase {
  constructor(scene, flowId) {
    super(scene, MINIGAME_KEYS.ROLL_DICE);
    this.flowId = flowId;
    this.currentDice = [1, 1];
    this.isComplete = false;
  }

  start() {
    super.start();
    GameManager.update({
      currentMinigame: MINIGAME_KEYS.ROLL_DICE,
      currentFlowId: this.flowId
    });
    SaveManager.save();

    return this.getSnapshot();
  }

  roll() {
    if (this.isComplete) {
      return this.getSnapshot();
    }

    this.currentDice = ROLL_RESULTS[this.flowId] ?? ROLL_RESULTS.ROLL_DICE_1;
    this.isComplete = true;
    const diceProgress = this.flowId === "ROLL_DICE_2" ? 2 : 1;
    GameManager.update({
      diceRollCount: diceProgress,
      diceProgress,
      currentMinigameResult: this.getResult()
    });
    SaveManager.save();
    EventBus.emitEvent(EVENTS.DICE_FINISHED, {
      flowId: this.flowId,
      result: [...this.currentDice]
    });

    return this.getSnapshot();
  }

  getResult() {
    return {
      success: true
    };
  }

  getSnapshot() {
    return {
      dice: [...this.currentDice],
      isComplete: this.isComplete
    };
  }
}

export const ROLL_DICE_FLOW_IDS = Object.keys(ROLL_RESULTS);

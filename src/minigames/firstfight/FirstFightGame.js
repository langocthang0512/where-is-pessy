import GameManager from "../../core/GameManager.js";
import SaveManager from "../../core/SaveManager.js";
import { MinigameBase } from "../MinigameBase.js";
import { MINIGAME_KEYS } from "../../utils/constants.js";

const FIRST_FIGHT_TURNS = {
  FIRST_FIGHT_TURN_1: 1,
  FIRST_FIGHT_TURN_2: 2
};

export class FirstFightGame extends MinigameBase {
  constructor(scene, flowId) {
    super(scene, MINIGAME_KEYS.FIRST_FIGHT);
    this.flowId = flowId;
    this.turnNumber = FIRST_FIGHT_TURNS[flowId] ?? 1;
    this.playerHp = 5;
    this.dragonHpPercent = 1;
    this.hasActed = false;
  }

  start() {
    super.start();
    GameManager.update({
      currentMinigame: MINIGAME_KEYS.FIRST_FIGHT,
      currentFlowId: this.flowId
    });
    SaveManager.save();

    return this.getSnapshot();
  }

  attack() {
    if (this.hasActed) {
      return this.getSnapshot();
    }

    this.hasActed = true;
    GameManager.update({
      firstFightTurnsCompleted: Math.max(GameManager.getState().firstFightTurnsCompleted, this.turnNumber),
      currentMinigameResult: this.getResult()
    });
    SaveManager.save();

    return this.getSnapshot();
  }

  getResult() {
    return {
      success: true
    };
  }

  getSnapshot() {
    return {
      turnNumber: this.turnNumber,
      playerName: "Cameldo",
      dragonName: "Dragon King",
      playerHpPercent: this.playerHp / 5,
      dragonHpPercent: this.dragonHpPercent,
      damageText: "-1",
      isComplete: this.hasActed
    };
  }
}

export const FIRST_FIGHT_FLOW_IDS = Object.keys(FIRST_FIGHT_TURNS);

import { GAME_STATES } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class GameStateMachine {
  constructor(initialState = GAME_STATES.MAIN_MENU) {
    this.currentState = initialState;
    this.allowedTransitions = new Map([
      [GAME_STATES.MAIN_MENU, new Set([
        GAME_STATES.VN,
        GAME_STATES.BLACKJACK,
        GAME_STATES.FIRST_FIGHT,
        GAME_STATES.ROLL_DICE,
        GAME_STATES.LAST_FIGHT,
        GAME_STATES.ENDING,
        GAME_STATES.CREDITS
      ])],
      [GAME_STATES.VN, new Set([
        GAME_STATES.MAIN_MENU,
        GAME_STATES.BLACKJACK,
        GAME_STATES.FIRST_FIGHT,
        GAME_STATES.ROLL_DICE,
        GAME_STATES.LAST_FIGHT,
        GAME_STATES.ENDING
      ])],
      [GAME_STATES.BLACKJACK, new Set([GAME_STATES.VN, GAME_STATES.MAIN_MENU])],
      [GAME_STATES.FIRST_FIGHT, new Set([GAME_STATES.VN, GAME_STATES.MAIN_MENU])],
      [GAME_STATES.ROLL_DICE, new Set([GAME_STATES.VN, GAME_STATES.MAIN_MENU])],
      [GAME_STATES.LAST_FIGHT, new Set([GAME_STATES.VN, GAME_STATES.ENDING, GAME_STATES.MAIN_MENU])],
      [GAME_STATES.ENDING, new Set([GAME_STATES.CREDITS, GAME_STATES.MAIN_MENU])],
      [GAME_STATES.CREDITS, new Set([GAME_STATES.MAIN_MENU, GAME_STATES.ENDING])]
    ]);
  }

  getState() {
    return this.currentState;
  }

  canTransition(nextState) {
    if (this.currentState === nextState) {
      return true;
    }

    return this.allowedTransitions.get(this.currentState)?.has(nextState) ?? false;
  }

  transition(nextState) {
    if (!this.canTransition(nextState)) {
      Logger.warn("Blocked invalid state transition", {
        from: this.currentState,
        to: nextState
      });
      return false;
    }

    this.currentState = nextState;
    return true;
  }

  force(nextState) {
    this.currentState = nextState;
  }
}

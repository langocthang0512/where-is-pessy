import { GAME_STATES, SCENE_KEYS } from "../utils/constants.js";
import { GameStateMachine } from "./GameStateMachine.js";

class GameManager {
  constructor() {
    this.stateMachine = new GameStateMachine();
    this.reset();
  }

  reset() {
    this.gameState = {
      currentScene: SCENE_KEYS.MAIN_MENU,
      currentVN: "",
      currentMinigame: "",
      currentMinigameResult: null,
      currentFlowId: "",
      chapter: 0,
      blackjackWins: 0,
      firstFightTurnsCompleted: 0,
      diceRollCount: 0,
      diceProgress: 0,
      fightProgress: 0,
      lastFightRoundsCompleted: 0,
      endingUnlocked: false,
      hiddenEndingUnlocked: false,
      trueEndingUnlocked: false,
      language: "US"
    };
    this.stateMachine.force(GAME_STATES.MAIN_MENU);
  }

  getState() {
    return { ...this.gameState };
  }

  hydrate(savedState = {}) {
    this.gameState = {
      ...this.gameState,
      ...savedState
    };
  }

  update(patch = {}) {
    this.gameState = {
      ...this.gameState,
      ...patch
    };
    return this.getState();
  }

  setCurrentScene(sceneKey) {
    this.update({ currentScene: sceneKey });
  }

  setLanguage(language) {
    this.update({ language });
  }

  transitionState(nextState) {
    return this.stateMachine.transition(nextState);
  }

  forceState(nextState) {
    this.stateMachine.force(nextState);
  }

  getCurrentMode() {
    return this.stateMachine.getState();
  }
}

export default new GameManager();

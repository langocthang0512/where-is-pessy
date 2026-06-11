import EventBus from "./EventBus.js";
import GameManager from "./GameManager.js";
import { EVENTS, SAVE_KEY } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

class SaveManager {
  hasSave() {
    return this.loadFromStorage({ hydrate: false, clearOnError: true }) !== null;
  }

  save(extraState = {}) {
    try {
      const state = {
        ...GameManager.getState(),
        ...extraState
      };
      const saveData = this.toSaveData(state);

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      EventBus.emitEvent(EVENTS.SAVE_WRITTEN, saveData);

      return saveData;
    } catch (error) {
      Logger.error("Save failed", error);
      return null;
    }
  }

  load() {
    return this.loadFromStorage({ hydrate: true, clearOnError: true });
  }

  loadFromStorage(options = {}) {
    const hydrate = options.hydrate ?? true;
    const clearOnError = options.clearOnError ?? false;

    try {
      const rawSave = this.readRawSave();

      if (!rawSave) {
        return null;
      }

      const saveData = this.normalizeSaveData(JSON.parse(rawSave));

      if (!this.isValidSaveData(saveData)) {
        throw new Error("Save data is missing required fields.");
      }

      if (!hydrate) {
        return saveData;
      }

      GameManager.hydrate(saveData);
      EventBus.emitEvent(EVENTS.SAVE_LOADED, saveData);

      return saveData;
    } catch (error) {
      Logger.warn("Load failed", error);

      if (clearOnError) {
        this.clear();
      }

      return null;
    }
  }

  normalizeSaveData(saveData = {}) {
    return {
      ...GameManager.getState(),
      ...saveData
    };
  }

  isValidSaveData(saveData = {}) {
    return typeof saveData.currentScene === "string" && saveData.currentScene.length > 0;
  }

  clear() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      Logger.error("Could not clear save", error);
    }
  }

  toSaveData(state) {
    return {
      currentScene: state.currentScene,
      currentVN: state.currentVN,
      currentMinigame: state.currentMinigame,
      currentFlowId: state.currentFlowId,
      chapter: state.chapter,
      blackjackWins: state.blackjackWins,
      firstFightTurnsCompleted: state.firstFightTurnsCompleted,
      diceRollCount: state.diceRollCount,
      diceProgress: state.diceProgress,
      fightProgress: state.fightProgress,
      lastFightRoundsCompleted: state.lastFightRoundsCompleted,
      endingUnlocked: state.endingUnlocked,
      hiddenEndingUnlocked: state.hiddenEndingUnlocked,
      trueEndingUnlocked: state.trueEndingUnlocked,
      language: state.language
    };
  }

  readRawSave() {
    try {
      return localStorage.getItem(SAVE_KEY);
    } catch (error) {
      Logger.error("Could not access LocalStorage", error);
      return null;
    }
  }
}

export default new SaveManager();

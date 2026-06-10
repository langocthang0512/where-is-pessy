import EventBus from "./EventBus.js";
import GameManager from "./GameManager.js";
import SaveManager from "./SaveManager.js";
import SceneManager from "./SceneManager.js";
import { EVENTS, SCENE_KEYS, TRANSITIONS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

class EndingManager {
  unlock(endingKey) {
    const patch = {
      endingUnlocked: true
    };

    if (endingKey === SCENE_KEYS.HIDDEN_ENDING) {
      patch.hiddenEndingUnlocked = true;
    }

    if (endingKey === SCENE_KEYS.TRUE_ENDING) {
      patch.trueEndingUnlocked = true;
    }

    GameManager.update(patch);
    SaveManager.save();
    EventBus.emitEvent(EVENTS.ENDING_UNLOCKED, { endingKey });
  }

  goToEnding(currentScene, endingKey) {
    if (![SCENE_KEYS.TRUE_ENDING, SCENE_KEYS.HIDDEN_ENDING].includes(endingKey)) {
      Logger.warn("Unknown ending requested", { endingKey });
      SceneManager.changeScene(currentScene, SCENE_KEYS.MAIN_MENU);
      return;
    }

    this.unlock(endingKey);
    SaveManager.save({ currentScene: endingKey });
    SceneManager.changeScene(currentScene, endingKey, {
      transition: TRANSITIONS.SLIDE_UP,
      autoSave: true
    });
  }
}

export default new EndingManager();

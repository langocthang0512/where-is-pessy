import EventBus from "./EventBus.js";
import GameManager from "./GameManager.js";
import SaveManager from "./SaveManager.js";
import SceneManager from "./SceneManager.js";
import { EVENTS, MINIGAME_KEYS, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

class MinigameManager {
  constructor() {
    this.minigameSceneMap = new Map([
      [MINIGAME_KEYS.BLACKJACK, SCENE_KEYS.BLACKJACK],
      [MINIGAME_KEYS.FIRST_FIGHT, SCENE_KEYS.FIRST_FIGHT],
      [MINIGAME_KEYS.ROLL_DICE, SCENE_KEYS.ROLL_DICE],
      [MINIGAME_KEYS.LAST_FIGHT, SCENE_KEYS.LAST_FIGHT]
    ]);
  }

  launch(currentScene, minigameKey, data = {}) {
    const targetScene = this.minigameSceneMap.get(minigameKey);

    if (!targetScene) {
      Logger.warn("Unknown minigame requested", { minigameKey });
      SceneManager.changeScene(currentScene, SCENE_KEYS.MAIN_MENU);
      return;
    }

    SaveManager.save({
      currentScene: targetScene,
      currentMinigame: minigameKey
    });

    EventBus.emitEvent(EVENTS.MINIGAME_STARTED, { minigameKey });
    SceneManager.changeScene(currentScene, targetScene, {
      autoSave: true,
      data: {
        minigameKey,
        ...data
      }
    });
  }

  complete(currentScene, result = { success: true }, returnScene = SCENE_KEYS.VN) {
    const normalizedResult = {
      success: Boolean(result.success)
    };

    GameManager.update({
      currentMinigameResult: normalizedResult
    });
    SaveManager.save();
    EventBus.emitEvent(EVENTS.MINIGAME_COMPLETED, normalizedResult);
    SceneManager.changeScene(currentScene, returnScene, { autoSave: true });
  }

  fail(currentScene, result = { success: false }, returnScene = SCENE_KEYS.VN) {
    const normalizedResult = {
      success: Boolean(result.success)
    };

    GameManager.update({
      currentMinigameResult: normalizedResult
    });
    SaveManager.save();
    EventBus.emitEvent(EVENTS.MINIGAME_FAILED, normalizedResult);
    SceneManager.changeScene(currentScene, returnScene, { autoSave: true });
  }
}

export default new MinigameManager();

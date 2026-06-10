import EventBus from "../core/EventBus.js";
import MinigameManager from "../core/MinigameManager.js";
import { EVENTS, SCENE_KEYS } from "../utils/constants.js";

export class MinigameBase {
  constructor(scene, minigameKey) {
    this.scene = scene;
    this.minigameKey = minigameKey;
    this.isActive = false;
  }

  start() {
    this.isActive = true;
    EventBus.emitEvent(EVENTS.MINIGAME_STARTED, {
      minigameKey: this.minigameKey
    });
  }

  complete(result = { success: true }, returnScene = SCENE_KEYS.VN) {
    this.cleanup();
    MinigameManager.complete(this.scene, result, returnScene);
  }

  fail(result = { success: false }, returnScene = SCENE_KEYS.VN) {
    this.cleanup();
    MinigameManager.fail(this.scene, result, returnScene);
  }

  cleanup() {
    this.isActive = false;
  }
}

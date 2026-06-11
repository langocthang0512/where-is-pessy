import EventBus from "./EventBus.js";
import GameManager from "./GameManager.js";
import SaveManager from "./SaveManager.js";
import AudioManager from "./AudioManager.js";
import { EVENTS, GAME_STATES, MINIGAME_KEYS, SCENE_KEYS, TRANSITIONS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

class SceneManager {
  constructor() {
    this.registeredScenes = new Set(Object.values(SCENE_KEYS));
    this.sceneStateMap = new Map([
      [SCENE_KEYS.MAIN_MENU, GAME_STATES.MAIN_MENU],
      [SCENE_KEYS.CREDITS, GAME_STATES.CREDITS],
      [SCENE_KEYS.VN, GAME_STATES.VN],
      [SCENE_KEYS.BLACKJACK, GAME_STATES.BLACKJACK],
      [SCENE_KEYS.FIRST_FIGHT, GAME_STATES.FIRST_FIGHT],
      [SCENE_KEYS.ROLL_DICE, GAME_STATES.ROLL_DICE],
      [SCENE_KEYS.LAST_FIGHT, GAME_STATES.LAST_FIGHT],
      [SCENE_KEYS.TRUE_ENDING, GAME_STATES.ENDING],
      [SCENE_KEYS.HIDDEN_ENDING, GAME_STATES.ENDING]
    ]);
  }

  changeScene(currentScene, targetSceneKey, options = {}) {
    try {
      if (!this.isSceneRegistered(targetSceneKey)) {
        throw new Error(`Unknown scene: ${targetSceneKey}`);
      }

      const nextState = this.sceneStateMap.get(targetSceneKey);

      if (nextState && !GameManager.transitionState(nextState)) {
        GameManager.forceState(nextState);
      }

      GameManager.setCurrentScene(targetSceneKey);
      this.applyTransitionData(options.data ?? {});

      if (options.autoSave) {
        SaveManager.save({ currentScene: targetSceneKey });
      }

      if ((options.transition ?? TRANSITIONS.FADE) !== TRANSITIONS.NONE) {
        AudioManager.setScene(currentScene);
        AudioManager.playSfx("scene_transition", { volume: 0.24 });
      }

      this.runTransition(currentScene, targetSceneKey, options);
      EventBus.emitEvent(EVENTS.SCENE_CHANGED, {
        scene: targetSceneKey,
        transition: options.transition ?? TRANSITIONS.FADE
      });
    } catch (error) {
      this.handleSceneError(currentScene, error);
    }
  }

  changeToNextFromFlow(currentScene, sceneFlow, flowKey, options = {}) {
    const flowTarget = sceneFlow[flowKey];

    if (!flowTarget) {
      Logger.warn("Scene flow has no next scene", { flowKey });
      this.changeScene(currentScene, SCENE_KEYS.MAIN_MENU, options);
      return;
    }

    if (typeof flowTarget === "string") {
      this.changeScene(currentScene, flowTarget, options);
      return;
    }

    this.changeScene(currentScene, flowTarget.scene, {
      ...options,
      transition: flowTarget.transition ?? options.transition,
      data: {
        ...(options.data ?? {}),
        ...(flowTarget.data ?? {})
      }
    });
  }

  isSceneRegistered(sceneKey) {
    return this.registeredScenes.has(sceneKey);
  }

  applyTransitionData(data) {
    const patch = {};

    if (data.dialogueKey) {
      patch.currentVN = data.dialogueKey;
      patch.currentFlowId = "";
      patch.currentMinigame = "";
    }

    if (data.flowId) {
      patch.currentFlowId = data.flowId;
      patch.currentMinigame = this.getMinigameKeyFromFlowId(data.flowId);
    }

    if (Object.keys(patch).length > 0) {
      GameManager.update(patch);
    }
  }

  getMinigameKeyFromFlowId(flowId) {
    if (flowId.startsWith("BLACKJACK") || flowId.startsWith("BJ_")) {
      return MINIGAME_KEYS.BLACKJACK;
    }

    if (flowId.startsWith("FIRST_FIGHT")) {
      return MINIGAME_KEYS.FIRST_FIGHT;
    }

    if (flowId.startsWith("ROLL_DICE")) {
      return MINIGAME_KEYS.ROLL_DICE;
    }

    if (flowId.startsWith("LAST_FIGHT")) {
      return MINIGAME_KEYS.LAST_FIGHT;
    }

    return "";
  }

  runTransition(currentScene, targetSceneKey, options) {
    const transition = options.transition ?? TRANSITIONS.FADE;
    const duration = options.duration ?? 450;
    const data = options.data ?? {};

    if (transition === TRANSITIONS.NONE) {
      currentScene.scene.start(targetSceneKey, data);
      return;
    }

    if (transition === TRANSITIONS.SLIDE_UP) {
      currentScene.cameras.main.once("camerafadeoutcomplete", () => {
        currentScene.scene.start(targetSceneKey, data);
      });
      currentScene.cameras.main.fadeOut(duration, 23, 25, 35);
      return;
    }

    currentScene.cameras.main.once("camerafadeoutcomplete", () => {
      currentScene.scene.start(targetSceneKey, data);
    });
    currentScene.cameras.main.fadeOut(duration, 23, 25, 35);
  }

  handleSceneError(currentScene, error) {
    Logger.error("Scene failure recovered", error);
    EventBus.emitEvent(EVENTS.ERROR_RECOVERED, { error });

    if (currentScene.scene.key !== SCENE_KEYS.MAIN_MENU) {
      GameManager.forceState(GAME_STATES.MAIN_MENU);
      GameManager.setCurrentScene(SCENE_KEYS.MAIN_MENU);
      currentScene.scene.start(SCENE_KEYS.MAIN_MENU);
    }
  }
}

export default new SceneManager();

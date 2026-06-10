import SaveManager from "./SaveManager.js";
import SceneManager from "./SceneManager.js";
import { MINIGAME_KEYS, SCENE_KEYS } from "../utils/constants.js";

class QAManager {
  validateSceneRegistry() {
    const requiredScenes = Object.values(SCENE_KEYS);
    const missingScenes = requiredScenes.filter((sceneKey) => !SceneManager.isSceneRegistered(sceneKey));

    return {
      name: "Scene Registry",
      passed: missingScenes.length === 0,
      details: { missingScenes }
    };
  }

  validateSaveShape() {
    const saveData = SaveManager.toSaveData({
      currentScene: SCENE_KEYS.MAIN_MENU,
      currentVN: "",
      currentMinigame: "",
      currentFlowId: "",
      chapter: 0,
      blackjackWins: 0,
      diceRollCount: 0,
      diceProgress: 0,
      fightProgress: 0,
      lastFightRoundsCompleted: 0,
      endingUnlocked: false,
      hiddenEndingUnlocked: false,
      trueEndingUnlocked: false,
      language: "US"
    });

    const requiredKeys = [
      "currentScene",
      "currentVN",
      "currentMinigame",
      "currentFlowId",
      "chapter",
      "blackjackWins",
      "diceRollCount",
      "diceProgress",
      "fightProgress",
      "lastFightRoundsCompleted",
      "endingUnlocked",
      "hiddenEndingUnlocked",
      "trueEndingUnlocked",
      "language"
    ];

    const missingKeys = requiredKeys.filter((key) => !(key in saveData));

    return {
      name: "Save Shape",
      passed: missingKeys.length === 0,
      details: { missingKeys }
    };
  }

  validateMinigameKeys() {
    const requiredKeys = ["BLACKJACK", "FIRST_FIGHT", "ROLL_DICE", "LAST_FIGHT"];
    const missingKeys = requiredKeys.filter((key) => !(key in MINIGAME_KEYS));

    return {
      name: "Minigame Keys",
      passed: missingKeys.length === 0,
      details: { missingKeys }
    };
  }

  runAll() {
    const results = [
      this.validateSceneRegistry(),
      this.validateSaveShape(),
      this.validateMinigameKeys()
    ];

    return {
      passed: results.every((result) => result.passed),
      results
    };
  }
}

export default new QAManager();

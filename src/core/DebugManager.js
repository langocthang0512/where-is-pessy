import GameManager from "./GameManager.js";
import SaveManager from "./SaveManager.js";
import SceneManager from "./SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { DEBUG_MODE, SCENE_KEYS, TRANSITIONS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

class DebugManager {
  constructor() {
    this.game = null;
    this.overlay = null;
    this.updateTimer = null;
    this.isInstalled = false;
  }

  install(game) {
    if (!DEBUG_MODE || this.isInstalled) {
      return;
    }

    this.game = game;
    this.isInstalled = true;
    this.createOverlay();
    this.installHotkeys();
    this.startOverlayUpdates();
    Logger.info("Debug mode enabled");
  }

  createOverlay() {
    this.overlay = document.createElement("pre");
    this.overlay.setAttribute("data-debug-overlay", "where-is-pessy");
    Object.assign(this.overlay.style, {
      position: "fixed",
      top: "8px",
      left: "8px",
      zIndex: "9999",
      margin: "0",
      padding: "8px 10px",
      maxWidth: "360px",
      pointerEvents: "none",
      color: "#ffffff",
      background: "rgba(0, 0, 0, 0.72)",
      fontFamily: "monospace",
      fontSize: "12px",
      lineHeight: "1.35",
      whiteSpace: "pre-wrap"
    });
    document.body.appendChild(this.overlay);
  }

  installHotkeys() {
    window.addEventListener("keydown", (event) => {
      if (!event.shiftKey || !event.altKey) {
        return;
      }

      if (event.code === "KeyS") {
        event.preventDefault();
        this.skipCurrentFlowNode();
      }

      if (event.code === "KeyE") {
        event.preventDefault();
        this.unlockEndings();
      }
    });
  }

  startOverlayUpdates() {
    this.updateTimer = window.setInterval(() => {
      if (!this.overlay || !this.game) {
        return;
      }

      const state = GameManager.getState();
      const fps = Math.round(this.game.loop.actualFps || 0);
      this.overlay.textContent = [
        "DEBUG MODE",
        `FPS: ${fps}`,
        `Mode: ${GameManager.getCurrentMode()}`,
        `Scene: ${state.currentScene}`,
        `VN: ${state.currentVN || "-"}`,
        `Flow: ${state.currentFlowId || "-"}`,
        `Minigame: ${state.currentMinigame || "-"}`,
        "Alt+Shift+S: Skip node",
        "Alt+Shift+E: Unlock endings"
      ].join("\n");
    }, 250);
  }

  skipCurrentFlowNode() {
    const activeScene = this.getActiveScene();

    if (!activeScene) {
      return;
    }

    const state = GameManager.getState();
    const flowKey = state.currentVN || state.currentFlowId;

    if (!flowKey || !sceneFlow[flowKey]) {
      Logger.warn("Debug skip unavailable", { flowKey });
      return;
    }

    SceneManager.changeToNextFromFlow(activeScene, sceneFlow, flowKey, {
      autoSave: true,
      transition: TRANSITIONS.NONE
    });
  }

  unlockEndings() {
    GameManager.update({
      endingUnlocked: true,
      hiddenEndingUnlocked: true,
      trueEndingUnlocked: true
    });
    SaveManager.save();
    Logger.info("Debug endings unlocked");
  }

  getActiveScene() {
    const activeScenes = this.game?.scene.getScenes(true) ?? [];
    return activeScenes.find((scene) => scene.scene.key !== SCENE_KEYS.BOOT) ?? activeScenes[0] ?? null;
  }
}

export default new DebugManager();

import Phaser from "phaser";
import GameManager from "../core/GameManager.js";
import SaveManager from "../core/SaveManager.js";
import SceneManager from "../core/SceneManager.js";
import sceneFlow from "../data/sceneFlow.json";
import { FlowNodeDatabase } from "../data/SceneDatabase.js";
import { UIButton } from "../ui/UIButton.js";
import { COLORS, FONT_FAMILY, SCENE_KEYS } from "../utils/constants.js";
import { Logger } from "../utils/logger.js";

export class PlaceholderScene extends Phaser.Scene {
  constructor(sceneKey, title, description) {
    super(sceneKey);
    this.title = title;
    this.description = description;
    this.flowId = "";
  }

  init(data = {}) {
    const canResumeFlow = [
      SCENE_KEYS.BLACKJACK,
      SCENE_KEYS.FIRST_FIGHT,
      SCENE_KEYS.ROLL_DICE,
      SCENE_KEYS.LAST_FIGHT
    ].includes(this.scene.key);

    this.flowId = data.flowId || (canResumeFlow ? GameManager.getState().currentFlowId : "");
  }

  create() {
    try {
      this.cameras.main.fadeIn(350, 23, 25, 35);
      this.cameras.main.setBackgroundColor(COLORS.background);
      const flowNode = FlowNodeDatabase[this.flowId];
      const title = flowNode?.title ?? this.title;
      const description = flowNode
        ? "Story gate only. Minigame mechanics will be implemented in a later prompt."
        : this.description;

      GameManager.update({
        currentScene: this.scene.key,
        currentFlowId: this.flowId,
        currentMinigame: flowNode?.id ?? "",
        hiddenEndingUnlocked: this.scene.key === SCENE_KEYS.HIDDEN_ENDING || GameManager.getState().hiddenEndingUnlocked,
        trueEndingUnlocked: this.scene.key === SCENE_KEYS.TRUE_ENDING || GameManager.getState().trueEndingUnlocked,
        endingUnlocked: [SCENE_KEYS.HIDDEN_ENDING, SCENE_KEYS.TRUE_ENDING].includes(this.scene.key) || GameManager.getState().endingUnlocked
      });
      SaveManager.save({
        currentScene: this.scene.key,
        currentFlowId: this.flowId
      });

      const { width, height } = this.scale;

      this.add.text(width / 2, 220, title, {
        fontFamily: FONT_FAMILY,
        fontSize: "88px",
        color: COLORS.text,
        align: "center"
      }).setOrigin(0.5);

      this.add.text(width / 2, 400, description, {
        fontFamily: FONT_FAMILY,
        fontSize: "42px",
        color: "#f2c14e",
        align: "center",
        wordWrap: { width: 980 }
      }).setOrigin(0.5);

      if (flowNode) {
        new UIButton(this, width / 2, height - 250, 440, 74, "Continue", () => {
          SceneManager.changeToNextFromFlow(this, sceneFlow, this.flowId, { autoSave: true });
        });
      } else {
        new UIButton(this, width / 2, height - 300, 360, 74, "Credits", () => {
          SceneManager.changeScene(this, SCENE_KEYS.CREDITS);
        });

        new UIButton(this, width / 2, height - 200, 440, 74, "Return To Menu", () => {
          SceneManager.changeScene(this, SCENE_KEYS.MAIN_MENU, { autoSave: true });
        });
      }
    } catch (error) {
      Logger.error("Placeholder scene failed", error);
      SceneManager.handleSceneError(this, error);
    }
  }
}

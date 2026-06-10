import { SCENE_KEYS } from "../utils/constants.js";
import { PlaceholderScene } from "./PlaceholderScene.js";

export class RollDiceScene extends PlaceholderScene {
  constructor() {
    super(
      SCENE_KEYS.ROLL_DICE,
      "Roll Dice Placeholder",
      "Dice architecture is reserved. Gameplay is intentionally not implemented yet."
    );
  }
}

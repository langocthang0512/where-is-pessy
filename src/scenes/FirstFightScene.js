import { SCENE_KEYS } from "../utils/constants.js";
import { PlaceholderScene } from "./PlaceholderScene.js";

export class FirstFightScene extends PlaceholderScene {
  constructor() {
    super(
      SCENE_KEYS.FIRST_FIGHT,
      "First Fight Placeholder",
      "Turn-based battle architecture is reserved. Gameplay is intentionally not implemented yet."
    );
  }
}

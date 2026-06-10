import { SCENE_KEYS } from "../utils/constants.js";
import { PlaceholderScene } from "./PlaceholderScene.js";

export class TrueEndingScene extends PlaceholderScene {
  constructor() {
    super(
      SCENE_KEYS.TRUE_ENDING,
      "True Ending Placeholder",
      "Ending architecture is reserved. Story content will arrive later."
    );
  }
}

import { SCENE_KEYS } from "../utils/constants.js";
import { PlaceholderScene } from "./PlaceholderScene.js";

export class HiddenEndingScene extends PlaceholderScene {
  constructor() {
    super(
      SCENE_KEYS.HIDDEN_ENDING,
      "Hidden Ending Placeholder",
      "Hidden ending architecture is reserved. Story content will arrive later."
    );
  }
}

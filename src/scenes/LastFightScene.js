import { SCENE_KEYS } from "../utils/constants.js";
import { PlaceholderScene } from "./PlaceholderScene.js";

export class LastFightScene extends PlaceholderScene {
  constructor() {
    super(
      SCENE_KEYS.LAST_FIGHT,
      "Last Fight Placeholder",
      "Final battle architecture is reserved. Gameplay is intentionally not implemented yet."
    );
  }
}

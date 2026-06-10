import { SCENE_KEYS } from "../utils/constants.js";
import { VisualNovelScene } from "../vn/VisualNovelScene.js";

export class VNScene extends VisualNovelScene {
  constructor() {
    super(SCENE_KEYS.VN);
  }
}

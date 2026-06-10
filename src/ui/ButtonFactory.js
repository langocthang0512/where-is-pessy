import { UIButton } from "./UIButton.js";

export class ButtonFactory {
  static create(scene, x, y, width, height, label, onClick) {
    return new UIButton(scene, x, y, width, height, label, onClick);
  }
}

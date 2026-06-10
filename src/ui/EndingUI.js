import { COLORS, FONT_FAMILY } from "../utils/constants.js";
import { ButtonFactory } from "./ButtonFactory.js";

export class EndingUI {
  constructor(scene, title) {
    this.scene = scene;
    this.title = scene.add.text(scene.scale.width / 2, 240, title, {
      fontFamily: FONT_FAMILY,
      fontSize: "96px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);
    this.buttons = [];
  }

  addButton(y, label, onClick) {
    const button = ButtonFactory.create(this.scene, this.scene.scale.width / 2, y, 360, 74, label, onClick);
    this.buttons.push(button);
    return button;
  }

  destroy() {
    this.title.destroy();
    this.buttons.forEach((button) => button.destroy());
    this.buttons = [];
  }
}

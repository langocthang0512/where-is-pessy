import { ButtonFactory } from "./ButtonFactory.js";

export class MenuUI {
  constructor(scene) {
    this.scene = scene;
    this.buttons = [];
  }

  addButton(x, y, width, height, label, onClick) {
    const button = ButtonFactory.create(this.scene, x, y, width, height, label, onClick);
    this.buttons.push(button);
    return button;
  }

  destroy() {
    this.buttons.forEach((button) => button.destroy());
    this.buttons = [];
  }
}

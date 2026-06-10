import { ButtonFactory } from "./ButtonFactory.js";

export class ChoiceMenu {
  constructor(scene) {
    this.scene = scene;
    this.buttons = [];
  }

  show(choices = [], onChoose) {
    this.clear();
    const startY = this.scene.scale.height / 2;
    const spacing = 92;

    choices.forEach((choice, index) => {
      const button = ButtonFactory.create(
        this.scene,
        this.scene.scale.width / 2,
        startY + index * spacing,
        520,
        70,
        choice.label,
        () => onChoose?.(choice)
      );
      this.buttons.push(button);
    });
  }

  clear() {
    this.buttons.forEach((button) => button.destroy());
    this.buttons = [];
  }
}

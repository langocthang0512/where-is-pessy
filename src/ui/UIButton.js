import { COLORS, FONT_FAMILY } from "../utils/constants.js";

export class UIButton {
  constructor(scene, x, y, width, height, label, onClick) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.background = scene.add.rectangle(0, 0, width, height, COLORS.accent, 1);
    this.background.setStrokeStyle(4, COLORS.accentDark, 1);
    this.text = scene.add.text(0, 0, label, {
      fontFamily: FONT_FAMILY,
      fontSize: "48px",
      color: COLORS.textDark,
      align: "center"
    });
    this.text.setOrigin(0.5);
    this.container.add([this.background, this.text]);
    this.container.setSize(width, height);
    this.container.setInteractive({ useHandCursor: true });
    this.container.on("pointerover", () => this.setHover(true));
    this.container.on("pointerout", () => this.setHover(false));
    this.container.on("pointerdown", () => onClick?.());
  }

  setHover(isHovering) {
    this.background.setFillStyle(isHovering ? 0xffd86b : COLORS.accent);
    this.container.setScale(isHovering ? 1.03 : 1);
  }

  setVisible(isVisible) {
    this.container.setVisible(isVisible);
  }

  destroy() {
    this.container.destroy();
  }
}

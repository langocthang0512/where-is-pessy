import AudioManager from "../core/AudioManager.js";
import { COLORS, FONT_FAMILY } from "../utils/constants.js";

export class UIButton {
  constructor(scene, x, y, width, height, label, onClick) {
    this.scene = scene;
    this.onClick = onClick;
    this.isEnabled = true;
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
    this.background.setInteractive({ useHandCursor: true });
    this.background.on("pointerover", () => {
      if (!this.isEnabled) {
        return;
      }

      AudioManager.setScene(this.scene);
      AudioManager.playSfx("button_hover", { volume: 0.2 });
      this.setHover(true);
    });
    this.background.on("pointerout", () => this.setHover(false));
    this.background.on("pointerdown", () => {
      if (!this.isEnabled) {
        return;
      }

      AudioManager.setScene(this.scene);
      AudioManager.playSfx("button_click", { volume: 0.28 });
      this.container.setScale(0.95);
      this.onClick?.();
    });
    this.background.on("pointerup", () => {
      if (this.isEnabled) {
        this.setHover(true);
      }
    });
  }

  setHover(isHovering) {
    this.background.setFillStyle(isHovering ? 0xffd86b : COLORS.accent);
    this.container.setScale(isHovering ? 1.05 : 1);
  }

  setVisible(isVisible) {
    this.container.setVisible(isVisible);
    this.setEnabled(isVisible);
  }

  setEnabled(isEnabled) {
    this.isEnabled = isEnabled;
    this.background.disableInteractive();

    if (isEnabled) {
      this.background.setInteractive({ useHandCursor: true });
    }
  }

  destroy() {
    this.container.destroy();
  }
}

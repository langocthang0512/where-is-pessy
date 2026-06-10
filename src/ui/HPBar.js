import Phaser from "phaser";
import { COLORS } from "../utils/constants.js";

export class HPBar {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.width = width;
    this.background = scene.add.rectangle(x, y, width, height, COLORS.panelDark, 1);
    this.background.setStrokeStyle(3, COLORS.textDark, 1);
    this.fill = scene.add.rectangle(x - width / 2, y, width, height, COLORS.success, 1);
    this.fill.setOrigin(0, 0.5);
  }

  setPercent(percent) {
    this.fill.width = this.width * Phaser.Math.Clamp(percent, 0, 1);
  }

  destroy() {
    this.background.destroy();
    this.fill.destroy();
  }
}

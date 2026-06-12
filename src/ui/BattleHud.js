import Phaser from "phaser";
import { COLORS, FONT_FAMILY } from "../utils/constants.js";

export class BattleHud {
  constructor(scene) {
    this.scene = scene;
    this.dragon = this.createPanel(1510, 145, "Dragon King", true);
    this.player = this.createPanel(390, 720, "Cameldo", false);
  }

  createPanel(x, y, name, alignRight) {
    const container = this.scene.add.container(x, y).setDepth(35);
    const shadowOffset = alignRight ? -10 : 10;
    const shadow = this.scene.add.rectangle(shadowOffset, 10, 540, 150, 0x000000, 0.38);
    const panel = this.scene.add.rectangle(0, 0, 540, 150, COLORS.panel, 0.97)
      .setStrokeStyle(5, 0xf6d77a, 1);
    const nameText = this.scene.add.text(alignRight ? 220 : -220, -43, name, {
      fontFamily: FONT_FAMILY,
      fontSize: "46px",
      color: COLORS.text
    }).setOrigin(alignRight ? 1 : 0, 0.5);
    const hpLabel = this.scene.add.text(-220, 35, "HP", {
      fontFamily: FONT_FAMILY,
      fontSize: "28px",
      color: "#f8d568"
    }).setOrigin(0, 0.5);
    const barBack = this.scene.add.rectangle(-155, 35, 375, 34, COLORS.panelDark, 1)
      .setOrigin(0, 0.5)
      .setStrokeStyle(3, 0x11131a, 1);
    const fill = this.scene.add.rectangle(-155, 35, 375, 34, COLORS.success, 1).setOrigin(0, 0.5);
    const shine = this.scene.add.rectangle(-150, 29, 365, 7, 0xffffff, 0.22).setOrigin(0, 0.5);

    container.add([shadow, panel, nameText, hpLabel, barBack, fill, shine]);
    return { container, fill, shine, width: 375 };
  }

  setPlayerPercent(percent) {
    this.setPercent(this.player, percent);
  }

  setDragonPercent(percent) {
    this.setPercent(this.dragon, percent);
  }

  setPercent(target, percent) {
    const width = target.width * Phaser.Math.Clamp(percent, 0, 1);
    target.fill.width = width;
    target.shine.width = Math.max(0, width - 10);
  }

  destroy() {
    this.dragon.container.destroy(true);
    this.player.container.destroy(true);
  }
}

import { COLORS, FONT_FAMILY } from "../utils/constants.js";

export class TimerUI {
  constructor(scene, x, y) {
    this.text = scene.add.text(x, y, "00", {
      fontFamily: FONT_FAMILY,
      fontSize: "52px",
      color: COLORS.text
    }).setOrigin(0.5);
  }

  setSeconds(seconds) {
    this.text.setText(String(Math.max(0, Math.ceil(seconds))).padStart(2, "0"));
  }

  destroy() {
    this.text.destroy();
  }
}

import { COLORS, FONT_FAMILY } from "../utils/constants.js";

export class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.container = scene.add.container(width / 2, height - 180);
    this.background = scene.add.rectangle(0, 0, width - 220, 250, COLORS.panel, 0.94);
    this.background.setStrokeStyle(5, COLORS.accent, 1);

    this.speakerText = scene.add.text(-((width - 220) / 2) + 44, -94, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "44px",
      color: "#f2c14e"
    });

    this.dialogueText = scene.add.text(-((width - 220) / 2) + 44, -28, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "42px",
      color: COLORS.text,
      lineSpacing: 8,
      wordWrap: { width: width - 320 }
    });

    this.promptText = scene.add.text((width - 220) / 2 - 44, 94, "Next", {
      fontFamily: FONT_FAMILY,
      fontSize: "34px",
      color: COLORS.text
    }).setOrigin(1, 0.5);

    this.container.add([
      this.background,
      this.speakerText,
      this.dialogueText,
      this.promptText
    ]);
  }

  setLine(line = {}) {
    this.speakerText.setText(line.speaker ?? "");
    this.dialogueText.setText(line.text ?? "");
  }

  setPrompt(label) {
    this.promptText.setText(label);
  }

  setVisible(isVisible) {
    this.container.setVisible(isVisible);
  }

  destroy() {
    this.container.destroy();
  }
}
